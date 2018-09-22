import 'babel-polyfill'

import path from 'path'
import merge from 'merge-options'
import blog from './blog'
import registerRoutes, { routes } from './app/routes'
import serve from './serve'
import build from './build'
import meta from '../package.json'

export default function NuxtModule(options) {
  const defaults = {
    base: 'http://localhost:3000',
    publicPath: '/_nuxt/',
    comments: false,
    static: true,
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
    routes,
    disqus: {
      url: options.base || 'http://localhost:3000',
      shortname: undefined,
      api_key: undefined, // eslint-disable-line camelcase
      sso_config: undefined // eslint-disable-line camelcase
    },
    twitter: null,
    og: null,
    fb: null,
    markdown: {
      plugins: [
        require('markdown-it-decorate'),
        require('markdown-it-emoji')
      ]
    }
  }
  const nuxtOptions = this.nuxt.options

  options = merge(defaults, options, {
    publicPath: (nuxtOptions.build || {}).publicPath || defaults.publicPath,
    static: nuxtOptions.dev ? defaults.static : (options.static === true),
    base: nuxtOptions.dev ? options.devBase || defaults.base : options.base || ''
  })
  options.rootDir = nuxtOptions.rootDir
  options.path = path.resolve(nuxtOptions.rootDir, options.dir)

  blog.context = this
  blog.addSource(`${options.path}/**/*.md`)

  // Register blog routes.
  this.extendRoutes((...any) => registerRoutes(options, ...any))
  // Register api server.
  serve(this, options)
  // Register build process.
  build(this, options)
  // Register layout.
  // this.
}

NuxtModule.meta = meta
