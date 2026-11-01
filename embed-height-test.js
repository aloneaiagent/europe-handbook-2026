(()=>{
  const send=()=>{
    const footer=document.querySelector('.site-footer');
    const height=footer ? Math.ceil(footer.getBoundingClientRect().bottom+scrollY) : document.body.scrollHeight;
    parent.postMessage({kind:'europe-handbook-height',height},'https://lam.art');
  };
  new ResizeObserver(send).observe(document.body);
  addEventListener('load',send);
  addEventListener('hashchange',()=>requestAnimationFrame(send));
  document.fonts?.ready.then(send);
  setTimeout(send,1000);
})();
