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

export const api = async (url, params, app) => {
  if (process.env.__NUXT_BLOG__.static) {
    const result = await app.$axios.get(`${base}${format(`/_nuxt/${prefix}/${url}`, params)}.json`)

    return result.data
  }

  const result = await app.$axios.get(`${base}${format(`/${prefix}/${url}`, params)}`)

  return result.data
}
