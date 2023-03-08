import { createUser } from '../utils'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import { faker } from '@faker-js/faker'

let user

test.group('Get user profile', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return user profile', async ({ client, assert }) => {
    const response = await client.get('/users/me').loginAs(user)

    assert.properties(response.body(), [
      'id',
      'full_name',
      'email',
      'avatar_url',
      'created_at',
      'updated_at',
      'provider',
    ])
  })
})

test.group('Update user profile', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that fullname is too short', async ({
    client,
    assert,
  }) => {
    const response = await client.put('/users/me').loginAs(user).json({
      full_name: 'a',
      email: 'john@doe.com',
      avatar_url: 'https://img.com',
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
    const response = await client
      .put('/users/me')
      .loginAs(user)
      .json({
        full_name: faker.lorem.words(50),
        email: 'john@doe.com',
        avatar_url: 'https://img.com',
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
    const response = await client.put('/users/me').loginAs(user).json({
      full_name: 'John Doe',
      email: 'john',
      avatar_url: 'https://img.com',
    })

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, 'Email invalide')
  })

  test('it should return that email is already exists', async ({
    client,
    assert,
  }) => {
    await createUser({ email: 'anon@mail.com' })
    const response = await client.put('/users/me').loginAs(user).json({
      full_name: 'John Doe',
      email: 'anon@mail.com',
      avatar_url: 'https://img.com',
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Cette adresse email est déjà utilisée'
    )
  })

  test('it should return that url is invalid', async ({ client, assert }) => {
    const response = await client.put('/users/me').loginAs(user).json({
      full_name: 'John Doe',
      email: 'john@doe.com',
      avatar_url: 'fakeurl',
    })

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, 'URL invalide')
  })

  test('it should update user profile sucessfuly', async ({
    client,
    assert,
  }) => {
    const data = {
      full_name: 'John Doe update',
      email: 'john@doeupdate.com',
      avatar_url: 'http://imgupdate.com',
    }

    const response = await client.put('/users/me').loginAs(user).json(data)

    assert.include(response.body(), data)
  })
})

test.group('Change password', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return that password is too long', async ({
    client,
    assert,
  }) => {
    const response = await client
      .put('/users/me/password')
      .loginAs(user)
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
    const response = await client.put('/users/me/password').loginAs(user).json({
      password: 'pass',
    })

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'Ce champ doit avoir au moins 8 caractères'
    )
  })

  test('it should return that password is updated successfully', async ({
    client,
    assert,
  }) => {
    const response = await client.put('/users/me/password').loginAs(user).json({
      password: 'newPassw0rd',
    })

    assert.equal(response.status(), 204)
  })
})
