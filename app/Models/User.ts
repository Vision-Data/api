import Workspace from 'App/Models/Workspace'
import { DateTime } from 'luxon'
import {
  BaseModel,
  beforeSave,
  column,
  computed,
  manyToMany,
  ManyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  public id: string

  @column()
  public email: string

  @column({ serializeAs: null })
  public password?: string

  @column()
  public fullName: string

  @column({ serializeAs: null })
  public providerId?: string

  @column()
  public provider?: string

  @column()
  public avatarUrl?: string

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime

  @manyToMany(() => Workspace, { pivotTable: 'workspace_users' })
  public workspaces: ManyToMany<typeof Workspace>

  @computed()
  public get role() {
    return this.$extras.pivot_role
  }

  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password!)
    }
  }
}
