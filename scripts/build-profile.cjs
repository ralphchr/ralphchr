// Run with Node 20+. All lettering is outlined; no npm dependencies required.
const fs=require('node:fs');
const path=require('node:path');
const {light}=require('./lib/theme.cjs');
const root=path.resolve(__dirname,'..');
const {SVG,esc}=require('./lib/svg.cjs');
const {flow,background,stage,terminal}=require('./lib/motion.cjs');
const {banner}=require('./lib/banner.cjs');
const {build:projects}=require('./lib/projects.cjs');
const {consistency,activity,leetcode,monkeytype,hackerrank}=require('./lib/compact-stats.cjs');
const C={ink:'#09090F',ivory:'#F0E9DD',silver:'#C5C6D0',cyan:'#8EBBEE',purple:'#8B5CF6',red:'#EF7583'};
function panel(w,h,title,desc){const s=new SVG(w,h,title,desc);s.add(`<rect width="${w}" height="${h}" fill="${C.ink}"/>`);return s;}
function words(s,text,x,y,size,maxWidth,font='body',color=C.silver,lineHeight=size*1.6){
  let line='';
  for(const word of text.split(' ')){
    const next=line?line+' '+word:word;
    if(s.measure(next,size,font)>maxWidth&&line){s.add(s.text(line,x,y,size,font,color));line=word;y+=lineHeight;}else line=next;
  }
  if(line)s.add(s.text(line,x,y,size,font,color));
  return y;
}
function finish(s,animated){s.parts.splice(1,0,background(s.w,s.h,false));return s.finish();}
function label(s,text,x,y){s.add(s.text(text,x,y,18,'mono',C.cyan,.5));}
function heading(mobile,animated,number,title,annotation){
  const w=mobile?600:1200,p=mobile?32:36,s=panel(w,90,title,annotation);
  s.add(s.text(annotation,p,22,14,'mono',C.cyan,.4));
  s.add(s.text(title,p,66,mobile?40:46,'display',C.ivory,-.5));
  s.add(`<path d="M${p} 80h${mobile?120:180}" stroke="#8B5CF6" stroke-width="1.5"/>`);
  if(animated)s.add(`<path d="M${p} 80h${mobile?120:180}" pathLength="100" stroke="#8EBBEE" stroke-dasharray="18 82"><animate attributeName="stroke-dashoffset" from="100" to="-100" dur="9s" repeatCount="indefinite"/></path>`);
  return s.finish();
}
function identity(mobile,animated){
  const w=mobile?600:1200,p=mobile?32:36,s=panel(w,mobile?210:144,'Maker notes','UP Cebu . Computer Science - II, based in Cebu, Philippines. Software development, design, AI, games, and cybersecurity.');
  s.add(`<path d="M14 16v${s.h-32}" stroke="#8B5CF6" stroke-opacity=".5"/>`);
  s.add(s.text('UP CEBU . COMPUTER SCIENCE - II',p,30,mobile?20:18,'mono',C.cyan,.2));
  words(s,'I write code, shape visual identities, and build interactive experiences.',p,mobile?76:72,mobile?23:22,w-p*2,'mono',C.ivory,mobile?32:30);
  words(s,'Software development / Design / AI / Games / Cybersecurity',p,mobile?152:116,mobile?19:18,w-p*2,'mono',C.silver,30);
  if(animated)s.add(`<path d="M${w-20} 19v14" stroke="#8EBBEE"><animate attributeName="visibility" values="visible;hidden;visible" calcMode="discrete" dur=".9s" repeatCount="indefinite"/></path>`);
  return s.finish();
}
const groups=[
 ['LANGUAGES',[['c','C'],['cplusplus','C++'],['css','CSS'],['haskell','Haskell'],['html5','HTML'],['javascript','JavaScript'],['kotlin','Kotlin'],['python','Python'],['typescript','TypeScript']]],
 ['FRAMEWORKS & LIBRARIES',[['expo','Expo'],['nextdotjs','Next.js'],['react','React'],['react','React Native'],['tailwindcss','Tailwind CSS']]],
 ['DEVELOPMENT TOOLS',[['cplusplus','C++ GDExtension'],['git','Git'],['github','GitHub'],['godotengine','Godot 4']]],
 ['SECURITY EXPLORATION',[['burpsuite','Burp Suite'],['linux','Linux'],['wireshark','Wireshark']]],
 ['DESIGN TOOLS',[['adobeillustrator','Adobe Illustrator'],['adobeindesign','Adobe InDesign'],['adobelightroom','Adobe Lightroom'],['adobephotoshop','Adobe Photoshop'],['canva','Canva'],['figma','Figma']]],
 ['VIDEO & MOTION',[['adobeaftereffects','Adobe After Effects'],['adobepremierepro','Adobe Premiere Pro']]]
];
function toolkit(mobile,animated){
  const w=mobile?600:1200,p=mobile?32:48,s=panel(w,mobile?560:360,'Toolkit',groups.map(g=>g[0]+': '+g[1].map(v=>v[1]).join(', ')).join('. '));
  const positions=mobile?[30,30,250,250,400,400]:[26,26,148,148,270,270];
  groups.forEach(([name,icons],i)=>{
    const x=mobile?(i%2===0?32:312):(i%2===0?36:636),y=positions[i],cols=mobile?4:9,size=48,gap=mobile?10:10;
    s.add(s.text(name,x,y,mobile?16:16,'mono',C.cyan,.1));
    icons.forEach(([slug,title],j)=>{
      const ix=x+(j%cols)*(size+gap),iy=y+24+Math.floor(j/cols)*(size+12);
      const source=fs.readFileSync(path.join(root,'assets/stack',slug+'.svg'),'utf8');
      const inner=source.slice(source.indexOf('>')+1,source.lastIndexOf('</svg>')).replace(/<!--.*?-->/gs,'');
      const boot=animated?`<rect x="1" y="1" width="46" height="46" rx="3" fill="none" stroke="#8EBBEE" stroke-width="1.3" pathLength="100" stroke-dasharray="100" stroke-dashoffset="100"><animate attributeName="stroke-dashoffset" values="100;0;0;-100;100" keyTimes="0;.12;.22;.34;1" dur="${12+i}s" begin="${j*.2}s" repeatCount="indefinite"/></rect>`:'';
      s.add(`<g transform="translate(${ix} ${iy}) scale(${size/48})"><title>${esc(title)}</title>${inner}${boot}</g>`);
    });
  });
  return finish(s,animated);
}
function beyond(mobile,animated){
  const w=mobile?600:1200,p=mobile?32:36,s=panel(w,mobile?190:112,'Parallel pursuits','Marketing Director of the UP Computer Science Guild. Seasonal tutor: calculus and programming. Freelance graphic designer: Pubmats and VFX. Competitive esports player: Tier 2 CODM.');
  s.add(s.text('PARALLEL PURSUITS',p,20,14,'mono',C.purple,.4));
  const roles=[['Marketing Director','UP Computer Science Guild'],['Seasonal Tutor','Calculus / programming'],['Graphic Designer','Freelance / Pubmats / VFX'],['Esports Player','Tier 2 CODM / competitive']];
  roles.forEach(([title,sub],i)=>{
    const x=mobile?p+(i%2)*280:p+i*282,y=mobile?56+Math.floor(i/2)*78:56;
    const content=s.text(title,x,y,mobile?20:22,'display',C.ivory,-.2)+s.text(sub,x,y+27,mobile?15:14,'mono',C.silver);
    s.add(stage(content,animated,{id:'pursuit-'+i,duration:22,delay:i*.2,dx:2,dy:0}));
  });
  return s.finish();
}
function linkCard(mobile,title,subtitle,animated){
  const s=panel(400,120,title,subtitle),slug=title.toLowerCase();
  s.add('<path d="M.5 .5H384L399.5 16V119.5H.5Z" fill="#09090F" stroke="none"/><circle cx="42" cy="61" r="25" fill="none" stroke="#8B5CF6" stroke-opacity=".5"/>');
  if(slug==='facebook')s.add('<g transform="translate(20 37) scale(.55)"><path d="M46 66V43h9l2-12H46v-6c0-4 1-6 6-6h6V8H48c-12 0-18 7-18 18v5h-8v12h8v23Z" fill="#8EBBEE"/></g>');
  if(slug==='linkedin')s.add(s.text('in',25,75,31,'display',C.cyan,-1));
  if(slug==='gmail')s.add('<g transform="translate(20 39) scale(.55)"><path d="M15 24h50v33H15Z M15 25l25 19 25-19" fill="none" stroke="#8EBBEE" stroke-width="4" stroke-linejoin="round"/></g>');
  s.add(s.text(title,84,54,26,'display',C.ivory));s.add(s.text(subtitle,84,82,16,'mono',C.silver));
  s.add('<path d="M84 27h24" stroke="#8EBBEE" stroke-width="1.5"/>');
  const arrow='<path d="M353 81l20-20m-14 0h14v14" fill="none" stroke="#8EBBEE" stroke-width="1.5"/>';
  s.add(animated?`<g>${arrow}<animateTransform attributeName="transform" type="translate" values="0 0;2 -2;0 0" calcMode="discrete" dur="3s" repeatCount="indefinite"/></g>`:arrow);
  if(animated)s.add('<path d="M108 27h8" stroke="#EF7583"><animate attributeName="visibility" values="hidden;hidden;visible;hidden" keyTimes="0;.86;.89;1" calcMode="discrete" dur="4s" repeatCount="indefinite"/></path>');
  return s.finish();
}
function write(stem,fn){
  for(const mobile of [false,true])for(const animated of [false,true]){
    const file=stem+(mobile?'-mobile':'')+(animated?'-animated':'')+'.svg';
    const svg=fn(mobile,animated);
    fs.writeFileSync(path.join(root,'assets',file),svg);
    fs.writeFileSync(path.join(root,'assets',file.replace('.svg','-light.svg')),light(svg));
  }
}
write('leetcode',leetcode);
if(!process.argv.includes('--leetcode-only')){
  write('consistency',consistency);
  write('activity',activity);
  write('monkeytype',monkeytype);
  write('hackerrank',hackerrank);
}
if(!process.argv.includes('--stats-only')&&!process.argv.includes('--leetcode-only')){
  for(const animated of [false,true]){const svg=banner(false,0,animated),stem=root+'/assets/profile-banner'+(animated?'-animated':'');fs.writeFileSync(stem+'.svg',svg);fs.writeFileSync(stem+'-light.svg',light(svg));}
  write('profile-intro',identity);
  write('project-index',projects);
  write('toolkit',toolkit);
  write('beyond-code',beyond);
  const headings=[['selected-heading','','The build log','IDEAS GIVEN FORM'],['toolkit-heading','','Instruments of craft','CODE / SYSTEMS / DESIGN'],['github-heading','','Traces of progress','GITHUB / LEETCODE / HACKERRANK / MONKEYTYPE'],['connect-heading','','Open a channel','FIND ME ON THE OTHER SIDE']];
  for(const [stem,num,title,annotation] of headings)write(stem,(m,a)=>heading(m,a,num,title,annotation));
  for(const [slug,title,sub] of [['facebook','Facebook','@ralphchrr'],['linkedin','LinkedIn','RALPH CHRISTIAN BORBON'],['gmail','Gmail','borbon.rchr@gmail.com']])write('contact-'+slug+(slug==='linkedin'?'-name':''),(m,a)=>linkCard(m,title,sub,a));
}
console.log('Built outlined profile artwork, native SVG motion and reduced-motion versions.');
