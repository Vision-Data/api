import { createUser } from './utils'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`

test.group('Register', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should return that fullname is too short', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .post('/register')
      .send({
        full_name: 'a',
        email: 'john@doe.com',
        password: '12345678',
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'full_name must be at least 4 characters'
    )
  })

  test('it should return that email is not an email', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .post('/register')
      .send({
        full_name: 'John doe',
        email: 'joh',
        password: '12345678',
      })

    assert.equal(statusCode, 422)
    assert.equal(body.errors[0].message, 'Invalid email')
  })

  test('it should return that email is already exists', async (assert) => {
    const user = {
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '12345678',
    }

    await createUser(user)

    const { body, statusCode } = await supertest(BASE_URL)
      .post('/register')
      .send(user)

    assert.equal(statusCode, 422)
    assert.equal(body.errors[0].message, 'This email already exists')
  })

  test('it should return that password is too short', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .post('/register')
      .send({
        full_name: 'John doe',
        email: 'john@doe.com',
        password: '1',
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'password must be at least 8 characters'
    )
  })

  test('it should that create user successfuly', async (assert) => {
    const { body } = await supertest(BASE_URL).post('/register').send({
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '2033003003030LFJLEFJ',
    })

    assert.hasAllKeys(body, ['token', 'user'])
    assert.hasAllDeepKeys(body.user, [
      'id',
      'full_name',
      'email',
      'created_at',
      'updated_at',
    ])
  })
})
