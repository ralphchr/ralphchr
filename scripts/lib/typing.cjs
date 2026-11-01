// Match each reveal/cursor stop to the actual proportional, outlined lettering.
function typingTitle(s,lines,animated,x,size){
  if(!animated)return lines.map(l=>l.art).join('');
  const glyphs=[];
  const cuts=lines.map((line,index)=>{
    let at=0;const result=[0],words=line.text.split(' ');
    const letters=[];
    words.forEach((word,i)=>{
      for(let n=1;n<=word.length;n++){
        const stop=at+s.measure(word.slice(0,n),size,'display',-1)+2;
        const start=n===1?0:s.measure(word.slice(0,n-1),size,'display',-1)-1;
        letters.push({stop,art:s.text(word[n-1],x+at+start,line.baseline,size,'display',index?'#F0E9DD':'#C5C6D0',0,index===0)});
        result.push(stop);
      }
      at+=s.measure(word,size,'display',-1);
      if(i<words.length-1){at+=size*.38;result.push(at);}
    });
    glyphs.push(letters);return result;
  });
  let time=0,widths=[0,0];
  const states=[];
  function add(t,line){states.push({time:t,widths:[...widths],x:x+widths[line]+4,y:lines[line].baseline-size*.79});}
  add(0,0);
  for(let line=0;line<lines.length;line++){
    time+=.22;add(time,line);
    for(const stop of cuts[line].slice(1)){time+=.12;widths[line]=stop;add(time,line);}
  }
  // Hold the completed title for reading, then backspace both lines.
  time=13;add(time,1);
  for(let line=lines.length-1;line>=0;line--){
    time+=.1;add(time,line);
    for(const stop of cuts[line].slice(0,-1).reverse()){time+=.055;widths[line]=stop;add(time,line);}
  }
  const duration=16;
  if(time>=duration)throw Error('Typing sequence exceeds its cycle');
  add(duration,0);
  const keys=states.map(p=>(p.time/duration).toFixed(6)).join(';');
  let out='<defs>';
  lines.forEach((line,i)=>{
    out+=`<clipPath id="type-line-${i}"><rect x="${x-2}" y="${line.baseline-size}" width="0" height="${size+12}"><animate attributeName="width" values="${states.map(p=>p.widths[i]===0?0:p.widths[i]+4).join(';')}" keyTimes="${keys}" calcMode="discrete" dur="${duration}s" repeatCount="indefinite"/></rect></clipPath>`;
  });
  out+='</defs>';
  lines.forEach((line,i)=>{
    out+=`<g id="${i?'headline-solid':'headline-outline'}">`;
    for(const glyph of glyphs[i])out+=`<g visibility="hidden">${glyph.art}<animate attributeName="visibility" values="${states.map(p=>p.widths[i]>=glyph.stop?'visible':'hidden').join(';')}" keyTimes="${keys}" calcMode="discrete" dur="${duration}s" repeatCount="indefinite"/></g>`;
    out+='</g>';
  });
  out+=`<rect id="typing-cursor" x="${x+4}" y="${states[0].y}" width="4" height="${size*.8}" fill="#8EBBEE"><animate attributeName="x" values="${states.map(p=>p.x).join(';')}" keyTimes="${keys}" calcMode="discrete" dur="${duration}s" repeatCount="indefinite"/><animate attributeName="y" values="${states.map(p=>p.y).join(';')}" keyTimes="${keys}" calcMode="discrete" dur="${duration}s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0;1" keyTimes="0;.5;1" calcMode="discrete" dur=".8s" repeatCount="indefinite"/></rect>`;
  return out;
}
module.exports={typingTitle};
