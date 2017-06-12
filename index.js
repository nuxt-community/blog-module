const fs = require('fs')
const glob = require('glob')
const path = require('path')

const marked = require('marked')
const prism = require('prismjs')
const fm = require('front-matter')

marked.setOptions({
  gfm: true,
  breaks: true,
  highlight(code, lang) {
    return prism.highlight(code, prism.languages[lang] || prism.languages.markup)
  }
})

function slugify(text = '') {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '-')       // Remove all non-word chars
    .replace(/-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')            // Trim - from end of text
}

const markdown = (source, id) => {
  const { attributes, body } = fm(source)
  const rendered = marked(body)

  if (!('title' in attributes)) {
    const headings = /<h1>([^<]*)<\/h1>/i.exec(rendered)
    attributes.title = (
                  (headings && headings[1]) ||
                  body.trim().split(/\r?\n/, 2)[0].replace(/^#+/, '')
              ) // TODO: Remove HTML entitites.
  }

  attributes.date = new Date(attributes.date).toISOString().split('T')[0]

  return {
    attributes,
    rendered,
    source
  }
}

function findArticles(dir, { extensions, root, url }) {
  const ext = extensions.length > 1 ? `(${extensions.join('|')})` : extensions[0] || 'md'

  const files = glob.sync(`${dir}/**/*.${ext}`)

  return files.map(file => {
    const article = markdown(fs.readFileSync(file, 'utf-8').toString(), file)

    article.id = file.replace(`${root}/`, '')
    article.url = ['title', 'date'].reduce(
      (result, key) => result.replace(new RegExp(`:${key}`, 'g'), slugify(article.attributes[key]))
      , url
    )

    return article
  })
}

module.exports = function (options = {}) {
  const defaults = {
    root: this.nuxt.dir,
    dir: 'blog',
    extensions: ['md'],
    url: '/blog/:title-:date',
    components: {
      article: path.resolve(__dirname, './dist/Article.js')
    }
  }

  try {
  // TODO: Use some package to extend options.
    Object.assign(options, defaults)

    const dir = path.resolve(this.nuxt.dir, options.dir)
    const articles = findArticles(dir, options)

    this.extendRoutes((routes, r) => {
      // 1. Landing Page.

      // 2. Articles.
      for (const article of articles) {
        routes.push({
          name: article.id,
          component: r(article.attributes.component || options.components.article),
          path: article.url,
          meta: { article }
        })

        if ('component' in article.attributes) delete article.attributes.component
      }

      // 3. Collections.

      // 4. Categories.
    })

    this.options.build.plugins.push({
      apply(compiler) {
        compiler.plugin('emit', (compilation, cb) => {
          for (const article of articles) {
            compilation.assets[`_blog${article.url}.json`] = {
              source: () => JSON.stringify(article),
              size: () => JSON.stringify(article).length
            }
          }
          cb()
        })
      }
    })
  } catch (e) {
    console.log(e)
  }
}

module.exports.meta = require('./package.json')
