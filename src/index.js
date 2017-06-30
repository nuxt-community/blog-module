import 'babel-polyfill'

import path from 'path'
import merge from 'merge-options'
import blog from './blog'
import registerRoutes from './app/routes'
import serve from './serve'
import build from './build'
import meta from '../package.json'

export default function NuxtModule(options) {
  const defaults = {
    base: 'http://localhost:3000',
    comments: false,
    static: false,
    dir: 'blog',
    api: {
      prefix: 'api/blog'
    },
    templates: {
      article: '/posts/:id',
      tag: '/tags/:id',
      collection: '/collections/:id',
      indexArticles: '/',
      indexTags: '/tags',
      indexCollections: '/collections'
    },
    routes: [],
    disqus: {
      url: options.base || 'http://localhost:3000',
      shortname: undefined,
      api_key: undefined, // eslint-disable-line camelcase
      sso_config: undefined // eslint-disable-line camelcase
    },
    twitter: null,
    og: null,
    fb: null
  }

  options = merge(defaults, options, { static: this.nuxt.dev ? false : options.static })
  options.path = path.resolve(this.nuxt.dir, options.dir)

  blog.context = this
  blog.addSource(`${options.path}/**/*.md`)

  // Register blog routes.
  this.extendRoutes((...any) => registerRoutes(options, ...any))
  // Register api server.
  serve(this, options)
  // Register build process.
  build(this, options)
}

NuxtModule.meta = meta
