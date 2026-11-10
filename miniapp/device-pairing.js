export function createApprovalSession({challengeId,post}){
 if(typeof challengeId!=='string'||!/^[A-Za-z0-9_-]{43}$/.test(challengeId)||typeof post!=='function')throw Error('PAIRING_INPUT');
 let closed=false,busy=false,details;
 return {close(){closed=true},async inspect(){
  if(closed||busy||details)throw Error('PAIRING_STATE');busy=true;
  try{const result=await post('inspect',challengeId);
   if(closed||!result||Object.keys(result).length!==2||!/^[a-f0-9]{64}$/.test(result.fingerprint)||!Number.isSafeInteger(result.expiresAt)||result.expiresAt<=Date.now()||result.expiresAt>Date.now()+65000)throw Error('PAIRING_RESPONSE');
   details=Object.freeze({...result});return details;
  }catch(error){closed=true;throw error}finally{busy=false}
 },async approve(){
  if(closed||busy||!details||details.expiresAt<=Date.now())throw Error('PAIRING_STATE');busy=true;
  try{const result=await post('approve',challengeId);if(closed||result?.approved!==true||Object.keys(result).length!==1)throw Error('PAIRING_RESPONSE');closed=true;return true}
  catch(error){closed=true;throw error}finally{busy=false}
 }};
}

// Dormant until the matching server migration and desktop UI are released.
// start_param is untrusted input: the server authenticates the actual owner.
export async function mountPairing({document,config,telegram,fetcher=fetch}){
 const param=telegram?.initDataUnsafe?.start_param;
 if(typeof param!=='string'||! /^(pair|move)_[A-Za-z0-9_-]{43}$/.test(param)||!telegram?.initData)return;
 const transfer=param.startsWith('move_');
 if((transfer?config?.nativeTransferEnabled:config?.nativePairingEnabled)!==true)return;
 const origin=new URL(config.apiUrl);
 if(origin.protocol!=='https:'||origin.origin!==config.apiUrl)throw Error('PAIRING_ORIGIN');
 const dialog=document.createElement('dialog'),title=document.createElement('h2'),message=document.createElement('p'),fingerprint=document.createElement('p'),approve=document.createElement('button'),cancel=document.createElement('button');
 title.textContent=transfer?'Перенос доступа':'Подключение компьютера';message.textContent='Проверяем запрос…';
 approve.textContent=transfer?'Перенести на этот компьютер':'Это мой компьютер';approve.className='primary';approve.disabled=true;
 cancel.textContent='Отмена';cancel.className='row-button';
 dialog.setAttribute('aria-label',title.textContent);message.setAttribute('role','status');fingerprint.style.overflowWrap='anywhere';
 dialog.append(title,message,fingerprint,approve,cancel);document.body.append(dialog);
 const controller=new AbortController();let timer,closed=false,sourceFingerprint;
 async function post(action,challengeId){
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
   const endpoint=transfer?'/v2/native/device/transfer/':'/v2/native/pairing/';
   const response=await fetcher(origin.origin+endpoint+action,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':telegram.initData},body:JSON.stringify(transfer?{transfer_id:challengeId}:{challenge_id:challengeId}),credentials:'omit',cache:'no-store',redirect:'error',signal:controller.signal});
   if(!response.ok||!response.body)throw Error('PAIRING_DENIED');
   const reader=response.body.getReader();let text='',size=0;const decoder=new TextDecoder('utf-8',{fatal:true});
   try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192)throw Error('PAIRING_RESPONSE');text+=decoder.decode(value,{stream:true})}text+=decoder.decode();
    const result=JSON.parse(text);
    if(transfer&&action==='inspect'){
     if(!result||Object.keys(result).length!==4||result.transferId!==challengeId||typeof result.sourceFingerprint!=='string'||!/^[a-f0-9]{64}$/.test(result.sourceFingerprint)||typeof result.targetFingerprint!=='string'||!/^[a-f0-9]{64}$/.test(result.targetFingerprint)||result.sourceFingerprint===result.targetFingerprint)throw Error('PAIRING_RESPONSE');
     sourceFingerprint=result.sourceFingerprint;
     return {fingerprint:result.targetFingerprint,expiresAt:result.expiresAt};
    }
    return result;
   }
   finally{await reader.cancel().catch(()=>{});reader.releaseLock()}
  }finally{clearTimeout(timeout)}
 }
 const session=createApprovalSession({challengeId:param.slice(5),post});
 function close(){if(closed)return;closed=true;clearTimeout(timer);session.close();controller.abort();dialog.remove()}
 cancel.addEventListener('click',close);dialog.addEventListener('cancel',close);
 document.defaultView?.addEventListener('pagehide',close,{once:true});
 dialog.showModal();
 approve.addEventListener('click',async()=>{
  if(approve.disabled||closed)return;approve.disabled=true;
  try{await session.approve();if(!closed){clearTimeout(timer);message.textContent=transfer?'Перенос подтверждён. Вернитесь в плагин и завершите перенос.':'Подтверждено. Вернитесь в плагин и завершите подключение.';cancel.textContent='Закрыть'}}
  catch{if(!closed)message.textContent='Подтверждение не выполнено. Создайте новый запрос в плагине.'}
 });
 try{const details=await session.inspect();if(closed)return;
  fingerprint.textContent=transfer?'Старый компьютер: '+sourceFingerprint+' → Новый компьютер: '+details.fingerprint:details.fingerprint.toUpperCase().match(/.{4}/g).join(' ');
  if(!transfer){fingerprint.setAttribute('aria-label','Код компьютера для сравнения');Object.assign(fingerprint.style,{fontFamily:'monospace',fontSize:'16px',lineHeight:'1.8',letterSpacing:'.04em'});}
  message.textContent=transfer?'После завершения переноса старый компьютер потеряет доступ. Сравните код устройства с кодом в плагине. Подтверждайте только свой компьютер. Не подтверждайте запрос по чужой ссылке.':'Сравните все группы кода ниже с полем «Код компьютера для сравнения» в плагине. Если всё совпало и вы сами начали подключение — нажмите «Это мой компьютер». Если код отличается или запрос не ваш — нажмите «Отмена».';
  approve.disabled=false;timer=setTimeout(()=>{approve.disabled=true;session.close();message.textContent='Запрос истёк. Создайте новый запрос в плагине.'},Math.max(0,details.expiresAt-Date.now()));
 }catch{if(!closed)message.textContent='Запрос недоступен. Откройте новую ссылку из плагина через свой Telegram.'}
 return {close};
}
if(typeof window!=='undefined')mountPairing({document:window.document,config:window.FM_CONFIG,telegram:window.Telegram?.WebApp}).catch(()=>{});
