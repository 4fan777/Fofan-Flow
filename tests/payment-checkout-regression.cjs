const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../miniapp/app.js'),'utf8');
function setup(failFirst=false){
 const lines=source.split(/\r?\n/).filter(l=>/^\s*(?:async )?function (requestId|reserveCheckoutWindow|createCheckout)\(/.test(l));
 const seen={opens:0,links:[],bodies:[],errors:[]};
 const context={window:{crypto:undefined},crypto:{},tg:{initData:'test-session'},state:{plan:'basic',months:1},paymentBusy:false,checkoutRequests:{},cfg:{apiUrl:'https://test.invalid'},AbortController,setTimeout,clearTimeout,Date,Math,
  open(){seen.opens++;return null;},setPaymentState(_t,b){context.paymentBusy=b;},paymentStatus(){},toast(m){seen.errors.push(m);},paymentUrl:u=>u,
  sessionStorage:{setItem(){throw Error('Storage denied');}},openCheckout(u){seen.links.push(u);context.paymentBusy=false;},
  fetch:async(_u,o)=>{seen.bodies.push(JSON.parse(o.body));if(failFirst&&seen.bodies.length===1)throw TypeError('network');return{ok:true,json:async()=>({payment_url:'https://pay.platega.io/pay/test',order_id:1})};}};
 vm.createContext(context);vm.runInContext(lines.join('\n'),context);return{context,seen};
}
test('Telegram mobile never opens a blank window before obtaining a payment link',async()=>{
 const h=setup();await h.context.createCheckout('platega');assert.equal(h.seen.opens,0);
});
test('Blocked browser storage cannot prevent opening a successfully created payment',async()=>{
 const h=setup();await h.context.createCheckout('platega');assert.deepEqual(h.seen.links,['https://pay.platega.io/pay/test']);
});
test('Network retry reuses the same checkout intent and never requires randomUUID support',async()=>{
 const h=setup(true);await h.context.createCheckout('platega');await h.context.createCheckout('platega');
 assert.equal(h.seen.bodies.length,2);assert.equal(h.seen.bodies[0].request_id,h.seen.bodies[1].request_id);
});
test('Ambiguous gateway errors preserve the checkout identity',async()=>{
 for(const status of [500,502,504]){
  const h=setup();let calls=0;h.context.fetch=async(_u,o)=>{h.seen.bodies.push(JSON.parse(o.body));return ++calls===1?{ok:false,status,json:async()=>({message:'temporary'})}:{ok:true,json:async()=>({payment_url:'https://pay.platega.io/pay/test',order_id:1})};};
  await h.context.createCheckout('platega');await h.context.createCheckout('platega');
  assert.equal(h.seen.bodies[0].request_id,h.seen.bodies[1].request_id);
 }
});
