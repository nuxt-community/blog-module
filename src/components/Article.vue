<template>
    <article v-if="article" class="post" v-html="article.rendered">
    </article>

    <div v-else>
      Loading....
    </div>
</template>

<script>
import fetch from 'axios'

export default {
  name: 'Article',

  async asyncData({ route }) {
    const { data: article } = await fetch(`http://127.0.0.1:3000/_nuxt/api/posts/${route.params.slug}.json`)

    return { article }
  },

  head () {
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

  data: () => ({ article: null })
}
</script>
