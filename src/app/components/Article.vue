<template>
<article class="nuxt-blog-article-preview">
  <router-link
      :to="{ name: '@nuxtjs/blog:article', params: { id } }"
  >{{ title }}</router-link>
  <div class="nuxt-blog-article-preview-meta">
    <time :datatime="published_at">{{ published_at | formatDate }}</time>
  </div>
  <p>{{ description }}</p>
</article>
</template>

<script>
import { formatDate } from '../mixins/filters'

export default {
  name: 'Article',

  props: {
    id: {
      required: true,
      type: String
    },
    title: {
      required: true,
      type: String
    },
    description: {
      required: true,
      type: String
    },
    published_at: {
      required: true,
      type: String
    },
  },

  filters: { formatDate }
}
</script>

<style>
.nuxt-blog-article-preview {
  margin-bottom: 15px;
}
.nuxt-blog-article-preview-meta {
  font-size: .75rem;
  opacity: .75;
}
</style>
