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
  const cta=document.getElementById("plansCta");
  const proCard=section.querySelector(".plan-x.pro");
  const sticky=section.querySelector(".plans-x-sticky");

  const copy=[
    ["01 / EXPRESS","Lo esencial, bien resuelto.","Para negocios que necesitan una presencia propia sin sumar complejidad."],
    ["02 / PRO","Más identidad y recorrido.","Para negocios que necesitan mostrar mejor su oferta."],
    ["03 / PREMIUM","La web como pieza central.","Para marcas que necesitan más páginas e integraciones."]
  ];

  const weight=(position,index)=>Math.max(0,1-Math.abs(position-index));

  const update=()=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);
    const position=p*2;
    const active=Math.round(position);

    cards.forEach((card,i)=>{
      const focus=weight(position,i);
      card.style.setProperty("--focus",focus.toFixed(4));
      card.classList.toggle("active",i===active);
    });

    if(level)level.textContent=copy[active][0];
    if(line)line.textContent=copy[active][1];
    if(note)note.textContent=copy[active][2];
    if(counter)counter.textContent=String(Math.round(p*100)).padStart(3,"0");
    if(progress)progress.style.setProperty("--cap-p",(p*100).toFixed(1)+"%");

    if(cta&&proCard&&sticky){
      const cardRect=proCard.getBoundingClientRect();
      const stickyRect=sticky.getBoundingClientRect();
      const left=cardRect.left-stickyRect.left+(cardRect.width/2);
      const top=cardRect.bottom-stickyRect.top+(innerWidth<=720?10:14);

      cta.style.left=left.toFixed(2)+"px";
      cta.style.top=top.toFixed(2)+"px";
    }
  };

  const targets=[.05,.50,.95];
  cards.forEach((card,i)=>card.addEventListener("click",()=>{
    const travel=section.offsetHeight-innerHeight;
    scrollTo({top:section.offsetTop+(travel*targets[i]),behavior:"smooth"});
  }));

  update();
  addEventListener("scroll",update,{passive:true});
  addEventListener("resize",update,{passive:true});
})();