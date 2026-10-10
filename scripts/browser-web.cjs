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
        plans:document.querySelectorAll(".plan-option").length,
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
    for(const selector of [".web-conversion-contact",".hero-conversion-primary","#plansBannerCta",".contact-actions a","#mobileBar a"]){
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

    // A single Development card must remain the only visible showcase indefinitely.
    const getShowcase = async()=>page.locator("#heroDashboardFrame").evaluate(el=>{
      const scene=el.querySelector("#dashDevScene");
      const rect=x=>{const r=x.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom,width:r.width,height:r.height};};
      const computed=getComputedStyle(scene);
      const image=scene.querySelector(".pc-iphone-image");
      const mobileFlow=scene.querySelector(".pc-channels");
      return {
        frameCount:document.querySelectorAll("#heroDashboardFrame").length,
        legacyCards:el.querySelectorAll(".dash-card,.dash-sidebar,.dash-topbar,.dash-overview,.dash-main,.dash-bottom,#dashStageSelect,#dashDevBack").length,
        sceneCount:el.querySelectorAll("#dashDevScene").length,
        phoneCount:el.querySelectorAll(".dash-dev-device").length,
        channelCount:el.querySelectorAll(".pc-channel").length,
        pathCount:el.querySelectorAll(".pc-route-base").length,
        pulseCount:el.querySelectorAll(".pc-route-pulse").length,
        animatedSvgCount:el.querySelectorAll(".pc-connection-map").length,
        reduceMotionRespected:getComputedStyle(el.querySelector(".pc-route-pulse")).animationName==="none",
        imageCount:el.querySelectorAll(".pc-iphone-image").length,
        flowCount:el.querySelectorAll(".dash-dev-flow").length,
        active:el.classList.contains("is-development-focus"),
        stable:scene.classList.contains("dash-dev-scene")&&computed.visibility==="visible"&&computed.opacity==="1"&&scene.getAttribute("aria-hidden")==="false",
        frame:rect(el),panel:rect(scene),phone:rect(scene.querySelector(".dash-dev-device")),flow:rect(scene.querySelector(".dash-dev-flow")),
        imgVisible:getComputedStyle(image).display!=="none",
        imgLoaded:image.complete&&image.naturalWidth>0,
        imgSrc:image.getAttribute("src"),
        mobileFlowVisible:getComputedStyle(mobileFlow).display!=="none",
        hit:(()=>{const r=scene.getBoundingClientRect(),x=(r.left+r.right)/2,y=Math.max(2,Math.min(innerHeight-10,(r.top+r.bottom)/2));return scene.contains(document.elementFromPoint(x,y));})()
      };
    });
    const assertShowcase=state=>{
      assert.equal(state.frameCount,1,"Exactly one showcase frame");
      assert.equal(state.sceneCount,1,"Exactly one Development scene");
      assert.equal(state.phoneCount,1,"Exactly one iPhone mockup");
      assert.equal(state.imageCount,1,"Exactly one real phone image");
      assert.equal(state.channelCount,4,"Four distinct channel cards");
      assert.equal(state.pathCount,4,"All four sources have physical connection lines");
      assert.equal(state.pulseCount,4,"Four moving connector signals are present");
      assert.equal(state.animatedSvgCount,1,"Only one animated connection graphic");
      assert.equal(state.reduceMotionRespected,true,"Motion preference disables background connector animation");
      assert.ok(state.phone.height<= (spec.width<=720?200:310),"Phone preview stays deliberately compact and sharp");

      assert.equal(state.flowCount,1,"Exactly one channels diagram");
      assert.equal(state.legacyCards,0,"All legacy cards, navigation and panels removed from markup");
      assert.ok(state.active&&state.stable,"Permanent Development scene is active and visible");
      assert.ok(state.panel.width>220&&state.panel.height>180,"Single card has adequate dimensions");
      assert.ok(state.phone.width>60&&state.phone.height>140,"Phone visible");
      assert.ok(state.flow.width>90&&state.flow.height>40,"Channels visible");
      assert.ok(state.phone.left>=state.panel.left-6&&state.phone.right<=state.panel.right+6,"Phone stays within showcase");
      assert.ok(state.flow.left>=state.panel.left-6&&state.flow.right<=state.panel.right+6,"Channels stay within showcase");
      assert.equal(state.imgVisible,true,"The chosen iPhone image has visible styling");
      assert.equal(state.imgLoaded,true,"The user-selected iPhone image must actually load");
      assert.equal(state.imgSrc,"./assets/alma-iphone.webp","Image must be local to avoid blocked CDN");
      assert.equal(state.mobileFlowVisible,true,"Channel cards are displayed in mobile and desktop");
      assert.ok(state.hit,"Showcase is not obstructed");
    };
    await page.waitForFunction(()=>{const img=document.querySelector(".pc-iphone-image");return Boolean(img&&img.complete&&img.naturalWidth>0)},{timeout:12000});
    const first=await getShowcase();
    assertShowcase(first);
    if(spec.width===390){
      // Regression for earlier 1.7-second idle cycle + 1.55-second rotation.
      // Force normal motion and wait longer than both while keeping the hero stationary.
      await page.waitForTimeout(5100);
      const later=await getShowcase();
      assertShowcase(later);
      assert.equal(later.legacyCards,first.legacyCards,"Legacy cards never return after a delay");
      await page.evaluate(()=>window.scrollBy(0,8));
      await page.waitForTimeout(150);
      assertShowcase(await getShowcase());
    }
    console.log(JSON.stringify({viewport:spec.name,singleCard:true,legacyCards:first.legacyCards,phone:first.phone,flow:first.flow,connectorPaths:first.pathCount}));
    await page.screenshot({path:"artifacts/web-single-development-"+spec.name+".png",animations:"disabled"});
    await page.locator("#dashDevScene").screenshot({path:"artifacts/web-dev-"+spec.name+".png",animations:"disabled"});
    const cta=page.locator(".hero-conversion-primary");
    assert.equal(await cta.getAttribute("target"),"_blank","Contact opens separate tab");
    assert.equal(await page.locator(".hero-conversion-secondary").getAttribute("href"),"#planes","Plan CTA is direct anchor");
    await page.locator("#webConversionHeader").screenshot({path:"artifacts/web-nav-"+spec.name+".png",animations:"disabled"});
    await page.screenshot({path:"artifacts/web-hero-"+spec.name+".png",animations:"disabled"});
    console.log(JSON.stringify({viewport:spec.name,navHeight:state.nav.height,heroTop:state.heroHeadline.top,ctaBottom:state.heroPrimary.bottom,fold:spec.height}));
   }finally{await context.close();}
  }
  // Confirm animated routes actually run with normal-motion preference.
  const motionContext=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:"no-preference"});
  const motionPage=await motionContext.newPage();
  await motionPage.goto(base,{waitUntil:"domcontentloaded",timeout:75000});
  const motion=await motionPage.locator(".pc-route-pulse").first().evaluate(el=>({
    animationName:getComputedStyle(el).animationName,
    iterationCount:getComputedStyle(el).animationIterationCount,
    routeCount:document.querySelectorAll(".pc-route-pulse").length
  }));
  assert.equal(motion.animationName,"pcLinkFlow","Source-to-web flow runs when motion is allowed");
  assert.equal(motion.iterationCount,"infinite","Connection flow loops gently");
  assert.equal(motion.routeCount,4,"Each source has one distinct animated path");
  await motionContext.close();
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