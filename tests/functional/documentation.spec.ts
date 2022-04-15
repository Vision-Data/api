import { test } from '@japa/runner'

test.group('Documentation access', () => {
  test('should that return response successfuly', async ({
    client,
    assert,
  }) => {
    const response = await client.get('/docs/index.html')
    assert.equal(response.status(), 200)
  })
})
