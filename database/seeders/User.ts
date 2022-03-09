import { UserFactory } from './../factories/UserFactory'
import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'

export default class UserSeeder extends BaseSeeder {
  public async run() {
    await UserFactory.merge({
      email: 'john@doe.com',
      fullName: 'John Doe',
    }).create()
  }
}
