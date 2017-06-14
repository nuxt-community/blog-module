const path = require('path')
const Blog = require('./helpers/blog')

const blog = new Blog()
const resource = object => {
  const content = JSON.stringify(object)

  return { source: () => content, size: () => content.length }
}

module.exports = function () {
  const options = {
    root: this.nuxt.dir,
    dir: 'blog',
    routes: {
      article: {
        name: 'article',
        path: '/:slug',
        component: path.resolve(__dirname, './components/Article.vue')
      }
    }
  }

  const dir = path.resolve(this.nuxt.dir, options.dir)

  this.extendRoutes((routes, r) => {
    const { article } = options.routes
      // 1. Landing Page.

      // 2. Articles.
    routes.push({
      name: article.name,
      path: article.path,
      component: r(article.component)
    })

      // 3. Collections.

      // 4. Categories.
  })

  this.options.build.plugins.push({
    apply(compiler) {
      compiler.plugin('emit', (compilation, cb) => {
        blog.addSource(`${dir}/**/*.md`).create().then(() => {
          for (const article of blog.articles) {
            compilation.assets[`api/posts/${article.id}.json`] = resource(article)
          }

          cb()
        })
      })
    }
  })
}

module.exports.meta = require('../package.json')
