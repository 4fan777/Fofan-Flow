import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '..');
const app = fs.readFileSync(path.join(root, 'miniapp', 'app.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'miniapp', 'index.html'), 'utf8');

test('mini app contains the current WADEONIX legal documents', () => {
  for (const text of [
    'Редакция от 16.09.2026',
    'Политика конфиденциальности',
    'Пользовательское соглашение',
    '@WadeOnix_Bot',
    'Platega',
    'Crypto Pay',
    'не ограничивает права потребителя',
    '@itsWade',
  ]) assert.ok(app.includes(text), `missing legal copy: ${text}`);

  assert.ok(html.includes('data-modal="privacy"'));
  assert.ok(html.includes('data-modal="terms"'));
  assert.ok(html.includes('Пользовательское соглашение'));
  assert.ok(!app.includes('Укажите актуальную дату'));
  assert.ok(!app.includes('ваш сайт/ тг бот'));
});
