import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=(relative)=>fs.readFileSync(path.join(root,relative),'utf8');
const html=read('miniapp/index.html');
const app=read('miniapp/app.js');
const config=read('miniapp/config.js');

assert.match(html,/<title>WADEONIX<\/title>/);
assert.match(html,/class="brand-mark">WX<\/span>/);
assert.match(html,/<img class="app-icon app-avatar" src="bot_avatar\.jpg" alt="Wade Onix">/);
assert.doesNotMatch(html,/class="app-icon">WX<\/div>/);
assert.equal((html.match(/<strong>Wade Onix<\/strong>/g)||[]).length,2);
assert.match(html,/>WADEONIX</);
assert.doesNotMatch(html,/Fofan Flow|Fofan Montage|Fofan Essentials/i);
assert.doesNotMatch(app,/Fofan Flow|Fofan Montage|Fofan Essentials/i);
assert.match(config,/appVersion:\s*"5\.0\.0"/);
assert.match(config,/supportUsername:\s*"itsWade"/);
assert.doesNotMatch(app,/dwayne633/);
assert.match(config,/releases\/download\/v5\.0\.0\/WADEONIX-v5\.0\.0\.zip/);
assert.match(config,/botUsername:\s*"WadeOnix_Bot"/);
assert.match(config,/apiUrl:\s*"https:\/\/fofan-miniapp-api\./);

for(const relative of ['start_banner.png','miniapp/start_banner.png']){
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,relative))).digest('hex');
  assert.equal(hash,'660bba350182d37dd9c0b3714a1287e0f92a3aea0af014981a9a899f8985df3b',`${relative} must use the supplied WADE artwork`);
}

console.log('WADEONIX Mini App branding OK');
