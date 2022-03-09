import { UserFactory } from './UserFactory'
import Factory from '@ioc:Adonis/Lucid/Factory'
import Workspace from 'App/Models/Workspace'

export const WorkspaceFactory = Factory.define(Workspace, ({ faker }) => {
  return {
    name: faker.name.findName(),
    environmentVariables: { data: [] },
    logo: faker.image.imageUrl(),
    color: faker.internet.color(),
  }
})
  .relation('users', () => UserFactory)
  .build()
