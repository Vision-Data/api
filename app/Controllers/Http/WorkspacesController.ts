import { RoleEnum } from './../../Enums/RoleEnum'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Workspace from 'App/Models/Workspace'
import WorkspaceValidator from 'App/Validators/WorkspaceValidator'

export default class WorkspacesController {
  public async store({ request, auth }: HttpContextContract) {
    const payload = await request.validate(WorkspaceValidator)

    const workspace = await Workspace.create(payload)
    await workspace
      .related('users')
      .attach({ [auth.user!.id]: { role: RoleEnum.OWNER } })

    return workspace
  }

  public async update({ bouncer, auth, params, request }: HttpContextContract) {
    const workspace = await Workspace.query()
      .preload('users', (query) =>
        query.pivotColumns(['role']).wherePivot('user_id', auth.user!.id)
      )
      .innerJoin(
        'workspace_users',
        'workspace_users.workspace_id',
        'workspaces.id'
      )
      .where('id', params.id)
      .where('workspace_users.user_id', auth.user!.id)
      .firstOrFail()

    await bouncer.with('WorkspacePolicy').authorize('update', workspace)

    const payload = await request.validate(WorkspaceValidator)
    workspace.merge(payload).save()

    return workspace
  }
}
