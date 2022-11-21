import Factory from '@ioc:Adonis/Lucid/Factory'
import User from 'App/Models/User'

export const UserFactory = Factory.define(User, ({ faker }) => {
  return {
    email: faker.internet.email(),
    password: 'secretPassw0rd',
    fullName: faker.name.fullName(),
    avatarUrl: faker.internet.avatar(),
  }
}).build()
