import slug from 'slug'
import pify from 'pify'
import glob from 'glob'
import Collection from './collection'
import Container from './container'
import Tag from './tag'
import Article from './article'
import { format } from '../helpers/path'

function compare(a, b) {
  return Object.keys(a).every(key => a[key] === b[key])
}

function find(items, query) {
  return items.find(item => compare(query, item))
}

export default class Blog {
  _articles: Container<Article>
  _tags: Container<Tag>
  _collections: Container<Collection>

  constructor() {
    this.patterns = []
    this._articles = new Container()
    this._tags = new Container()
    this._dirty = true
    this._collections = new Container()
  }

  set context(context) {
    this._context = context
  }

  set options(options: Object) {
    this._options = options
  }

  get articles(): Article[] {
    return this._articles.items
  }

  get tags(): Tag[] {
    return this._tags.items
  }

  get collections(): Collection[] {
    return this._collections.items
  }

  addSource(pattern: string) {
    this.patterns.push(pattern)
    this._dirty = true
  }

  async create(options, force = false) {
    if (this._dirty || force) {
      this._options = options
      await Promise.all(
          this.patterns.map(async pattern => {
            const files = await pify(glob)(pattern)

            await Promise.all(files.map(async filename => this._addArticle(filename)))
          })
      )
    }
    this._dirty = false
  }

  async generate(options) {
    const templates = options.templates
    await this.create(options)
    const output = {}

    function resolve(filename) {
      return `${options.api.prefix}/${filename}`.replace(/\/+/g, '/').replace(/\/+$/, '') + '.json'
    }

    this.articles.forEach((article: Article) => {
      output[format(resolve(templates.article), article)] = this.addPaginationLinks(article)
    })
    this.tags.forEach((tag: Tag) => {
      output[format(resolve(templates.tag), tag)] = tag.toPlainObject()
    })
    this.collections.forEach((collection: Collection) => {
      output[format(resolve(templates.collection), collection)] = collection.toPlainObject()
    })

    output[resolve(templates.indexArticles)] = this.articles.map(article => article.preview)
    output[resolve(templates.indexTags)] = this.tags
    output[resolve(templates.indexCollections)] = this.collections

    return output
  }

  addPaginationLinks(article: Article) {
    const json = JSON.parse(JSON.stringify(article))
    const next = this.getNextArticle(article)
    const prev = this.getPrevArticle(article)

    if (next) {
      json.next = next.preview
    }

    if (prev) {
      json.prev = prev.preview
    }

    return json
  }

  async _addArticle(filename: string) {
    const article = await Article.create(filename, this._options, this)

    this._articles.addItem(article)
    article.tags.forEach(tag => tag.addArticle(article))
    article.collection && article.collection.addArticle(article)

    return article
  }

  getArticle(id: string): Article {
    return this._articles.getItem(id)
  }

  getNextArticle(id: string | Article): Article | null {
    const article = typeof (id) === 'string' ? this.getArticle(id) : id
    const index = this.articles.findIndex(other => article.id === other.id)

    return index > 0 ? this.articles[index - 1] : null
  }

  getPrevArticle(id: string | Article): Article | null {
    const article = typeof (id) === 'string' ? this.getArticle(id) : id
    const index = this.articles.findIndex(other => article.id === other.id)

    return index + 1 < this.articles.length ? this.articles[index + 1] : null
  }

  getCollection(name: string): Collection {
    const id = slug(name, { lower: true })
    let collection = this._collections.getItem(id)

    if (!collection) {
      collection = new Collection(name)
      this._collections.addItem(collection)
    }

    return collection
  }

  getTag(name: string): Tag {
    const id = slug(name, { lower: true })
    let tag = this._tags.getItem(id)

    if (!tag) {
      tag = new Tag(name)
      this._tags.addItem(tag)
    }

    return tag
  }

  findArticle(params) {
    return find(this.articles, params)
  }

  findTag(params) {
    return find(this.tags, params)
  }

  findCollection(params) {
    return find(this.collections, params)
  }
}
