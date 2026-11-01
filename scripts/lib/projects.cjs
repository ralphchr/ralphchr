const fs=require('node:fs');
const root=require('node:path').resolve(__dirname,'../..');
const {SVG,n}=require('./svg.cjs');
const {flow,background,stage}=require('./motion.cjs');
const projects=[
 {name:'RELAYA',domain:'COMMUNICATION / AI',stack:[['ai','AI'],['speech','Speech recognition'],['nlp','NLP']]},
 {name:'LazyFill',domain:'GOOGLE FORMS AUTOFILL EXTENSION',stack:[['react','React'],['typescript','TypeScript'],['extension','Manifest V3']]},
 {name:'TUGONEX',domain:'HEALTHCARE',stack:[['react','React'],['typescript','TypeScript'],['tailwindcss','Tailwind CSS']]},
 {name:'Albularyo’s Apprentice',domain:'COZY COMMERCE PH TRADITION GAME',stack:[['godotengine','Godot 4'],['cplusplus','C++'],['extension','GDExtension']]},
 {name:'Upocalypse Control',domain:'DISASTER PREPAREDNESS STRATEGY GAME',stack:[['godotengine','Godot 4'],['cplusplus','C++'],['extension','GDExtension']]},
 {name:'E-HAW',domain:'COMMUNITY',stack:[['html5','HTML'],['css','CSS'],['javascript','JavaScript']]}
];
const generic={
 ai:'<path d="M12 2 14.5 9.5 22 12 14.5 14.5 12 22 9.5 14.5 2 12 9.5 9.5Z"/>',
 speech:'<path d="M3 10v4M7 6v12M12 3v18M17 6v12M21 10v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 nlp:'<path d="M4 4h16v12H9l-5 4Z M8 8h8M8 12h5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
 extension:'<path d="M8 4H5v6l-3 2 3 2v6h3M16 4h3v6l3 2-3 2v6h-3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>'
};
const icons={};
for(const project of projects)for(const [slug] of project.stack){
 if(icons[slug])continue;
 icons[slug]=generic[slug]||fs.readFileSync(root+'/assets/stack/'+slug+'.svg','utf8').match(/<path\b[^>]*\/>/g).join('');
}
function build(mobile,animated=false){
 const width=mobile?600:1200,rowHeight=mobile?158:88,head=mobile?68:58,height=head+projects.length*rowHeight+8;
 const s=new SVG(width,height,'Selected projects — domain and technology index',projects.map(p=>p.name+': '+p.domain.toLowerCase()+'. '+(p.name==='RELAYA'?'Approach':'Built with')+': '+p.stack.map(x=>x[1]).join(', ')+'.').join(' '));
 s.add(`<rect width="${width}" height="${height}" fill="#09090F"/>`);
 s.add(background(width,height,false));
 s.add(`<path d="M${mobile?32:30} 0H${width-(mobile?32:30)}" stroke="#8B5CF6" stroke-width="2"/>`);
 s.add(s.text(mobile?'PROJECT INDEX / 01-'+String(projects.length).padStart(2,'0'):'PROJECT / DOMAIN',mobile?32:84,mobile?42:35,mobile?20:14,'mono','#C5C6D0',.6));
 if(!mobile)s.add(s.text('STACK / APPROACH',740,35,14,'mono','#C5C6D0',.6));
 const font=mobile?20:14,chipHeight=mobile?40:29,icon=mobile?21:15,gap=mobile?9:8,padding=mobile?11:9,chipGap=mobile?8:7;
 function chip(slug,label,x,y){
  const chipWidth=s.measure(label,font,'mono')+padding*2+icon+gap;
  s.add(`<rect x="${n(x)}" y="${y}" width="${n(chipWidth)}" height="${chipHeight}" rx="3" fill="#11141F" stroke="#8B5CF6" stroke-opacity=".27" stroke-width=".8"/>`);
  s.add(`<g transform="translate(${n(x+padding)} ${n(y+(chipHeight-icon)/2)}) scale(${n(icon/24)})" color="#8EBBEE" fill="#8EBBEE">${icons[slug]}</g>`);
  s.add(s.text(label,x+padding+icon+gap,y+(mobile?27:20),font,'mono','#F0E9DD'));
  return chipWidth;
 }
 projects.forEach((p,i)=>{
  const y=head+i*rowHeight;
  const rowStart=s.parts.length;
  s.add(`<path d="M${mobile?32:30} ${y+rowHeight-1}H${width-(mobile?32:30)}" stroke="#C5C6D0" stroke-opacity=".16"/>`);
  if(mobile){
   s.add(s.text(String(i+1).padStart(2,'0'),32,y+38,18,'mono','#8B5CF6'));
   s.add(s.text(p.name,82,y+39,36,'display','#F0E9DD',-.7));
   s.add(s.text(p.domain,82,y+76,20,'mono','#8EBBEE',.4));
   let x=32;
   p.stack.forEach(([slug,label])=>{x+=chip(slug,label,x,y+97)+chipGap;});
   if(x-chipGap>width-32)throw Error('Mobile chips exceed margin '+p.name+' '+x);
  }else{
   s.add(s.text(String(i+1).padStart(2,'0'),30,y+38,14,'mono','#8B5CF6'));
   s.add(s.text(p.name,84,y+39,28,'display','#F0E9DD',-.5));
   s.add(s.text(p.domain,84,y+66,14,'mono','#8EBBEE',.6));
   let x=740;
   p.stack.forEach(([slug,label])=>{x+=chip(slug,label,x,y+27)+chipGap;});
   if(x-chipGap>width-30)throw Error('Desktop chips exceed margin '+p.name);
  }
  const row=s.parts.splice(rowStart).join('');
  s.add(stage(row,animated,{id:'project-row-'+i,duration:20,delay:i*.16,dx:18,dy:0,min:.25}));
 });
 s.add(flow(width,height,animated));
 return s.finish();
}

module.exports={build,projects};
