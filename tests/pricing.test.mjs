import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

await import('../miniapp/pricing.js');

assert.deepEqual(globalThis.FM_PRICES, {
  basic: {3:1290,6:1890,12:2390},
  pro: {3:1990,6:2990,12:3790},
  unlimit: {3:4490,6:6490,12:8490},
});
assert.deepEqual(globalThis.FM_ORIGINAL_PRICES, {
  basic: {3:2590,6:3790,12:4790},
  pro: {3:3990,6:5990,12:7590},
  unlimit: {3:6390,6:9290,12:12190},
});
assert.deepEqual(globalThis.FM_DISCOUNT_PERCENT, {basic:50,pro:50,unlimit:30});
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
