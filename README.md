# Metro Pinjaman Berlesen

Next.js static export for the Metro Pinjaman Berlesen website, with Cloudflare Pages Functions for booking APIs.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

The production build exports static files to `out/`.

## Cloudflare Pages

Use these build settings:

```text
Framework preset: Next.js
Build command: npm run build
Build output directory: out
Node.js version: 22
```

The repository also includes `wrangler.toml` with `pages_build_output_dir = "out"` and `.nvmrc`/`.node-version` with Node 22 so Cloudflare Pages uses the same static export settings during Git deployments.

Generated Next.js output is not tracked in Git. The `public/` directory is kept for source assets such as scripts, images, CSS, and icons.

The `functions/` directory provides the `/api/bookings` routes used by the contact form.
