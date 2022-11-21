import Invitation from 'App/Models/Invitation'
import Database from '@ioc:Adonis/Lucid/Database'
import { test } from '@japa/runner'
import faker from '@faker-js/faker'
import { createUser } from '../utils'
import Mail from '@ioc:Adonis/Addons/Mail'
import { DateTime } from 'luxon'

let user

const createWorkspace = async (
  client,
  userData,
  data: any = {
    name: 'My amzing workspace',
    logo: 'http://google.com',
    color: '#ffffff',
  }
) => {
  return await client.post('/workspaces').json(data).loginAs(userData)
}

const createInvitation = async (client, user, workspaceId, email) => {
  return await client
    .post(`/workspaces/${workspaceId}/invitations`)
    .loginAs(user)
    .json({ email })
}

test.group('Get workspaces', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return list of workspaces', async ({ client, assert }) => {
    await createWorkspace(client, user)

    const response = await client.get('/workspaces').loginAs(user)

    assert.equal(response.body().data.length, 1)
    assert.properties(response.body(), ['data', 'meta'])
    assert.properties(response.body().data[0], [
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
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should that return name is too short', async ({
    client,
    assert,
  }) => {
    const response = await createWorkspace(client, user, {
      name: 'a',
      logo: null,
      color: null,
    })

    assert.equal(
      response.body().errors[0].message,
      'This field must be at least 3 characters'
    )
  })

  test('it should that return name is too long', async ({ client, assert }) => {
    const response = await createWorkspace(client, user, {
      name: faker.lorem.words(200),
      logo: null,
      color: null,
    })

    assert.equal(
      response.body().errors[0].message,
      'This field must be at most 100 characters'
    )
  })

  test('it should that return logo is not valid', async ({
    client,
    assert,
  }) => {
    const response = await createWorkspace(client, user, {
      name: 'My amzing workspace',
      logo: 'badUrl',
      color: null,
    })

    assert.equal(response.body().errors[0].message, 'Invalid URL')
  })

  test('it should that return color is not hexColor', async ({
    client,
    assert,
  }) => {
    const response = await createWorkspace(client, user, {
      name: 'My amzing workspace',
      logo: null,
      color: 'test',
    })

    assert.equal(response.body().errors[0].message, 'Invalid hexadecimal color')
  })

  test('it should that return workspace is successfuly', async ({
    client,
    assert,
  }) => {
    const response = await createWorkspace(client, user, {
      name: 'My amzing workspace',
      logo: 'http://google.com',
      color: '#ffffff',
    })

    assert.properties(response.body(), [
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
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should that return workspace is not found', async ({
    client,
    assert,
  }) => {
    const anotherUser = await createUser()
    const result = await createWorkspace(client, anotherUser)

    const response = await client
      .get(`/workspaces/${result.body().id}`)
      .loginAs(user)

    assert.equal(response.status(), 404)
  })

  test('it should that return workspace successfuly', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await client
      .get(`/workspaces/${result.body().id}`)
      .loginAs(user)

    assert.properties(response.body(), [
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
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should that return workspace not found', async ({
    client,
    assert,
  }) => {
    const anotherUser = await createUser()
    const result = await createWorkspace(client, anotherUser)

    const response = await client
      .put(`/workspaces/${result.body().id}`)
      .loginAs(user)
      .json({
        name: 'My amzing workspace update',
        logo: 'http://google.com',
        color: '#ffffff',
      })

    assert.equal(response.status(), 404)
  })

  test('it should that return user not allowed to update workspace', async ({
    client,
    assert,
  }) => {
    const response = await createWorkspace(client, user)

    await Database.rawQuery(
      'UPDATE workspace_users SET role = ? WHERE workspace_id = ? AND user_id = ?',
      ['member', response.body().id, user.id]
    )

    const result = await client
      .put(`/workspaces/${response.body().id}`)
      .loginAs(user)
      .json({
        name: 'My amzing workspace update',
        logo: 'http://google.com',
        color: '#ffffff',
      })

    assert.equal(result.status(), 403)
  })

  test('it should that return name is too short', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await client
      .put(`/workspaces/${result.body().id}`)
      .loginAs(user)
      .json({
        name: 'a',
        logo: null,
        color: null,
      })

    assert.equal(
      response.body().errors[0].message,
      'This field must be at least 3 characters'
    )
  })

  test('it should that return name is too long', async ({ client, assert }) => {
    const result = await createWorkspace(client, user)

    const response = await client
      .put(`/workspaces/${result.body().id}`)
      .loginAs(user)
      .json({
        name: faker.lorem.words(200),
        logo: null,
        color: null,
      })

    assert.equal(
      response.body().errors[0].message,
      'This field must be at most 100 characters'
    )
  })

  test('it should that return logo is not valid', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await client
      .put(`/workspaces/${result.body().id}`)
      .loginAs(user)
      .json({
        name: 'My amzing workspace',
        logo: 'badUrl',
        color: null,
      })

    assert.equal(response.body().errors[0].message, 'Invalid URL')
  })

  test('it should that return color is not hexColor', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await client
      .put(`/workspaces/${result.body().id}`)
      .loginAs(user)
      .json({
        name: 'My amzing workspace',
        logo: null,
        color: 'test',
      })

    assert.equal(response.body().errors[0].message, 'Invalid hexadecimal color')
  })

  test('it should that return workspace updated successfuly', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await client
      .put(`/workspaces/${result.body().id}`)
      .loginAs(user)
      .json({
        name: 'My amzing workspace updated',
        logo: null,
        color: null,
      })

    assert.properties(response.body(), [
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
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should that return workspace not found', async ({
    client,
    assert,
  }) => {
    const anotherUser = await createUser()
    const result = await createWorkspace(client, anotherUser)

    const response = await client
      .delete(`/workspaces/${result.body().id}`)
      .loginAs(user)

    assert.equal(response.status(), 404)
  })

  test('it should that return user not allowed to delete workspace', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    await Database.rawQuery(
      'UPDATE workspace_users SET role = ? WHERE workspace_id = ? AND user_id = ?',
      ['member', result.body().id, user.id]
    )

    const response = await client
      .delete(`/workspaces/${result.body().id}`)
      .loginAs(user)

    assert.equal(response.status(), 403)
  })

  test('it should that return workspace deleted successfuly', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await client
      .delete(`/workspaces/${result.body().id}`)
      .loginAs(user)

    assert.equal(response.status(), 204)
  })
})

