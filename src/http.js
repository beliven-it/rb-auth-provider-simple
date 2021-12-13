import fetch from 'cross-fetch'

export const retryCodes = [408, 500, 502, 503, 504, 522, 524]

export function defaultClient (url, opts) {
  return fetch(url, {
    credentials: 'include',
    ...opts,
    headers: {
      Accept: 'application/json',
      ...opts.headers
    }
  })
}
