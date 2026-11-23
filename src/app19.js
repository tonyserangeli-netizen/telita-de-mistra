/* ============ secciones plegables ============ */
function foldKey(el){if(el.dataset.fold)return el.dataset.fold;const h=el.querySelector(":scope > h2, :scope > .gh .gt");return h?"s:"+h.textContent.trim().slice(0,40):null}
function foldApply(){
  if(!C||ui.edit)return;const F=C.fold||{};
  document.querySelectorAll("#app .pane .grp, #app .pane .sec").forEach(el=>{
    const head=el.querySelector(":scope > .gh")||el.querySelector(":scope > h2");if(!head)return;const k=foldKey(el);if(!k)return;
    el.classList.add("foldable");head.classList.add("foldhead");head.setAttribute("role","button");head.setAttribute("tabindex","0");
    const on=!!F[k];el.classList.toggle("folded",on);head.setAttribute("aria-expanded",String(!on));
    if(on&&head.tagName==="H2"&&!head.querySelector(".fcount")){const n=el.querySelectorAll(":scope > .card, :scope .card").length;if(n){const s=document.createElement("span");s.className="fcount";s.textContent=n;head.appendChild(s)}}
  });
}
(function(){
  const tog=head=>{const el=head.closest(".foldable");if(!el||!C)return;const k=foldKey(el);C.fold=C.fold||{};C.fold[k]=!C.fold[k];if(!C.fold[k])delete C.fold[k];saveSoon();el.classList.toggle("folded",!!C.fold[k]);head.setAttribute("aria-expanded",String(!C.fold[k]))};
  document.addEventListener("click",e=>{const head=e.target.closest(".foldhead");if(!head||ui.edit)return;if(e.target.closest("button,input,select,textarea,label,a"))return;tog(head)});
  document.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("foldhead")){e.preventDefault();tog(e.target)}});
})();
