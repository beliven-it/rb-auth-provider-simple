import fetch from 'cross-fetch';

export default (url, opts) => {
  return fetch(url, {
    credentials: 'include',
    ...opts,
    headers: {
      Accept: 'application/json',
      ...opts.headers
    },
  })
}