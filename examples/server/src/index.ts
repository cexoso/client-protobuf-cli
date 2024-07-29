import { HelloApp } from './app'
import { createSecureServer } from 'http2'
import { readFileSync } from 'fs'

const http2Server = createSecureServer({
  key: readFileSync('cert/server.key'),
  cert: readFileSync('cert/server.crt'),
})
const app = HelloApp.createApp({
  http2Server,
})
const port = 50051
console.log(`listen on ${port}`)
app.listen(port)
