import http from 'node:http'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve, extname, sep } from 'node:path'
const root = resolve('.output/public')
http.createServer((request, response) => {
  let path = resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname))
  if (path !== root && !path.startsWith(root + sep)) { response.writeHead(403).end(); return }
  if (existsSync(path) && statSync(path).isDirectory()) path = resolve(path, 'index.html')
  if (!existsSync(path)) { response.writeHead(404).end(); return }
  response.setHeader('Content-Type', ({'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'})[extname(path)] ?? 'application/octet-stream')
  response.end(readFileSync(path))
}).listen(3020,'127.0.0.1')
