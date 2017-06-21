<template>
<div class="container mt-3">
  <div class="row">
    <div class="col-xs-12 col-lg-8 offset-lg-2">
      <header>
        <small class="tag-links">
          <small class="text-uppercase">
            <nuxt-link :to="{ name: 'blog.index' }">Back to blog</nuxt-link>
          </small>
        </small>
        <h1 class="tag-header">{{ tag.name }}</h1>
      </header>

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
import TagPage from '../mixins/tagPage'

export default {
  extends: TagPage
}
</script>


<style lang="scss">
.tag-header {
  cursor: pointer;
  &:hover {
    &::before {
      content: '#';
      margin-left: -.6em;
    }
  }
}

.tag-links {
  margin-bottom: -1rem;
  display: block;
  text-align: right;
}
</style>
