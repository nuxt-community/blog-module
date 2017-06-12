import vue from 'rollup-plugin-vue'

export default {
  entry: './src/components/Article.vue',
  dest: './dist/Article.js',
  plugins: [vue()]
}
