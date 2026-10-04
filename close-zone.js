(() => {
  const zone=document.getElementById("closeZone");
  if(!zone)return;

  const panels=[...zone.querySelectorAll(".close-panel")];
  const count=document.getElementById("closeZoneCount");
  const fill=document.getElementById("closeZoneFill");

  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  const fade=(p,a,b,c,d)=>{
    if(p<=a||p>=d)return 0;
    if(p<b)return smooth(clamp((p-a)/(b-a)));
    if(p<=c)return 1;
    return 1-smooth(clamp((p-c)/(d-c)));
  };

  const update=()=>{
    const r=zone.getBoundingClientRect();
    const travel=Math.max(1,zone.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);

    const opacities=[
      p<=.31 ? 1 : 1-smooth(clamp((p-.31)/.035)),
      fade(p,.325,.365,.625,.66),
      p<.645 ? 0 : smooth(clamp((p-.645)/.045))
    ];

    let active=0;
    if(p>=.34)active=1;
    if(p>=.67)active=2;

    panels.forEach((panel,i)=>{
      const o=opacities[i];
      const entering=i===0 ? 0 : (1-o)*22;
      const leaving=i<active ? -(1-o)*18 : entering;
      panel.style.setProperty("--close-opacity",o.toFixed(3));
      panel.style.setProperty("--close-y",leaving.toFixed(2)+"px");
      panel.classList.toggle("is-interactive",i===active && o>.75);
      panel.setAttribute("aria-hidden",i===active ? "false" : "true");
    });

    if(count)count.textContent=String(active+1).padStart(2,"0");
    zone.style.setProperty("--close-progress",(p*100).toFixed(1)+"%");
    if(fill)fill.style.width=(p*100).toFixed(1)+"%";
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