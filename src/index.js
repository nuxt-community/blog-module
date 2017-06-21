const path = require('path')
const fs = require('fs')
const Blog = require('./helpers/blog')
const express = require('express')
const chalk = require('chalk')

const resource = object => {
  const content = JSON.stringify(object, null, process.env.NODE_ENV === 'production' ? 0 : 2)

  return { source: () => content, size: () => content.length }
}

const router = express.Router() // eslint-disable-line

module.exports = function () {
  const blog = new Blog(this.nuxt)
  const options = {
    root: this.nuxt.dir,
    dir: 'blog',
    routes: {
      index: {
        name: 'blog.index',
        path: '/blog',
        component: path.resolve(__dirname, './components/BlogIndex.vue')
      },
      page: {
        name: 'blog.page',
        path: '/blog/pages/:page',
        component: path.resolve(__dirname, './components/BlogIndex.vue')
      },
      article: {
        name: 'blog.article',
        path: '/blog/:slug',
        component: path.resolve(__dirname, './components/Article.vue')
      },
      tag: {
        name: 'blog.tag',
        path: '/blog/tags/:tag',
        component: path.resolve(__dirname, './components/TagPage.vue')
      },
      collection: {
        name: 'blog.collection',
        path: '/blog/collection/:collection',
        component: path.resolve(__dirname, './components/CollectionPage.vue')
      }
    }
  }

  const dir = path.resolve(this.nuxt.dir, options.dir)
  const generateDir = (this.nuxt.options.generate && this.nuxt.options.generate.dir && path.resolve(this.nuxt.dir, this.nuxt.options.generate.dir)) ||
    path.resolve(this.nuxt.dir, 'dist')
  const distDir = path.resolve(generateDir, '_nuxt/api')
  blog.addSource(`${dir}/**/*.md`)

  this.extendRoutes((routes, r) => {
    const { article, index, page, tag, collection } = options.routes
    // 1. Landing Page.
    routes.push({
      name: index.name,
      path: index.path,
      component: r(index.component)
    })

    routes.push({
      name: page.name,
      path: page.path,
      component: r(page.component)
    })

    // 2. Articles.
    routes.push({
      name: article.name,
      path: article.path,
      component: r(article.component)
    })

    // 3. Collections.
    routes.push({
      name: collection.name,
      path: collection.path,
      component: r(collection.component)
    })

    // 4. Tags.
    routes.push({
      name: tag.name,
      path: tag.path,
      component: r(tag.component)
    })
  })

  const backup = this.options.generate && this.options.generate.routes

  if (!('generate' in this.options)) this.options.generate = {}
  this.options.generate.routes = async () => {
    const pages = []
    if (typeof (backup) === 'function') {
      pages.concat(await backup())
    } else if (Array.isArray(backup)) {
      pages.concat(pages)
    }

    await blog.create()
    blog.articles.forEach(article => {
      pages.push({
        route: options.routes.article.path.replace(/:slug/gi, article.id),
        payload: article
      })
    })

    const chunks = blog.pages
    chunks.forEach((chunk, index) => {
      pages.push({
        route: options.routes.page.path.replace(/:page/gi, index),
        payload: chunk
      })
    })

    pages.push({
      route: options.routes.index.path,
      payload: chunks[0] || []
    })

    const tags = blog.tags
    tags.forEach(tag => {
      pages.push({
        route: options.routes.tag.path.replace(/:tag/gi, tag.id),
        payload: tag
      })
    })

    const collections = blog.tags
    collections.forEach(collection => {
      pages.push({
        route: options.routes.collection.path.replace(/:collection/gi, collection.id),
        payload: collection
      })
    })

    return pages
  }

  const send404 = res => {
    res.statusCode = 404
    res.statusMessage = 'Not Found'
    res.end()
  }

  const sendFile = (filename, res) => {
    console.log(`   Resolved file: ${filename}`)
    fs.exists(filename, exists => {
      if (exists) {
        console.log(`   Found required file. Attempting response.`)
        fs.readFile(filename, { encoding: 'utf-8' }, (error, content) => {
          if (error) {
            console.log(`   Failed to send response.`, error)
            res.statusCode = 500
            res.statusMessage = 'Internal Server Error'
            res.end(error.stack || String(error))
          }

          res.setHeader('Content-Type', 'application/json')
          res.end(content, 'utf-8')
          console.log(`   Response sent successfully.`)
        })
      } else {
        return send404(res)
      }
    })
  }

  router.get('/posts/:slug', (req, res) => {
    console.log(`   ${chalk.blue('blog:api')} ${chalk.green('GET')} /api/blog/posts/${req.params.slug}`)
    const filename = path.resolve(distDir, `blog/posts/${req.params.slug}.json`)
    if (this.nuxt.dev) {
      console.log(`   ... running in dev mode.`)
      blog.create().then(() => {
        const article = blog.getArticleById(req.params.slug)

        if (article) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(article), 'utf-8')

          return
        }

        return send404(res)
      })
    } else if (filename) {
      return sendFile(filename, res)
    }
  })

  router.get('/tags/:tag', (req, res) => {
    console.log(`   ${chalk.blue('blog:api')} ${chalk.green('GET')} /api/blog/tags/${req.params.tag}`)
    const filename = path.resolve(distDir, `blog/tags/${req.params.tag}.json`)
    if (this.nuxt.dev) {
      console.log(`   ... running in dev mode.`)
      blog.create().then(() => {
        const tag = blog.tags.find(tag => tag.id === req.params.tag)

        if (tag) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(tag), 'utf-8')

          return
        }

        return send404(res)
      })
    } else if (filename) {
      return sendFile(filename, res)
    }
  })

  router.get('/collections/:collection', (req, res) => {
    console.log(`   ${chalk.blue('blog:api')} ${chalk.green('GET')} /api/blog/collections/${req.params.collection}`)
    const filename = path.resolve(distDir, `blog/collections/${req.params.collection}.json`)
    if (this.nuxt.dev) {
      console.log(`   ... running in dev mode.`)
      blog.create().then(() => {
        const collection = blog.collections.find(c => c.id === req.params.collection)

        if (collection) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(collection), 'utf-8')

          return
        }

        return send404(res)
      })
    } else if (filename) {
      return sendFile(filename, res)
    }
  })

  router.get('/:page', (req, res) => {
    console.log(`   ${chalk.blue('blog:api')} ${chalk.green('GET')} /api/blog/${req.params.page}`)
    const filename = path.resolve(distDir, `blog/${req.params.page}.json`)
    if (this.nuxt.dev) {
      console.log(`   ... running in dev mode.`)
      blog.create().then(() => {
        const articles = blog.pages[req.params.page - 1]

        if (articles) {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(articles), 'utf-8')

          return
        }

        return send404(res)
      })
    } else if (filename) {
      return sendFile(filename, res)
    }
  })

  this.addServerMiddleware({
    path: '/api/blog',
    handler: router
  })

  this.options.build.plugins.push({
    apply(compiler) {
      compiler.plugin('emit', (compilation, cb) => {
        blog.create().then(() => {
          const articles = blog.articles
          articles.forEach((article, index) => {
            const next = articles[index + 1]

            if (next) {
              article.next = { id: next.id, attributes: next.attributes }
            }

            compilation.assets[`api/blog/posts/${article.id}.json`] = resource(article)
          })

          const tags = blog.tags
          tags.forEach(tag => {
            compilation.assets[`api/blog/tags/${tag.id}.json`] = resource(tag)
          })
          compilation.assets[`api/blog/tags.json`] = resource(tags.map(tag => ({ id: tag.id, name: tag.name })))

          const collections = blog.tags
          collections.forEach(collection => {
            compilation.assets[`api/blog/collections/${collection.id}.json`] = resource(collection)
          })
          compilation.assets[`api/blog/collections.json`] = resource(collections.map(c => ({ id: c.id, name: c.name })))

          const pages = blog.pages
          pages.forEach((page, index) => {
            compilation.assets[`api/blog/${index + 1}.json`] = resource(page)
          })
          cb()
        }).catch(error => {
          console.log(error)
          cb()
        })
      })
    }
  })
}

module.exports.meta = require('../package.json')
