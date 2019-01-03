import slug from 'slug'

export function format (template, resource) {
  const keys = Object.keys(resource)

  keys.forEach(key => {
    if (['number', 'string'].includes(typeof (resource[key]))) {
      template = template.replace(new RegExp(`:${key}`, 'gi'), slug(`${resource[key]}`))
    }
  })

  return template.replace(/\/?:[^/]+/g, '')
}
