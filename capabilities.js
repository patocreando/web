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
    ["01 / DISEÑO","Jerarquía, ritmo y marca.","Ordena lo que importa."],
    ["02 / DESARROLLO","La interfaz cobra vida.","Responsive, interacción y código real."],
    ["03 / DIRECCIÓN","Cada decisión tiene intención.","Foco, encuadre y recorrido."],
    ["04 / IA","Más capacidad detrás.","Acelera producción sin reemplazar criterio."]
  ];

  const layerOpacity=(position,index)=>{
    if(index===0){
      return .34 + .66*(1-smooth(clamp((position-.62)/.72))) + .16*smooth(clamp((position-.62)/.72));
    }
    const enter=smooth(clamp((position-(index-.72))/.72));
    const after=smooth(clamp((position-(index+.46))/.72));
    const peak=.92;
    const residual=[.30,.34,.40,.92][index];
    return enter*(peak-(after*(peak-residual)));
  };

  const setActive=i=>{
    tabs.forEach((t,n)=>t.classList.toggle("active",n===i));
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
    const position=p*3;
    const active=Math.round(position);

    setActive(active);

    layers.forEach((layer,i)=>{
      const opacity=layerOpacity(position,i);
      layer.style.setProperty("--layer-opacity",opacity.toFixed(3));
      const depth=i===active?1:0;
      layer.style.setProperty("--layer-depth",String(depth));
      layer.classList.toggle("active",i===active);
    });

    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100).toFixed(1)+"%");

    if(heading){
      heading.style.opacity="1";
      heading.style.transform="translate3d(0,"+(-6*smooth(clamp(p/.25))).toFixed(2)+"px,0)";
    }

    if(stage){
      const drift=(p-.5)*14;
      const scale=1+(Math.sin(p*Math.PI)*.015);
      stage.style.transform="translate(-50%,-50%) translate3d(0,"+drift.toFixed(2)+"px,0) scale("+scale.toFixed(4)+")";
    }

    if(desc){
      const x=(active-1.5)*2.5;
      desc.style.transform="translate3d("+x.toFixed(2)+"px,0,0)";
      desc.style.opacity="1";
    }

    if(final){
      const f=smooth(clamp((p-.88)/.09));
      final.style.opacity=String(f);
      final.style.transform="translate(-50%,"+(22*(1-f))+"px)";
    }
  };

  const targets=[.03,.35,.67,.96];
  tabs.forEach((t,i)=>t.addEventListener("click",()=>{
    const travel=section.offsetHeight-innerHeight;
    scrollTo({top:section.offsetTop+(travel*targets[i]),behavior:"smooth"});
  }));

  update();
  addEventListener("scroll",update,{passive:true});
  addEventListener("resize",update,{passive:true});
})();