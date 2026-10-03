(() => {
  const wrap=document.getElementById("masterFilm");
  const video=document.getElementById("masterFilmVideo");
  if(!wrap||!video)return;

  const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ready=false;
  let duration=10;
  let raf=0;

  const clamp=v=>Math.min(1,Math.max(0,v));

  const progress=()=>{
    const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);
    return clamp((scrollY||document.documentElement.scrollTop)/max);
  };

  const paint=()=>{
    raf=0;
    if(!ready)return;

    const p=progress();

    if(reduce){
      const still=Math.min(duration-.05,duration*.58);
      if(Math.abs(video.currentTime-still)>.08) video.currentTime=still;
      wrap.style.setProperty("--film-opacity",".20");
      return;
    }

    const target=Math.min(duration-.045,Math.max(.01,p*(duration-.06)));
    if(!video.seeking&&Math.abs(video.currentTime-target)>.028){
      try{video.currentTime=target;}catch(e){}
    }

    const opacity=.23+(Math.sin(Math.PI*p)*.11);
    wrap.style.setProperty("--film-opacity",opacity.toFixed(3));
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