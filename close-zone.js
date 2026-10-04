(() => {
  const zone=document.getElementById("closeZone");
  if(!zone)return;

  const panels=[...zone.querySelectorAll(".close-panel")];
  const count=document.getElementById("closeZoneCount");
  const fill=document.getElementById("closeZoneFill");

  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  const ramp=(p,a,b)=>smooth(clamp((p-a)/(b-a)));
  const windowed=(p,a,b,c,d)=>{
    if(p<=a||p>=d)return 0;
    if(p<b)return ramp(p,a,b);
    if(p<=c)return 1;
    return 1-ramp(p,c,d);
  };

  const update=()=>{
    const r=zone.getBoundingClientRect();
    const travel=Math.max(1,zone.offsetHeight-innerHeight);
    const p=clamp(-r.top/travel);

    const sceneOpacity=[
      p<=.30 ? 1 : 1-ramp(p,.30,.345),
      windowed(p,.325,.37,.615,.665),
      p<.645 ? 0 : ramp(p,.645,.695)
    ];

    const titleOpacity=[
      p<=.285 ? 1 : 1-ramp(p,.285,.34),
      windowed(p,.325,.365,.61,.66),
      p<.642 ? 0 : ramp(p,.642,.685)
    ];

    const bodyOpacity=[
      p<=.275 ? 1 : 1-ramp(p,.275,.335),
      windowed(p,.342,.392,.60,.655),
      p<.66 ? 0 : ramp(p,.66,.71)
    ];

    let active=0;
    if(p>=.34)active=1;
    if(p>=.67)active=2;

    panels.forEach((panel,i)=>{
      const o=sceneOpacity[i];
      const t=titleOpacity[i];
      const b=bodyOpacity[i];

      const direction=i<active?-1:1;
      const panelY=((1-o)*18*direction).toFixed(2);
      const titleY=((1-t)*24*direction).toFixed(2);
      const bodyY=((1-b)*18*direction).toFixed(2);

      panel.style.setProperty("--close-opacity",o.toFixed(3));
      panel.style.setProperty("--close-y",panelY+"px");
      panel.style.setProperty("--close-title-opacity",t.toFixed(3));
      panel.style.setProperty("--close-title-y",titleY+"px");
      panel.style.setProperty("--close-title-blur",((1-t)*2.4).toFixed(2)+"px");
      panel.style.setProperty("--close-body-opacity",b.toFixed(3));
      panel.style.setProperty("--close-body-y",bodyY+"px");
      panel.style.setProperty("--close-body-blur",((1-b)*1.6).toFixed(2)+"px");

      panel.classList.toggle("is-interactive",i===active && o>.72);
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