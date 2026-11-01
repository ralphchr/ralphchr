const {SVG,frame}=require('./svg.cjs');
const {background}=require('./motion.cjs');
const {typingTitle}=require('./typing.cjs');
function banner(mobile=false,phase=0,animated=false){
  const w=1200,h=480,p=48;
  const s=new SVG(w,h,'RC_ — Always Becoming, Always Building / Explore my portfolio','Ralph Christian Borbon. Portfolio: https://ralphchr.vercel.app/. A creative mind. A problem-solving spirit. Cebu, Philippines. Character-by-character typing with a blinking cursor, hard resets and restrained two-second chromatic glitches.');
  frame(s);s.add(background(w,h,false));
  s.add('<path d="M48 94H1152M48 442H1152" stroke="#C5C6D0" stroke-opacity=".22"/>');
  s.add(s.text('RC',p,68,44));s.add(s.text('_',p+s.measure('RC',44)-1,68,44,'display','#8EBBEE'));
  s.add(s.text('RALPH CHRISTIAN BORBON',161,60,17,'mono','#C5C6D0',1));
  s.add(s.text('@RALPHCHR',1152,60,17,'mono','#8EBBEE',1,false,'end'));
  const top='ALWAYS BECOMING,',bottom='ALWAYS BUILDING',size=82;
  function title(t,x,y,color,outline=false){
    let at=x;return t.split(' ').map(word=>{const out=s.text(word,at,y,size,'display',color,-1,outline);at+=s.measure(word,size,'display',-1)+size*.38;return out;}).join('');
  }
  const topArt=title(top,p,193,'#C5C6D0',true),bottomArt=title(bottom,p,291,'#F0E9DD');
  s.add(typingTitle(s,[{text:top,art:`<g id="headline-outline">${topArt}</g>`,baseline:193},{text:bottom,art:`<g id="headline-solid">${bottomArt}</g>`,baseline:291}],animated,p,size));
  s.add('<defs><clipPath id="cyan-slice"><rect x="48" y="245" width="1104" height="4"/></clipPath><clipPath id="red-slice"><rect x="48" y="271" width="1104" height="3"/></clipPath></defs>');
  if(animated){
    s.add(`<g clip-path="url(#type-line-1)"><g clip-path="url(#cyan-slice)" opacity="0">${title(bottom,p+8,291,'#8EBBEE')}<animate attributeName="opacity" values="0;0;.85;0;.5;0" keyTimes="0;.86;.89;.92;.96;1" calcMode="discrete" dur="2s" repeatCount="indefinite"/></g></g><g clip-path="url(#type-line-1)"><g clip-path="url(#red-slice)" opacity="0">${title(bottom,p-7,291,'#EF7583')}<animate attributeName="opacity" values="0;0;.8;0;.5;0" keyTimes="0;.86;.89;.92;.96;1" calcMode="discrete" dur="2s" repeatCount="indefinite"/></g></g>`);
    s.parts=s.parts.map(part=>part.replace('<g id="headline-solid">','<g id="headline-solid"><animateTransform attributeName="transform" type="translate" values="0 0;0 0;2 0;-2 0;0 0" keyTimes="0;.88;.91;.95;1" calcMode="discrete" dur="2s" repeatCount="indefinite"/>'));
  }
  let cta='<rect x="48" y="334" width="1104" height="96" rx="4" fill="#111A2A" stroke="#8EBBEE" stroke-opacity=".6"/><path d="M48 348v68" stroke="#8EBBEE" stroke-width="4"/>';
  cta+=s.text('EXPLORE MY PORTFOLIO',70,360,16,'mono','#8EBBEE',1);
  cta+=s.text('https://ralphchr.vercel.app/',70,407,36,'display','#F0E9DD',-.4);
  cta+=s.text('ENTER',1050,392,20,'mono','#8EBBEE',.6,false,'end');
  cta+='<path d="M1080 384h38m-12-12 12 12-12 12" fill="none" stroke="#8EBBEE" stroke-width="2.5"/>';
  if(animated)cta+='<rect x="48" y="334" width="1104" height="96" rx="4" fill="none" stroke="#8EBBEE" stroke-width="2" pathLength="100" stroke-dasharray="12 88"><animate attributeName="stroke-dashoffset" from="100" to="-100" dur="9s" repeatCount="indefinite"/></rect>';
  s.add(`<g id="portfolio-callout">${cta}</g>`);
  s.add(s.text('CEBU, PHILIPPINES',48,465,14,'mono','#C5C6D0',.7));
  s.add(s.text('A creative mind. A problem-solving spirit.',1152,465,14,'mono','#C5C6D0',.3,false,'end'));
  s.add('<path d="M1116 116h36v36M48 316v-14h14" fill="none" stroke="#8B5CF6" stroke-opacity=".6"/>');
  return s.finish();
}
module.exports={banner};
