import fs from 'fs'
import chalk from 'chalk'

export const send404 = res => {
  res.statusCode = 404
  res.statusMessage = 'Not Found'
  res.end()
}

export const sendJson = (content, res) => {
  if (!content) {
    console.log(`  ${chalk.blue('blog:api')} ${chalk.red('Not found')}`)

    return send404(res)
  }

  content = JSON.stringify(content, null, 2)
  console.log(`  ${chalk.blue('blog:api')} ${chalk.green('application/json')}`)
  console.log(`  ${chalk.blue('blog:api')} ${JSON.stringify(content).substr(0, 40)}...}`)
  res.setHeader('Content-Type', 'application/json')
  res.end(content, 'utf-8')
}

export const sendFile = (filename, res) => {
  console.log(`   Resolved file: ${filename}`)
  fs.access(filename, exists => {
    if (exists) {
      console.log('   Found required file. Attempting response.')
      fs.readFile(filename, { encoding: 'utf-8' }, (error, content) => {
        if (error) {
          console.log('   Failed to send response.', error)
          res.statusCode = 500
          res.statusMessage = 'Internal Server Error'
          res.end(error.stack || String(error))
        }

        res.setHeader('Content-Type', 'application/json')
        res.end(content, 'utf-8')
        console.log('   Response sent successfully.')
      })
    }
    else {
      return send404(res)
    }
  })
}