test.group('Invite a user in workspace', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should that return workspace not found', async ({
    client,
    assert,
  }) => {
    const anotherUser = await createUser()
    const result = await createWorkspace(client, anotherUser)

    const response = await createInvitation(
      client,
      user,
      result.body().id,
      anotherUser.email
    )

    assert.equal(response.status(), 404)
  })

  test('it should that return user not allowed to update workspace', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    await Database.rawQuery(
      'UPDATE workspace_users SET role = ? WHERE workspace_id = ? AND user_id = ?',
      ['member', result.body().id, user.id]
    )

    const response = await createInvitation(
      client,
      user,
      result.body().id,
      'anotheruser@gmail.com'
    )

    assert.equal(response.status(), 403)
  })

  test('it should that return email is not valid', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await createInvitation(
      client,
      user,
      result.body().id,
      'notanemail'
    )

    assert.equal(response.status(), 422)
    assert.equal(response.body().errors[0].message, 'Invalid email')
  })

  test('it should that return user account not found', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await createInvitation(
      client,
      user,
      result.body().id,
      'notregistered@gmail.com'
    )

    assert.equal(response.status(), 422)
    assert.equal(
      response.body().errors[0].message,
      'User account with this email does not exist'
    )
  })

  test('it should that return user account already added', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await createInvitation(
      client,
      user,
      result.body().id,
      user.email
    )

    assert.equal(response.status(), 409)
    assert.equal(response.body().error, 'User already added in workspace')
  })

  test('it should that return invitation sent successfuly', async ({
    client,
    assert,
  }) => {
    const mailer = Mail.fake()
    const result = await createWorkspace(client, user)

    const anotherUser = await createUser({ email: 'anotheruser@mail.com' })

    const response = await createInvitation(
      client,
      user,
      result.body().id,
      anotherUser.email
    )
    assert.equal(response.status(), 204)

    assert.isTrue(
      mailer.exists((mail) => {
        return mail.to![0].address === anotherUser.email
      })
    )
  })
})

