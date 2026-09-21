import fs from 'fs'
import path from 'path'
import { sqliteD1Adapter } from '@payloadcms/db-d1-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { CloudflareContext, getCloudflareContext } from '@opennextjs/cloudflare'
import { GetPlatformProxyOptions } from 'wrangler'
import { r2Storage } from '@payloadcms/storage-r2'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { AboutUsPage } from './globals/AboutUsPage'
import { ContactUsPage } from './globals/ContactUsPage'
import { HomePage } from './globals/HomePage'
import { HowToApplyPage } from './globals/HowToApplyPage'
import { LoanPage } from './globals/LoanPage'
import { SiteSettings } from './globals/SiteSettings'
import { DEFAULT_PAYLOAD_PUBLIC_SERVER_URL, publishedContentEndpoint } from './endpoints/publishedContent'
import { configurePagesDeployHookUrl } from './hooks/triggerPagesDeploy'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)
const realpath = (value: string) => (fs.existsSync(value) ? fs.realpathSync(value) : undefined)

const isCLI = process.argv.some((value) => realpath(value)?.endsWith(path.join('payload', 'bin.js')))
const isProduction = process.env.NODE_ENV === 'production'
const isNextBuild = process.env.NEXT_PHASE === 'phase-production-build'
const useWranglerContext = process.env.PAYLOAD_USE_WRANGLER_CONTEXT === 'true'

const createLog =
  (level: string, fn: typeof console.log) => (objOrMsg: object | string, msg?: string) => {
    if (typeof objOrMsg === 'string') {
      fn(JSON.stringify({ level, msg: objOrMsg }))
    } else {
      fn(JSON.stringify({ level, ...objOrMsg, msg: msg ?? (objOrMsg as { msg?: string }).msg }))
    }
  }

const cloudflareLogger = {
  level: process.env.PAYLOAD_LOG_LEVEL || 'info',
  trace: createLog('trace', console.debug),
  debug: createLog('debug', console.debug),
  info: createLog('info', console.log),
  warn: createLog('warn', console.warn),
  error: createLog('error', console.error),
  fatal: createLog('fatal', console.error),
  silent: () => {},
} as any // Use PayloadLogger type when it's exported

const cloudflare =
  isCLI || useWranglerContext || !isProduction || isNextBuild
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true })

const payloadSecret =
  (cloudflare.env as CloudflareEnv & { PAYLOAD_SECRET?: string }).PAYLOAD_SECRET ||
  process.env.PAYLOAD_SECRET ||
  ''

configurePagesDeployHookUrl(
  (cloudflare.env as CloudflareEnv & { CLOUDFLARE_PAGES_DEPLOY_HOOK_URL?: string }).CLOUDFLARE_PAGES_DEPLOY_HOOK_URL,
)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL || DEFAULT_PAYLOAD_PUBLIC_SERVER_URL,
  admin: {
    components: {
      header: [{ path: '/admin/VersionHistoryActions' }],
    },
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  globals: [SiteSettings, HomePage, AboutUsPage, LoanPage, HowToApplyPage, ContactUsPage],
  endpoints: [publishedContentEndpoint],
  cors: [
    'https://metropinjamanberlesen.pages.dev',
    'https://12add699.metropinjamanberlesen.pages.dev',
    'http://localhost:3000',
  ],
  editor: lexicalEditor(),
  secret: payloadSecret,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: sqliteD1Adapter({ binding: cloudflare.env.D1 }),
  logger: isProduction ? cloudflareLogger : undefined,
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
})

// Adapted from https://github.com/opennextjs/opennextjs-cloudflare/blob/d00b3a13e42e65aad76fba41774815726422cc39/packages/cloudflare/src/api/cloudflare-context.ts#L328C36-L328C46
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  return import(/* webpackIgnore: true */ `${'__wrangler'.replaceAll('_', '')}`).then(
    ({ getPlatformProxy }) =>
      getPlatformProxy({
        environment: process.env.CLOUDFLARE_ENV,
        remoteBindings: process.env.CLOUDFLARE_REMOTE_BINDINGS === 'true',
      } satisfies GetPlatformProxyOptions),
  )
}
