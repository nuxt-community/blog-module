<template>
<nuxt-link class="tag"
             :class="[`tag-${id}`]"
             :to="{ name: '@nuxtjs/blog:tag', params: { id } }"
>{{ name }}</nuxt-link>
</template>

<script>
export default {
  name: 'Tag',

  props: {
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }
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
