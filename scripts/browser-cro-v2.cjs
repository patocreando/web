const { chromium }=require("playwright");
const assert=require("node:assert/strict");
const http=require("node:http");
const fs=require("node:fs/promises");
const path=require("node:path");

const root=process.cwd();
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
  try {
    const raw=new URL(req.url,"http://localhost");
    const pathname=raw.pathname==="/" ? "/index.html" : decodeURIComponent(raw.pathname);
    const target=path.resolve(root,"."+pathname);
    if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
    const buf=await fs.readFile(target);
    res.writeHead(200,{"content-type":types[path.extname(target)]||"application/octet-stream","cache-control":"no-store"}).end(buf);
  } catch(e){res.writeHead(404).end();}
});
const specs=[
{name:"mobile-375",width:375,height:812},
{name:"mobile-390",width:390,height:844},
{name:"tablet-768",width:768,height:1024},
{name:"desktop-1366",width:1366,height:900},
{name:"desktop-1920",width:1920,height:1080}
];
(async()=>{
 await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
 const base="http://127.0.0.1:"+server.address().port+"/";
 const browser=await chromium.launch({headless:true,args:["--no-sandbox"]});
 await fs.mkdir("artifacts",{recursive:true});
 try {
  for(const spec of specs){
   const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},reducedMotion:"reduce"});
   const page=await context.newPage();
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   await page.goto(base+"#faq",{waitUntil:"networkidle"});
   const assertFaq=async()=>{
    const state=await page.locator("#faq").evaluate(el=>{
     const r=el.getBoundingClientRect(),summary=el.querySelector("summary"),sr=summary.getBoundingClientRect();
     return {top:r.top,summaryTop:sr.top,summaryBottom:sr.bottom,opacity:getComputedStyle(el).opacity,hidden:!!el.closest('[aria-hidden="true"],[inert]'),hit:summary.contains(document.elementFromPoint(sr.left+sr.width/2,sr.top+sr.height/2))};
    });
    assert.ok(state.top>=55 && state.top<130,JSON.stringify(state));
    assert.equal(state.opacity,"1");assert.equal(state.hidden,false);assert.equal(state.hit,true);
   };
   await assertFaq();
   const first=page.locator("#faq summary").nth(0);
   await first.focus();
   await page.keyboard.press("Enter");
   assert.equal(await first.evaluate(el=>el.parentElement.open),false);
   await page.keyboard.press("Space");
   assert.equal(await first.evaluate(el=>el.parentElement.open),true);
   await page.keyboard.press("Tab");
   assert.equal(await page.locator("#faq summary").nth(1).evaluate(el=>el===document.activeElement),true);
   await page.keyboard.press("Shift+Tab");
   assert.equal(await first.evaluate(el=>el===document.activeElement),true);
   assert.notEqual(await first.evaluate(el=>getComputedStyle(el).outlineStyle),"none");
   // Navigate from beginning, plans and end through real links. The footer offers FAQ on narrow screens.
   for(const start of ["#inicio","#planes","footer"]){
    await page.locator(start).evaluate(el=>el.scrollIntoView({behavior:"instant"}));
    const link=page.locator(spec.width>1110?'.web-conversion-sections a[href="#faq"]':'.footer-links a[href="#faq"]');
    await link.click();
    await assertFaq();
    assert.equal(await page.evaluate(()=>location.hash),"#faq");
    assert.equal(await page.locator("#faq").evaluate(el=>document.activeElement===el),true);
   }
   const ax=await page.locator("#faq").ariaSnapshot();
   assert.ok(ax.includes("¿Necesito tener todo listo?"));assert.ok(ax.includes("No. Podemos partir"));
   await page.screenshot({path:"artifacts/cro-faq-"+spec.name+".png"});
   await page.locator("#planes").evaluate(el=>el.scrollIntoView({behavior:"instant"}));
   const cards=await page.locator(".plan-option").evaluateAll(nodes=>nodes.map(el=>{
    const r=el.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,opacity:getComputedStyle(el).opacity,transform:getComputedStyle(el).transform,scroll:el.scrollWidth,client:el.clientWidth,price:[...el.querySelectorAll(".plan-option-price strong,.plan-option-price small")].map(n=>n.textContent).join(" "),text:el.textContent.replace(/\s+/g," ").trim(),items:[...el.querySelectorAll("li")].map(n=>n.textContent)};
   }));
   assert.equal(cards.length,3);
   assert.deepEqual(cards.map(c=>c.items),[
    ["1 página","Hasta 5 bloques","Optimizada para celular","Acción principal","SEO básico","1 ajuste"],
    ["Diseño personalizado","Más secciones","Galería / mapa / formulario","Integraciones","Dominio propio","2 ajustes"],
    ["Página avanzada o multipágina","Dirección visual","Animación e interacción","Integraciones a medida","SEO ampliado","3 ajustes"]]);
   ["ARS 30.000 pago único","ARS 75.000 pago único","ARS 150.000 desde"].forEach((price,i)=>assert.ok(cards[i].price===price));
   for(const card of cards){assert.equal(card.opacity,"1");assert.equal(card.transform,"none");assert.ok(card.scroll<=card.client+1);assert.ok(card.x>=0&&card.right<=spec.width);}
   if(spec.width>900){assert.ok(cards.every(c=>Math.abs(c.width-cards[0].width)<1&&Math.abs(c.y-cards[0].y)<1));}
   else{assert.ok(cards[1].y>=cards[0].y+cards[0].height);}
   await page.locator("#planes").screenshot({path:"artifacts/cro-plans-"+spec.name+".png"});
   await page.locator("#proceso").screenshot({path:"artifacts/cro-process-"+spec.name+".png"});
   for(let i=0;i<4;i++){
    const tab=page.locator(".cap-tab").nth(i);
    await tab.focus();await page.keyboard.press(i%2?"Space":"Enter");
    await page.waitForFunction(i=>document.querySelectorAll(".cap-tab")[i].getAttribute("aria-pressed")==="true",i);
    assert.equal(await page.locator("#capFocusCopy").evaluate(el=>!!el.closest('[aria-hidden="true"],[inert]')),false);
    assert.equal(await page.locator(".cap-tab[aria-pressed=true]").count(),1);
   }
   await page.screenshot({path:"artifacts/cro-capabilities-"+spec.name+".png"});
   // The hero remains cinematic; only its currently visible phase is exposed.
   await page.evaluate(()=>{const h=document.querySelector(".hero-v3");scrollTo({top:h.offsetTop+(h.offsetHeight-innerHeight)*.66,behavior:"instant"});});
   await page.waitForFunction(()=>!document.querySelector("#heroStage").inert);
   assert.equal(await page.locator("#dashDevScene").evaluate(el=>!!el.closest('[aria-hidden="true"],[inert]')),false);
   assert.equal(await page.locator(".pc-showcase-caption").evaluate(el=>getComputedStyle(el).display),"block");
   assert.equal(await page.locator("#heroCopy").evaluate(el=>el.inert),true);
   await page.evaluate(()=>scrollTo({top:0,behavior:"instant"}));
   await page.waitForFunction(()=>document.querySelector("#heroStage").inert);
   // A complete keyboard traversal must never land in an invisible or hidden ancestor.
   await page.locator(".web-conversion-home").focus();
   for(let n=0;n<26;n++){
    await page.keyboard.press("Tab");
    const bad=await page.evaluate(()=>{let el=document.activeElement;if(el===document.body)return false;while(el){const s=getComputedStyle(el);if(el.inert||el.getAttribute("aria-hidden")==="true"||s.display==="none"||s.visibility==="hidden"||Number(s.opacity)<.1)return true;el=el.parentElement;}return false;});
    assert.equal(bad,false,"No invisible keyboard destination");
   }
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2));
   assert.deepEqual(errors,[]);
   console.log(JSON.stringify({viewport:spec.name,faq:true,keyboard:true,plans:true,semantics:true,pageHeight:await page.evaluate(()=>document.documentElement.scrollHeight)}));
   await context.close();
  }
  // Real video seeks with scrolling; reduced motion retains one frame.
  for(const preference of ["no-preference","reduce"]){
   const ctx=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:preference});
   const page=await ctx.newPage();await page.goto(base,{waitUntil:"networkidle"});
   await page.waitForFunction(()=>document.querySelector("#masterFilmVideo").readyState>=2);
   const before=await page.locator("#masterFilmVideo").evaluate(el=>el.currentTime);
   await page.locator("#faq").evaluate(el=>el.scrollIntoView({behavior:"instant"}));
   await page.waitForTimeout(500);
   const after=await page.locator("#masterFilmVideo").evaluate(el=>el.currentTime);
   if(preference==="reduce")assert.ok(Math.abs(after-before)<.1);else assert.ok(after>before+1);
   // Smooth anchor also reaches an unobstructed FAQ when motion is allowed.
   await page.locator('.web-conversion-brand').click();await page.waitForTimeout(1000);
   await page.locator('.web-conversion-sections a[href="#faq"]').click();await page.waitForTimeout(1200);
   assert.ok(await page.locator("#faq").evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=55&&r.top<130;}));
   await ctx.close();
  }
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
