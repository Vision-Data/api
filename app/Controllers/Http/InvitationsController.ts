import { DateTime } from 'luxon'
import Route from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import InvitationMailer from 'App/Mailers/InvitationMailer'
import User from 'App/Models/User'
import Workspace from 'App/Models/Workspace'
import CreateInvitationValidator from 'App/Validators/CreateInvitationValidator'
import Invitation from 'App/Models/Invitation'

export default class InvitationsController {
  public async store({
    auth,
    params,
    bouncer,
    request,
    response,
  }: HttpContextContract) {
    const workspace = await Workspace.query()
      .preload('users')
      .innerJoin(
        'workspace_users',
        'workspace_users.workspace_id',
        'workspaces.id'
      )
      .where('id', params.id)
      .where('workspace_users.user_id', auth.user!.id)
      .firstOrFail()

    await bouncer.with('WorkspacePolicy').authorize('ownerActions', workspace)

    const payload = await request.validate(CreateInvitationValidator)

    const user = await User.query().where('email', payload.email).firstOrFail()

    if (workspace.users.find((user) => user.email === payload.email)) {
      return response
        .status(409)
        .send({ error: 'User already added in workspace' })
    }

    const invitation = await Invitation.create({
      userId: user.id,
      workspaceId: workspace.id,
    })

    const url = Route.makeUrl('validateInvitation', {
      id: workspace.id,
      invitationId: invitation.id,
    })

    await new InvitationMailer(user, workspace, url).sendLater()

    response.status(204)
  }

  public async validate({ params, response }: HttpContextContract) {
    const invitation = await Invitation.query()
      .where('workspace_id', params.id)
      .where('id', params.invitationId)
      .firstOrFail()

    if (invitation.expiredAt < DateTime.now()) {
      return response.status(410).send({ error: 'Invitation expired' })
    }

    const workspace = await Workspace.findOrFail(params.id)
    await workspace.related('users').attach([invitation.userId])
    await invitation.delete()

    response.status(204)
  }
}
