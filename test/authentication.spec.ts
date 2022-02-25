import PasswordToken from 'App/Models/PasswordToken'
import { createUser } from './utils'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'
import faker from 'faker'
import Mail from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

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
      'This field must be at least 4 characters'
    )
  })

  test('it should return that fullname is too long', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .post('/register')
      .send({
        full_name: faker.lorem.words(50),
        email: 'john@doe.com',
        password: '12345678',
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'This field must be at most 50 characters'
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
      'This field must be at least 8 characters'
    )
  })

  test('it should return that password is too long', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .post('/register')
      .send({
        full_name: 'John doe',
        email: 'john@doe.com',
        password: faker.lorem.words(50),
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'This field must be at most 30 characters'
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
      'avatar_url',
      'provider',
    ])
  })
})

test.group('Login', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should return that email is not an email', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL).post('/login').send({
      email: 'joh',
      password: '12345678',
    })

    assert.equal(statusCode, 422)
    assert.equal(body.errors[0].message, 'Invalid email')
  })

  test("it should return that email doesn't exists", async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL).post('/login').send({
      email: 'fake@gmail.com',
      password: '13303uieo',
    })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'User account with this email does not exist'
    )
  })

  test('it should return that password is too long', async (assert) => {
    const user = {
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '2033003003030LFJLEFJ',
    }

    await createUser(user)

    const { body, statusCode } = await supertest(BASE_URL)
      .post('/login')
      .send({
        email: 'john@doe.com',
        password: faker.lorem.words(100),
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'This field must be at most 30 characters'
    )
  })

  test('it should login successfuly', async (assert) => {
    const user = {
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '2033003003030LFJLEFJ',
    }

    await createUser(user)

    const { body, statusCode } = await supertest(BASE_URL).post('/login').send({
      email: user.email,
      password: user.password,
    })

    assert.equal(statusCode, 200)
    assert.hasAllKeys(body, ['token', 'user'])
    assert.hasAllDeepKeys(body.user, [
      'id',
      'full_name',
      'email',
      'created_at',
      'updated_at',
      'avatar_url',
      'provider',
    ])
  })
})

test.group('Send reset password link', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
    Mail.restore()
  })

  test('it should return that email is invalid', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .post('/password/reset')
      .send({
        email: 'john',
      })

    assert.equal(statusCode, 422)
    assert.equal(body.errors[0].message, 'Invalid email')
  })

  test('it should return that email is not found', async (assert) => {
    const { body, statusCode } = await supertest(BASE_URL)
      .post('/password/reset')
      .send({
        email: 'john@doe.com',
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'User account with this email does not exist'
    )
  })

  test('it should send password link successfuly  ', async (assert) => {
    const user = {
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '2033003003030LFJLEFJ',
    }

    await createUser(user)

    const { statusCode } = await supertest(BASE_URL)
      .post('/password/reset')
      .send({
        email: 'john@doe.com',
      })

    assert.equal(statusCode, 204)

    Mail.trap((message) => {
      assert.deepEqual(message.to, [
        {
          address: 'virk@adonisjs.com',
        },
      ])

      assert.equal(message.from?.address, 'visiondata@mail.com')

      assert.equal(message.subject, 'Vision - Réinitialisation du mot de passe')
    })
  })
})

test.group('Reset password', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should return that token is expired', async (assert) => {
    const passwordToken = await createPasswordToken()

    passwordToken!.expiredAt = DateTime.now().minus({ minutes: 15 })
    await passwordToken!.save()

    const { statusCode } = await supertest(BASE_URL)
      .post(`/password/reset/${passwordToken!.token}`)
      .send({
        password: '1234567666668',
      })

    assert.equal(statusCode, 404)
  })

  test('it should return that token is invalid', async (assert) => {
    const { statusCode } = await supertest(BASE_URL)
      .post(`/password/reset/${uuidv4()}`)
      .send({
        password: '1234567666668',
      })

    assert.equal(statusCode, 404)
  })

  test('it should return that password is too long', async (assert) => {
    const passwordToken = await createPasswordToken()

    const { body, statusCode } = await supertest(BASE_URL)
      .post(`/password/reset/${passwordToken!.token}`)
      .send({
        password: faker.lorem.words(50),
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'This field must be at most 30 characters'
    )
  })

  test('it should return that password is too short', async (assert) => {
    const passwordToken = await createPasswordToken()

    const { body, statusCode } = await supertest(BASE_URL)
      .post(`/password/reset/${passwordToken!.token}`)
      .send({
        password: 'pass',
      })

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'This field must be at least 8 characters'
    )
  })

  test('it should reset password successfuly', async (assert) => {
    const passwordToken = await createPasswordToken()

    const newPassword = 'newPass0rd9643'
    const { statusCode } = await supertest(BASE_URL)
      .post(`/password/reset/${passwordToken!.token}`)
      .send({
        password: newPassword,
      })

    assert.equal(statusCode, 204)

    const { body, status } = await supertest(BASE_URL).post('/login').send({
      email: 'john@doe.com',
      password: newPassword,
    })

    assert.equal(status, 200)
    assert.hasAllKeys(body, ['token', 'user'])
  })
})

const createPasswordToken = async () => {
  const user = {
    full_name: 'John doe',
    email: 'john@doe.com',
    password: '2033003003030LFJLEFJ',
  }

  await createUser(user)

  await supertest(BASE_URL).post('/password/reset').send({
    email: 'john@doe.com',
  })

  return await PasswordToken.first()
}
