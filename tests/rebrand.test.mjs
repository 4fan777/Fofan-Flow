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
assert.match(html,/class="app-icon">WX<\/div>/);
assert.match(html,/>WADEONIX</);
assert.doesNotMatch(html,/Fofan Flow|Fofan Montage|Fofan Essentials/i);
assert.doesNotMatch(app,/Fofan Flow|Fofan Montage|Fofan Essentials/i);
assert.match(config,/appVersion:\s*"4\.1\.6"/);
assert.match(config,/releases\/download\/v4\.1\.6\/WADEONIX-v4\.1\.6\.zip/);
assert.match(config,/botUsername:\s*"FofanFlowBot"/);
assert.match(config,/apiUrl:\s*"https:\/\/fofan-miniapp-api\./);

for(const relative of ['start_banner.png','miniapp/start_banner.png']){
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,relative))).digest('hex');
  assert.equal(hash,'9ed62db32572cdf269a011887da6e0f6ba825afead1dcaf408c6de58308df63d',`${relative} must not change`);
}

console.log('WADEONIX Mini App branding OK');
