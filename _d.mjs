import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname } from "node:path";
const ROOT=join(process.cwd(),"dist"); const PREFIX="/coffs-colorectal";
const T={".html":"text/html",".css":"text/css",".js":"text/javascript",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const srv=createServer(async(q,r)=>{let p=decodeURIComponent(new URL(q.url,"http://x").pathname);
  if(!p.startsWith(PREFIX)){r.writeHead(404);r.end();return;} p=p.slice(PREFIX.length);
  if(p.endsWith("/"))p+="index.html"; const f=join(ROOT,p); if(!existsSync(f)){r.writeHead(404);r.end();return;}
  r.writeHead(200,{"content-type":T[extname(f)]||"text/plain"});r.end(await readFile(f));});
await new Promise(r=>srv.listen(4381,"127.0.0.1",r));
const {chromium}=await import("playwright");
const b=await chromium.launch();
const c=await b.newContext({viewport:{width:1440,height:900},reducedMotion:"reduce"});
const pg=await c.newPage();
await pg.goto(`http://127.0.0.1:4381${PREFIX}/your-visit/symptoms/`,{waitUntil:"networkidle"});
await pg.evaluate(async()=>{await document.fonts.ready;});
await pg.waitForTimeout(250);
const m=await pg.evaluate(()=>{
  const out=[];
  document.querySelectorAll(".panel").forEach(pl=>{
    pl.querySelectorAll("svg").forEach(sv=>{
      const r=sv.getBoundingClientRect(), cs=getComputedStyle(sv);
      out.push({panelH:Math.round(pl.getBoundingClientRect().height),
        svg:Math.round(r.width)+"x"+Math.round(r.height),
        w:cs.width, h:cs.height, fs:cs.fontSize,
        parent:(sv.parentElement.className||sv.parentElement.tagName).toString().slice(0,20),
        parentDisplay:getComputedStyle(sv.parentElement).display});
    });
  });
  return out;
});
for (const x of m) console.log(`  panel ${x.panelH}px  svg ${x.svg}  css ${x.w}x${x.h}  fs=${x.fs}  parent=<${x.parent}> display=${x.parentDisplay}`);
await b.close();
