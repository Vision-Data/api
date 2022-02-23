import { UserFactory } from './../database/factories/UserFactory'
import supertest from 'supertest'

export const createUser = async (user) => {
  return await UserFactory.merge(user).create()
}

export const login = async (baseUrl) => {
  const user = await createUser({
    fullName: 'John Doe',
    email: 'john@doe.com',
  })

  const { body } = await supertest(baseUrl).post('/login').send({
    email: user.email,
    password: 'secretPassw0rd',
  })

  return body
}
