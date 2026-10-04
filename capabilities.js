(() => {
  const section=document.querySelector(".cap-section");
  if(!section)return;

  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  const tabs=[...section.querySelectorAll(".cap-tab")];
  const layers=[...section.querySelectorAll(".cap-layer")];
  const desc=document.getElementById("capDescription");
  const counter=document.getElementById("capCounter");
  const progress=document.querySelector(".cap-progress");
  const final=document.getElementById("capFinal");
  const heading=document.getElementById("capHeading");
  const stage=document.getElementById("capStage");

  const copy=[
    ["01 / DISEÑO","Jerarquía y marca.","Lo importante se entiende primero."],
    ["02 / DESARROLLO","La interfaz cobra vida.","Adaptación, interacción y código real."],
    ["03 / DIRECCIÓN","Cada decisión tiene intención.","Foco, encuadre y recorrido."],
    ["04 / IA","Más capacidad, mismo criterio.","Acelera producción sin perder dirección."]
  ];

  let current=-1;

  const setActive=i=>{
    if(i===current)return;
    current=i;

    tabs.forEach((tab,n)=>tab.classList.toggle("active",n===i));
    layers.forEach((layer,n)=>layer.classList.toggle("active",n===i));

    if(desc){
      const c=copy[i];
      desc.querySelector("small").textContent=c[0];
      desc.querySelector("strong").textContent=c[1];
      desc.querySelector("p").textContent=c[2];
      desc.dataset.active=String(i);
    }
  };

  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);
    const active=Math.max(0,Math.min(3,Math.round(p*3)));

    setActive(active);

    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100).toFixed(1)+"%");

    if(heading){
      heading.style.opacity="1";
      heading.style.transform="translate3d(0,"+(-5*smooth(clamp(p/.25))).toFixed(2)+"px,0)";
    }

    if(stage){
      const drift=(p-.5)*8;
      stage.style.transform="translate(-50%,-50%) translate3d(0,"+drift.toFixed(2)+"px,0)";
    }

    if(desc){
      desc.style.opacity="1";
      desc.style.transform="translate3d(0,0,0)";
    }

    if(final){
      const f=smooth(clamp((p-.90)/.07));
      final.style.opacity=String(f);
      final.style.transform="translate(-50%,"+(22*(1-f))+"px)";
    }
  };

  const targets=[.03,.35,.67,.96];
  tabs.forEach((tab,i)=>tab.addEventListener("click",()=>{
    const travel=section.offsetHeight-innerHeight;
    scrollTo({top:section.offsetTop+(travel*targets[i]),behavior:"smooth"});
  }));

  update();
  addEventListener("scroll",update,{passive:true});
  addEventListener("resize",update,{passive:true});
})();