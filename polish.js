(() => {
  const root=document.documentElement;
  const navLinks=[...document.querySelectorAll(".desktop-nav a[href^='#']")];
  const targets=navLinks
    .map(a=>({a,el:document.querySelector(a.getAttribute("href"))}))
    .filter(x=>x.el);

  const setPointer=(x,y)=>{
    root.style.setProperty("--mx",x+"px");
    root.style.setProperty("--my",y+"px");
  };

  if(matchMedia("(pointer:fine)").matches&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
    addEventListener("pointermove",e=>setPointer(e.clientX,e.clientY),{passive:true});
  }

  const updateNav=()=>{
    const probe=innerHeight*.42;
    let current=null;
    for(const item of targets){
      const r=item.el.getBoundingClientRect();
      if(r.top<=probe&&r.bottom>=probe) current=item;
    }
    navLinks.forEach(a=>a.classList.toggle("active",!!current&&a===current.a));
  };

  const final=document.querySelector(".final-x-inner");
  if(final&&matchMedia("(pointer:fine)").matches&&!matchMedia("(prefers-reduced-motion: reduce)").matches){
    final.addEventListener("pointermove",e=>{
      const r=final.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      final.style.transform="translate3d("+(x*6)+"px,"+(y*4)+"px,0)";
    });
    final.addEventListener("pointerleave",()=>final.style.transform="translate3d(0,0,0)");
  }

  updateNav();
  addEventListener("scroll",updateNav,{passive:true});
  addEventListener("resize",updateNav,{passive:true});
})();