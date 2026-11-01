// Run with Node 20+. All lettering is outlined; no npm dependencies required.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const {SVG,esc}=require('./lib/svg.cjs');
const {flow,background,stage,terminal}=require('./lib/motion.cjs');
const {banner}=require('./lib/banner.cjs');
const {build:projects}=require('./lib/projects.cjs');
const {consistency,activity,monkeytype,hackerrank}=require('./lib/stats.cjs');
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
function finish(s,animated){s.parts.splice(1,0,background(s.w,s.h,false));s.add(flow(s.w,s.h,false));return s.finish();}
function label(s,text,x,y){s.add(s.text(text,x,y,18,'mono',C.cyan,.5));}
function heading(mobile,animated,number,title,annotation){
  const w=mobile?600:1200,s=panel(w,140,title,annotation),p=mobile?32:48;
  label(s,annotation,p,42);
  s.add(s.text(title,p,108,mobile?44:56,'display',C.ivory,-.8));
  if(!mobile)s.add(s.text('RC_',w-48,104,26,'mono',C.purple,0,false,'end'));
  if(animated)s.add(`<path d="M${p} 128h${mobile?160:240}" pathLength="100" stroke="#8B5CF6" stroke-width="2" stroke-dasharray="100" stroke-dashoffset="0"><animate attributeName="stroke-dashoffset" values="100;0;0;-100;100" keyTimes="0;.15;.8;.95;1" dur="12s" repeatCount="indefinite"/></path>`);
  return finish(s,animated);
}
function identity(mobile,animated){
  const w=mobile?600:1200,p=mobile?32:48,s=panel(w,mobile?550:390,'Ralph Christian Borbon','Computer Science - II student at UP Cebu, based in Cebu, Philippines. Interests: software development, design, AI, games, and cybersecurity.');
  label(s,'THE PERSON BEHIND RC_',p,46);
  const nameStart=s.parts.length;
  if(mobile){s.add(s.text('Ralph Christian',p,119,56));s.add(s.text('Borbon',p,180,56));}
  else s.add(s.text('Ralph Christian Borbon',p,127,64,'display',C.ivory,-1));
  const name=s.parts.splice(nameStart).join('');s.add(stage(name,animated,{id:'identity-name',duration:22,dy:8,min:.5}));
  const y=mobile?234:184;
  label(s,'UP CEBU . COMPUTER SCIENCE - II',p,y);
  const copyStart=s.parts.length;
  words(s,'I write code, shape visual identities, and build interactive experiences.',p,y+56,mobile?24:25,mobile?536:1000,'mono',C.ivory,38);
  const copy=s.parts.splice(copyStart).join('');s.add(terminal(s,copy,animated,p,y+24,w-p*2,mobile?154:112));
  words(s,'Software development / Design / AI / Games / Cybersecurity',p,mobile?450:344,mobile?20:20,w-p*2,'mono',C.cyan,34);
  return finish(s,animated);
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
  const w=mobile?600:1200,p=mobile?32:48,s=panel(w,mobile?1085:640,'Toolkit',groups.map(g=>g[0]+': '+g[1].map(v=>v[1]).join(', ')).join('. '));
  const positions=mobile?[40,250,416,582,748,914]:[40,40,250,250,444,444];
  groups.forEach(([name,icons],i)=>{
    const x=mobile?p:(i%2===0?p:660),y=positions[i],cols=mobile?7:7,size=mobile?60:56,gap=mobile?16:20;
    label(s,name,x,y);
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
  const w=mobile?600:1200,p=mobile?32:48,s=panel(w,mobile?700:400,'Beyond the code','Marketing Director of the UP Computer Science Guild, seasonal tutor (calculus and programming), freelance graphic designer (Pubmats and VFX), and competitive esports player (Tier 2 CODM Esports Player).');
  const roles=[['01','Marketing Director','UP COMPUTER SCIENCE GUILD'],['02','Seasonal Tutor','(calculus and programming)'],['03','Freelance Graphic Designer','(Pubmats and VFX)'],['04','Competitive Esports Player','(Tier 2 CODM Esports Player)']];
  roles.forEach(([num,title,sub],i)=>{
    const x=mobile?p:(i%2===0?p:660),y=mobile?26+i*164:32+Math.floor(i/2)*180;
    const roleStart=s.parts.length;
    const end=words(s,title,x,y+46,mobile?34:32,mobile?536:490,'display',C.ivory,42);
    if(sub)s.add(s.text(sub,x,end+34,mobile?20:18,'mono',C.cyan));
    s.add(`<path d="M${x} ${end+64}h${mobile?536:490}" stroke="${C.silver}" stroke-opacity=".15"/>`);
    const role=s.parts.splice(roleStart).join('');s.add(stage(role,animated,{id:'role-'+i,duration:24,delay:i*.25,dx:i%2?10:-10,dy:0,min:.3}));
  });
  return finish(s,animated);
}
function linkCard(mobile,title,subtitle,animated){
  const w=mobile?600:1200,p=mobile?32:48,s=panel(w,110,title,subtitle);
  s.add(`<rect x=".5" y=".5" width="${w-1}" height="109" fill="none" stroke="#8B5CF6" stroke-opacity=".25"/>`);
  label(s,title,p,45);
  s.add(s.text(subtitle,p,82,mobile?22:23,'mono',C.ivory));
  const arrow=s.text('->',w-p-8,65,26,'mono',C.cyan,0,false,'end');
  s.add(animated?`<g>${arrow}<animateTransform attributeName="transform" type="translate" values="-8 0;0 0;8 0;0 0;-8 0" dur="5s" repeatCount="indefinite"/></g>`:arrow);
  return finish(s,animated);
}
function leetcode(mobile,animated){
  const data=JSON.parse(fs.readFileSync(root+'/assets/data/leetcode.json','utf8'));
  const w=mobile?600:1200,p=mobile?32:48,h=mobile?630:365;
  const s=panel(w,h,'LeetCode / ralphchr',`${data.solved} solved. `+Object.entries(data.difficulties).map(([name,d])=>name+': '+d.solved+' / '+d.available).join('. ')+`. Ranking ${data.ranking}. Updated ${data.updated} UTC. Public data via LeetCode Stats Card.`);
  label(s,'@RALPHCHR / LEETCODE',p,44);
  const cx=mobile?134:155,cy=mobile?188:190,r=mobile?90:100;
  s.add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.purple}" stroke-opacity=".18" stroke-width="3"/>`);
  let start=-90;
  Object.entries(data.difficulties).forEach(([name,d],i)=>{
    const share=data.solved?d.solved/data.solved:0,circ=2*Math.PI*r;
    if(share)s.add(`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${[C.cyan,C.purple,C.red][i]}" stroke-width="4" stroke-dasharray="${Math.max(0,share*circ-5)} ${circ}" transform="rotate(${start} ${cx} ${cy})"/>`);
    start+=share*360;
  });
  s.add(s.text(String(data.solved),cx+s.measure(String(data.solved),68)/2,cy+16,68,'display',C.ivory,0,false,'end'));
  s.add(s.text('SOLVED',cx+s.measure('SOLVED',16,'mono')/2,cy+45,16,'mono',C.silver,0,false,'end'));
  const rx=mobile?270:320;
  label(s,'GLOBAL RANK',rx,mobile?168:151);
  s.add(s.text('#'+data.ranking.toLocaleString('en-US'),rx,mobile?210:198,mobile?28:32,'display',C.ivory,-.3));
  Object.entries(data.difficulties).forEach(([name,d],i)=>{
    const x=mobile?p:660,y=(mobile?344:104)+i*(mobile?82:70),barW=mobile?536:492,color=[C.cyan,C.purple,C.red][i];
    s.add(s.text(name.toUpperCase(),x,y,18,'mono',color));
    s.add(s.text(`${d.solved} / ${d.available}`,x+barW,y,18,'mono',C.ivory,0,false,'end'));
    s.add(`<path d="M${x} ${y+20}h${barW}" stroke="#1D2030" stroke-width="5"/><path d="M${x} ${y+20}h${barW*d.solved/d.available}" stroke="${color}" stroke-width="5" pathLength="100" stroke-dasharray="100">${animated?'<animate attributeName="stroke-dashoffset" values="100;0;0;100;100" keyTimes="0;.15;.86;.96;1" dur="17s" repeatCount="indefinite"/>':''}</path>`);
  });
  s.add(s.text('UPDATED '+data.updated+' UTC',p,h-25,16,'mono',C.silver));
  if(animated)for(let i=0;i<3;i++)s.add(`<rect x="${w-125+i*25}" y="27" width="9" height="9" fill="#8B5CF6"><animate attributeName="opacity" values=".15;1;.15;.15" keyTimes="0;.2;.4;1" dur="3s" begin="${i*.3}s" repeatCount="indefinite"/></rect>`);
  return finish(s,animated);
}
function write(stem,fn){
  for(const mobile of [false,true])for(const animated of [false,true]){
    const file=stem+(mobile?'-mobile':'')+(animated?'-animated':'')+'.svg';
    fs.writeFileSync(path.join(root,'assets',file),fn(mobile,animated));
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
  for(const animated of [false,true])fs.writeFileSync(root+'/assets/profile-banner'+(animated?'-animated':'')+'.svg',banner(false,0,animated));
  write('profile-intro',identity);
  write('project-index',projects);
  write('toolkit',toolkit);
  write('beyond-code',beyond);
  const headings=[['selected-heading','','Projects so far','BUILT / BUILDING / EXPLORING'],['toolkit-heading','','The toolkit','TOOLS OF THE PRACTICE'],['github-heading','','On GitHub','CONSISTENCY & ACTIVITY'],['leetcode-heading','','Problem solving','LEETCODE / IN PRACTICE'],['hackerrank-heading','','On HackerRank','CHALLENGES / PUBLIC TRACK STATS'],['monkeytype-heading','','At the keyboard','MONKEYTYPE / PERSONAL BESTS'],['beyond-heading','','Beyond the code','OTHER SIDES OF ME'],['connect-heading','',"Let’s connect",'FIND ME ELSEWHERE']];
  for(const [stem,num,title,annotation] of headings)write(stem,(m,a)=>heading(m,a,num,title,annotation));
  for(const [slug,title,sub] of [['facebook','FACEBOOK','@ralphchrr'],['linkedin','LINKEDIN','Ralph Christian Borbon'],['gmail','GMAIL','borbon.rchr@gmail.com']])write('contact-'+slug,(m,a)=>linkCard(m,title,sub,a));
}
console.log('Built outlined profile artwork, native SVG motion and reduced-motion versions.');
