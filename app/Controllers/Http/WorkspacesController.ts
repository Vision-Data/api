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
}
