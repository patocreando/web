import fs from "node:fs";
import assert from "node:assert/strict";

const html=fs.readFileSync("index.html","utf8");
const oldWebLink="https://ig.me/m/patocreando?ref=w61000387";
const count=(str,text)=>str.split(text).length-1;
const match=(needle)=>assert.ok(html.includes(needle),"Missing: "+needle);
const sectionIds=[...html.matchAll(/<section\b[^>]*\bid="([^"]+)"/g)].map(x=>x[1]);
assert.deepEqual(sectionIds,["inicio","solucion","capacidades","planes","proceso","faq"],"Original storytelling chapters preserved");
assert.equal(count(html,'<h1>'),1,"One primary H1");
assert.equal(count(html,'class="web-conversion-header"'),1,"Exactly one persistent conversion header");
assert.equal(count(html,'id="web-conversion-critical"'),1,"Critical nav and CTAs CSS embedded atomically");
assert.ok(html.indexOf('id="web-conversion-critical"')<html.indexOf('</head>'),"Conversion CSS in head");
assert.equal(count(html,'class="home-return"'),0,"No conflicting floating home-return link");
assert.equal(count(html,'class="web-conversion-primary"'),0,"Only registered CTAs");
match('href="https://patocreando.github.io/inicio/"');
match('class="web-conversion-brand" href="#inicio"');
match('class="web-conversion-contact" href="'+oldWebLink+'"');
match('class="hero-conversion-primary" href="'+oldWebLink+'"');
match('class="hero-conversion-secondary" href="#planes"');
match('class="hero-conversion-note"');
match('Desde ARS 30.000 · Pago único');
match('id="planes"');
match('id="faq"');
match('id="main-content"');
match('href="#main-content"');
match('<video id="masterFilmVideo" muted playsinline preload="metadata">');
const ctaAnchors=[...html.matchAll(/<a\b[^>]*\bdata-web-cta="manychat"[^>]*>/g)].map(x=>x[0]);
assert.equal(ctaAnchors.length,5,"Exactly five consultation CTAs are marked and unified");
for(const cta of ctaAnchors) {
  assert.ok(cta.includes('href="'+oldWebLink+'"'),"Every commercial CTA uses the Web Manychat automation");
  assert.ok(cta.includes('target="_blank"'),"Commercial CTAs keep their external open behavior");
}
const allManychatAnchors=[...html.matchAll(/<a\b[^>]*href="https:\/\/ig\.me\/[^"]+"[^>]*>/g)].map(x=>x[0]);
assert.equal(allManychatAnchors.length,5,"No competing or untagged Instagram DM links exist");
for(const anchor of allManychatAnchors)assert.ok(anchor.includes('data-web-cta="manychat"'),"Every DM CTA is accounted for");
assert.equal(count(html,oldWebLink),5,"No accidental duplicate, broken or alternative Manychat ref");
assert.ok(count(html,oldWebLink)>=5,"All previous Web Manychat links remain and new early CTAs use the same ref");
const amounts=[["Web Express","ARS 30.000"],["Web Pro","ARS 75.000"],["Web Premium","ARS 150.000"]];
for(const [name,price] of amounts) {match(name);assert.equal(count(html,price)>=1,true,"Price preserved "+price);}
for(const term of ["1 ajuste","2 ajustes","3 ajustes","Diseño personalizado","SEO básico","Dominio propio","Página avanzada o multipágina"])match(term);
match("Alcance, plazos y condiciones de pago se acuerdan antes de empezar.");
match('aria-label="Navegación principal"');
match('meta name="description" content="Diseño de landing pages');
assert.equal(count(html,'class="plan-x '),3,"Three original plans still present");
for(const file of ["styles.css","hero-v3.css","experience.css","script.js","capabilities.js","plans.js","process.js","polish.js","film.js","kinetic.js","close-zone.js"])assert.ok(fs.existsSync(file),"Original asset missing "+file);
const css=html.slice(html.indexOf('<style id="web-conversion-critical">'),html.indexOf('</style>',html.indexOf('<style id="web-conversion-critical">')));
for(const style of [".web-conversion-nav",".hero-conversion-actions","#solucion,#capacidades,#planes,#proceso,#faq","@media(max-width:720px)"])assert.ok(css.includes(style),"Responsive style missing "+style);
const anchors=[...html.matchAll(/<a\b[^>]*href="#([^"]+)"/g)].map(x=>x[1]);
const ids=new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]));
for(const anchor of anchors)assert.ok(ids.has(anchor),"Broken local anchor #"+anchor);

const script=fs.readFileSync("script.js","utf8");
const heroCss=fs.readFileSync("hero-v3.css","utf8");
const devContent=html.slice(html.indexOf('<div class="dash-dev-scene"'),html.indexOf('class="v3-piece v3-topbar"'));
assert.equal(count(html,'id="dashDevScene"'),1,"Single development story panel");
assert.ok(devContent.includes('class="dash-dev-device"'),"Premium phone remains in Development");
assert.ok(devContent.includes('src="./assets/canales-unificados.svg"'),"Convergence flow remains in Development");
for(const oldClass of ['dash-dev-left','dash-dev-benefits','dash-dev-footer','dash-dev-preview-heading','dash-dev-spec']){
  assert.ok(!devContent.includes('class="'+oldClass),"Remove redundant Development copy and cards: "+oldClass);
}
assert.ok(!devContent.includes('<h3>'),"No redundant Development headline");
assert.ok(!devContent.includes('<figcaption>'),"No redundant flow caption");
assert.ok(fs.existsSync("assets/canales-unificados.svg"),"Diagram asset exists");
assert.ok(!script.includes("98 / 100"),"Remove fabricated Lighthouse performance score");
assert.ok(!script.includes('title:"Código y rendimiento"'),"Old generic technical dashboard replaced");
assert.ok(script.includes('is-development",index===2'),"Development view controlled by selected tab");
assert.ok(script.includes('dashboardStageSelect.addEventListener("change"'),"Mobile can access Development view directly");
assert.ok(heroCss.includes(".dash-workspace.is-development .dash-dev-scene"),"Tab-specific composition styles exist");
assert.ok(heroCss.includes("@media(max-width:720px)"),"Mobile storytelling layout exists");
assert.equal(count(html,'id="dashStageSelect"'),1,"Single mobile stage selector");
for(const price of ["ARS 30.000","ARS 75.000","ARS 150.000"])match(price);
assert.ok(html.includes('src="./assets/canales-unificados.svg"'),"Convergence image is a local asset");
assert.ok(heroCss.includes("dash-dev-island")&&heroCss.includes("dash-dev-device-glass")===false,"Premium phone shell and dynamic island are styled");
console.log("Minimal Development showcase QA OK: only phone and connected-channel graphic, no redundant copy; commercial terms intact.");
console.log("Web conversion static smoke OK: pricing, Manychat, chapter structure, hero CTAs and responsive CSS.");