// @flow
import slug from 'slug'
import Container from './container'
import Article from './article'

export default class Tag {
  id: string
  name: string
  /** @private */
  _articles: Container

  constructor(name: string) {
    this.id = slug(name, { lower: true })
    this.name = name
    Object.defineProperties(this, {
      _articles: { value: new Container() }
    })
  }

  addArticle(article: Article) {
    this._articles.addItem(article)
  }

  get articles(): Article[] {
    return this._articles.items
  }

  toPlainObject(): Object {
    return { id: this.id, name: this.name, articles: this.articles.map(article => article.preview) }
  }
}
