<template>
    <article class="post" v-html="rendered">
    </article>
</template>

<script>
export default {
  name: 'Article',

  props: {
    title: {
      required: true,
      type: String
    },

    description: {
      type: String
    },

    rendered: {
      type: String
    }
  }
}
</script>
