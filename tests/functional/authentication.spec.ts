import PasswordToken from 'App/Models/PasswordToken'
import { createUser } from '../utils'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { faker } from '@faker-js/faker'
import Mail from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'
import { v4 as uuidv4 } from 'uuid'

test.group('Register', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that fullname is too short', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/register').json({
      full_name: 'a',
      email: 'john@doe.com',
      password: '12345678',
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Ce champ doit avoir au moins 4 caractères'
    )
  })

  test('it should return that fullname is too long', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/register').json({
      full_name: faker.lorem.words(50),
      email: 'john@doe.com',
      password: '12345678',
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Ce champ doit avoir au maximum 50 caractères'
    )
  })

  test('it should return that email is not an email', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/register').json({
      full_name: 'John doe',
      email: 'joh',
      password: '12345678',
    })

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, 'Email invalide')
  })

  test('it should return that email is already exists', async ({
    client,
    assert,
  }) => {
    const user = {
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '12345678',
    }

    await createUser(user)

    const response = await client.post('/register').json(user)

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Cette adresse email est déjà utilisée'
    )
  })

  test('it should return that password is too short', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/register').json({
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '1',
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Ce champ doit avoir au moins 8 caractères'
    )
  })

  test('it should return that password is too long', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/register').json({
      full_name: 'John doe',
      email: 'john@doe.com',
      password: faker.lorem.words(50),
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Ce champ doit avoir au maximum 30 caractères'
    )
  })

  test('it should that create user successfuly', async ({ client, assert }) => {
    const response = await client.post('/register').json({
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '2033003003030LFJLEFJ',
    })

    assert.properties(response.body(), ['token', 'user'])
    assert.properties(response.body().user, [
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
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that email is not an email', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/login').json({
      email: 'joh',
      password: '12345678',
    })

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, 'Email invalide')
  })

  test("it should return that email doesn't exists", async ({
    client,
    assert,
  }) => {
    const response = await client.post('/login').json({
      email: 'fake@gmail.com',
      password: '13303uieo',
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      "Aucun compte n'est associé à cette adresse email"
    )
  })

  test('it should return that password is too long', async ({
    client,
    assert,
  }) => {
    const user = {
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '2033003003030LFJLEFJ',
    }

    await createUser(user)

    const response = await client.post('/login').json({
      email: 'john@doe.com',
      password: faker.lorem.words(100),
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Ce champ doit avoir au maximum 30 caractères'
    )
  })

  test('it should login successfuly', async ({ client, assert }) => {
    const user = {
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '2033003003030LFJLEFJ',
    }

    await createUser(user)

    const response = await client.post('/login').json({
      email: user.email,
      password: user.password,
    })

    assert.equal(response.status(), 200)
    assert.properties(response.body(), ['token', 'user'])
    assert.properties(response.body().user, [
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
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that email is invalid', async ({ client, assert }) => {
    const response = await client.post('/password/reset').json({
      email: 'john',
    })

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, 'Email invalide')
  })

  test('it should return that email is not found', async ({
    client,
    assert,
  }) => {
    const response = await client.post('/password/reset').json({
      email: 'john@doe.com',
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      "Aucun compte n'est associé à cette adresse email"
    )
  })

  test('it should send password link successfuly  ', async ({
    client,
    assert,
  }) => {
    const user = {
      full_name: 'John doe',
      email: 'john@doe.com',
      password: '2033003003030LFJLEFJ',
    }

    await createUser(user)

    const mailer = Mail.fake()

    const response = await client.post('/password/reset').json({
      email: 'john@doe.com',
    })

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.subject === 'Vision - Réinitialisation du mot de passe'
      })
    )

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.to![0].address === user.email
      })
    )

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.from!.address === 'visiondata@mail.com'
      })
    )

    assert.equal(response.status(), 204)

    Mail.restore()
  })
})

test.group('Reset password', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that token is expired', async ({ client, assert }) => {
    const passwordToken = await createPasswordToken(client)

    passwordToken!.expiredAt = DateTime.now().minus({ minutes: 15 })
    await passwordToken!.save()

    const response = await client
      .post(`/password/reset/${passwordToken!.token}`)
      .json({
        password: '1234567666668',
      })

    assert.equal(response.status(), 404)
  })

  test('it should return that token is invalid', async ({ client, assert }) => {
    const response = await client.post(`/password/reset/${uuidv4()}`).json({
      password: '1234567666668',
    })

    assert.equal(response.status(), 404)
  })

  test('it should return that password is too long', async ({
    client,
    assert,
  }) => {
    const passwordToken = await createPasswordToken(client)

    const response = await client
      .post(`/password/reset/${passwordToken!.token}`)
      .json({
        password: faker.lorem.words(50),
      })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Ce champ doit avoir au maximum 30 caractères'
    )
  })

  test('it should return that password is too short', async ({
    client,
    assert,
  }) => {
    const passwordToken = await createPasswordToken(client)

    const response = await client
      .post(`/password/reset/${passwordToken!.token}`)
      .json({
        password: 'pass',
      })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Ce champ doit avoir au moins 8 caractères'
    )
  })

  test('it should reset password successfuly', async ({ client, assert }) => {
    const passwordToken = await createPasswordToken(client)

    const newPassword = 'newPass0rd9643'
    const passwordResetResponse = await client
      .post(`/password/reset/${passwordToken!.token}`)
      .json({
        password: newPassword,
      })

    assert.equal(passwordResetResponse.status(), 204)

    const response = await client.post('/login').json({
      email: 'john@doe.com',
      password: newPassword,
    })

    assert.equal(response.status(), 200)
    assert.properties(response.body(), ['token', 'user'])
  })
})

const createPasswordToken = async (client) => {
  const user = {
    full_name: 'John doe',
    email: 'john@doe.com',
    password: '2033003003030LFJLEFJ',
  }

  await createUser(user)

  await client.post('/password/reset').json({
    email: 'john@doe.com',
  })

  return await PasswordToken.first()
}
