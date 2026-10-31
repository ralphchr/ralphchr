const {SVG,frame}=require('./svg.cjs');
const {flow,background}=require('./motion.cjs');
function banner(mobile=false,phase=0,animated=false){
  const s=new SVG(mobile?600:1200,mobile?510:480,'RC_ — Always Becoming, Always Building','Ralph Christian Borbon. A creative mind. A problem-solving spirit. Cebu, Philippines. Inter Black display type, JetBrains Mono annotations, orbital geometry and restrained cyan/red glitch details.');frame(s);s.add(background(s.w,s.h,animated));
  const pad=mobile?32:48,w=s.w,foot=mobile?448:430;
  const cx=mobile?438:973,cy=mobile?246:228,r=mobile?142:174;
  s.add(`<g fill="none" stroke="#C5C6D0"><path d="M${pad} 94H${w-pad} M${pad} ${foot}H${w-pad}" stroke-opacity=".25"/><circle cx="${cx}" cy="${cy}" r="${r}" stroke-opacity=".12"/><ellipse cx="${cx}" cy="${cy}" rx="${mobile?81:102}" ry="${r}" transform="rotate(35 ${cx} ${cy})" stroke="#8EBBEE" stroke-opacity=".18"/></g><path d="M${pad} 108V94H${pad+14} M${w-pad-14} ${foot}H${w-pad}V${foot-14}" fill="none" stroke="#8EBBEE"/>`);
  s.add(s.text('RC',pad,68,44));s.add(s.text('_',pad+s.measure('RC',44)-1,68,44,'display','#8EBBEE'));
  if(!mobile)s.add(s.text('RALPH CHRISTIAN BORBON',161,60,17,'mono','#C5C6D0',1));
  s.add(s.text('@RALPHCHR',w-pad,60,mobile?22:17,'mono','#8EBBEE',mobile?.6:1,false,'end'));
  const topTitle='ALWAYS BECOMING,',bottomTitle='ALWAYS BUILDING';
  const tracking=mobile?-.5:-1.5;
  const lineWidth=(text,size)=>text.split(' ').reduce((width,word)=>width+s.measure(word,size,'display',tracking),0)+size*.38;
  const capSize=mobile?44:90,maxWidth=w-pad*2-(mobile?16:48);
  const widest=Math.max(lineWidth(topTitle,capSize),lineWidth(bottomTitle,capSize));
  const size=Math.min(capSize,capSize*maxWidth/widest);
  const titleY=mobile?290:328,topY=mobile?210:222;
  const titleLine=(text,x,y,color,outline=false)=>{
    let cursor=x;
    return text.split(' ').map(word=>{
      const drawn=s.text(word,cursor,y,size,'display',color,tracking,outline);
      cursor+=s.measure(word,size,'display',tracking)+size*.38;
      return drawn;
    }).join('');
  };
  s.add(`<g id="headline-outline">${titleLine(topTitle,pad,topY,'#C5C6D0',true)}</g>`);
  s.add(`<g id="headline-solid">${titleLine(bottomTitle,pad,titleY,'#F0E9DD')}</g>`);
  const y1=mobile?269:282,y2=mobile?282:309;
  const shifts=[0,-5,6,-3,8,-2];const dx=shifts[phase];
  s.add(`<defs><clipPath id="c"><rect x="${pad}" y="${y1+(phase%3)*3}" width="${maxWidth}" height="${phase?4:1.2}"/></clipPath><clipPath id="r"><rect x="${pad}" y="${y2-(phase%2)*5}" width="${maxWidth}" height="${phase?3:1}"/></clipPath></defs>`);
  s.add(`<g aria-hidden="true" clip-path="url(#c)" opacity="${phase?.9:.55}">${titleLine(bottomTitle,pad-2+dx,titleY,'#8EBBEE')}</g><g aria-hidden="true" clip-path="url(#r)" opacity="${phase?.85:.5}">${titleLine(bottomTitle,pad+2-dx,titleY,'#EF7583')}</g>`);
  const tagline=mobile
    ? s.text('A creative mind.',pad,365,20,'mono','#C5C6D0',.35)+s.text('A problem-solving spirit.',pad,404,20,'mono','#C5C6D0',.35)
    : s.text('https://ralphchr.vercel.app/',pad,398,20,'mono','#8EBBEE',.35);
  s.add(`<g id="tagline">${tagline}</g>`);
  if(!mobile)s.add(`<g id="annotation">${s.text('[ CODE / DESIGN / CURIOSITY ]',1152,134,14,'mono','#C5C6D0',.6,false,'end')}</g>`);
  s.add(s.text('CEBU, PHILIPPINES',pad,mobile?482:460,mobile?22:15,'mono','#C5C6D0',mobile?.7:1));
  s.add(s.text(mobile?'01':'A creative mind. A problem-solving spirit.',w-pad,mobile?482:460,mobile?22:14,'mono',mobile?'#8EBBEE':'#C5C6D0',.6,false,'end'));
  s.add(`<g aria-hidden="true" stroke-width="2"><path d="M${mobile?499:1088} ${mobile?151:178}h${phase?46:37} m-${phase?37:28} 6h14" fill="none" stroke="#8EBBEE" opacity=".65"/><path d="M${w-pad-25+dx} ${mobile?318:352}h25" stroke="#EF7583" opacity=".7"/></g>`);
  if(animated){
    s.add(`<g aria-hidden="true" clip-path="url(#c)" opacity="0">${titleLine(bottomTitle,pad+8,titleY,'#8EBBEE')}<animate attributeName="opacity" values="0;0;.9;0;.7;0" keyTimes="0;.86;.89;.92;.96;1" calcMode="discrete" dur="2s" repeatCount="indefinite"/></g><g aria-hidden="true" clip-path="url(#r)" opacity="0">${titleLine(bottomTitle,pad-8,titleY,'#EF7583')}<animate attributeName="opacity" values="0;0;.8;0;.6;0" keyTimes="0;.86;.89;.92;.96;1" calcMode="discrete" dur="2s" repeatCount="indefinite"/></g>`);
    s.parts=s.parts.map(p=>p.replace('<g id="headline-outline">','<g id="headline-outline"><animateTransform attributeName="transform" type="translate" values="0 0;0 0;-2 0;3 0;0 0" keyTimes="0;.88;.91;.95;1" calcMode="discrete" dur="2s" repeatCount="indefinite"/>').replace('<g id="headline-solid">','<g id="headline-solid"><animateTransform attributeName="transform" type="translate" values="0 0;0 0;2 0;-2 0;0 0" keyTimes="0;.88;.91;.95;1" calcMode="discrete" dur="2s" repeatCount="indefinite"/>'));

    s.add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#8EBBEE" stroke-width="2" stroke-dasharray="28 ${Math.round(2*Math.PI*r)-28}" opacity=".65"><animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="18s" repeatCount="indefinite"/></circle>`);
  }
  s.add(flow(w,s.h,animated));
  return s.finish();
}

module.exports={banner};
