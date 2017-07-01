<template>
<nuxt-link
    :to="{ name: '@nuxtjs/blog:collection', params: { id } }"
    :title="`This article is part of '${name}' collection.`"
>{{ name }}</nuxt-link>
</template>

<script>
export default {
  name: 'Collection',

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
