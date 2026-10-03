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

  const weight=(position,index)=>Math.max(0,1-Math.abs(position-index));

  const setText=i=>{
    tabs.forEach((t,n)=>t.classList.toggle("active",n===i));
    if(mode)mode.textContent=["DESIGN","DEVELOP","DIRECT","AI"][i];
    if(desc){
      const c=copy[i];
      desc.querySelector("small").textContent=c[0];
      desc.querySelector("strong").textContent=c[1];
      desc.querySelector("p").textContent=c[2];
    }
  };

  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);
    const position=p*3;

    const w0=weight(position,0);
    const w1=weight(position,1);
    const w2=weight(position,2);
    const w3=weight(position,3);
    const active=Math.round(position);

    setText(active);

    const baseOpacity=Math.max(.12,w0+(w1*.30)+(w2*.18)+(w3*.10));
    base.forEach(el=>el.style.opacity=String(baseOpacity));

    if(dev){
      dev.style.opacity=String(clamp(w1+(w2*.16)));
      dev.style.transform="translateY("+((1-w1)*5)+"px) scale("+(0.985+(w1*.015))+")";
    }

    if(dir){
      dir.style.opacity=String(w2);
      dir.style.transform="scale("+(0.985+(w2*.015))+")";
    }

    if(ai){
      ai.style.opacity=String(w3);
      ai.style.transform="scale("+(0.96+(w3*.04))+")";
    }

    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100).toFixed(1)+"%");

    if(heading){
      const f=clamp((p-.10)/.18);
      heading.style.opacity=String(1-f*.76);
      heading.style.transform="translateX(-50%) translateY("+(-20*f)+"px) scale("+(1-f*.018)+")";
    }

    if(stage){
      const settle=ease(clamp(p/.10));
      const micro=Math.sin(p*Math.PI*6)*.004;
      stage.style.opacity=String(.84+(settle*.16));
      stage.style.transform="translate(-50%,-50%) scale("+(0.975+(settle*.025)+micro)+")";
    }

    if(final){
      const f=ease(clamp((p-.88)/.09));
      final.style.opacity=String(f);
      final.style.transform="translate(-50%,"+(30*(1-f))+"px)";
    }
  };

  const targets=[.04,.35,.66,.92];
  tabs.forEach((t,i)=>t.addEventListener("click",()=>{
    const travel=section.offsetHeight-innerHeight;
    scrollTo({top:section.offsetTop+(travel*targets[i]),behavior:"smooth"});
  }));

  update();
  addEventListener("scroll",update,{passive:true});
  addEventListener("resize",update,{passive:true});
})();