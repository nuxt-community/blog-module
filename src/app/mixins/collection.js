import { formatDate } from './filters'
import { api } from './api'

export default {
  name: 'CollectionPage',

  async asyncData (context) {
    const { params, payload, app } = context

    if (typeof (payload) === 'object' && payload) {
      return { collection: payload }
    }

    return { collection: await api(process.env.__NUXT_BLOG__.templates.collection, params, app) }
  },

  computed: {
    articles () {
      return this.collection ? this.collection.articles : []
    }
  },

  filters: { formatDate }
}
