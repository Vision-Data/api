import User from 'App/Models/User'
import { DateTime } from 'luxon'
import {
  BaseModel,
  column,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'

export default class Workspace extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public name: string

  @column()
  public environmentVariables?: object

  @column()
  public logo?: string

  @column()
  public color?: string

  @manyToMany(() => User, {
    pivotTable: 'workspace_users',
    pivotTimestamps: true,
    pivotColumns: ['role'],
  })
  public users: ManyToMany<typeof User>

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
