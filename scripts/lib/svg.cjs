const fs=require('node:fs');
const fonts=JSON.parse(fs.readFileSync(__dirname+'/font-outlines.json','utf8').replace(/^\uFEFF/,''));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const n=x=>+x.toFixed(3);
class SVG{
  constructor(w,h,title,desc){this.w=w;this.h=h;this.title=title;this.desc=desc;this.parts=[];this.glyphs=new Map();}
  measure(text,size,font='display',spacing=0){return [...text].reduce((v,c)=>v+fonts[font].glyphs[c].advance*size/1000+spacing,0)-spacing;}
  text(text,x,y,size,font='display',color='#F0E9DD',spacing=0,outline=false,align='start'){
    if(align==='end')x-=this.measure(text,size,font,spacing);
    let at=0,uses=[];
    for(const c of text){const glyph=fonts[font].glyphs[c];if(!glyph)throw Error('Missing glyph '+c);const id=font[0]+c.codePointAt(0);this.glyphs.set(id,glyph.d);if(glyph.d)uses.push(`<use href="#${id}" x="${n(at)}"/>`);at+=glyph.advance+spacing*1000/size;}
    const paint=outline?`fill="none" stroke="${color}" stroke-width="${n(1.4*1000/size)}" stroke-linejoin="round"`:`fill="${color}"`;
    return `<g transform="translate(${n(x)} ${n(y)}) scale(${n(size/1000)})" ${paint}>${uses.join('')}</g>`;
  }
  add(s){this.parts.push(s);}
  finish(){return `<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}" role="img" aria-labelledby="title desc"><title id="title">${esc(this.title)}</title><desc id="desc">${esc(this.desc)}</desc><!-- Inter Black / Inter Regular / JetBrains Mono, converted to vector outlines. No external fonts, CSS or scripts. --><defs>${[...this.glyphs].map(([id,d])=>`<path id="${id}" d="${d}"/>`).join('')}</defs>${this.parts.join('').replace(/fill="#[0-9a-f]{6}"/gi,paint=>/09090f|11141f|111a2a|0e1020|101124/i.test(paint)?'fill="none"':paint)}</svg>\n`;}
}
function frame(s){s.add(`<rect width="${s.w}" height="${s.h}" fill="none"/>`);}


module.exports={SVG,frame,esc,n};
