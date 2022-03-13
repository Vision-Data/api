import { PaginationEnum } from './../../Enums/PaginationEnum'
import { RoleEnum } from './../../Enums/RoleEnum'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Workspace from 'App/Models/Workspace'
import WorkspaceValidator from 'App/Validators/WorkspaceValidator'

export default class WorkspacesController {
  public async index({ auth, request }: HttpContextContract) {
    const page = request.input('page', PaginationEnum.DEFAULT_PAGE)

    return await auth
      .user!.related('workspaces')
      .query()
      .preload('users')
      .paginate(page, PaginationEnum.DEFAULT_LIMIT)
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

    await bouncer
      .with('WorkspacePolicy')
      .authorize('updateWorkspace', workspace)

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

    await bouncer
      .with('WorkspacePolicy')
      .authorize('destroyWorkspace', workspace)

    await workspace.delete()

    response.status(204)
  }
}
