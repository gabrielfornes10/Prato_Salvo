/**
 * landing.js
 * ---------------------------------------------------------------
 * Comportamento próprio da Landing Page do Prato Salvo:
 *   1) Monta o "ticker" de resgates ao vivo (carrossel infinito com
 *      anéis de progresso indicando o tempo restante até o vencimento
 *      de cada item).
 *   2) Anima os números da seção de impacto (count-up) quando entram
 *      na viewport, usando IntersectionObserver.
 *   3) Aplica a classe `.in` em elementos [data-reveal] conforme
 *      entram na tela, disparando a transição de fade/slide definida
 *      em landing.css.
 *
 * Este arquivo NÃO conhece o restante da plataforma (cliente,
 * fornecedor, admin) — a integração com a navegação global fica
 * isolada em `landing-bridge.js`, para manter responsabilidades
 * separadas (SRP).
 * ---------------------------------------------------------------
 */

  // ---- live rescue ticker: build ring cards from real product data ----
  const items = [
    {emoji:"🍅", name:"Caixa de tomates (12kg)", supplier:"Hortifruti Boa Vista", h:8, max:24, color:"#C1443B"},
    {emoji:"🍞", name:"Pães artesanais (20un)", supplier:"Padaria Trigo Dourado", h:72, max:96, color:"#E8A33D"},
    {emoji:"🥛", name:"Iogurtes naturais (6un)", supplier:"Laticínios Serra Verde", h:48, max:96, color:"#E8A33D"},
    {emoji:"🥬", name:"Folhas verdes (8kg)", supplier:"Hortifruti Boa Vista", h:168, max:168, color:"#1F4D3D"},
    {emoji:"🍎", name:"Maçãs fuji (5kg)", supplier:"Sítio Bom Fruto", h:96, max:120, color:"#E8A33D"},
    {emoji:"🧀", name:"Queijos artesanais (1kg)", supplier:"Laticínios Serra Verde", h:12, max:24, color:"#C1443B"}
  ];
  const R = 15, C = 2 * Math.PI * R;
  function ringSvg(pct, color){
    const offset = C * (1 - pct);
    return `<svg width="34" height="34" viewBox="0 0 34 34">
      <circle class="bg" cx="17" cy="17" r="${R}"/>
      <circle class="fg" cx="17" cy="17" r="${R}" stroke="${color}" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}"/>
    </svg>`;
  }
  function timeLabel(h){ return h < 24 ? `${h}h` : `${Math.round(h/24)}d`; }
  function card(it){
    const pct = Math.max(0.06, it.h / it.max);
    return `<div class="tcard">
      <div class="photo">${it.emoji}</div>
      <div class="info"><h4>${it.name}</h4><span>${it.supplier}</span></div>
      <div class="ring">${ringSvg(pct, it.color)}<div class="rt">${timeLabel(it.h)}</div></div>
    </div>`;
  }
  const track = document.getElementById('track');
  const html = items.map(card).join('') + items.map(card).join(''); // duplicate for seamless loop
  track.innerHTML = html;

  // ---- count-up stats on scroll into view ----
  function animateCount(el){
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || "";
    const dur = 1200;
    const start = performance.now();
    function tick(now){
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = Math.round(target * eased);
      el.textContent = val.toLocaleString('pt-BR') + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const revealEls = document.querySelectorAll('[data-reveal]');
  const countEls = document.querySelectorAll('.num[data-count]');
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:.2});
  revealEls.forEach(el=>io.observe(el));

  const io2 = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        animateCount(e.target);
        io2.unobserve(e.target);
      }
    });
  }, {threshold:.4});
  countEls.forEach(el=>io2.observe(el));

