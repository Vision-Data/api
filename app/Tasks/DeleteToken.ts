import { BaseTask } from 'adonis5-scheduler/build'
import Database from '@ioc:Adonis/Lucid/Database'

export default class DeleteToken extends BaseTask {
  public static get schedule() {
    return '*/5 * * * *'
  }
  /**
   * Set enable use .lock file for block run retry task
   * Lock file save to `build/tmpTaskLock`
   */
  public static get useLock() {
    return false
  }

  public async handle() {
    const deletedApiTokens = await Database.from('api_tokens')
      .where('expires_at', '<', new Date())
      .delete()

    this.logger.info(`${deletedApiTokens} api tokens deleted`)

    const deletedPasswordTokens = await Database.from('password_tokens')
      .where('expired_at', '<', new Date())
      .delete()

    this.logger.info(`${deletedPasswordTokens} password tokens deleted`)
  }
}
