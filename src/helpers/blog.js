// import pify from 'pify'
const pify = require('pify')
// import fs from 'fs'
const fs = require('fs')
// import path from 'path'
const path = require('path')
// import marked from 'marked'
const marked = require('marked')
// import Prism from 'prismjs'
const Prism = require('prismjs')
// import fm from 'front-matter'
const fm = require('front-matter')
// import glob from 'glob'
const glob = require('glob')

marked.setOptions({
  gfm: true,
  breaks: true,
  highlight(code, lang) {
    return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
  }
})
function chunk(items, size) {
  const chunks = []

  if (!Array.isArray(items)) return chunks

  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }

  return chunks
}

function slugify(text = '') {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '-')       // Remove all non-word chars
    .replace(/-+/g, '-')            // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')             // Trim - from end of text
}

class Container {
  constructor(sort) {
    this._sort = sort
    this._items = {}
    this._items$sorted = null
  }

  get items() {
    if (!this._items$sorted) {
      this._items$sorted = Object.values(this._items)
      this._sort && this._items$sorted.sort(this._sort)
    }

    return this._items$sorted
  }

  addItem(item, key = 'id') {
    this._items[item[key]] = item
  }

  getItem(id) {
    return this._items[id]
  }
}

class ArticleContainer extends Container {
  constructor() {
    super((a, b) => a.attributes.date < b.attributes.date)
  }

  get articles() {
    return this.items.map((article, index) => {
      if (index > 0) {
        const next = this.items[index - 1]
        console.log('Previous', article.id, '->', next.id)

        return Object.assign({ next: { id: next.id, attributes: next.attributes } }, article)
      }

      return article
    })
  }

  get _articles() {
    return this._items
  }

  addArticle(article) {
    if (article.id in this._articles && article.filename !== this._articles[article.id].filename) {
      console.log(`
       !! Article ID collision. (${article.id})
          + ${this._articles[article.id].filename}
          - ${article.filename}
      `)
    }

    this.addItem(article)
  }

  getArticleById(id) {
    const slug = slugify(id)

    return this.articles.find(article => article.id === slug)
  }
}

class Collection extends ArticleContainer {
  constructor(name) {
    super()
    this.id = slugify(name)
    this.name = name
  }
}

class Blog extends ArticleContainer {
  constructor(nuxt) {
    super()
    this._nuxt = nuxt
    this._sources = []
    this._collections = new Container((a, b) => a.name < b.name)
    this._tags = new Container((a, b) => a.name < b.name)
    this._dirty = true
    this._working = null
    this._pages = null
  }

  get pages() {
    if (!this._pages) {
      const chunks = chunk(this.articles, 15)
      this._pages = chunks.map((chunk, index) => {
        const links = {}

        if (index > 0) links.prev = index
        if (index + 1 < chunks.length) links.next = index + 2

        return { data: chunk, links }
      })
    }

    return this._pages
  }

  get collections() {
    return this._collections.items.map(c => ({ id: c.id, name: c.name, data: c.items }))
  }

  get tags() {
    return this._tags.items.map(tag => ({ id: tag.id, name: tag.name, data: tag.items }))
  }

  async _addArticle(filename) {
    const source = await pify(fs.readFile)(filename, { encoding: 'utf-8' })
    const article = this._markdown(source, await pify(fs.stat)(filename), filename)

    super.addArticle(article)

    if (typeof (article.attributes.collection) === 'string') {
      article.attributes.collections = [article.attributes.collection]
    }

    if ('collections' in article.attributes && Array.isArray(article.attributes.collections)) {
      article.attributes.collections.forEach(name => this._addArticleToCollection(name, article))
    }

    if ('tags' in article.attributes && Array.isArray(article.attributes.tags)) {
      article.attributes.tags.forEach(name => this._addArticleToTag(name, article))
    }
  }

  _addArticleToCollection(name, article) {
    const id = slugify(name)

    if (!this._collections.getItem(id)) {
      this._collections.addItem(new Collection(name))
    }

    this._collections.getItem(id).addArticle(article)
  }

  _addArticleToTag(name, article) {
    const id = slugify(name)

    if (!this._tags.getItem(id)) {
      this._tags.addItem(new Collection(name))
    }

    this._tags.getItem(id).addArticle(article)
  }

  addSource(source) {
    this._sources.push(source)
    this.markDirty()

    return this
  }

  markDirty() {
    this._pages = null
    this._items$sorted = null
    this._collections._items$sorted = null
  }

  async create() {
    if (!this._dirty) return
    if (this._working) return this._working

    this._working = await Promise.all(
        this._sources.map(async pattern => {
          const files = await pify(glob)(pattern)

          await Promise.all(files.map(async filename => this._addArticle(filename)))
        })
    )
    this._dirty = false
    this._working = null
  }

  _markdown(source, stats, filename) {
    const { attributes, body } = fm(source)
    const rendered = marked(body)

    if (!('title' in attributes)) {
      const headings = /<h1[^>]*>([^<]*)<\/h1>/i.exec(rendered)
      attributes.title = (
                    (headings && headings[1]) ||
                    body.trim().split(/\r?\n/, 2)[0].replace(/^#+/, '')
                ) // TODO: Remove HTML entitites.
    }

    if (!('date' in attributes)) {
      attributes.date = new Date(stats.ctime)
    }

    if (!('updated_at' in attributes)) {
      attributes.updated_at = new Date(stats.mtime) // eslint-disable-line
    }

    return {
      id: slugify(path.basename(filename).replace(/\.md$/i, '')),
      filename: filename.replace(`${this._nuxt.dir}/`, ''),
      attributes,
      rendered,
      source
    }
  }
}

module.exports = Blog
