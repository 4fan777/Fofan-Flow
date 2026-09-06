import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

await import('../miniapp/pricing.js');

assert.deepEqual(globalThis.FM_PRICES, {
  basic: {1:390,3:990,12:2990},
  pro: {1:590,3:1490,12:4490},
  unlimit: {1:1890,3:3990,12:8990},
});
const expected={basic:[[390,0],[330,180],[249,1690]],pro:[[590,0],[497,280],[374,2590]],unlimit:[[1890,0],[1330,1680],[749,13690]]};
for(const [code,quotes] of Object.entries(expected))for(const [i,months] of [1,3,12].entries()){
  const quote=globalThis.FM_QUOTE(code,months);
  assert.equal(quote.total,globalThis.FM_PRICES[code][months]);
  assert.equal(quote.monthly,quotes[i][0]);
  assert.equal(quote.saving,quotes[i][1]);
}
assert.equal(globalThis.FM_QUOTE('basic',6),null);
assert.equal(globalThis.FM_QUOTE('unknown',3),null);
assert.deepEqual(globalThis.FM_PURCHASABLE_MONTHS, [1,3,12]);
assert.equal(Object.hasOwn(globalThis.FM_PRICES.basic, 6), false);

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'miniapp','index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'miniapp','app.js'),'utf8');
assert.match(html,/data-months="1"/);
assert.match(html,/data-months="3"/);
assert.match(html,/data-months="12"/);
assert.doesNotMatch(html,/data-months="6"/);
assert.doesNotMatch(html,/−(?:5|10|15)%/);
assert.match(app,/months:\s*1/);
assert.match(app,/purchasableMonths\.includes\(state\.months\)/);

console.log('pricing matrix OK');
