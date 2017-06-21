<template>
<div class="container mt-3">
  <div class="row">
    <div class="col-xs-12 col-lg-8 offset-lg-2">
      <header>
        <small class="collection-links">
          <small class="text-uppercase">
            <nuxt-link :to="{ name: 'blog.index' }">Back to blog</nuxt-link>
          </small>
        </small>
        <h1 class="collection-header">{{ collection.name }}</h1>
      </header>

      <article v-for="article in articles" :key="article.id">
        <router-link :to="{ name: 'blog.article', params: { slug: article.id } }">{{ article.attributes.title }}</router-link>
        <div class="blog-collection-index-meta">
          <time :datatime="article.attributes.date">{{ article.attributes.date | formatDate }}</time>
        </div>
        <p>{{ article.attributes.description }}</p>
      </article>
    </div>
  </div>
</div>
</template>

<script>
import collectionPage from '../mixins/collectionPage'

export default {
  extends: collectionPage
}
</script>


<style lang="scss">
.collection-links {
  margin-bottom: -1rem;
  display: block;
  text-align: right;
}
.blog-collection-index-meta {
  opacity: .75;
  font-size: .75rem;
}
</style>
