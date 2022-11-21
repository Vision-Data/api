import { UserFactory } from './UserFactory'
import Factory from '@ioc:Adonis/Lucid/Factory'
import Workspace from 'App/Models/Workspace'

export const WorkspaceFactory = Factory.define(Workspace, ({ faker }) => {
  return {
    name: faker.name.fullName(),
    environmentVariables: { data: [] },
    logo: faker.image.imageUrl(),
    color: '#ffffff',
  }
})
  .relation('users', () => UserFactory)
  .build()
