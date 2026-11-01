const fs=require('node:fs');
const path=require('node:path');
const {SVG}=require('./svg.cjs');
const {weekly}=require('./stats.cjs');
const root=path.resolve(__dirname,'../..');
const C={ink:'#09090F',paper:'#F0E9DD',silver:'#C5C6D0',cyan:'#8EBBEE',purple:'#8B5CF6',red:'#EF7583'};
const read=name=>JSON.parse(fs.readFileSync(root+'/assets/data/'+name+'.json','utf8'));
function text(s,t,x,y,size=16,font='mono',color=C.silver,align='start'){s.add(s.text(String(t),x,y,size,font,color,0,false,align));}
function card(service,desc){
  const s=new SVG(288,260,service+' / public statistics',desc);
  const names={github:'GitHub',leetcode:'LeetCode',hackerrank:'HackerRank',monkeytype:'Monkeytype'};
  s.add('<defs><pattern id="plate-grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="#8EBBEE" stroke-opacity=".035"/></pattern></defs><path d="M.5 .5H287.5V243L271 259.5H.5Z" fill="#09090F" stroke="none"/><path d="M1 1H287V242L270 259H1Z" fill="url(#plate-grid)"/>');
  text(s,names[service],16,29,18,'display',C.paper);
  s.add('<path d="M16 42H272" stroke="#C5C6D0" stroke-opacity=".14"/><path d="M16 42h32" stroke="#8EBBEE"/>');
  return s;
}
function stamp(s,date){text(s,'as of '+date+' UTC',16,244,12);return s.finish();}
function consistency(m,a){
  const data=read('github'),week=weekly(data),days=data.days.slice(-31);
  const total=data.days.reduce((n,d)=>n+d.count,0),recent=days.reduce((n,d)=>n+d.count,0);
  const s=card('github',`${total} contributions during ${data.days[0].date} to ${data.through}. ${recent} in the last 31 days. Current weekly streak ${week.current}, best ${week.longest} within this window.`);
  text(s,total,16,85,48,'display',C.paper);
  text(s,'contributions / calendar',16,111,14);
  const peak=Math.max(1,...days.map(d=>d.count));
  days.forEach((d,i)=>{const h=Math.max(2,d.count/peak*55);s.add(`<rect x="${16+i*8.2}" y="${180-h}" width="5.6" height="${h}" fill="${d.count===peak?C.purple:C.cyan}" fill-opacity="${d.count?.9:.18}"><title>${d.date}: ${d.count}</title></rect>`);});
  text(s,recent+' in 31D',16,204,14,'mono',C.cyan);
  text(s,week.current+'W streak / '+week.longest+'W best',16,225,14);
  if(a)s.add(`<rect x="16" y="184" width="8" height="2" fill="${C.cyan}"><animate attributeName="x" values="16;265;16" calcMode="discrete" dur="3s" repeatCount="indefinite"/></rect>`);
  return stamp(s,data.through);
}
function leetcode(m,a){
  const data=read('leetcode'),s=card('leetcode',`${data.solved} solved; rank ${data.ranking}. Difficulty bars show the share of solved problems, not completion of the full problem set.`);
  text(s,data.solved,16,85,48,'display',C.paper);text(s,'solved',272,83,18,'mono',C.silver,'end');
  Object.entries(data.difficulties).forEach(([name,d],i)=>{
    const y=127+i*30,color=[C.cyan,C.purple,C.red][i];
    text(s,name[0].toUpperCase()+name.slice(1),16,y,14,'mono',color);
    const valueX=94+140*d.solved/Math.max(1,data.solved);
    s.add(`<path d="M94 ${y-5}H234" stroke="${color}" stroke-opacity=".18"/><path d="M94 ${y-5}H${valueX}" stroke="${color}" stroke-width="2"/><path d="M${valueX} ${y-9}l4 4-4 4-4-4Z" fill="${color}"/>`);
    text(s,d.solved,272,y,16,'mono',C.paper,'end');
  });
  text(s,'rank #'+data.ranking.toLocaleString('en-US'),16,220,14);
  if(a)for(let i=0;i<3;i++)s.add(`<rect x="${235+i*13}" y="64" width="5" height="5" fill="${C.purple}"><animate attributeName="visibility" values="visible;hidden;visible" calcMode="discrete" dur="2s" begin="${i*.2}s" repeatCount="indefinite"/></rect>`);
  return stamp(s,data.updated);
}
function hackerrank(m,a){
  const data=read('hackerrank'),s=card('hackerrank',data.tracks.map(t=>`${t.name}: ${t.solved} solved; rank ${t.rank}`).join('. ')+'. Track totals are not summed.');
  text(s,data.tracks.length,16,85,48,'display',C.paper);text(s,'tracks',65,83,18);
  data.tracks.slice(0,3).forEach((t,i)=>{
    const y=129+i*31,color=i===1?C.purple:C.cyan;
    text(s,t.name,16,y,15,'mono',color);text(s,t.solved,272,y,20,'display',C.paper,'end');
    s.add(`<path d="M16 ${y+10}H272" stroke="#C5C6D0" stroke-opacity=".1"/>`);
  });
  text(s,'challenges solved / track',16,222,13);
  if(a)s.add('<path d="M256 211h16m-6-6 6 6-6 6" fill="none" stroke="#8EBBEE"><animateTransform attributeName="transform" type="translate" values="0 0;2 0;0 0" calcMode="discrete" dur="2s" repeatCount="indefinite"/></path>');
  return stamp(s,data.updated);
}
function monkeytype(m,a){
  const data=read('monkeytype'),best=data.personalBests[0],other=data.personalBests[1];
  const s=card('monkeytype',data.personalBests.map(p=>`${p.seconds}s English personal best: ${p.wpm} WPM, ${p.accuracy}% accuracy`).join('. ')+`. ${data.completedTests} completed tests.`);
  text(s,best.wpm.toFixed(2),16,85,43,'display',C.paper);text(s,'WPM',226,83,18,'mono',C.cyan);
  text(s,best.seconds+'s PB / '+best.accuracy.toFixed(2)+'% acc',16,116,14);
  if(other){text(s,other.seconds+'s PB',16,155,14,'mono',C.purple);text(s,other.wpm.toFixed(2)+' WPM',272,155,18,'display',C.paper,'end');text(s,other.accuracy.toFixed(2)+'% accuracy',16,179,14);}
  text(s,data.completedTests+' tests / '+(data.timeTyping/60).toFixed(1)+' min',16,221,14);
  if(a)s.add('<path d="M272 65v22" stroke="#8EBBEE" stroke-width="2"><animate attributeName="visibility" values="visible;hidden;visible" calcMode="discrete" dur=".8s" repeatCount="indefinite"/></path>');
  return stamp(s,data.updated);
}
function activity(m,a){
  const data=read('github'),days=data.days.slice(-31),w=m?600:1200,h=m?320:252,p=m?32:36;
  const total=days.reduce((n,d)=>n+d.count,0),peak=Math.max(1,...days.map(d=>d.count));
  const s=new SVG(w,h,'Contribution signal / last 31 days',`Daily GitHub contributions, ${days[0].date} to ${data.through}. ${total} contributions. Exact counts are in point titles.`);
  s.add(`<rect width="${w}" height="${h}" fill="${C.ink}"/>`);
  text(s,'CONTRIBUTION SIGNAL',p,30,16,'mono',C.cyan);text(s,total+' / 31D',w-p,30,16,'mono',C.silver,'end');
  const left=p+22,right=w-p,top=62,bottom=h-58,max=Math.max(4,Math.ceil(peak/4)*4),points=days.map((d,i)=>[left+i*(right-left)/30,bottom-d.count/max*(bottom-top)]);
  for(let i=0;i<=4;i++){const y=top+i*(bottom-top)/4;s.add(`<path d="M${left} ${y}H${right}" stroke="${C.cyan}" stroke-opacity=".1" stroke-dasharray="2 7"/>`);text(s,Math.round(max*(1-i/4)),left-10,y+4,12,'mono',C.silver,'end');}
  const d=points.map(([x,y],i)=>(i?'L':'M')+x.toFixed(2)+' '+y.toFixed(2)).join(' ');
  s.add(`<path d="${d}L${right} ${bottom}H${left}Z" fill="${C.purple}" fill-opacity=".1"/><path d="${d}" fill="none" stroke="${C.cyan}" stroke-width="2"/>`);
  points.forEach(([x,y],i)=>{s.add(`<circle cx="${x}" cy="${y}" r="2.4" fill="${C.purple}"><title>${days[i].date}: ${days[i].count} contributions</title></circle>`);if(i%10===0)text(s,days[i].date.slice(5),x,bottom+22,14,'mono',C.silver,i===30?'end':'start');});
  if(a)s.add(`<path d="${d}" pathLength="100" stroke-dasharray="4 96" fill="none" stroke="${C.paper}" stroke-width="2"><animate attributeName="stroke-dashoffset" from="100" to="-100" dur="14s" repeatCount="indefinite"/></path>`);
  text(s,days[0].date+' -> '+data.through,p,h-12,12);
  return s.finish();
}
module.exports={consistency,activity,leetcode,hackerrank,monkeytype};
