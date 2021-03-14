import * as t from 'tap'
import createAuthProvider from '../src/index'

function mockStorage () {
  const _storage = {}
  return {
    setItem: (key, val) => { _storage[key] = val },
    getItem: (key) => _storage[key],
    removeItem: (key) => { delete _storage[key] }
  }
}

function createAuthTestProvider (opts) {
  return createAuthProvider({
    ...opts,
    storage: {
      local: mockStorage(),
      session: mockStorage()
    }
  })
}

t.test('getIdentity', async t => {
  t.test('without passing a user', async t => {
    const provider = createAuthTestProvider('https://my.api.url/auth')
    const res = await provider.getIdentity()
    t.equal(res, '', 'should return an empty string')
  })
})
