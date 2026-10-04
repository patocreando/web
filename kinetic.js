(() => {
  const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
  const smooth=t=>t*t*(3-2*t);

  const scenes=[
    {sel:".order-section", copy:[".order-copy > p",".order-copy h2"], drift:[".order-result"]},
    {sel:".plans-x", copy:[".plans-x-heading > p",".plans-x-heading h2"], drift:[".plans-x-detail",".plans-x-cta"]},
    {sel:".process-x", copy:[".process-x-heading > p",".process-x-heading h2"], drift:[".process-x-side",".process-x-track"]},
    {sel:".direct-x", copy:[".direct-x-inner > p:first-child",".direct-x-inner h2"], drift:[".direct-x-meta",".direct-x-copy",".direct-x a"]},
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

  const local=section=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    return clamp(-r.top/travel);
  };

  const paint=()=>{
    raf=0;

    scenes.forEach(scene=>{
      const p=local(scene.section);

      scene.copy.forEach((el,i)=>{
        const offset=i*.055;
        const enter=smooth(clamp((p-offset)/.22));
        const exit=smooth(clamp((p-.72-offset)/.22));
        const y=(1-enter)*44-(exit*32);
        const opacity=.22+(enter*.78)-(exit*.46);
        const scale=.975+(enter*.025)-(exit*.012);
        const blur=(1-enter)*3+(exit*1.2);

        el.style.setProperty("--kinetic-y",y.toFixed(2)+"px");
        el.style.setProperty("--kinetic-opacity",clamp(opacity,.12,1).toFixed(3));
        el.style.setProperty("--kinetic-scale",scale.toFixed(4));
        el.style.setProperty("--kinetic-blur",blur.toFixed(2)+"px");
      });

      scene.drift.forEach((el,i)=>{
        const phase=.10+i*.045;
        const enter=smooth(clamp((p-phase)/.28));
        const exit=smooth(clamp((p-.80)/.18));
        const direction=i%2===0?1:-1;
        const x=(1-enter)*22*direction-(exit*10*direction);
        const y=(1-enter)*18-(exit*16);
        const opacity=.15+(enter*.85)-(exit*.42);

        el.style.setProperty("--kinetic-x",x.toFixed(2)+"px");
        el.style.setProperty("--kinetic-y",y.toFixed(2)+"px");
        el.style.setProperty("--kinetic-opacity",clamp(opacity,.10,1).toFixed(3));
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