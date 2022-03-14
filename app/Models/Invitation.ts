import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Invitation extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public userId: string

  @column()
  public workspaceId: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime()
  public expiredAt: DateTime
}
