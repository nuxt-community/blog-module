export default {
  name: 'Tag',

  props: {
    name: {
      type: String,
      required: true
    }
  },

  computed: {
    slug() {
      return this.name
                 .replace(/[^a-z0-9-]+/gi, '-')
                 .replace(/-+/g, '-')
                 .replace(/^-+|-+$/g, '')
                 .toLowerCase()
    },

    url() {
      return {
        name: 'blog.tag',
        params: {
          tag: this.slug
        }
      }
    }
  }
}
