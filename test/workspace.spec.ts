import Invitation from 'App/Models/Invitation'
import Mail from '@ioc:Adonis/Addons/Mail'
import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'
import { login } from './utils'
import faker from 'faker'
import { createUser } from './utils'
import { DateTime } from 'luxon'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user

const createWorkspace = async (
  user,
  data = {
    name: 'My amzing workspace',
    logo: 'http://google.com',
    color: '#ffffff',
  }
) => {
  return await supertest(BASE_URL)
    .post('/workspaces')
    .set('Authorization', `Bearer ${user.token}`)
    .send(data)
}

const createInvitation = async (user, workspaceId, email) => {
  return await supertest(BASE_URL)
    .post(`/workspaces/${workspaceId}/invitations`)
    .set('Authorization', `Bearer ${user.token}`)
    .send({ email })
}

test.group('Get workspaces', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should return list of workspaces', async (assert) => {
    const workspace = await createWorkspace(user)

    const { body } = await supertest(BASE_URL)
      .get('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)

    assert.equal(body.data.length, 1)
    assert.hasAllKeys(body, ['data', 'meta'])
    assert.hasAllKeys(body.data[0], [
      'id',
      'name',
      'logo',
      'color',
      'users',
      'created_at',
      'updated_at',
      'environment_variables',
    ])
  })
})

test.group('Create a workspace', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should that return name is too short', async (assert) => {
    const { body } = await createWorkspace(user, {
      name: 'a',
      logo: null,
      color: null,
    })

    assert.equal(
      body.errors[0].message,
      'This field must be at least 3 characters'
    )
  })

  test('it should that return name is too long', async (assert) => {
    const { body } = await createWorkspace(user, {
      name: faker.lorem.words(200),
      logo: null,
      color: null,
    })

    assert.equal(
      body.errors[0].message,
      'This field must be at most 100 characters'
    )
  })

  test('it should that return logo is not valid', async (assert) => {
    const { body } = await createWorkspace(user, {
      name: 'My amzing workspace',
      logo: 'badUrl',
      color: null,
    })

    assert.equal(body.errors[0].message, 'Invalid URL')
  })

  test('it should that return color is not hexColor', async (assert) => {
    const { body } = await createWorkspace(user, {
      name: 'My amzing workspace',
      logo: null,
      color: 'test',
    })

    assert.equal(body.errors[0].message, 'Invalid hexadecimal color')
  })

  test('it should that return workspace is successfuly', async (assert) => {
    const { body } = await createWorkspace(user, {
      name: 'My amzing workspace',
      logo: 'http://google.com',
      color: '#ffffff',
    })

    assert.hasAllKeys(body, [
      'id',
      'name',
      'logo',
      'color',
      'created_at',
      'updated_at',
    ])
  })
})

test.group('Get workspace by id', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should that return workspace is not found', async (assert) => {
    const anotherUser = await login(BASE_URL, { email: 'another@user.com' })
    const result = await createWorkspace(anotherUser)

    const { statusCode } = await supertest(BASE_URL)
      .get(`/workspaces/${result.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)

    assert.equal(statusCode, 404)
  })

  test('it should that return workspace successfuly', async (assert) => {
    const result = await createWorkspace(user)

    const { body } = await supertest(BASE_URL)
      .get(`/workspaces/${result.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)

    assert.hasAllKeys(body, [
      'id',
      'name',
      'logo',
      'color',
      'users',
      'created_at',
      'updated_at',
      'environment_variables',
    ])
  })
})

