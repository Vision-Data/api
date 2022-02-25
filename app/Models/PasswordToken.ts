import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class PasswordToken extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public token: string

  @column()
  public userId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime()
  public expiredAt: DateTime
}
