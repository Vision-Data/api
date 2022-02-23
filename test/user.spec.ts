import { login, createUser } from './utils'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user

test.group('Get user profile', (group) => {
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

test.group('Update user profile', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should return that fullname is too short', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .put('/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        full_name: 'a',
        email: 'john@doe.com',
        avatar_url: 'https://img.com',
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'This field must be at least 4 characters'
    )
  })

  test('it should return that email is not an email', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .put('/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        full_name: 'John Doe',
        email: 'john',
        avatar_url: 'https://img.com',
      })

    assert.equal(statusCode, 422)
    assert.equal(body.errors[0].message, 'Invalid email')
  })

  test('it should return that email is already exists', async (assert) => {
    await createUser({ email: 'anon@mail.com' })
    const { body, statusCode } = await supertest(BASE_URL)
      .put('/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        full_name: 'John Doe',
        email: 'anon@mail.com',
        avatar_url: 'https://img.com',
      })

    assert.equal(statusCode, 422)
    assert.equal(body.errors[0].message, 'This email already exists')
  })

  test('it should return that url is invalid', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .put('/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        full_name: 'John Doe',
        email: 'john@doe.com',
        avatar_url: 'fakeurl',
      })

    assert.equal(statusCode, 422)
    assert.equal(body.errors[0].message, 'Invalid URL')
  })

  test('it should update user profile sucessfuly', async (assert) => {
    const data = {
      full_name: 'John Doe update',
      email: 'john@doeupdate.com',
      avatar_url: 'http://imgupdate.com',
    }

    const { body } = await supertest(BASE_URL)
      .put('/users/me')
      .set('Authorization', `Bearer ${user.token}`)
      .send(data)

    assert.include(body, data)
  })
})
