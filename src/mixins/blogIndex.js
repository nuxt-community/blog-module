import { formatDate } from './filters'
import { api } from '../helpers/api'

export default {
  name: 'BlogIndex',

  async asyncData(context) {
    const { params, payload, app } = context

    if (typeof (payload) === 'object' && payload) {
      console.log('   Using payload.')
      return { page: payload }
    }

    const { data: page } = await api(`/blog/${params.page || 1}`, app)

    return { page }
  },

  computed: {
    articles() {
      return (this.page && this.page.data) || []
    }
  },

  filters: { formatDate }
}
