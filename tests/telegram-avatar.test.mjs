import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'miniapp','index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'miniapp','app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'miniapp','styles.css'),'utf8');

assert.match(html,/<img[^>]+id="telegram-avatar"[^>]*>/);
assert.doesNotMatch(html,/class="avatar-nav[^>]*>[\s\S]*?<span>FM<\/span>/);
assert.match(app,/initDataUnsafe\?\.user\?\.photo_url/);
assert.match(app,/telegram-avatar/);
assert.match(css,/\.telegram-avatar[^}]*object-fit:cover/);

console.log('telegram avatar wiring OK');
