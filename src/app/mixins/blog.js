import { api } from './api'

export default {
  name: 'BlogIndex',

  async asyncData(context) {
    const { params, payload, app } = context

    if (typeof (payload) === 'object' && payload) {
      return { page: payload }
    }

    return { page: await api(process.env.__NUXT_BLOG__.templates.indexArticles, params, app) }
  },

  computed: {
    articles() {
      return this.page || []
    }
  }
}
