(() => {
  const section=document.querySelector(".process-x");
  if(!section)return;

  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  const steps=[...section.querySelectorAll(".process-step-x")];
  const nodes=[...section.querySelectorAll(".process-orbit-node")];
  const orbit=section.querySelector(".process-orbit");
  const heading=document.getElementById("processHeading");
  const fill=document.getElementById("processFill");
  const counter=document.getElementById("processCounter");
  const progress=document.querySelector(".process-x-counter");
  const side=document.getElementById("processSide");
  const label=document.getElementById("processStageLabel");
  const title=document.getElementById("processStageTitle");
  const textEl=document.getElementById("processStageText");

  const copy=[
    ["01 / DEFINICIÓN","Primero, entender.","Definimos objetivo, contenido y acción principal."],
    ["02 / DISEÑO","Después, ordenar.","Contenido, jerarquía y dirección visual se convierten en un sistema claro."],
    ["03 / DESARROLLO","Luego, construir.","La web queda adaptable, interactiva y lista para usar."],
    ["04 / PUBLICACIÓN","Por último, publicar.","La web queda publicada y lista para recibir tráfico."]
  ];

  let previous=-1;

  const setCopy=i=>{
    if(i===previous)return;
    previous=i;

    if(label)label.textContent=copy[i][0];
    if(title)title.textContent=copy[i][1];
    if(textEl)textEl.textContent=copy[i][2];

    nodes.forEach((node,n)=>node.classList.toggle("active",n===i));
    steps.forEach((step,n)=>step.classList.toggle("active",n===i));
  };

  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);

    const raw=Math.min(3.9999,p*4);
    const active=Math.min(3,Math.floor(raw));
    const local=active===3 && p>=.999 ? 1 : raw-active;

    setCopy(active);

    // Each step starts slightly soft, locks focus quickly, stays readable,
    // then releases just before the next step.
    const enter=smooth(clamp(local/.12));
    const exit=smooth(clamp((local-.82)/.16));
    const hold=clamp(enter*(1-exit));

    steps.forEach((step,i)=>{
      if(i===active){
        step.style.setProperty("--step-opacity",(0.58+hold*.42).toFixed(3));
        step.style.setProperty("--step-blur",((1-enter)*1.8).toFixed(2)+"px");
        step.style.setProperty("--step-y",((1-enter)*8-exit*6).toFixed(2)+"px");
        step.style.setProperty("--step-scale",(0.992+hold*.008).toFixed(4));
      }else{
        step.style.setProperty("--step-opacity",".36");
        step.style.setProperty("--step-blur","0px");
        step.style.setProperty("--step-y","0px");
        step.style.setProperty("--step-scale","1");
      }
    });

    if(side){
      const sideIn=smooth(clamp(local/.15));
      const sideOut=smooth(clamp((local-.84)/.14));
      const sideFocus=sideIn*(1-sideOut);

      side.style.setProperty("--process-side-opacity",(0.62+sideFocus*.38).toFixed(3));
      side.style.setProperty("--process-side-blur",((1-sideIn)*1.7).toFixed(2)+"px");
      side.style.setProperty("--process-side-y",((1-sideIn)*10-sideOut*8).toFixed(2)+"px");
    }

    if(heading){
      const intro=smooth(clamp(p/.035));
      const out=smooth(clamp((p-.94)/.05));

      heading.style.opacity=(0.62+intro*.38-out*.22).toFixed(3);
      heading.style.filter="blur("+((1-intro)*1.8).toFixed(2)+"px)";
      heading.style.transform="translate3d(0,"+((1-intro)*10-out*10).toFixed(2)+"px,0)";
    }

    if(orbit){
      orbit.style.setProperty("--process-angle",(p*270).toFixed(2)+"deg");
    }

    if(fill)fill.style.height=(p*100).toFixed(2)+"%";
    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100).toFixed(1)+"%");
  };

  let raf=0;
  const queue=()=>{
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;update();});
  };

  update();
  addEventListener("scroll",queue,{passive:true});
  addEventListener("resize",queue,{passive:true});
})();