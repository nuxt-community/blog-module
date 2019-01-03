<template>
  <div class="container mt-3">
    <div class="row">
      <div class="col-xs-12 col-lg-8 offset-lg-2">
        <ArticlePreview
          v-for="article in articles"
          :key="article.id"
          :id="article.id"
          :title="article.title"
          :description="article.description"
          :published_at="article.published_at"
          v-bind="article"/>
      </div>
    </div>
  </div>
</template>

<script>
import { api } from '../mixins/api'
import ArticlePreview from '../components/Article.vue'

export default {
  components: { ArticlePreview },

  async asyncData (context) {
    const { params, payload, app } = context

    if (typeof payload === 'object' && payload) {
      return { page: payload }
    }

    return {
      page: await api(
        process.env.__NUXT_BLOG__.templates.indexArticles,
        params,
        app
      )
    }
  },

  mounted () {
    this.page.sort((a, b) => {
      const pageA = new Date(a.published_at)
      const pageB = new Date(b.published_at)
      return pageB - pageA
    })
  },

  computed: {
    articles () {
      return (
        this.page || []
      )
    }
  }
}
</script>
