import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { WorkspaceFactory } from 'Database/factories/WorkspaceFactory'

export default class WorkspaceSeeder extends BaseSeeder {
  public async run () {
    await WorkspaceFactory.createMany(10)
  }
}
