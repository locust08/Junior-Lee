import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import test from 'node:test';
import ts from 'typescript';

const documentUrl = new URL('../src/pages/_document.tsx', import.meta.url);
const documentPath = documentUrl.pathname.replace(/^\/(.:\/)/, '$1');
const source = fs.readFileSync(documentUrl, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
  fileName: documentPath,
}).outputText;

const module = { exports: {} };
const require = createRequire(documentUrl);
vm.runInNewContext(compiled, { exports: module.exports, module, require }, { filename: documentPath });

const LocalizedDocument = module.exports.default;

test('every page emits GTM-TGL5NW4G at the start of head and body', () => {
  const tree = new LocalizedDocument({ locale: 'en' }).render();
  const [head, body] = tree.props.children;
  const headChildren = head.props.children;
  const bodyChildren = body.props.children;

  const bootstrap = headChildren[0];
  assert.equal(bootstrap.type, 'script');
  assert.equal(
    typeof bootstrap.props.dangerouslySetInnerHTML?.__html,
    'string',
    'the first head script must be the inline GTM bootstrap',
  );
  assert.match(
    bootstrap.props.dangerouslySetInnerHTML.__html,
    /https:\/\/www\.googletagmanager\.com\/gtm\.js\?id=/,
  );
  assert.match(
    bootstrap.props.dangerouslySetInnerHTML.__html,
    /\(window,document,'script','dataLayer','GTM-TGL5NW4G'\);/,
  );

  const fallback = bodyChildren[0];
  assert.equal(fallback.type, 'noscript');
  assert.equal(
    fallback.props.children.props.src,
    'https://www.googletagmanager.com/ns.html?id=GTM-TGL5NW4G',
  );
});
