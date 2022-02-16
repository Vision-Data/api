import { login } from './utils'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user

test.group('User profile', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should return user profile', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .get('/users/me')
      .set('Authorization', `Bearer ${user.token}`)

    assert.hasAllKeys(body, [
      'id',
      'full_name',
      'email',
      'avatar_url',
      'created_at',
      'updated_at',
    ])
  })
})
