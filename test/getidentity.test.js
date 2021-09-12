import * as t from 'tap'
import createAuthProvider from '../src/index'

function mockStorage () {
  const _storage = {}
  return {
    setItem: (key, val, persistent) => { _storage[key] = { val, persistent } },
    getItem: (key) => _storage[key] && _storage[key].val,
    removeItem: (key) => { delete _storage[key] },
    isItemPersistent: (key) => _storage[key] && _storage[key].persistent,
  }
}

function createAuthTestProvider (opts) {
  return createAuthProvider({
    ...opts,
    storage: mockStorage(),
  })
}

t.test('getIdentity', async t => {
  t.test('without passing a user', async t => {
    const provider = createAuthTestProvider('https://my.api.url/auth')
    const res = await provider.getIdentity()
    t.equal(res, '', 'should return an empty string')
  })
})
