import { routes } from '../app/routes'
import { format } from '../helpers/path'
import blog from '../blog'

function toPlainObject (any) {
  if (Array.isArray(any)) {
    return any.map(item => JSON.parse(JSON.stringify(item)))
  }

  return JSON.parse(JSON.stringify(any))
}

export default async function () {
  await blog.create()
  const paths = []
  routes.forEach(route => {
    switch (route.name) {
      case '@nuxtjs/blog:index':
        paths.push({
          route: route.path,
          payload: toPlainObject(blog.articles.map(article => article.preview))
        })
        break
      case '@nuxtjs/blog:article':
        paths.push(...blog.articles.map(article => ({
          route: format(route.path, article),
          payload: toPlainObject(article)
        })))
        break
      case '@nuxtjs/blog:tag':
        paths.push(...blog.tags.map(tag => ({
          route: format(route.path, tag),
          payload: toPlainObject(tag.toPlainObject())
        })))
        break
      case '@nuxtjs/blog:collection':
        paths.push(...blog.collections.map(collection => ({
          route: format(route.path, collection),
          payload: toPlainObject(collection.toPlainObject())
        })))
        break
      default:
        // -- Ignore!
    }
  })

  return paths
}
