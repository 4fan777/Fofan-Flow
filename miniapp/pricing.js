(function(global){
  const matrix={basic:{1:270,3:1080,6:2050,12:3870},pro:{1:340,3:1390,6:2640,12:4990},unlimit:{1:550,3:2220,6:4210,12:7950}};
  const original={basic:{1:380},pro:{1:490},unlimit:{1:780}};
  global.FM_PRICES=Object.freeze(matrix);
  global.FM_ORIGINAL_PRICES=Object.freeze(original);
})(globalThis);
