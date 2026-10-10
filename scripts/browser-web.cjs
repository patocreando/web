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
   const mobile=spec.width<=768;
   const context=await browser.newContext({viewport:{width:spec.width,height:spec.height},deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile,reducedMotion:"reduce"});
   await context.route("**/*.mp4",route=>route.abort());
   await context.route(/^https?:\/\/(?!127\.0\.0\.1)/,route=>route.abort());
   const page=await context.newPage();
   try{
    await page.goto(base,{waitUntil:"domcontentloaded",timeout:75000});
    await page.waitForTimeout(450);
    const state=await page.evaluate(()=>{
      const el=selector=>document.querySelector(selector);
      const R=(selector)=>{const x=el(selector);const r=x.getBoundingClientRect();return {x:r.x,y:r.y,left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height,center:r.left+r.width/2};};
      return {
        innerWidth,scrollWidth:document.documentElement.scrollWidth,
        nav:R("#webConversionHeader"),
        brand:R(".web-conversion-brand"),home:R(".web-conversion-home"),
        sections:R(".web-conversion-sections"),consult:R(".web-conversion-contact"),
        sectionsDisplay:getComputedStyle(el(".web-conversion-sections")).display,
        heroHeadline:R("#heroCopy h1"),
        heroPrimary:R(".hero-conversion-primary"),
        heroSecondary:R(".hero-conversion-secondary"),
        heroNote:R(".hero-conversion-note"),
        primaryText:el(".hero-conversion-primary").textContent.replace(/\s+/g," ").trim(),
        primaryPointer:getComputedStyle(el(".hero-conversion-primary")).pointerEvents,
        links:[...document.querySelectorAll("a[href*='w61000387']")].map(n=>n.getAttribute("href")),
        localLinks:[...document.querySelectorAll(".web-conversion-sections a")].map(n=>n.getAttribute("href")),
        visibleHeadline:getComputedStyle(el("#heroCopy")).opacity,
        plans:document.querySelectorAll(".plan-x").length,
        cssInHead:!!el("#web-conversion-critical")&&document.head.contains(el("#web-conversion-critical")),
        legacyPill:document.querySelectorAll(".home-return").length
      };
    });
    assert.ok(state.cssInHead,"Critical navigation CSS embedded in head");
    assert.equal(state.legacyPill,0,"Legacy floating Inicio removed");
    assert.ok(state.nav.top>=-1&&state.nav.top<=1,"Navbar fixed to top");
    assert.ok(state.nav.width>=spec.width-2,"Navbar full viewport width");
    assert.ok(state.nav.height>=55&&state.nav.height<=80,"Compact navbar height");
    assert.ok(state.scrollWidth<=spec.width+2,"No global horizontal overflow");
    assert.deepEqual(state.localLinks,["#solucion","#planes","#faq"],"Three section links preserved");
    const ctas=await page.locator('a[data-web-cta="manychat"]').evaluateAll(nodes=>nodes.map(n=>({href:n.href,label:n.textContent.replace(/\s+/g," ").trim(),target:n.target})));
    assert.equal(ctas.length,5,"All five commercial CTAs are registered");
    assert.ok(ctas.every(c=>c.href==="https://ig.me/m/patocreando?ref=w61000387" && c.target==="_blank"),"Every web consultation uses identical Manychat link");
    for(const selector of [".web-conversion-contact",".hero-conversion-primary","#plansBannerCta",".final-x-actions a","#mobileBar a"]){
      assert.equal(await page.locator(selector).getAttribute("data-web-cta"),"manychat","Commercial button is protected: "+selector);
    }
    assert.ok(state.links.length>=5,"Existing and new Manychat links preserved");
    assert.ok(state.links.every(href=>href==="https://ig.me/m/patocreando?ref=w61000387"),"All web inquiries use original Manychat ref");
    assert.equal(state.plans,3,"Three web packs preserved");
    assert.ok(parseFloat(state.visibleHeadline)>.8,"Hero copy visible at initial load");
    assert.ok(state.heroHeadline.top>=state.nav.bottom-5,"Hero headline starts below header");
    assert.ok(state.heroPrimary.top>=state.nav.bottom-5,"Hero inquiry CTA not hidden under header");
    assert.ok(state.heroPrimary.bottom<=spec.height+2,"Hero inquiry CTA visible without scrolling");
    assert.ok(state.heroSecondary.bottom<=spec.height+2,"Plan-price CTA visible without scrolling");
    assert.ok(state.heroPrimary.left>=0&&state.heroPrimary.right<=spec.width+2,"Inquiry CTA fits viewport");
    assert.ok(state.heroSecondary.left>=0&&state.heroSecondary.right<=spec.width+2,"Plan CTA fits viewport");
    assert.equal(state.primaryPointer,"auto","Hero primary CTA is interactive");
    assert.ok(state.heroNote.bottom<=spec.height+2,"Starting price visible above fold");
    if(spec.width>1110){
      assert.notEqual(state.sectionsDisplay,"none","Desktop has visible centered navigation");
      assert.ok(Math.abs(state.sections.center-spec.width/2)<5,"Desktop section navigation centered");
      assert.ok(state.brand.right+8<state.sections.left,"Desktop brand does not overlap nav links");
      assert.ok(state.sections.right+8<state.consult.left,"Desktop links do not overlap CTA");
    }else{
      assert.equal(state.sectionsDisplay,"none","Narrow screen simplifies navigation");
      assert.ok(Math.abs(state.brand.center-spec.width/2)<5,"Brand centered on mobile and tablet");
      assert.ok(state.home.right+3<state.brand.left,"Home link does not overlap brand");
      assert.ok(state.brand.right+3<state.consult.left,"Brand does not overlap CTA");
    }
    // Navigate to the dashboard's intended scrollytelling phase before inspecting it.
    await page.evaluate(()=>{
      const hero=document.querySelector(".hero-v3");
      const top=scrollY+hero.getBoundingClientRect().top;
      const travel=Math.max(1,hero.offsetHeight-innerHeight);
      scrollTo({top:top+travel*.66,behavior:"instant"});
    });
    await page.waitForTimeout(320);
    assert.ok((await page.locator("#heroCopy").evaluate(el=>Number(getComputedStyle(el).opacity)))<.05,"Intro copy must have faded out before dashboard evaluation");
    assert.ok(await page.locator("#heroCopy").evaluate(el=>el.inert),"Invisible conversion buttons cannot intercept the dashboard");
    assert.ok((await page.locator("#heroStage").evaluate(el=>Number(getComputedStyle(el).opacity)))>.95,"Dashboard stage must be visible");

    // Development tab can be reached and read without fabricated benchmark claims.
    if(spec.width>720) {
      await page.locator('#dashSidebarNav [data-sidebar-tab="2"]').click({force:true});
    } else {
      await page.locator("#dashStageSelect").selectOption("2");
    }
    await page.waitForTimeout(430);
    const dev=await page.locator("#dashDevScene").evaluate(el=>{
      const rect=x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const panel=rect(el),device=rect(el.querySelector(".dash-dev-device")),flow=rect(el.querySelector(".dash-dev-flow"));
      const image=el.querySelector(".dash-dev-flow img"),flowMobile=el.querySelector(".dash-dev-flow-mobile");
      const displayed=x=>{const s=getComputedStyle(x);return s.display!=="none"&&s.visibility!=="hidden";};
      return {
        aria:el.getAttribute("aria-hidden"),visible:getComputedStyle(el).visibility,
        panel,device,flow,phoneCount:el.querySelectorAll(".dash-dev-device").length,
        flowCount:el.querySelectorAll(".dash-dev-flow").length,
        imgVisible:displayed(image),mobileFlowVisible:displayed(flowMobile),
        redundant:el.querySelectorAll(".dash-dev-left,.dash-dev-benefit,.dash-dev-footer,.dash-dev-preview-heading,.dash-dev-spec,h3,figcaption").length,
        devMode:el.closest(".dash-workspace").classList.contains("is-development"),
        noSyntheticNumbers:!el.textContent.includes("98 / 100")
      };
    });
    assert.equal(dev.aria,"false","Development illustration accessible in selected view");
    assert.equal(dev.visible,"visible","Development illustration is visible");
    assert.ok(dev.devMode,"Development mode is selected");
    assert.ok(dev.noSyntheticNumbers,"No fabricated performance metric in Development");
    assert.equal(dev.phoneCount,1,"Only the phone mockup remains");
    assert.equal(dev.flowCount,1,"Only the channel graphic remains");
    assert.equal(dev.redundant,0,"No redundant Development paragraphs, cards, or headings");
    assert.ok(dev.panel.height>180&&dev.panel.width>220,"Development panel has adequate dimensions");
    assert.ok(dev.device.width>60&&dev.device.height>140,"Phone mockup remains visible");
    assert.ok(dev.flow.width>150&&dev.flow.height>40,"Convergence flow remains visible");
    assert.ok(dev.device.left>=dev.panel.left-8&&dev.device.right<=dev.panel.right+8,"Phone stays within Development panel");
    assert.ok(dev.device.bottom<=dev.flow.top+20,"Phone and flow do not overlap");
    assert.ok(dev.flow.bottom<=dev.panel.bottom+5,"Flow does not clip vertically");
    assert.equal(dev.imgVisible,spec.width>720,"Full SVG flow displays only on tablet and desktop");
    assert.equal(dev.mobileFlowVisible,spec.width<=720,"Compact flow displays only on phones");
    const hit=await page.locator("#dashDevScene").evaluate(el=>{
      const r=el.getBoundingClientRect();const x=Math.min(innerWidth-10,Math.max(10,(r.left+r.right)/2));const y=Math.min(innerHeight-10,Math.max(10,(r.top+r.bottom)/2));
      const top=document.elementFromPoint(x,y);
      return {hit:top===el||el.contains(top),x,y,insideViewport:r.bottom>0&&r.top<innerHeight,
        topTag:top?.tagName,topClass:top?.className,
        stack:document.elementsFromPoint(x,y).slice(0,6).map(e=>e.tagName+"."+String(e.className).slice(0,60)),
        scrollY,heroOpacity:getComputedStyle(document.querySelector("#heroCopy")).opacity,
        panelOpacity:getComputedStyle(el).opacity};
    
    });
    console.log(JSON.stringify({developmentHitTest:spec.name,...hit}));
    await page.screenshot({path:"artifacts/debug-dev-"+spec.name+".png",animations:"disabled"});
    assert.ok(hit.insideViewport,"Development story must appear within the viewport during hero scroll");
    assert.ok(hit.hit,"Development scene is not obstructed by unrelated hero content");
    await page.screenshot({path:"artifacts/web-dev-stage-"+spec.name+".png",animations:"disabled"});
    await page.locator("#dashDevScene").screenshot({path:"artifacts/web-dev-"+spec.name+".png",animations:"disabled"});
    if(spec.width>720){
      await page.locator('#dashSidebarNav [data-sidebar-tab="1"]').click({force:true});
    }else{
      await page.locator("#dashStageSelect").selectOption("1");
    }
    assert.equal(await page.locator("#dashDevScene").getAttribute("aria-hidden"),"true","Switching tabs hides the Development story");
    const cta=page.locator(".hero-conversion-primary");
    assert.equal(await cta.getAttribute("target"),"_blank","Contact opens separate tab");
    assert.equal(await page.locator(".hero-conversion-secondary").getAttribute("href"),"#planes","Plan CTA is direct anchor");
    await page.locator("#webConversionHeader").screenshot({path:"artifacts/web-nav-"+spec.name+".png",animations:"disabled"});
    await page.screenshot({path:"artifacts/web-hero-"+spec.name+".png",animations:"disabled"});
    console.log(JSON.stringify({viewport:spec.name,navHeight:state.nav.height,heroTop:state.heroHeadline.top,ctaBottom:state.heroPrimary.bottom,fold:spec.height}));
   }finally{await context.close();}
  }
  // Verify anchor navigation independently of long cinematic scrollytelling.
  const ctx=await browser.newContext({viewport:{width:390,height:844},reducedMotion:"reduce"});
  const page=await ctx.newPage();
  await page.goto(base,{waitUntil:"domcontentloaded",timeout:75000});
  assert.equal(await page.locator("#planes").count(),1);
  assert.equal(await page.locator("#faq").count(),1);
  assert.equal(await page.locator('.hero-conversion-secondary').getAttribute("href"),"#planes");
  await ctx.close();
 }finally{
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
 }
})().catch(err=>{console.error(err);process.exitCode=1;server.close();});