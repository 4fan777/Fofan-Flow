(function(global){
  const matrix={basic:{1:490,3:1400,6:2650,12:5000},pro:{1:780,3:2220,6:4210,12:7960},unlimit:{1:1750,3:4990,6:9450,12:17850}};
  const original={basic:{1:980},pro:{1:1560},unlimit:{1:3500}};
  global.FM_PRICES=Object.freeze(matrix);
  global.FM_ORIGINAL_PRICES=Object.freeze(original);
  global.FM_SALE_PERCENT=50;
})(globalThis);
