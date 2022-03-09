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

  // TODO validation name is too short
  // TODO validation name is too long
  // TODO environnement variables is not object
  // TODO logo is not a url valid
  // TODO color is equal 7
  // TODO color is not hex

  test('it should that return name is too short', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'a',
        environnement_variables: null,
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
        environnement_variables: null,
        logo: null,
        color: null,
      })

    assert.equal(
      body.errors[0].message,
      'This field must be at most 100 characters'
    )
  })

  test('it should that return env vars is not valid', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        environment_variables: 'ee',
        logo: null,
        color: null,
      })

    assert.equal(body.errors[0].message, 'object validation failed')
  })

  test('it should that return logo is not valid', async (assert) => {
    const { body } = await supertest(BASE_URL)
      .post('/workspaces')
      .set('Authorization', `Bearer ${user.token}`)
      .send({
        name: 'My amzing workspace',
        environment_variables: null,
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
        environment_variables: null,
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
        environment_variables: {},
        logo: 'http://google.com',
        color: '#ffffff',
      })

    assert.hasAllKeys(body, [
      'id',
      'name',
      'environment_variables',
      'logo',
      'color',
      'created_at',
      'updated_at',
    ])
  })

  // TODO success
})
