(function(global){
  const matrix={basic:{3:1290,6:1890,12:2390},pro:{3:1990,6:2990,12:3790},unlimit:{3:4490,6:6490,12:8490}};
  const original={basic:{3:2590,6:3790,12:4790},pro:{3:3990,6:5990,12:7590},unlimit:{3:6390,6:9290,12:12190}};
  const discounts={basic:50,pro:50,unlimit:30};
  const purchasableMonths=[3,6,12];
  global.FM_PRICES=Object.freeze(matrix);
  global.FM_ORIGINAL_PRICES=Object.freeze(original);
  global.FM_DISCOUNT_PERCENT=Object.freeze(discounts);
  global.FM_PURCHASABLE_MONTHS=Object.freeze(purchasableMonths);
})(globalThis);
