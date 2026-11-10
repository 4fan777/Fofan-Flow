// Profile-only owner code. No Telegram messages, redirects or persistent storage.
export function mountProfileCode({document,telegram,config,fetcher=fetch}){
 const key=document.querySelector('#license-key'),card=key?.closest('.key-card');
 if(!card)return;
 const box=document.createElement('article');box.className='key-form';
 const title=document.createElement('strong'),hint=document.createElement('small'),value=document.createElement('code'),status=document.createElement('small'),generate=document.createElement('button'),copy=document.createElement('button');
 title.textContent='Подключение компьютера';hint.textContent='Сначала нажмите «Подключить компьютер» в плагине. Затем получите код здесь и введите его в плагине. Никому его не передавайте.';
 value.hidden=true;Object.assign(value.style,{fontSize:'28px',letterSpacing:'.25em',padding:'12px 0'});
 generate.type='button';generate.className='primary';generate.textContent='Получить код подключения';
 Object.assign(generate.style,{display:'block',width:'100%',minHeight:'44px',padding:'12px 16px',marginTop:'12px',fontSize:'12px'});
 copy.type='button';copy.className='text-btn';copy.textContent='Скопировать код';copy.hidden=true;status.setAttribute('role','status');
 Object.assign(copy.style,{minHeight:'40px',padding:'8px 0',fontSize:'12px'});
 box.append(title,hint,value,status,generate,copy);card.after(box);
 let timer,controller,code='',expiresAt=0,busy=false,generation=0;
 const clear=()=>{generation++;controller?.abort();clearInterval(timer);code='';expiresAt=0;value.textContent='';value.hidden=true;copy.hidden=true;busy=false;generate.disabled=false;};
 const keyText=()=>String(key.textContent||'').trim();let selected=keyText();
 const observer=new MutationObserver(()=>{if(keyText()!==selected){selected=keyText();clear();status.textContent='';}});observer.observe(key,{childList:true,characterData:true,subtree:true});
 generate.addEventListener('click',async()=>{
  if(busy)return;if(code&&expiresAt>Date.now()){status.textContent='Код уже готов. Скопируйте 6 цифр и введите их в плагине.';return;}clear();const turn=generation,license=keyText();
  if(!telegram?.initData){status.textContent='Откройте Mini App через @WadeOnix_Bot.';return;}
  if(!/^FF1(?:-[A-Z2-9]{4}){4}$/.test(license)){status.textContent='Сначала подключите свой ключ лицензии.';return;}
  busy=true;generate.disabled=true;status.textContent='Создаём код…';controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),10000);
  try{
   const origin=new URL(config.apiUrl);if(origin.protocol!=='https:'||origin.origin!==config.apiUrl)throw Error();
   const response=await fetcher(origin.origin+'/v2/native/telegram/profile-code',{method:'POST',credentials:'omit',cache:'no-store',redirect:'error',headers:{'content-type':'application/json','x-telegram-init-data':telegram.initData},body:JSON.stringify({license_key:license}),signal:controller.signal});
   const text=await response.text();if(text.length>8192)throw Error();const data=JSON.parse(text);
   if(turn!==generation||license!==keyText()||document.hidden)return;
   if(!response.ok){status.textContent=response.status===409?'В плагине нажмите «Подключить компьютер», затем получите код здесь.':response.status===429?'Используйте уже полученный код или повторите через 30 секунд. Лимит попыток не сбрасывается.':response.status===403?'Сеанс Telegram истёк. Закройте и снова откройте Mini App.':'Не удалось получить код. Повторите попытку.';return;}
   if(Object.keys(data).length!==2||!/^\d{6}$/.test(data.code)||!Number.isSafeInteger(data.expiresAt)||data.expiresAt<=Date.now()||data.expiresAt>Date.now()+305000)throw Error();
   code=data.code;expiresAt=data.expiresAt;value.textContent=code;value.hidden=false;copy.hidden=false;
   const tick=()=>{const left=Math.ceil((expiresAt-Date.now())/1000);if(left<=0){clear();status.textContent='Код истёк. Создайте новый запрос в плагине.';return;}status.textContent='Одноразовый код · осталось '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0');};tick();timer=setInterval(tick,1000);
  }catch{if(turn===generation)status.textContent='Не удалось получить код. Повторите попытку.';}
  finally{clearTimeout(timeout);if(turn===generation){busy=false;generate.disabled=false;}}
 });
 copy.addEventListener('click',async()=>{if(!code||expiresAt<=Date.now())return;try{await document.defaultView.navigator.clipboard.writeText(code);copy.textContent='Скопировано';}catch{status.textContent='Выделите и скопируйте 6 цифр вручную.';}});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){clear();status.textContent='Код скрыт. Если вы его скопировали, введите его в плагине.';}});
 document.defaultView?.addEventListener('pagehide',()=>{clear();observer.disconnect();},{once:true});
 return {clear};
}
if(typeof window!=='undefined')mountProfileCode({document:window.document,telegram:window.Telegram?.WebApp,config:window.FM_CONFIG});
