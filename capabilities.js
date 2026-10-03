(() => {
  const section=document.querySelector(".cap-section");
  if(!section)return;
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const ease=t=>1-Math.pow(1-t,3);
  const tabs=[...document.querySelectorAll(".cap-tab")];
  const mode=document.getElementById("capMode");
  const desc=document.getElementById("capDescription");
  const counter=document.getElementById("capCounter");
  const progress=document.querySelector(".cap-progress");
  const final=document.getElementById("capFinal");
  const heading=document.getElementById("capHeading");
  const stage=document.getElementById("capStage");
  const dev=document.querySelector(".cap-dev-overlay");
  const dir=document.querySelector(".cap-direction-overlay");
  const ai=document.querySelector(".cap-ai-overlay");
  const base=[...document.querySelectorAll(".layer-design")];
  const copy=[
    ["01 / DISEÑO","Jerarquía, ritmo y marca.","La primera capa define cómo se entiende y cómo se siente."],
    ["02 / DESARROLLO","La interfaz cobra vida.","Responsive, interacción y estructura real en código."],
    ["03 / DIRECCIÓN","Todo responde a una intención.","Qué entra, qué sale y dónde tiene que mirar el usuario."],
    ["04 / IA","Más capacidad detrás.","IA como acelerador de producción, no como sustituto del criterio."]
  ];
  const setStage=i=>{
    tabs.forEach((t,n)=>t.classList.toggle("active",n===i));
    if(mode)mode.textContent=["DESIGN","DEVELOP","DIRECT","AI"][i];
    if(desc){const c=copy[i];desc.querySelector("small").textContent=c[0];desc.querySelector("strong").textContent=c[1];desc.querySelector("p").textContent=c[2];}
    const o=i===0?1:i===1?.32:i===2?.2:.12;
    base.forEach(el=>el.style.opacity=String(o));
    if(dev)dev.style.opacity=i===1?"1":i>1?".22":"0";
    if(dir)dir.style.opacity=i===2?"1":"0";
    if(ai)ai.style.opacity=i===3?"1":"0";
  };
  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);
    const i=Math.min(3,Math.floor(p*.9999*4));
    setStage(i);
    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100)+"%");
    if(heading){const f=clamp((p-.12)/.18);heading.style.opacity=String(1-f*.72);heading.style.transform="translateX(-50%) translateY("+(-18*f)+"px)";}
    if(stage)stage.style.transform="translate(-50%,-50%) scale("+(.96+Math.sin(p*Math.PI*4)*.008)+")";
    if(final){const f=ease(clamp((p-.86)/.11));final.style.opacity=String(f);final.style.transform="translate(-50%,"+(28*(1-f))+"px)";}
  };
  tabs.forEach((t,i)=>t.addEventListener("click",()=>{const travel=section.offsetHeight-innerHeight;scrollTo({top:section.offsetTop+travel*(i/4+.06),behavior:"smooth"});}));
  update();addEventListener("scroll",update,{passive:true});addEventListener("resize",update,{passive:true});
})();