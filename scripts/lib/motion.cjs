// Decorative circuitry only. Native SVG SMIL stays active in image tags.
function background(w,h,animated=false){
  let out=`<defs><pattern id="terminal-grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#8EBBEE" stroke-opacity=".045"/><circle cx="1" cy="1" r="1" fill="#8B5CF6" fill-opacity=".2"/></pattern><linearGradient id="terminal-fade"><stop stop-color="#09090F" stop-opacity=".96"/><stop offset="1" stop-color="#09090F" stop-opacity=".35"/></linearGradient></defs><g aria-hidden="true"><rect width="${w}" height="${h}" fill="url(#terminal-grid)"/>`;
  const code=['010010 / 101101','rc.route(next);','[0x09] :: build','await create();','011001 / 010011','signal -> node','if (idea) ship();'];
  for(let i=0;20+i*42<h-8;i++)out+=`<text x="${Math.max(260,w-340)+(i%3)*14}" y="${20+i*42}" font-family="monospace" font-size="11" fill="${i%2?'#8B5CF6':'#8EBBEE'}" opacity=".1">${code[i%code.length].replaceAll('>','&gt;')}</text>`;
  out+=`<rect width="${w}" height="${h}" fill="url(#terminal-fade)"/>`;
  if(animated)out+=`<rect x="${w-290}" y="0" width="270" height="2" fill="#8EBBEE" opacity=".12"><animate attributeName="y" values="0;${h-2}" dur="13s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;.12;0" dur="13s" repeatCount="indefinite"/></rect>`;
  return out+'</g>';
}
function flow(w,h,animated=true){
  const y=Math.max(28,h-14),a=Math.max(18,h*.27),b=Math.max(30,h*.64);
  const routes=[`M${w-4} 12 V${a} L${w-18} ${a+14} V${b} L${w-8} ${b+10} V${y-12} L${w-20} ${y} H${w*.72} L${w*.72-10} ${h-4} H${w*.6}`,
    `M4 14 V${a+8} L18 ${a+22} V${y-10} L28 ${y} H${w*.25} L${w*.25+10} ${h-4} H${w*.36}`];
  let out='<g aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">';
  routes.forEach((d,i)=>{
    const color=i?'#8B5CF6':'#8EBBEE',dur=i?11:8;
    out+=`<path d="${d}" stroke="${color}" stroke-opacity=".24" stroke-width="1"/>`;
    if(animated)out+=`<path d="${d}" pathLength="100" stroke="${color}" stroke-width="1.8" stroke-dasharray="9 91"><animate attributeName="stroke-dashoffset" from="100" to="-100" dur="${dur}s" repeatCount="indefinite"/></path><circle r="2.4" fill="${color}"><animateMotion path="${d}" dur="${dur}s" repeatCount="indefinite"/><animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="${dur}s" repeatCount="indefinite"/></circle>`;
    out+=`<rect x="${i?w*.36-3:w*.6-3}" y="${h-7}" width="6" height="6" stroke="${color}" fill="#09090F">${animated?`<animate attributeName="fill" values="#09090F;${color};#09090F" dur="${dur}s" repeatCount="indefinite"/>`:''}</rect>`;
  });
  if(animated&&h>180)out+=`<path stroke="#EF7583" stroke-opacity=".5" d="M${w-20} 24 L${w-30} 34 V62 L${w-20} 72"><animate attributeName="d" values="M${w-20} 24 L${w-30} 34 V62 L${w-20} 72;M${w-20} 24 L${w-12} 42 V82 L${w-20} 96;M${w-20} 24 L${w-30} 34 V62 L${w-20} 72" dur="6s" repeatCount="indefinite"/></path>`;
  return out+'</g>';
}
function glitch(s,animated){
  if(!animated||s.h<180)return '';
  return `<g aria-hidden="true" opacity="0"><path d="M${s.w-96} 16h38m-18 5h62" stroke="#EF7583" stroke-width="2"/><path d="M${s.w-92} 21h14" stroke="#8EBBEE"/><animate attributeName="opacity" values="0;0;.8;0;.5;0" keyTimes="0;.88;.91;.94;.97;1" calcMode="discrete" dur="5s" repeatCount="indefinite"/></g>`;
}
// Long holds keep copy readable. These run on a clock, since README images
// cannot receive scroll/viewport events or run JavaScript.
function stage(content,animated,{id='stage',duration=16,delay=0,dx=0,dy=14,min=0}={}){
  if(!animated)return content;
  return `<g id="${id}" opacity="${min}">${content}<animate attributeName="opacity" values="${min};1;1;${min};${min}" keyTimes="0;.09;.88;.97;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/><animateTransform attributeName="transform" type="translate" values="${dx} ${dy};0 0;0 0;${-dx} ${-dy};${dx} ${dy}" keyTimes="0;.09;.88;.97;1" dur="${duration}s" begin="${delay}s" repeatCount="indefinite"/></g>`;
}
function terminal(s,content,animated,x,y,w,h,id='terminal-copy'){
  if(!animated)return content;
  return `<defs><clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"><animate attributeName="width" values="0;${w*.15};${w*.3};${w*.48};${w*.65};${w*.82};${w};${w};0;0" keyTimes="0;.025;.05;.075;.10;.125;.15;.9;.98;1" calcMode="discrete" dur="19s" repeatCount="indefinite"/></rect></clipPath></defs><g clip-path="url(#${id})">${content}</g>`;
}
module.exports={flow,background,glitch,stage,terminal};