test.group('Update a workspace', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should that return workspace not found', async (assert) => {
    const anotherUser = await login(BASE_URL, { email: 'another@user.com' })
    const { body } = await createWorkspace(anotherUser)

    const { statusCode } = await supertest(BASE_URL)
      .put(`/workspaces/${body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace update',
        logo: 'http://google.com',
        color: '#ffffff',
      })

    assert.equal(statusCode, 404)
  })

  test('it should that return user not allowed to update workspace', async (assert) => {
    const { body } = await createWorkspace(user)

    await Database.rawQuery(
      'UPDATE workspace_users SET role = ? WHERE workspace_id = ? AND user_id = ?',
      ['member', body.id, user.user.id]
    )

    const { statusCode } = await supertest(BASE_URL)
      .put(`/workspaces/${body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace update',
        logo: 'http://google.com',
        color: '#ffffff',
      })

    assert.equal(statusCode, 403)
  })

  test('it should that return name is too short', async (assert) => {
    const result = await createWorkspace(user)

    const { body } = await supertest(BASE_URL)
      .put(`/workspaces/${result.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'a',
        logo: null,
        color: null,
      })

    assert.equal(
      body.errors[0].message,
      'This field must be at least 3 characters'
    )
  })

  test('it should that return name is too long', async (assert) => {
    const result = await createWorkspace(user)

    const { body } = await supertest(BASE_URL)
      .put(`/workspaces/${result.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: faker.lorem.words(200),
        logo: null,
        color: null,
      })

    assert.equal(
      body.errors[0].message,
      'This field must be at most 100 characters'
    )
  })

  test('it should that return logo is not valid', async (assert) => {
    const result = await createWorkspace(user)

    const { body } = await supertest(BASE_URL)
      .put(`/workspaces/${result.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'badUrl',
        color: null,
      })

    assert.equal(body.errors[0].message, 'Invalid URL')
  })

  test('it should that return color is not hexColor', async (assert) => {
    const result = await createWorkspace(user)

    const { body } = await supertest(BASE_URL)
      .put(`/workspaces/${result.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: null,
        color: 'test',
      })

    assert.equal(body.errors[0].message, 'Invalid hexadecimal color')
  })

  test('it should that return workspace updated successfuly', async (assert) => {
    const result = await createWorkspace(user)

    const { body } = await supertest(BASE_URL)
      .put(`/workspaces/${result.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace updated',
        logo: null,
        color: null,
      })

    assert.hasAllKeys(body, [
      'id',
      'name',
      'logo',
      'color',
      'created_at',
      'updated_at',
      'environment_variables',
      'users',
    ])
  })
})

test.group('Delete a workspace', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should that return workspace not found', async (assert) => {
    const anotherUser = await login(BASE_URL, { email: 'another@user.com' })
    const { body } = await createWorkspace(anotherUser)

    const { statusCode } = await supertest(BASE_URL)
      .delete(`/workspaces/${body.id}`)
      .set('Authorization', `Bearer ${user.token}`)

    assert.equal(statusCode, 404)
  })

  test('it should that return user not allowed to delete workspace', async (assert) => {
    const { body } = await createWorkspace(user)

    await Database.rawQuery(
      'UPDATE workspace_users SET role = ? WHERE workspace_id = ? AND user_id = ?',
      ['member', body.id, user.user.id]
    )

    const { statusCode } = await supertest(BASE_URL)
      .delete(`/workspaces/${body.id}`)
      .set('Authorization', `Bearer ${user.token}`)

    assert.equal(statusCode, 403)
  })

  test('it should that return workspace deleted successfuly', async (assert) => {
    const result = await createWorkspace(user)

    const { statusCode } = await supertest(BASE_URL)
      .delete(`/workspaces/${result.body.id}`)
      .set('Authorization', `Bearer ${user.token}`)

    assert.equal(statusCode, 204)
  })
})

test.group('Invite a user in workspace', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
    Mail.restore()
  })

  test('it should that return workspace not found', async (assert) => {
    const anotherUser = await login(BASE_URL, { email: 'another@user.com' })
    const { body } = await createWorkspace(anotherUser)

    const { statusCode } = await createInvitation(
      user,
      body.id,
      anotherUser.user.email
    )

    assert.equal(statusCode, 404)
  })

  test('it should that return user not allowed to update workspace', async (assert) => {
    const { body } = await createWorkspace(user)

    await Database.rawQuery(
      'UPDATE workspace_users SET role = ? WHERE workspace_id = ? AND user_id = ?',
      ['member', body.id, user.user.id]
    )

    const { statusCode } = await createInvitation(
      user,
      body.id,
      'anotheruser@gmail.com'
    )

    assert.equal(statusCode, 403)
  })

  test('it should that return email is not valid', async (assert) => {
    const result = await createWorkspace(user)

    const { body, statusCode } = await createInvitation(
      user,
      result.body.id,
      'notanemail'
    )

    assert.equal(statusCode, 422)
    assert.equal(body.errors[0].message, 'Invalid email')
  })

  test('it should that return user account not found', async (assert) => {
    const result = await createWorkspace(user)

    const { body, statusCode } = await createInvitation(
      user,
      result.body.id,
      'notregistered@gmail.com'
    )

    assert.equal(statusCode, 422)
    assert.equal(
      body.errors[0].message,
      'User account with this email does not exist'
    )
  })

  test('it should that return user account already added', async (assert) => {
    const result = await createWorkspace(user)

    const { body, statusCode } = await createInvitation(
      user,
      result.body.id,
      user.user.email
    )

    assert.equal(statusCode, 409)
    assert.equal(body.error, 'User already added in workspace')
  })

  test('it should that return invitation sent successfuly', async (assert) => {
    const result = await createWorkspace(user)

    const anotherUser = await createUser({ email: 'anotheruser@mail.com' })

    Mail.trap((message) => {
      assert.deepEqual(message.to, [
        {
          address: anotherUser.email,
        },
      ])
    })

    const { statusCode } = await createInvitation(
      user,
      result.body.id,
      anotherUser.email
    )
    assert.equal(statusCode, 204)
  })
})

test.group('Validate an invitation to a workspace', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
    Mail.restore()
  })

  test('it should return workspace not found', async (assert) => {
    const { statusCode } = await supertest(BASE_URL)
      .post(
        `/workspaces/8a970a53-c739-40cf-8c8c-3b2416852e7f/invitations/8a970a53-c739-40cf-8c8c-3b2416852e7f`
      )
      .set('Authorization', `Bearer ${user.token}`)

    assert.equal(statusCode, 404)
  })

  test('it should that return invitation expired', async (assert) => {
    const result = await createWorkspace(user)
    const anotherUser = await createUser({ email: 'anotheruser@gmail.com' })
    await createInvitation(user, result.body.id, anotherUser.email)

    const invitation = await Invitation.firstOrFail()
    invitation.expiredAt = DateTime.now().minus({ days: 1 })
    await invitation.save()

    const { body, statusCode } = await supertest(BASE_URL)
      .post(`/workspaces/${result.body.id}/invitations/${invitation.id}`)
      .set('Authorization', `Bearer ${user.token}`)

    assert.equal(statusCode, 410)
    assert.equal(body.error, 'Invitation expired')
  })

  test('it should that return invitation is validated successfuly', async (assert) => {
    const result = await createWorkspace(user)
    const anotherUser = await createUser({ email: 'anotheruser@gmail.com' })
    await createInvitation(user, result.body.id, anotherUser.email)

    const invitation = await Invitation.firstOrFail()

    const { statusCode } = await supertest(BASE_URL)
      .post(`/workspaces/${result.body.id}/invitations/${invitation.id}`)
      .set('Authorization', `Bearer ${user.token}`)

    assert.equal(statusCode, 204)
  })
})
