(() => {
  const section=document.querySelector(".process-x");
  if(!section)return;

  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const steps=[...document.querySelectorAll(".process-step-x")];
  const nodes=[...document.querySelectorAll(".process-orbit-node")];
  const orbit=document.querySelector(".process-orbit");
  const heading=document.getElementById("processHeading");
  const fill=document.getElementById("processFill");
  const counter=document.getElementById("processCounter");
  const progress=document.querySelector(".process-x-counter");
  const label=document.getElementById("processStageLabel");
  const title=document.getElementById("processStageTitle");
  const textEl=document.getElementById("processStageText");

  const copy=[
    ["01 / DEFINICIÓN","Primero, entender.","Definimos objetivo, contenido y acción principal."],
    ["02 / DISEÑO","Después, ordenar.","Contenido, jerarquía y dirección visual se convierten en un sistema claro."],
    ["03 / DESARROLLO","Luego, construir.","La web queda adaptable, interactiva y lista para usar."],
    ["04 / PUBLICACIÓN","Por último, publicar.","La web queda publicada y lista para recibir tráfico."]
  ];

  const weight=(position,index)=>Math.max(0,1-Math.abs(position-index));

  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);
    const position=p*3;
    const active=Math.round(position);

    steps.forEach((step,i)=>{
      const focus=weight(position,i);
      step.style.setProperty("--step-focus",focus.toFixed(4));
      step.classList.toggle("active",i===active);
    });

    nodes.forEach((node,i)=>node.classList.toggle("active",i===active));

    if(orbit){
      orbit.style.setProperty("--process-angle",(p*270).toFixed(2)+"deg");
    }

    if(fill)fill.style.height=(p*100).toFixed(2)+"%";
    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100).toFixed(1)+"%");

    if(label)label.textContent=copy[active][0];
    if(title)title.textContent=copy[active][1];
    if(textEl)textEl.textContent=copy[active][2];

    if(heading){
      const fade=clamp((p-.18)/.18);
      heading.style.opacity=String(1-fade*.64);
      heading.style.transform="translateY("+(-18*fade)+"px) scale("+(1-.018*fade)+")";
    }
  };

  update();
  addEventListener("scroll",update,{passive:true});
  addEventListener("resize",update,{passive:true});
})();