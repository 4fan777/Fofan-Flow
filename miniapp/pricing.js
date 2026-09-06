(function(global){
  const plans={
    basic:{name:'Core',base:390,description:'Для ежедневных задач',descriptionEn:'For everyday editing',prices:{3:990,6:1790,12:2990}},
    pro:{name:'Pro',base:590,description:'Полный набор WadeOnix',descriptionEn:'The complete WadeOnix toolkit',prices:{3:1490,6:2690,12:4490}},
    unlimit:{name:'Ultimate',base:1890,description:'Максимальные возможности',descriptionEn:'Maximum possibilities',prices:{3:3990,6:5990,12:8990}}
  };
  Object.values(plans).forEach(p=>{Object.freeze(p.prices);Object.freeze(p)});
  global.FM_PLANS=Object.freeze(plans);
  global.FM_PRICES=Object.freeze(Object.fromEntries(Object.entries(plans).map(([code,p])=>[code,p.prices])));
  global.FM_PURCHASABLE_MONTHS=Object.freeze([3,6,12]);
  global.FM_QUOTE=(code,months)=>{const p=plans[code],total=p?.prices[months];return total?{total,monthly:Math.round(total/months),saving:p.base*months-total}:null};
})(globalThis);
