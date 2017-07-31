import path from 'path'

const resolve = filename => path.resolve(__dirname, '../src/app', filename)

export const routes = [
  {
    name: '@nuxtjs/blog:index',
    path: '/blog',
    component: resolve('./pages/Blog.vue')
  },
  {
    name: '@nuxtjs/blog:page',
    path: '/blog/pages/:page',
    component: resolve('./pages/Blog.vue')
  },
  {
    name: '@nuxtjs/blog:tag',
    path: '/blog/tags/:id/:page?',
    component: resolve('./pages/Tag.vue')
  },
  {
    name: '@nuxtjs/blog:collection',
    path: '/blog/collections/:id/:page?',
    component: resolve('./pages/Collection.vue')
  },
  {
    name: '@nuxtjs/blog:article',
    path: '/blog/:collection?/:id',
    component: resolve('./pages/Article.vue')
  }
]

export default function (options, router, r) {
  options.routes.forEach(route => {
    const index = routes.findIndex(r => r.name === route.name)

    if (index > -1) Object.assign(routes[index], route)
  })

  router.push(...routes.map(route => ({ ...route, component: r(route.component) })))
}
