import { Router as createRouter } from 'express'
import path from 'path'
import registerRotues from './routes'

export default function (context, options) {
  const router = createRouter()
  const generateDir = (
          context.nuxt.options.generate &&
          context.nuxt.options.generate.dir &&
          path.resolve(options.rootDir, context.nuxt.options.generate.dir)
  ) || path.resolve(options.rootDir, 'dist')
  options.distDir = path.resolve(generateDir, '_nuxt')

  registerRotues(router, context, options)
}
