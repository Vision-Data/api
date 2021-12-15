import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, column } from '@ioc:Adonis/Lucid/Orm'
import { v4 as uuid } from 'uuid'


export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public email: String

  @column()
  public password: String

  @column()
  public fullName: String

  @column()
  public providerId: String
  
  @column()
  public provider: String
  
  @column()
  public uuid: String

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @beforeCreate()
  public static async generateUuid(user: User) {
    user.uuid = uuid()
  }
}
