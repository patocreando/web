(() => {
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  const scenes=[
    {sel:".order-section", copy:[".order-copy > p",".order-copy h2"], drift:[".order-result"]},
    {sel:".plans-x", copy:[".plans-x-heading > p",".plans-x-heading h2"], drift:[".plans-x-detail"]},
  ].map(s=>{
    const section=document.querySelector(s.sel);
    if(!section)return null;
    const copy=s.copy.map(q=>section.querySelector(q)).filter(Boolean);
    const drift=s.drift.map(q=>section.querySelector(q)).filter(Boolean);
    copy.forEach(el=>el.classList.add("kinetic-copy"));
    drift.forEach(el=>el.classList.add("kinetic-drift"));
    return {section,copy,drift};
  }).filter(Boolean);

  let raf=0;

  const phase=section=>{
    const r=section.getBoundingClientRect();
    const vh=Math.max(1,innerHeight);

    // Focus begins as the next section reaches the viewport and is complete
    // before its heading is fully visible.
    const enter=smooth(clamp((vh-r.top)/(vh*.12)));

    // Keep everything sharp through the entire sticky section.
    // Only soften/fade once the section itself is actually leaving.
    const exit=smooth(clamp(((vh*.88)-r.bottom)/(vh*.18)));

    return {enter,exit};
  };

  const paint=()=>{
    raf=0;

    scenes.forEach(scene=>{
      const {enter,exit}=phase(scene.section);

      scene.copy.forEach((el,i)=>{
        const stagger=i*.055;
        const focused=smooth(clamp((enter-stagger)/(1-stagger)));
        const y=(1-focused)*24-(exit*18);
        const opacity=.58+(focused*.42)-(exit*.30);
        const scale=.988+(focused*.012)-(exit*.006);
        const blur=(1-focused)*2.2;

        el.style.setProperty("--kinetic-y",y.toFixed(2)+"px");
        el.style.setProperty("--kinetic-opacity",clamp(opacity,.45,1).toFixed(3));
        el.style.setProperty("--kinetic-scale",scale.toFixed(4));
        el.style.setProperty("--kinetic-blur",Math.max(0,blur).toFixed(2)+"px");
      });

      scene.drift.forEach((el,i)=>{
        const stagger=.10+i*.05;
        const focused=smooth(clamp((enter-stagger)/(1-stagger)));
        const direction=i%2===0?1:-1;
        const x=(1-focused)*12*direction-(exit*6*direction);
        const y=(1-focused)*12-(exit*10);
        const opacity=.55+(focused*.45)-(exit*.26);

        el.style.setProperty("--kinetic-x",x.toFixed(2)+"px");
        el.style.setProperty("--kinetic-y",y.toFixed(2)+"px");
        el.style.setProperty("--kinetic-opacity",clamp(opacity,.48,1).toFixed(3));
      });
    });
  };

  const queue=()=>{
    if(raf)return;
    raf=requestAnimationFrame(paint);
  };

  paint();
  addEventListener("scroll",queue,{passive:true});
  addEventListener("resize",queue,{passive:true});
})();