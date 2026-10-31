const fs=require('node:fs');
const path=require('node:path');
const {SVG,esc}=require('./svg.cjs');
const {background,flow,glitch}=require('./motion.cjs');
const root=path.resolve(__dirname,'../..');
const C={ink:'#09090F',ivory:'#F0E9DD',silver:'#C5C6D0',cyan:'#8EBBEE',purple:'#8B5CF6',red:'#EF7583'};
function panel(w,h,title,desc,a){const s=new SVG(w,h,title,desc);s.add(`<rect width="${w}" height="${h}" fill="${C.ink}"/>`);s.add(background(w,h,a));return s;}
function text(s,t,x,y,size=18,font='mono',color=C.silver,align='start'){s.add(s.text(String(t),x,y,size,font,color,0,false,align));}
function end(s,a){s.add(flow(s.w,s.h,a));s.add(glitch(s,a));return s.finish();}
function read(name){return JSON.parse(fs.readFileSync(root+'/assets/data/'+name+'.json','utf8'));}
function weekly(data){
  const weeks=new Map();
  for(const d of data.days){const date=new Date(d.date+'T00:00:00Z');const offset=(date.getUTCDay()+6)%7;date.setUTCDate(date.getUTCDate()-offset);const monday=date.toISOString().slice(0,10);weeks.set(monday,(weeks.get(monday)||0)+d.count);}
  const values=[...weeks.values()];
  let longest=0,run=0;
  for(const v of values){run=v>0?run+1:0;longest=Math.max(longest,run);}
  let index=values.length-1,current=0;
  if(values[index]===0)index--; // Allow the current incomplete week to continue.
  for(;index>=0&&values[index]>0;index--)current++;
  return {current,longest,values};
}
function consistency(m,a){
  const data=read('github'),days=data.days,week=weekly(data),w=m?600:1200,h=m?540:370,p=m?32:48;
  const sum=days.reduce((n,d)=>n+d.count,0),active=days.filter(d=>d.count>0).length;
  const s=panel(w,h,'GitHub / consistency',`${sum} contributions, ${active} active days. Current weekly streak ${week.current}; longest weekly streak ${week.longest}, within ${days[0].date} to ${data.through}. Monday-Sunday weeks; an unfinished current week has a grace period.`,a);
  text(s,'CONSISTENCY / PUBLIC CALENDAR',p,42,18,'mono',C.cyan);
  const cx=m?155:205,cy=m?195:180,r=m?100:102;
  for(const [rr,color,dash] of [[r,C.purple,'3 9'],[r+13,C.cyan,'48 700']])s.add(`<circle cx="${cx}" cy="${cy}" r="${rr}" fill="none" stroke="${color}" stroke-width="${rr===r?2:1}" stroke-opacity=".65" stroke-dasharray="${dash}">${a?`<animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="${rr===r?50:20}s" repeatCount="indefinite"/>`:''}</circle>`);
  const num=String(week.current);text(s,num,cx+s.measure(num,76)/2,cy+19,76,'display',C.ivory,'end');
  text(s,'WEEK STREAK',cx+s.measure('WEEK STREAK',14,'mono')/2,cy+50,14,'mono',C.cyan,'end');
  const x=m?310:435;
  text(s,sum,x,m?155:166,m?48:65,'display',C.ivory);
  text(s,'CONTRIBUTIONS',x,m?185:200,18,'mono',C.cyan);
  text(s,m?'CALENDAR WINDOW':`${days[0].date} -> ${data.through}`,x,m?211:233,m?14:16);
  text(s,week.longest,m?310:855,m?275:166,m?44:65,'display',C.ivory);
  text(s,'LONGEST / WEEKS',m?310:855,m?304:200,m?16:18,'mono',C.purple);
  text(s,active+' ACTIVE DAYS',m?310:855,m?331:233,m?16:18);
  text(s,'LAST 16 WEEKS / MON-SUN',p,m?390:287,16,'mono',C.silver);
  const shown=week.values.slice(-16),step=(w-p*2)/16;
  shown.forEach((n,i)=>{const x=p+i*step,y=m?414:310;s.add(`<path d="M${x} ${y}h${step-6}" stroke="${n?C.purple:'#242633'}" stroke-width="8"/>`);s.add(`<circle cx="${x+step-8}" cy="${y}" r="2" fill="${n?C.cyan:'#242633'}"/>`);});
  text(s,`${days[0].date} -> ${data.through}`,p,h-34,m?16:14);
  return end(s,a);
}
function activity(m,a){
  const data=read('github'),days=data.days.slice(-31),w=m?600:1200,h=m?620:540,p=m?32:48;
  const sum=days.reduce((n,d)=>n+d.count,0),active=days.filter(d=>d.count>0).length,peak=Math.max(...days.map(d=>d.count));
  const s=panel(w,h,'GitHub / contribution signal',`Real daily contributions ${days[0].date} to ${data.through}. ${sum} contributions across ${active} active days. Peak ${peak} contributions in one day.`,a);
  text(s,'CONTRIBUTION SIGNAL / 31D',p,45,18,'mono',C.cyan);
  const col=(w-p*2)/3;
  [[sum,'CONTRIBUTIONS'],[active,'ACTIVE DAYS'],[peak,'PEAK / DAY']].forEach(([n,label],i)=>{
    text(s,n,p+i*col,132,m?48:62,'display',i===1?C.purple:C.ivory);text(s,label,p+i*col,164,m?16:18);
  });
  const left=p+24,right=w-p,top=220,bottom=h-100,pw=right-left,ph=bottom-top;
  const step=Math.max(1,Math.ceil(peak/4/5)*5),max=Math.max(4,Math.ceil(peak/step)*step);
  for(let y=0;y<=max;y+=step){const yy=bottom-y/max*ph;s.add(`<path d="M${left} ${yy}H${right}" stroke="${C.cyan}" stroke-opacity=".12" stroke-dasharray="2 8"/>`);text(s,y,left-12,yy+5,14,'mono',C.silver,'end');}
  const points=days.map((d,i)=>[left+i*pw/30,bottom-d.count/max*ph]);
  const d=points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(' ');
  s.add(`<defs><linearGradient id="signal-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${C.purple}" stop-opacity=".24"/><stop offset="1" stop-color="${C.purple}" stop-opacity=".01"/></linearGradient><linearGradient id="signal-line"><stop stop-color="${C.purple}"/><stop offset="1" stop-color="${C.cyan}"/></linearGradient></defs><path d="${d}L${right} ${bottom}H${left}Z" fill="url(#signal-fill)"/><path id="signal" d="${d}" fill="none" stroke="url(#signal-line)" stroke-width="2.5"/>`);
  points.forEach(([x,y],i)=>{s.add(`<circle cx="${x}" cy="${y}" r="${days[i].count===peak?5:2.5}" fill="${days[i].count===peak?C.ivory:C.purple}"><title>${days[i].date}: ${days[i].count} contributions</title></circle>`);if(i%10===0||i===30)text(s,days[i].date.slice(5),x,bottom+32,m?16:14,'mono',C.silver,i===30?'end':'start');});
  if(a){
    s.add(`<path d="${d}" pathLength="100" fill="none" stroke="${C.ivory}" stroke-width="3" stroke-dasharray="5 95" stroke-opacity=".6"><animate attributeName="stroke-dashoffset" from="100" to="-100" dur="12s" repeatCount="indefinite"/></path>`);
    const i=days.findIndex(d=>d.count===peak),[x,y]=points[i];
    s.add(`<circle cx="${x}" cy="${y}" r="5" fill="none" stroke="${C.cyan}"><animate attributeName="r" values="5;16" dur="3s" repeatCount="indefinite"/><animate attributeName="opacity" values=".6;0" dur="3s" repeatCount="indefinite"/></circle>`);
  }
  text(s,'DAILY CONTRIBUTIONS / THROUGH '+data.through,p,h-28,m?14:16);
  return end(s,a);
}
function monkeytype(m,a){
  const data=read('monkeytype'),w=m?600:1200,p=m?32:48,h=m?650:430;
  const s=panel(w,h,'Monkeytype / ralphchr','Public English time-mode personal bests. '+data.personalBests.map(d=>`${d.seconds}s: ${d.wpm} WPM, ${d.accuracy}% accuracy`).join('. ')+`. ${data.completedTests} completed tests. Updated ${data.updated} UTC.`,a);
  text(s,'@RALPHCHR / MONKEYTYPE',p,44,18,'mono',C.cyan);
  data.personalBests.forEach((pb,i)=>{
    const x=m?p:p+i*550,y=m?105+i*175:108;
    text(s,pb.seconds+'S / PERSONAL BEST',x,y,18,'mono',C.purple);
    text(s,pb.wpm.toFixed(2),x,y+69,64,'display',C.ivory);text(s,'WPM',x+255,y+68,20,'mono',C.cyan);
    text(s,pb.accuracy.toFixed(2)+'% ACCURACY',x,y+104,18);
    const d=`M${x} ${y+133}H${x+80}l10 -10h80l10 10h110`;
    s.add(`<path d="${d}" stroke="${C.purple}" fill="none" stroke-opacity=".4"/>`);
    if(a)s.add(`<circle r="3" fill="${C.cyan}"><animateMotion path="${d}" dur="${4+i}s" repeatCount="indefinite"/></circle>`);
  });
  const y=m?510:315;
  text(s,`${data.completedTests} COMPLETED / ${data.startedTests} STARTED`,p,y,18,'mono',C.ivory);
  text(s,(data.timeTyping/60).toFixed(1)+' MIN TYPING',p,y+32,18,'mono',C.cyan);
  text(s,'ENGLISH / NORMAL / NO MODIFIERS',p,h-56,m?16:18);
  text(s,'UPDATED '+data.updated+' UTC',p,h-28,16);
  return end(s,a);
}
module.exports={consistency,activity,monkeytype,weekly};
