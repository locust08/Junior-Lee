import fs from 'node:fs'
import path from 'node:path'

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return

  const source = fs.readFileSync(filePath, 'utf8')
  const patched = source
    .replaceAll(/\.wasm\?module/g, '.wasm')
    .replaceAll(/require\(["']node:sqlite["']\)/g, '({})')
    .replaceAll(
      'throw Error(\'Dynamic require of "\'+x3+\'" is not supported\')',
      'if(String(x3).endsWith("/server/middleware-manifest.json"))return{version:3,middleware:{},functions:{},sortedMiddleware:[]};throw Error(\'Dynamic require of "\'+x3+\'" is not supported\')',
    )
    .replaceAll(
      'getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}',
      'getMiddlewareManifest(){return{version:3,middleware:{},functions:{},sortedMiddleware:[]}}',
    )
    .replaceAll(/"path":\s*"node:sqlite",\s*"kind":\s*"require-call",\s*"external":\s*true/g, '"path":"node:sqlite-stub","kind":"require-call","external":false')
  if (patched !== source) {
    fs.writeFileSync(filePath, patched)
  }
}

patchFile(path.join(process.cwd(), '.open-next', 'server-functions', 'default', 'handler.mjs'))
patchFile(path.join(process.cwd(), '.open-next', 'server-functions', 'default', 'handler.mjs.meta.json'))
