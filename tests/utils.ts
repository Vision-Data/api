import { UserFactory } from './../database/factories/UserFactory'

export const createUser = async (user = {}) => {
  return await UserFactory.merge(user).create()
}
