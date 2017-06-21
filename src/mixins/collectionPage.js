import { formatDate } from './filters'
import { api } from '../helpers/api'

export default {
  name: 'CollectionPage',

  async asyncData(context) {
    const { params, payload, app } = context

    if (typeof (payload) === 'object' && payload) {
      console.log('   Using payload.')
      return { collection: payload }
    }

    const { data: collection } = await api(`/blog/collections/${params.collection}`, app)

    return { collection }
  },

  computed: {
    articles() {
      return (this.collection && this.collection.data.slice().reverse()) || []
    }
  },

  filters: { formatDate }
}
