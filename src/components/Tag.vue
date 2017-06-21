<template>
  <router-link class="tag" :class="[`tag-${slug}`]" :to="url">
    {{ name }}
  </router-link>
</template>

<script>
import Tag from '../mixins/tag'

export default {
  extends: Tag
}
</script>

<style lang="scss">
.tag {
  display: inline-block;
  margin: 0 2px;
  padding: 0 4px;
  border-radius: 4px;
  text-decoration: none !important;
  white-space: nowrap;

  // Default Color
  color: #fff;
  background: #999;

  &:hover, &:focus {
    color: #efefef;
  }
}
</style>
