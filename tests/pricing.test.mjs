import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

await import('../miniapp/pricing.js');

assert.deepEqual(globalThis.FM_PRICES, {
  basic: {3:990,6:1790,12:2990},
  pro: {3:1490,6:2690,12:4490},
  unlimit: {3:3990,6:5990,12:8990},
});
const expected={basic:[[330,180],[298,550],[249,1690]],pro:[[497,280],[448,850],[374,2590]],unlimit:[[1330,1680],[998,5350],[749,13690]]};
for(const [code,quotes] of Object.entries(expected))for(const [i,months] of [3,6,12].entries()){
  const quote=globalThis.FM_QUOTE(code,months);
  assert.equal(quote.total,globalThis.FM_PRICES[code][months]);
  assert.equal(quote.monthly,quotes[i][0]);
  assert.equal(quote.saving,quotes[i][1]);
}
assert.equal(globalThis.FM_QUOTE('basic',1),null);
assert.equal(globalThis.FM_QUOTE('unknown',3),null);
assert.deepEqual(globalThis.FM_PURCHASABLE_MONTHS, [3,6,12]);
assert.equal(Object.hasOwn(globalThis.FM_PRICES.basic, 1), false);

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'miniapp','index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'miniapp','app.js'),'utf8');
assert.match(html,/data-months="3"/);
assert.match(html,/data-months="6"/);
assert.match(html,/data-months="12"/);
assert.doesNotMatch(html,/data-months="1"/);
assert.doesNotMatch(html,/−(?:5|10|15)%/);
assert.match(app,/months:\s*3/);
assert.match(app,/purchasableMonths\.includes\(state\.months\)/);

console.log('pricing matrix OK');
