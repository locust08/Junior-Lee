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

test('every page loads the BugHerd sidebar asynchronously from the document head', () => {
  const tree = new LocalizedDocument({ locale: 'en' }).render();
  const [head] = tree.props.children;
  const bugHerdScripts = head.props.children.filter(
    (child) => child?.type === 'script' && child.props.src?.startsWith('https://www.bugherd.com/sidebarv2.js'),
  );

  assert.equal(bugHerdScripts.length, 1, 'the BugHerd loader must appear exactly once');
  assert.equal(
    bugHerdScripts[0].props.src,
    'https://www.bugherd.com/sidebarv2.js?apikey=ctqytgzjkfwsthje8nqgca',
  );
  assert.equal(bugHerdScripts[0].props.async, true);
});
