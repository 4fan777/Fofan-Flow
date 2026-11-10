(function(global){
  const plans={
    basic:{name:'Core',base:390,description:'Для ежедневных задач',descriptionEn:'For everyday editing',prices:{1:390,3:990,12:2990}},
    pro:{name:'Pro',base:590,description:'Полный набор WadeOnix',descriptionEn:'The complete WadeOnix toolkit',prices:{1:590,3:1490,12:4490}},
    unlimit:{name:'Ultimate',base:1890,description:'Максимальные возможности',descriptionEn:'Maximum possibilities',prices:{1:1890,3:3990,12:8990}}
  };
  if(global.FM_CONFIG?.lifetimeUltimateEnabled===true){
    plans.unlimit={name:'Ultimate',base:2990,description:'Все функции навсегда',descriptionEn:'Every feature, lifetime access',prices:{0:2990},lifetime:true};
  }
  Object.values(plans).forEach(p=>{Object.freeze(p.prices);Object.freeze(p)});
  global.FM_PLANS=Object.freeze(plans);
  global.FM_PRICES=Object.freeze(Object.fromEntries(Object.entries(plans).map(([code,p])=>[code,p.prices])));
  global.FM_PURCHASABLE_MONTHS=Object.freeze([1,3,12]);
  global.FM_QUOTE=(code,months)=>{const p=Object.hasOwn(plans,code)?plans[code]:null,total=p?.prices[months];return total?{total,monthly:p.lifetime?null:Math.round(total/months),saving:p.lifetime?0:p.base*months-total,...(p.lifetime?{lifetime:true}:{})}:null};
})(globalThis);
