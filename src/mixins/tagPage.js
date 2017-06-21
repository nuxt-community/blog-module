import { formatDate } from './filters'
import { api } from '../helpers/api'

export default {
  name: 'TagPage',

  async asyncData(context) {
    const { params, payload, app } = context

    if (typeof (payload) === 'object' && payload) {
      console.log('   Using payload.')
      return { tag: payload }
    }

    const { data: tag } = await api(`/blog/tags/${params.tag}`, app)

    return { tag }
  },

  computed: {
    articles() {
      return (this.tag && this.tag.data) || []
    }
  },

  filters: { formatDate }
}
