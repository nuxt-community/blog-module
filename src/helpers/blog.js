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

function slugify(text = '') {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '-')       // Remove all non-word chars
    .replace(/-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '')            // Trim - from end of text
}

const markdown = (source, filename) => {
  const { attributes, body } = fm(source)
  const rendered = marked(body)

  if (!('title' in attributes)) {
    const headings = /<h1>([^<]*)<\/h1>/i.exec(rendered)
    attributes.title = (
                  (headings && headings[1]) ||
                  body.trim().split(/\r?\n/, 2)[0].replace(/^#+/, '')
              ) // TODO: Remove HTML entitites.
  }

  return {
    filename,
    attributes,
    rendered,
    source
  }
}

class Blog {
  constructor() {
    this._sources = []
    this._articles = {}
  }

  get articles() {
    return Object.values(this._articles)
  }

  addSource(source) {
    this._sources.push(source)

    return this
  }

  async create() {
    await Promise.all(
        this._sources.map(async pattern => {
          const files = await pify(glob)(pattern)

          await Promise.all(files.map(async filename => this.addArticle(filename)))
        })
    )
  }

  async addArticle(filename) {
    const source = await pify(fs.readFile)(filename, 'utf-8')
    const article = markdown(source, filename)

    article.id = slugify(path.basename(filename).replace(/\.md$/i, ''))

    if (article.id in this._articles && article.filename !== this._articles[article.id].filename) {
      console.log(`
       !! Article ID collision. (${article.id})
          + ${this._articles[article.id].filename}
          - ${article.filename}
      `)
    }

    this._articles[article.id] = article
  }
}

module.exports = Blog
