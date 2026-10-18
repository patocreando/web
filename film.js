(() => {
  const wrap=document.getElementById("masterFilm");
  const video=document.getElementById("masterFilmVideo");
  if(!wrap||!video)return;

  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sections=[...document.querySelectorAll("main > section, main > .close-flow")];
  let ready=false;
  let duration=10;
  let raf=0;

  const clamp=v=>Math.min(1,Math.max(0,v));

  const pageProgress=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    return clamp((scrollY||document.documentElement.scrollTop)/max);
  };

  const localFor=section=>{
    const r=section.getBoundingClientRect();
    const travel=Math.max(1,section.offsetHeight-innerHeight);
    return clamp(-r.top/travel);
  };

  const currentSection=()=>{
    const probe=innerHeight*.52;
    let found=null;
    for(const s of sections){
      const r=s.getBoundingClientRect();
      if(r.top<=probe&&r.bottom>=probe){found=s;break;}
    }
    return found;
  };

  const sectionOpacity=s=>{
    if(!s)return .78;
    if(s.classList.contains("hero-v3"))return .80;
    if(s.classList.contains("order-section"))return .86;
    if(s.classList.contains("cap-section"))return .84;
    if(s.classList.contains("plans-comparison"))return .82;
    if(s.classList.contains("process-overview"))return .86;
    if(s.classList.contains("close-flow"))return .80;
    if(s.classList.contains("direct-x"))return .84;
    if(s.classList.contains("before-x"))return .78;
    if(s.classList.contains("final-x"))return .86;
    return .80;
  };

  const paint=()=>{
    raf=0;
    if(!ready)return;

    const p=pageProgress();
    const current=currentSection();
    const local=current?localFor(current):p;

    if(reduce){
      const still=Math.min(duration-.05,duration*.58);
      if(Math.abs(video.currentTime-still)>.08) video.currentTime=still;
      wrap.style.setProperty("--film-opacity",".42");
      wrap.style.setProperty("--film-scale","1.04");
      wrap.style.setProperty("--film-y","0px");
      return;
    }

    const target=Math.min(duration-.045,Math.max(.01,p*(duration-.06)));
    if(!video.seeking&&Math.abs(video.currentTime-target)>.024){
      try{video.currentTime=target;}catch(e){}
    }

    const base=sectionOpacity(current);
    const pulse=Math.sin(local*Math.PI)*.05;
    wrap.style.setProperty("--film-opacity",(base+pulse).toFixed(3));
    wrap.style.setProperty("--film-brightness",(.84+Math.sin(p*Math.PI)*.08).toFixed(3));
    wrap.style.setProperty("--film-scale",(1.035+p*.035).toFixed(4));
    wrap.style.setProperty("--film-y",((p-.5)*-10).toFixed(2)+"px");
  };

  const queue=()=>{
    if(raf)return;
    raf=requestAnimationFrame(paint);
  };

  video.addEventListener("loadedmetadata",()=>{
    duration=Number.isFinite(video.duration)&&video.duration>0?video.duration:10;
    ready=true;
    wrap.classList.add("ready");
    video.pause();
    paint();
  },{once:true});

  video.addEventListener("canplay",()=>{
    if(!ready){
      ready=true;
      wrap.classList.add("ready");
      video.pause();
      paint();
    }
  },{once:true});

  addEventListener("scroll",queue,{passive:true});
  addEventListener("resize",queue,{passive:true});
  addEventListener("pageshow",queue,{passive:true});

  if(video.readyState>=1){
    duration=video.duration||10;
    ready=true;
    wrap.classList.add("ready");
    video.pause();
    paint();
  }
})();