test.group('Validate an invitation to a workspace', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should return workspace not found', async ({ client, assert }) => {
    const response = await client
      .post(
        '/workspaces/8a970a53-c739-40cf-8c8c-3b2416852e7f/invitations/8a970a53-c739-40cf-8c8c-3b2416852e7f'
      )
      .loginAs(user)

    assert.equal(response.status(), 404)
  })

  test('it should that return invitation expired', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)
    const anotherUser = await createUser({ email: 'anotheruser@gmail.com' })
    await createInvitation(client, user, result.body().id, anotherUser.email)

    const invitation = await Invitation.firstOrFail()
    invitation.expiredAt = DateTime.now().minus({ days: 1 })
    await invitation.save()

    const response = await client
      .post(`/workspaces/${result.body().id}/invitations/${invitation.id}`)
      .loginAs(anotherUser)

    assert.equal(response.status(), 410)
    assert.equal(response.body().error, 'Invitation expired')
  })

  test('it should that return invitation is validated successfuly', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)
    const anotherUser = await createUser({ email: 'anotheruser@gmail.com' })
    await createInvitation(client, user, result.body().id, anotherUser.email)

    const invitation = await Invitation.firstOrFail()

    const response = await client
      .post(`/workspaces/${result.body().id}/invitations/${invitation.id}`)
      .loginAs(anotherUser)

    assert.equal(response.status(), 204)
  })
})

test.group('Remove a user in workspace', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    user = await createUser()
    return () => Database.rollbackGlobalTransaction()
  })

  test('it should that return user not found', async ({ client, assert }) => {
    const anotherUser = await createUser()
    const result = await createWorkspace(client, anotherUser)

    const response = await client
      .delete(`/workspaces/${result.body().id}/users/${user.id}`)
      .loginAs(user)

    assert.equal(response.status(), 404)
  })

  test('it should that return user not allowed to remove a user workspace', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    await Database.rawQuery(
      'UPDATE workspace_users SET role = ? WHERE workspace_id = ? AND user_id = ?',
      ['member', result.body().id, user.id]
    )

    const response = await client
      .delete(`/workspaces/${result.body().id}/users/${user.id}`)
      .loginAs(user)

    assert.equal(response.status(), 403)
  })

  test('it should that return user not found in workspace', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)
    const anotherUser = await createUser({ email: 'anotheruser@gmail.com' })

    const response = await client
      .delete(`/workspaces/${result.body().id}/users/${anotherUser.id}`)
      .loginAs(user)

    assert.equal(response.status(), 404)
  })

  test('it should that return cannot remove yourself', async ({
    client,
    assert,
  }) => {
    const result = await createWorkspace(client, user)

    const response = await client
      .delete(`/workspaces/${result.body().id}/users/${user.id}`)
      .loginAs(user)

    assert.equal(response.status(), 400)
  })

  test('it should that remove user successfuly', async ({ client, assert }) => {
    const result = await createWorkspace(client, user)

    const anotherUser = await createUser({ email: 'another@gmail.com' })

    await createInvitation(client, user, result.body().id, anotherUser.email)

    const invitation = await Invitation.firstOrFail()

    await client
      .post(`/workspaces/${result.body().id}/invitations/${invitation.id}`)
      .loginAs(anotherUser)

    const response = await client
      .delete(`/workspaces/${result.body().id}/users/${anotherUser.id}`)
      .loginAs(user)

    assert.equal(response.status(), 204)
  })
})
