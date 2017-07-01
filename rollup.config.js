import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'

export default {
  entry: './src/index.js',
  dest: 'dist/blog-module.js',
  format: 'cjs',
  plugins: [
    json(),
    babel(),
    commonjs(),
    resolve()
  ],
  external: [
    'slug',
    'path',
    'pify',
    'fs',
    'front-matter',
    'markdown-it',
    'glob',
    'prismjs',
    'cheerio',
    'webpack',
    'express',
    'babel-polyfill',
    'chalk'
  ]
}
