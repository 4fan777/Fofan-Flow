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
assert.match(config,/supportUsername:\s*"itsWade"/);
assert.doesNotMatch(app,/dwayne633/);
assert.match(config,/releases\/download\/v4\.1\.6\/WADEONIX-v4\.1\.6\.zip/);
assert.match(config,/botUsername:\s*"FofanFlowBot"/);
assert.match(config,/apiUrl:\s*"https:\/\/fofan-miniapp-api\./);

for(const relative of ['start_banner.png','miniapp/start_banner.png']){
  const hash=crypto.createHash('sha256').update(fs.readFileSync(path.join(root,relative))).digest('hex');
  assert.equal(hash,'660bba350182d37dd9c0b3714a1287e0f92a3aea0af014981a9a899f8985df3b',`${relative} must use the supplied WADE artwork`);
}

console.log('WADEONIX Mini App branding OK');
