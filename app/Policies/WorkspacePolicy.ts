import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import { RoleEnum } from 'App/Enums/RoleEnum'
import User from 'App/Models/User'
import Workspace from 'App/Models/Workspace'

export default class WorkspacePolicy extends BasePolicy {
  public async ownerActions(user: User, workspace: Workspace) {
    const admin = workspace.users.find((admin) => admin.id === user.id)
    return admin!.role === RoleEnum.OWNER
  }
}
