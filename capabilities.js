(() => {
  const section=document.querySelector(".cap-section");
  if(!section)return;

  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  const tabs=[...section.querySelectorAll(".cap-tab")];
  const layers=[...section.querySelectorAll(".cap-layer")];
  const objects=[...section.querySelectorAll(".cap-object")];
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

    tabs.forEach((t,n)=>t.classList.toggle("active",n===i));

    layers.forEach((layer,n)=>{
      const show=n===0 && i===0;
      layer.style.setProperty("--layer-opacity",show?".82":"0");
      layer.style.setProperty("--layer-depth",show?"1":"0");
      layer.classList.toggle("active",show);
    });

    objects.forEach(object=>{
      const state=Number(object.dataset.capObject);
      object.classList.toggle("is-active",state===i);
      object.classList.toggle("is-before",state<i);
      object.classList.toggle("is-after",state>i);
    });

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
    const active=Math.max(0,Math.min(3,Math.round(position)));

    setActive(active);

    const local=clamp(position-active,-.5,.5);
    objects.forEach(object=>{
      const state=Number(object.dataset.capObject);
      if(state!==active)return;
      const y=(-local*10).toFixed(2);
      const rotate=(local*.9).toFixed(2);
      const scale=(1.005-Math.abs(local)*.012).toFixed(4);
      object.style.setProperty("--asset-y",y+"px");
      object.style.setProperty("--asset-rotate",rotate+"deg");
      object.style.setProperty("--asset-scale",scale);
    });

    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100).toFixed(1)+"%");

    if(heading){
      heading.style.opacity="1";
      heading.style.transform="translate3d(0,"+(-6*smooth(clamp(p/.25))).toFixed(2)+"px,0)";
    }

    if(stage){
      const drift=(p-.5)*11;
      const scale=1+(Math.sin(p*Math.PI)*.012);
      stage.style.transform="translate(-50%,-50%) translate3d(0,"+drift.toFixed(2)+"px,0) scale("+scale.toFixed(4)+")";
    }

    if(desc){
      const x=(active-1.5)*2;
      desc.style.transform="translate3d("+x.toFixed(2)+"px,0,0)";
      desc.style.opacity="1";
    }

    if(final){
      const f=smooth(clamp((p-.90)/.07));
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