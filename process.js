(() => {
  const section=document.querySelector(".process-x");
  if(!section)return;
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const steps=[...document.querySelectorAll(".process-step-x")];
  const fill=document.getElementById("processFill");
  const counter=document.getElementById("processCounter");
  const progress=document.querySelector(".process-x-counter");
  const label=document.getElementById("processStageLabel");
  const title=document.getElementById("processStageTitle");
  const textEl=document.getElementById("processStageText");
  const copy=[
    ["01 / DISCOVERY","Primero, entender.","No hace falta un briefing enorme. Partimos de lo que ya existe y definimos qué tiene que resolver la web."],
    ["02 / DESIGN","Después, ordenar.","Contenido, jerarquía y dirección visual se convierten en un sistema claro."],
    ["03 / BUILD","Luego, construir.","La experiencia se vuelve responsive, interactiva y lista para uso real."],
    ["04 / LIVE","Por último, publicar.","La web queda online y lista para recibir tráfico desde redes, Google, anuncios o QR."]
  ];
  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);
    const i=Math.min(3,Math.floor(p*.9999*4));
    steps.forEach((s,n)=>s.classList.toggle("active",n===i));
    if(fill)fill.style.height=(p*100)+"%";
    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100)+"%");
    if(label)label.textContent=copy[i][0];
    if(title)title.textContent=copy[i][1];
    if(textEl)textEl.textContent=copy[i][2];
  };
  update();addEventListener("scroll",update,{passive:true});addEventListener("resize",update,{passive:true});
})();