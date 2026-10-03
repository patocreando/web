(() => {
  const section=document.querySelector(".plans-x");
  if(!section)return;
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const cards=[...document.querySelectorAll(".plan-x")];
  const counter=document.getElementById("plansCounter");
  const progress=document.querySelector(".plans-x-counter");
  const level=document.getElementById("plansLevel");
  const line=document.getElementById("plansLine");
  const note=document.getElementById("plansNote");
  const copy=[
    ["01 / EXPRESS","Lo esencial, bien resuelto.","Para negocios que necesitan una presencia propia sin sumar complejidad."],
    ["02 / PRO","Más identidad. Más recorrido.","Para negocios que necesitan mostrar mejor servicios, productos y diferenciales."],
    ["03 / PREMIUM","La web como pieza central.","Para marcas que necesitan más páginas, interacción e integraciones."]
  ];
  const setStage=i=>{
    cards.forEach((c,n)=>c.classList.toggle("active",n===i));
    if(level)level.textContent=copy[i][0];
    if(line)line.textContent=copy[i][1];
    if(note)note.textContent=copy[i][2];
  };
  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);
    const i=Math.min(2,Math.floor(p*.9999*3));
    setStage(i);
    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100)+"%");
  };
  cards.forEach((c,i)=>c.addEventListener("click",()=>{const travel=section.offsetHeight-innerHeight;scrollTo({top:section.offsetTop+travel*(i/3+.06),behavior:"smooth"});}));
  update();addEventListener("scroll",update,{passive:true});addEventListener("resize",update,{passive:true});
})();