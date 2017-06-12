import { insert } from './utils'
import fetch from 'axios'

const actions = {
  async fetchArticle({ commit }, url) {
    try {
      const { body } = await fetch(`/_blog${url}.json`)
      const article = typeof (body) === 'string' ? JSON.parse(body) : body

      commit('add', article)
    } catch (error) {
      commit('error', { url, error })
    }
  }
}

const getters = {
  articleByUrl: state => (url => state.articles.find(article => article.url === url)),
  articleNotFound: state => (url => state.errors[url])
}

const state = () => ({
  articles: [],
  errors: {}
})

const mutations = {
  add: ({ articles }, article) => insert(articles, article),
  error(state, { url, error }) {
    state.errors[url] = { error }
  }
}

export default {
  state: state(),
  mutations,
  actions,
  getters
}
