import chalk from 'chalk'
import path from 'path'
import blog from '../../blog'
import { sendFile, sendJson } from '../helpers'

import { format } from '../../helpers/path'

export default function (router, context, options) {
  function request(url) {
    console.log(`  ${chalk.blue('blog:api')} ${chalk.green('GET')} /${options.api.prefix}${url}`)

    return url
  }

  function resolve(filename) {
    return path.resolve(options.distDir, `${options.api.prefix}/${filename}`.replace(/\/+/, '/').replace(/\/+$/, '') + '.json')
  }

  const templates = options.templates
  const dev = () => {
    if (context.nuxt.options.dev) {
      console.log(`  ${chalk.blue('blog:api')} ... running in dev mode`)
      return true
    }
  }
  router.get(templates.indexArticles, (req, res) => {
    const url = request(format(templates.indexArticles, req.params))

    if (dev()) {
      blog.create(options, true).then(() => sendJson(blog.articles.map(article => article.preview), res))
      return
    }

    sendFile(resolve(url), res)
  })
  router.get(templates.indexTags, (req, res) => {
    const url = request(format(templates.indexTags, req.params))

    if (dev()) {
      blog.create(options, true).then(() => sendJson(blog.tags, res))
      return
    }

    sendFile(resolve(url), res)
  })
  router.get(templates.tag, (req, res) => {
    const url = request(format(templates.tag, req.params))
    if (dev()) {
      blog.create(options, true).then(() => sendJson(blog.findTag(req.params).toPlainObject(), res))
      return
    }
    sendFile(resolve(url), res)
  })
  router.get(templates.indexCollections, (req, res) => {
    const url = request(format(templates.indexCollections, req.params))

    if (dev()) {
      blog.create(options, true).then(() => sendJson(blog.collections, res))
      return
    }

    sendFile(resolve(url), res)
  })
  router.get(templates.collection, (req, res) => {
    const url = request(format(templates.collection, req.params))
    if (dev()) {
      blog.create(options, true).then(() => sendJson(blog.findCollection(req.params).toPlainObject(), res))
      return
    }
    sendFile(resolve(url), res)
  })
  router.get(templates.article, (req, res) => {
    const url = request(format(templates.article, req.params))

    if (dev()) {
      blog.create(options, true).then(() => sendJson(blog.addPaginationLinks(blog.findArticle(req.params)), res))
      return
    }

    sendFile(resolve(url))
  })

  console.log(`   ${chalk.blue('blog:api')} Listening on /${options.api.prefix}`)
  context.addServerMiddleware({
    path: `/${options.api.prefix}`,
    handler: router
  })
}
