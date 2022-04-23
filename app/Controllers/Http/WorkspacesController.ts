import { PaginationEnum } from './../../Enums/PaginationEnum'
import { RoleEnum } from './../../Enums/RoleEnum'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Workspace from 'App/Models/Workspace'
import WorkspaceValidator from 'App/Validators/WorkspaceValidator'

export default class WorkspacesController {
  public async index({ auth, request }: HttpContextContract) {
    const page = request.input('page', PaginationEnum.DEFAULT_PAGE)
    const limit = request.input('limit', PaginationEnum.DEFAULT_LIMIT)

    return await auth
      .user!.related('workspaces')
      .query()
      .preload('users')
      .paginate(page, limit)
  }

  public async store({ request, auth }: HttpContextContract) {
    const payload = await request.validate(WorkspaceValidator)

    const workspace = await Workspace.create(payload)
    await workspace
      .related('users')
      .attach({ [auth.user!.id]: { role: RoleEnum.OWNER } })
    return workspace
  }

  public async show({ auth, params }: HttpContextContract) {
    return await Workspace.query()
      .preload('users')
      .innerJoin(
        'workspace_users',
        'workspace_users.workspace_id',
        'workspaces.id'
      )
      .where('workspace_users.user_id', auth.user!.id)
      .where('id', params.id)
      .firstOrFail()
  }

  public async update({ bouncer, auth, params, request }: HttpContextContract) {
    const workspace = await Workspace.query()
      .preload('users', (query) => query.wherePivot('user_id', auth.user!.id))
      .innerJoin(
        'workspace_users',
        'workspace_users.workspace_id',
        'workspaces.id'
      )
      .where('id', params.id)
      .where('workspace_users.user_id', auth.user!.id)
      .firstOrFail()

    await bouncer.with('WorkspacePolicy').authorize('ownerActions', workspace)

    const payload = await request.validate(WorkspaceValidator)
    workspace.merge(payload).save()

    return workspace
  }

  public async destroy({
    bouncer,
    auth,
    params,
    response,
  }: HttpContextContract) {
    const workspace = await Workspace.query()
      .preload('users', (query) => query.wherePivot('user_id', auth.user!.id))
      .innerJoin(
        'workspace_users',
        'workspace_users.workspace_id',
        'workspaces.id'
      )
      .where('id', params.id)
      .where('workspace_users.user_id', auth.user!.id)
      .firstOrFail()

    await bouncer.with('WorkspacePolicy').authorize('ownerActions', workspace)

    await workspace.delete()

    response.status(204)
  }

  public async removeUser({
    params,
    auth,
    bouncer,
    response,
  }: HttpContextContract) {
    const workspace = await Workspace.query()
      .innerJoin(
        'workspace_users',
        'workspace_users.workspace_id',
        'workspaces.id'
      )
      .where('id', params.id)
      .where('workspace_users.user_id', auth.user!.id)
      .preload('users')
      .firstOrFail()

    await bouncer.with('WorkspacePolicy').authorize('ownerActions', workspace)

    const userInWorkspace = workspace.users.find(
      (user) => user.id === params.userId
    )

    if (!userInWorkspace) {
      return response.status(404).send({ error: 'User not found in workspace' })
    }

    if (auth.user!.id === params.userId) {
      return response
        .status(400)
        .send({ error: 'You cannot remove yourself from workspace' })
    }

    await workspace.related('users').detach([params.userId])

    response.status(204)
  }
}
