import Database from '@ioc:Adonis/Lucid/Database'
import test from 'japa'
import supertest from 'supertest'
import { login } from './utils'
import faker from 'faker'

const BASE_URL = `http://${process.env.HOST}:${process.env.PORT}`
let user

test.group('Create a workspace', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should that return name is too short', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
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
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
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
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'badUrl',
        color: null,
      })

    assert.equal(body.errors[0].message, 'Invalid URL')
  })

  test('it should that return color is not hexColor', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: null,
        color: 'test',
      })

    assert.equal(body.errors[0].message, 'Invalid hexadecimal color')
  })

  test('it should that return workspace is successfuly', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
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

test.group('Create a workspace', (group) => {
  group.beforeEach(async () => {
    await Database.beginGlobalTransaction()
    user = await login(BASE_URL)
  })

  group.afterEach(async () => {
    await Database.rollbackGlobalTransaction()
  })

  test('it should that return workspace not found', async (assert) => {
    const anotherUser = await login(BASE_URL, { email: 'another@user.com' })
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${anotherUser.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'http://google.com',
        color: '#ffffff',
      })

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
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'http://google.com',
        color: '#ffffff',
      })

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
    const result = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'http://google.com',
        color: '#ffffff',
      })

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
    const result = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'http://google.com',
        color: '#ffffff',
      })

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
    const result = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'http://google.com',
        color: '#ffffff',
      })

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
    const result = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'http://google.com',
        color: '#ffffff',
      })

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
    const result = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        logo: 'http://google.com',
        color: '#ffffff',
      })

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
