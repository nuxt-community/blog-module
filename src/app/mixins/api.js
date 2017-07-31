const base = process.env.__NUXT_BLOG__.base.replace(/\/$/, '')
const prefix = process.env.__NUXT_BLOG__.api.prefix

export function format(template, resource) {
  const keys = Object.keys(resource)

  keys.forEach(key => {
    if (['number', 'string'].includes(typeof (resource[key]))) {
      template = template.replace(new RegExp(`:${key}`, 'gi'), `${resource[key]}`)
    }
  })

  return template.replace(/\/?:[^/]+/g, '').replace(/\/+/g, '/').replace(/\/$/, '')
}

async function get (url, app) {
  if (!app || !('$axios' in app)) {
    console.log('Use @nuxtjs/axios or axios plugin.\n' +
    'this.$axios is requried to fetch from blog API.\n' +
    'Falling back to fetch API. https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API')

    return (await fetch(url)).json()
  }

  return (await app.$axios.get(url)).data
}

export const api = async (url, params, app) => {
  if (process.env.__NUXT_BLOG__.static) {
    return await get(`${base}${format(`/_nuxt/${prefix}/${url}`, params)}.json`, app)
  }

  return await get(`${base}${format(`/${prefix}/${url}`, params)}`, app)
}
