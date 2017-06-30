import { formatDate } from './filters'
import { api } from './api'

export default {
  name: 'Article',

  async asyncData(context) {
    const { params, payload, app } = context

    if (typeof (payload) === 'object' && payload) {
      return { article: payload }
    }

    return { article: await api(process.env.__NUXT_BLOG__.templates.article, params, app) }
  },

  head() {
    if (!this.article) {
      return { title: '404. Not Found' }
    }

    const meta = [
      { hid: 'description', name: 'description', content: this.article.description },
      { hid: 'keywords', name: 'keywords', content: this.article.keywords.join(', ') }
    ]
    const link = []

    if (this.article.highlightedLanguages.length) {
      link.push({
        rel: 'stylesheet',
        href: `//unpkg.com/prismjs/themes/prism${this.article.attributes.highlight ?
            '-' + this.article.attributes.highlight : ''}.css`
      })
    }

    const twitter = Object.assign({
      card: 'summary',
      title: this.article.title,
      description: this.article.description,
      image: this.article.photo,
      url: this.$route.path
    }, this.article.attributes.twitter || {}, process.env.__NUXT_BLOG__.twitter || {})
    const twitterMeta = Object.keys(twitter).map(key => {
      if (key === 'image') {
        return { name: `twitter:${key}`, content: twitter[key] }
      }

      return { hid: `twitter:${key}`, name: `twitter:${key}`, content: twitter[key] }
    })

    const og = Object.assign({
      type: 'article',
      title: this.article.title,
      description: this.article.description,
      image: this.article.photo,
      url: this.$route.path
    }, this.article.attributes.og || {}, process.env.__NUXT_BLOG__.og || {})
    const ogMeta = Object.keys(og).map(key => ({
      hid: `og:${key}`,
      name: `og:${key}`,
      content: og[key]
    }))

    const fb = Object.assign(this.article.attributes.fb || {}, process.env.__NUXT_BLOG__.fb || {})
    const fbMeta = Object.keys(fb).map(key => ({
      hid: `fb:${key}`,
      name: `fb:${key}`,
      content: fb[key]
    }))

    return {
      title: this.article.attributes.title,
      meta: [].concat(meta, twitterMeta, ogMeta, fbMeta),
      link
    }
  },

  filters: { formatDate },

  computed: {
    disqus() {
      /* eslint-disable camelcase */
      const disqus = {
        url: process.env.__NUXT_BLOG__.disqus.url,
        shortname: process.env.__NUXT_BLOG__.disqus.shortname,
        api_key: process.env.__NUXT_BLOG__.disqus.api_key,
        sso_config: JSON.parse(process.env.__NUXT_BLOG__.disqus.sso_config || '{}')
      }
      const article = this.article

      return {
        ...disqus,
        identifier: article.id,
        title: article.title,
        url: `${(disqus.url || '').replace(/\/$/, '')}${this.$route.path}`
      }
      /* eslint-enable camelcase */
    },
    comments() {
      return ('comments' in this.article.attributes) ?
          this.article.attributes.comments :
          process.env.__NUXT_BLOG__.comments
    }
  }
}
