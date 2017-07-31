<template>
<div class="container mt-3">
  <div class="row">
    <div class="col-xs-12 col-lg-8 offset-lg-2">
      <header>
        <small class="tag-links">
          <small class="text-uppercase">
            <nuxt-link :to="{ name: '@nuxtjs/blog:index' }">Back to blog</nuxt-link>
          </small>
        </small>
        <h1 class="tag-header">{{ tag.name }}</h1>
      </header>

      <ArticlePreview v-for="article in articles"
                      :key="article.id"
                      :id="article.id"
                      :title="article.title"
                      :description="article.description"
                      :published_at="article.published_at"
                      v-bind="article"
      />
    </div>
  </div>
</div>
</template>

<script>
import TagPage from '../mixins/tag'
import ArticlePreview from '../components/Article.vue'

export default {
  extends: TagPage,
  components: { ArticlePreview }
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
