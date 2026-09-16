import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const html=fs.readFileSync(path.join(root,'miniapp/index.html'),'utf8');
const app=fs.readFileSync(path.join(root,'miniapp/app.js'),'utf8');

assert.match(html,/id="payment-status"[^>]*aria-live="polite"/);
assert.match(html,/id="payment-open"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
assert.match(app,/setPaymentState\(loading,true,provider\)/);
assert.match(app,/const popup=reserveCheckoutWindow\(\),loading=/);
assert.match(app,/popup\.location\.replace\(url\)/);
assert.match(app,/tg\.openLink\(url,\{try_instant_view:false\}\)/);
assert.match(app,/Если страница не открылась, нажмите кнопку ниже/);
assert.match(app,/body:JSON\.stringify\(\{provider,plan:state\.plan,period:state\.months,request_id:requestId\(\)\}\)/);
assert.doesNotMatch(app,/CRYPTO_PAY_TOKEN|PLATEGA_SECRET|PAYMENT_GATEWAY_TOKEN|amount:state/);

console.log('Payment handoff UI and secret boundary OK');
