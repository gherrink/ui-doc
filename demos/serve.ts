/* eslint-disable no-console */

import fs from 'node:fs'
import http from 'node:http'
import path from 'node:path'

const basePath = process.argv[2] || undefined
const port = process.argv[3] ? parseInt(process.argv[3], 10) : 8080

if (!basePath) {
  console.error('Usage: node serve.js <base_path> [port]')
  process.exit(1)
}

// maps file extension to MIME types
const mimeType = {
  '.ico': 'image/x-icon',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.doc': 'application/msword',
  '.eot': 'application/vnd.ms-fontobject',
  '.ttf': 'application/x-font-ttf',
}

http
  .createServer((req, res) => {
    console.log(`${req.method} ${req.url}`)

    // parse URL
    const baseURL = `http://${req.headers.host}/`
    const parsedUrl = new URL(req.url ?? '', baseURL)

    if (!parsedUrl?.pathname) {
      res.statusCode = 500
      res.end('Invalid URL')
      return
    }

    // extract URL path
    // Avoid https://en.wikipedia.org/wiki/Directory_traversal_attack
    // e.g curl --path-as-is http://localhost:9000/../fileInDanger.txt
    // by limiting the path to current directory only
    const sanitizePath = path.normalize(parsedUrl.pathname).replace(/^(\.\.[/\\])+/, '')
    let pathname = path.join(__dirname, basePath, sanitizePath)

    // file dose not exist exit with 404
    if (!fs.existsSync(pathname)) {
      res.statusCode = 404
      res.end(`File ${pathname} not found!`)
      return
    }

    // if is a directory, then look for index.html
    if (fs.statSync(pathname).isDirectory()) {
      pathname += '/index.html'
    }

    try {
      const content = fs.readFileSync(pathname)
      const ext = path.parse(pathname).ext

      // set content type based on file extension
      res.setHeader('Content-type', mimeType[ext as keyof typeof mimeType] || 'text/plain')
      res.end(content)
    } catch (err) {
      res.statusCode = 500
      res.end(`Error getting the file: ${err}.`)
    }
  })
  .listen(port)

console.log(`Server listening on port ${port}`)
