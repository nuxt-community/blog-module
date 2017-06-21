import { formatDate } from './filters'
import { api } from '../helpers/api'

export default {
  name: 'Article',

  async asyncData(context) {
    const { params, payload, app } = context

    if (typeof (payload) === 'object' && payload) {
      console.log('   Using payload.')
      return { article: payload }
    }

    const { data: article } = await api(`/blog/posts/${params.slug}`, app)

    return { article }
  },

  head() {
    if (!this.article) {
      return { title: '404. Not Found' }
    }

    return {
      title: this.article.attributes.title,
      meta: [
        { hid: 'description', name: 'description', content: this.article.attributes.description }
      ]
    }
  },

  data: () => ({ article: null }),

  filters: { formatDate },

  computed: {
    collection() {
      const collection = this.article.attributes.collection

      if (!collection) return collection

      return {
        name: collection,
        route: {
          name: 'blog.collection',
          params: { collection: collection.replace(/[^a-z0-9-]+/gi, '-')
                      .replace(/-+/g, '-')
                      .replace(/^-+|-+$/g, '')
                      .toLowerCase() }
        }
      }
    }
  }
}
