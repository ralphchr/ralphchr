// Separate SVG sources keep a transparent canvas readable in either theme.
function light(svg){
  const colors={'#F0E9DD':'#222432','#C5C6D0':'#4B5064','#8EBBEE':'#376A9F','#8B5CF6':'#6D42BE','#EF7583':'#BA4356'};
  return svg.replace(/#(?:F0E9DD|C5C6D0|8EBBEE|8B5CF6|EF7583)/gi,c=>colors[c.toUpperCase()]);
}
module.exports={light};
