import { api } from './api'

export default {
  name: 'TagPage',

  async asyncData (context) {
    const { params, payload, app } = context

    if (typeof (payload) === 'object' && payload) {
      return { tag: payload }
    }

    return { tag: await api(process.env.__NUXT_BLOG__.templates.tag, params, app) }
  },

  computed: {
    articles () {
      return this.tag ? this.tag.articles : []
    }
  }
}
