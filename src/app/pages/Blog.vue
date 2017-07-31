<template>
<div class="container mt-3">
  <div class="row">
    <div class="col-xs-12 col-lg-8 offset-lg-2">
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
import BlogIndex from '../mixins/blog'
import ArticlePreview from '../components/Article.vue'

export default {
  extends: BlogIndex,
  components: { ArticlePreview }
}
</script>
