(() => {
  const section=document.querySelector(".cap-section");
  if(!section)return;

  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  const tabs=[...section.querySelectorAll(".cap-tab")];
  const layers=[...section.querySelectorAll(".cap-layer")];
  const focus=document.getElementById("capFocusCopy");
  const focusTitle=document.getElementById("capFocusTitle");
  const focusLine=document.getElementById("capFocusLine");
  const progress=document.querySelector(".cap-progress");
  const final=document.getElementById("capFinal");
  const heading=document.getElementById("capHeading");
  const stage=document.getElementById("capStage");

  const copy=[
    ["DISEÑO","Jerarquía, ritmo y marca."],
    ["DESARROLLO","Interacción, adaptación y código."],
    ["DIRECCIÓN","Foco, encuadre y recorrido."],
    ["IA","Más capacidad. Mismo criterio."]
  ];

  const reduceMotion=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let current=-1;
  let swapToken=0;

  const updateFocus=i=>{
    if(!focus || !focusTitle || !focusLine)return;
    const c=copy[i];
    const token=++swapToken;

    if(reduceMotion){
      focusTitle.textContent=c[0];
      focusLine.textContent=c[1];
      focus.dataset.active=String(i);
      return;
    }

    focus.classList.add("is-changing");
    setTimeout(()=>{
      if(token!==swapToken)return;
      focusTitle.textContent=c[0];
      focusLine.textContent=c[1];
      focus.dataset.active=String(i);
      requestAnimationFrame(()=>focus.classList.remove("is-changing"));
    },110);
  };

  const setActive=i=>{
    if(i===current)return;
    current=i;

    tabs.forEach((tab,n)=>tab.classList.toggle("active",n===i));
    layers.forEach((layer,n)=>layer.classList.toggle("active",n===i));
    updateFocus(i);
  };

  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);
    const active=Math.max(0,Math.min(3,Math.round(p*3)));

    setActive(active);

    if(progress)progress.style.setProperty("--cap-p",(p*100).toFixed(1)+"%");

    if(heading){
      heading.style.opacity="1";
      heading.style.transform="translate3d(0,"+(-5*smooth(clamp(p/.25))).toFixed(2)+"px,0)";
    }

    if(stage){
      const drift=(p-.5)*8;
      stage.style.transform="translate(-50%,-50%) translate3d(0,"+drift.toFixed(2)+"px,0)";
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