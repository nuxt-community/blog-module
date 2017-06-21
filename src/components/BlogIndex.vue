<template>
<div class="container mt-3">
  <div class="row">
    <div class="col-xs-12 col-lg-8 offset-lg-2">
      <article v-for="article in articles" :key="article.id">
        <router-link :to="{ name: 'blog.article', params: { slug: article.id } }">{{ article.attributes.title }}</router-link>
        <div class="blog-index-meta">
          <time :datatime="article.attributes.date">{{ article.attributes.date | formatDate }}</time>
        </div>
        <p>{{ article.attributes.description }}</p>
      </article>
    </div>
  </div>
</div>
</template>

<script>
import BlogIndex from '../mixins/blogIndex'

export default {
  extends: BlogIndex
}
</script>

<style lang="scss">
.blog-index-meta {
  font-size: .75rem;
  opacity: .75;
}
</style>
