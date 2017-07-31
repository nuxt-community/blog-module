import fs from 'fs'
import fm from 'front-matter'
import pify from 'pify'
import Markdown from 'markdown-it'
import Prism from 'prismjs'
import path from 'path'
import slug from 'slug'
import cheer from 'cheerio'
import Blog from './blog'
import Tag from './tag'
import Collection from './collection'

const ucword = any => any.replace(/[-_]+/g, ' ').replace(/(?:^|\s)([a-z])/g, m => m.toUpperCase())

export default class Article {
  id: string
  title: string
  description: string
  photo: string
  keywords: string[]
  year: number
  month: number
  day: number
  slug: number
  published_at: Date // eslint-disable-line camelcase
  updated_at: Date // eslint-disable-line camelcase
  source: string
  rendered: string
  attributes: Object
  highlightedLanguages: string
  /** @private */
  filename: string
  _tags: Tag[]
  _collection: Collection | null

  /** @namespace blog.__markdown */

  constructor(filename: string) {
    Object.defineProperties(this, {
      filename: { value: filename },
      _tags: { value: [], writable: true },
      _collection: { value: null, writable: true }
    })
    this.id = slug(path.basename(filename.replace(/\.md$/, '')), { lower: true })
    this.slug = this.id.replace(/^[\d]{4}-[\d]{2}-[\d]{2}-/, '')
    this.highlightedLanguages = []
  }

  static async create(filename, options, blog) {
    const article = new Article(filename)

    await article.create(options, blog)

    return article
  }

  /**
   * Create article from markdown.
   * @param options
   * @param blog
   * @returns {Promise.<Article>}
   */
  async create(options: Object, blog: Blog) {
    const marked = this._createMarkdownRenderer(options, blog)

    this.source = await pify(fs.readFile)(this.filename, { encoding: 'utf-8' })

    const { attributes, body } = fm(this.source)

    this.rendered = marked.render(body)
    this.attributes = this._prepareAttributes(attributes, options)

    if (this.attributes.collection) {
      this._collection = blog.getCollection(this.attributes.collection)
      this.attributes.collection = this._collection
    } else if (path.dirname(this.filename) !== options.path) {
      this._collection = blog.getCollection(ucword(path.basename(path.dirname(this.filename))))
      this.attributes.collection = this._collection
    }
    this._tags = this.attributes.tags.map(tag => blog.getTag(tag))
    this.attributes.tags = this._tags

    this.id = `${this.id}-${this.attributes.date.getTime()}`
    this.title = attributes.title
    this.description = attributes.description || ''
    this.photo = attributes.photo
    this.keywords = this.attributes.tags.map(tag => tag.name)
    /* eslint-disable camelcase */
    this.published_at = this.attributes.date
    this.updated_at = this.attributes.updated_at
    this.year = this.published_at.getFullYear()
    this.month = this.published_at.getUTCMonth() + 1
    this.day = this.published_at.getDate() + 1
    /* eslint-enable camelcase */

    return this
  }

  /**
   * Tags/Categories, the article belongs to
   * @returns {Tag[]}
   */
  get tags(): Tag[] {
    return this._tags
  }

  /**
   * Collection/Series, the article is part of.
   * @returns {Collection|null}
   */
  get collection(): Collection | null {
    return this._collection
  }

  /**
   * Minimal article info.
   * @returns {{id: string, title: string, description: string, photo: string, published_at: Date}}
   */
  get preview() {
    return {
      id: this.id,
      slug: this.slug,
      collection: this.collection && this.collection.id,
      title: this.title,
      description: this.description,
      photo: this.photo,
      published_at: this.published_at // eslint-disable-line camelcase
    }
  }

  /**
   * Create instance of MarkdownIt.
   * @param options
   * @param blog
   * @returns {MarkdownIt}
   * @private
   */
  _createMarkdownRenderer(options: Object, blog: Blog) {
    const plugins = options.markdown.plugins || []

    const marked = new Markdown({
      html: true,
      linkify: true,
      breaks: true,
      ...options.markdown,
      highlight: (code, lang) => {
        if (!this.highlightedLanguages.includes(lang)) {
          this.highlightedLanguages.push(lang)
        }

        if ('highlight' in options) {
          return options.highlight(code, lang)
        }

        return Prism.highlight(code, Prism.languages[lang] || Prism.languages.markup)
      }
    })

    Array.isArray(plugins) && plugins.forEach(
        plugin => marked.use(plugin)
    )

    return marked
  }

  /**
   * Fix missing article attributes.
   * @param attributes
   * @returns {Object}
   * @private
   */
  _prepareAttributes(attributes) {
    const s = cheer.load(this.rendered)
    const stats = fs.statSync(this.filename)
    const text = query => {
      const matches = s(query)

      if (matches.length) return matches.first().text()
    }

    if (!('title' in attributes) || !attributes.title) {
      attributes.title = text('h1') || text('h2') || text('h3')
    }

    if (!('date' in attributes)) {
      attributes.date = new Date(stats.ctime)
    }

    attributes.date = new Date(attributes.date)

    if (!('updated_at' in attributes)) {
      attributes.updated_at = new Date(stats.mtime) // eslint-disable-line camelcase
    }

    attributes.updated_at = new Date(attributes.updated_at)

    attributes.updated_at = new Date(attributes.updated_at) // eslint-disable-line camelcase

    if (!('description' in attributes) || !attributes.description) {
      attributes.description = text('p')
    }

    if (!('tags' in attributes)) {
      attributes.tags = []
    } else if (!Array.isArray(attributes.tags)) {
      attributes.tags = [attributes.tags]
    }

    if (!('photo' in attributes)) {
      attributes.photo = s('img.cover').attr('src') || s('img').attr('src')
    }

    return attributes
  }
}
