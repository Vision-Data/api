import { BaseTask } from 'adonis5-scheduler/build'
import Database from '@ioc:Adonis/Lucid/Database'
import Invitation from 'App/Models/Invitation'

export default class DeleteToken extends BaseTask {
  logger: any
  public static get schedule() {
    return '* * * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    const apiTokens = await Database.from('api_tokens')
      .where('expires_at', '<', new Date())
      .delete()

    this.logger.info(`${apiTokens} api tokens deleted`)

    const passwordTokens = await Database.from('password_tokens')
      .where('expired_at', '<', new Date())
      .delete()

    this.logger.info(`${passwordTokens} password tokens deleted`)

    const invitationTokens = await Invitation.query()
      .where('expired_at', '<', new Date())
      .delete()

    this.logger.info(`${invitationTokens} invitations tokens deleted`)
  }
}
