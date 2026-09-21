import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import test from 'node:test';

const require = createRequire(import.meta.url);
const postcss = require('postcss');
const tailwindConfig = require('../tailwind.config.js');

function hexToRgb(hex) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((offset) => Number.parseInt(value.slice(offset, offset + 2), 16) / 255);
}

function relativeLuminance(hex) {
  const [red, green, blue] = hexToRgb(hex).map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(first, second) {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

test('Tailwind exposes the Metro-derived Junior Lee colour hierarchy', () => {
  const theme = tailwindConfig.presets[0].theme.extend;
  const colors = theme.colors;
  const themeLookup = (path, fallback) =>
    path.split('.').reduce((value, key) => value?.[key], { colors }) ?? fallback;

  assert.equal(colors.teal[500], '#18BC9D');
  assert.equal(colors.teal[800], '#0E6656');
  assert.equal(colors.teal[900], '#0B4F46');
  assert.equal(colors.lime[500], '#E67E22');
  assert.equal(colors.orange[500], '#E67E22');
  assert.equal(colors.gray[600], '#3C4854');
  assert.equal(colors.indigo[900], '#191061');
  assert.equal(theme.textColor(() => colors).body, '#3C4854');
  assert.equal(theme.backgroundColor(() => colors).body, '#FFFFFF');
  assert.deepEqual(theme.outline.lime, ['2px solid #E67E22', '2px']);
  assert.equal(theme.ringColor(themeLookup).DEFAULT, '#C96517');
});

test('brand surface and CTA colour pairs meet WCAG AA contrast', () => {
  assert.ok(contrastRatio('#FFFFFF', '#0E6656') >= 4.5, 'white on strong teal');
  assert.ok(contrastRatio('#191061', '#18BC9D') >= 4.5, 'indigo on primary teal');
  assert.ok(contrastRatio('#191061', '#E67E22') >= 4.5, 'indigo on orange CTA');
  assert.ok(contrastRatio('#3C4854', '#FFFFFF') >= 4.5, 'body text on white');
  assert.ok(contrastRatio('#C96517', '#FFFFFF') >= 3, 'focus orange on white');
});

test('dark teal buttons allow their hover background to remain visible', () => {
  const stylesheet = postcss.parse(
    fs.readFileSync(new URL('../src/styles/main.css', import.meta.url), 'utf8'),
  );
  let backgroundDeclaration;

  stylesheet.walkRules('.bg-teal-900', (rule) => {
    rule.walkDecls('background-color', (declaration) => {
      backgroundDeclaration = declaration;
    });
  });

  assert.ok(backgroundDeclaration, 'expected the shared dark teal background rule');
  assert.equal(Boolean(backgroundDeclaration.important), false);
  assert.ok(contrastRatio('#0B4F46', '#FFFFFF') >= 4.5, 'dark teal text on white hover');
});

test('the footer logo is rendered as a dark asset on the light footer', () => {
  const stylesheet = postcss.parse(
    fs.readFileSync(new URL('../src/styles/main.css', import.meta.url), 'utf8'),
  );
  const declarations = new Map();
  const widthValues = [];

  stylesheet.walkRules('#site-footer-logo', (rule) => {
    rule.walkDecls((declaration) => {
      declarations.set(declaration.prop, declaration.value);
      if (declaration.prop === 'width') widthValues.push(declaration.value);
    });
  });

  assert.equal(declarations.get('background-color'), 'transparent');
  assert.equal(declarations.get('filter'), 'none');
  assert.equal(declarations.get('object-fit'), 'cover');
  assert.deepEqual(widthValues, ['11rem', '10rem']);
});
