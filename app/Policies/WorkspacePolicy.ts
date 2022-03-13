import { BasePolicy } from '@ioc:Adonis/Addons/Bouncer'
import { RoleEnum } from 'App/Enums/RoleEnum'
import User from 'App/Models/User'
import Workspace from 'App/Models/Workspace'

export default class WorkspacePolicy extends BasePolicy {
  public async updateWorkspace(user: User, workspace: Workspace) {
    return workspace.users[0].role === RoleEnum.OWNER
  }

  public async destroyWorkspace(user: User, workspace: Workspace) {
    return workspace.users[0].role === RoleEnum.OWNER
  }
}
