/**
 * cliente.js
 * ---------------------------------------------------------------
 * Comportamento próprio do App do Cliente:
 *   1) Busca em tempo real nos itens da lista "Perto de você".
 *   2) Favoritar itens (botão de coração).
 *   3) Navegação entre abas (menu inferior + menu superior desktop).
 *   4) Modal de compra: escolher quantidade, retirada e pagamento.
 *   5) Carrinho (sacola): adicionar, remover, ajustar quantidade,
 *      calcular subtotal/taxa/total e finalizar pedido.
 *   6) Modal de pedidos: histórico simulado de compras.
 *
 * A integração com o restante da plataforma fica isolada em
 * cliente-bridge.js (SRP) — este arquivo não sabe nada sobre o
 * shell/router externo.
 * ---------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input');
  const cards = [...document.querySelectorAll('.lcard')];
  const navItems = [...document.querySelectorAll('.nav-item')];
  const hnavLinks = [...document.querySelectorAll('.hnav a')];

  input?.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    cards.forEach(card => {
      card.style.display = card.innerText.toLowerCase().includes(term) ? 'flex' : 'none';
    });
  });

  document.querySelectorAll('.heart').forEach(btn => {
    btn.setAttribute('aria-label','Favoritar');
    btn.addEventListener('click', () => {
      const active = btn.dataset.active === '1';
      btn.dataset.active = active ? '0' : '1';
      btn.textContent = active ? '🤍' : '❤️';
      btn.style.background = active ? '#F5F3F7' : '#FFF0EB';
    });
  });

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });

  hnavLinks.forEach(link => {
    link.addEventListener('click', () => {
      hnavLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  /* ---------------- tela de comprar ---------------- */
  const overlay = document.getElementById('buy-overlay');
  const bmThumb = document.getElementById('bm-thumb');
  const bmName = document.getElementById('bm-name');
  const bmSupplier = document.getElementById('bm-supplier');
  const bmUnitPrice = document.getElementById('bm-unit-price');
  const bmTotal = document.getElementById('bm-total');
  const bmQtyVal = document.getElementById('bm-qty-val');
  const bmMinus = document.getElementById('bm-minus');
  const bmPlus = document.getElementById('bm-plus');
  const bmClose = document.getElementById('bm-close');
  const bmConfirm = document.getElementById('bm-confirm');

  let currentUnitPrice = 0;
  let currentQty = 1;
  let currentIsFree = false;

  function parsePrice(str){
    if(!str) return {value:0, isFree:true};
    const clean = str.trim().toLowerCase();
    if(clean.includes('grátis') || clean.includes('gratis')) return {value:0, isFree:true};
    const num = parseFloat(clean.replace('r$','').trim().replace(/\./g,'').replace(',','.'));
    return {value: isNaN(num) ? 0 : num, isFree:false};
  }

  function formatBRL(value){
    return 'R$ ' + value.toFixed(2).replace('.', ',');
  }

  function updateTotals(){
    bmQtyVal.textContent = currentQty;
    if(currentIsFree){
      bmUnitPrice.textContent = 'Grátis';
      bmTotal.textContent = 'Grátis';
    } else {
      bmUnitPrice.textContent = formatBRL(currentUnitPrice);
      bmTotal.textContent = formatBRL(currentUnitPrice * currentQty);
    }
  }

  function openBuyModal(card){
    const emoji = card.dataset.emoji || '🛒';
    const name = card.dataset.name || 'Item';
    const supplier = card.dataset.supplier || '';
    const priceStr = card.dataset.price || 'R$ 0,00';
    const parsed = parsePrice(priceStr);

    bmThumb.textContent = emoji;
    bmName.textContent = name;
    bmSupplier.textContent = supplier;
    currentUnitPrice = parsed.value;
    currentIsFree = parsed.isFree;
    currentQty = 1;
    updateTotals();

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBuyModal(){
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.ucard, .lcard').forEach(card => {
    card.addEventListener('click', (e) => {
      if(e.target.closest('.heart')) return;
      openBuyModal(card);
    });
  });

  bmMinus.addEventListener('click', () => {
    if(currentQty > 1){ currentQty--; updateTotals(); }
  });
  bmPlus.addEventListener('click', () => {
    currentQty++; updateTotals();
  });

  document.querySelectorAll('.bm-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const name = opt.querySelector('input').name;
      document.querySelectorAll(`.bm-opt input[name="${name}"]`).forEach(inp => {
        inp.closest('.bm-opt').classList.remove('sel');
      });
      opt.classList.add('sel');
      opt.querySelector('input').checked = true;
    });
  });

  bmClose.addEventListener('click', closeBuyModal);
  overlay.addEventListener('click', (e) => {
    if(e.target === overlay) closeBuyModal();
  });

  bmConfirm.addEventListener('click', () => {
    const retirada = document.querySelector('input[name="bm-retirada"]:checked').closest('label').textContent.trim();
    const pagamento = document.querySelector('input[name="bm-pagto"]:checked').closest('label').textContent.trim();
    addToCart({
      emoji: bmThumb.textContent,
      name: bmName.textContent,
      supplier: bmSupplier.textContent,
      unitPrice: currentUnitPrice,
      isFree: currentIsFree,
      qty: currentQty,
      retirada, pagamento
    });
    closeBuyModal();
    openBagModal('sacola');
  });

  /* ---------------- sacola / pedidos ---------------- */
  const cart = [];
  const cartBar = document.getElementById('cart-bar');
  const cartBarTxt = document.getElementById('cart-bar-txt');
  const cartBarBtn = document.getElementById('cart-bar-btn');
  const bagOverlay = document.getElementById('bag-overlay');
  const bagClose = document.getElementById('bag-close');
  const tabSacola = document.getElementById('tab-sacola');
  const tabPedidos = document.getElementById('tab-pedidos');
  const panelSacola = document.getElementById('panel-sacola');
  const panelPedidos = document.getElementById('panel-pedidos');
  const bagItemsList = document.getElementById('bag-items-list');
  const bagEmptyState = document.getElementById('bag-empty-state');
  const bagSummary = document.getElementById('bag-summary');
  const bagSubtotal = document.getElementById('bag-subtotal');
  const bagFee = document.getElementById('bag-fee');
  const bagTotal = document.getElementById('bag-total');
  const bagCheckout = document.getElementById('bag-checkout');

  function addToCart(item){
    const existing = cart.find(i => i.name === item.name && i.retirada === item.retirada && i.pagamento === item.pagamento);
    if(existing){ existing.qty += item.qty; }
    else { cart.push(item); }
    renderCartBar();
  }

  function cartSubtotal(){
    return cart.reduce((sum, i) => sum + (i.isFree ? 0 : i.unitPrice * i.qty), 0);
  }

  function cartItemCount(){
    return cart.reduce((sum, i) => sum + i.qty, 0);
  }

  function renderCartBar(){
    const count = cartItemCount();
    if(count === 0){
      cartBar.style.display = 'none';
    } else {
      cartBar.style.display = 'flex';
      cartBarTxt.innerHTML = `${count} ${count === 1 ? 'item' : 'itens'}<b>${formatBRL(cartSubtotal())}</b>`;
    }
  }

  function renderBagItems(){
    bagItemsList.innerHTML = '';
    if(cart.length === 0){
      bagEmptyState.style.display = 'block';
      bagSummary.style.display = 'none';
      bagCheckout.style.display = 'none';
      return;
    }
    bagEmptyState.style.display = 'none';
    bagSummary.style.display = 'block';
    bagCheckout.style.display = 'block';

    cart.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'bag-item';
      const priceLabel = item.isFree ? 'Grátis' : formatBRL(item.unitPrice * item.qty);
      el.innerHTML = `
        <div class="thumb">${item.emoji}</div>
        <div class="info">
          <div class="name">${item.name}</div>
          <div class="meta">${item.supplier}</div>
          <div class="qty-ctrl">
            <button type="button" data-act="minus" data-idx="${idx}" aria-label="Diminuir">−</button>
            <span>${item.qty}</span>
            <button type="button" data-act="plus" data-idx="${idx}" aria-label="Aumentar">+</button>
          </div>
        </div>
        <div class="right">
          <div class="price">${priceLabel}</div>
          <button type="button" class="remove" data-act="remove" data-idx="${idx}">Remover</button>
        </div>`;
      bagItemsList.appendChild(el);
    });

    bagItemsList.querySelectorAll('button[data-act]').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const act = btn.dataset.act;
        if(act === 'plus'){ cart[idx].qty++; }
        else if(act === 'minus'){ cart[idx].qty > 1 ? cart[idx].qty-- : cart.splice(idx, 1); }
        else if(act === 'remove'){ cart.splice(idx, 1); }
        renderBagItems();
        renderCartBar();
      });
    });

    const subtotal = cartSubtotal();
    const fee = subtotal > 0 ? 2.90 : 0;
    bagSubtotal.textContent = formatBRL(subtotal);
    bagFee.textContent = formatBRL(fee);
    bagTotal.textContent = formatBRL(subtotal + fee);
  }

  function openBagModal(tab){
    renderBagItems();
    switchBagTab(tab || 'sacola');
    bagOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeBagModal(){
    bagOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function switchBagTab(tab){
    if(tab === 'pedidos'){
      tabPedidos.classList.add('active');
      tabSacola.classList.remove('active');
      panelPedidos.style.display = 'block';
      panelSacola.style.display = 'none';
    } else {
      tabSacola.classList.add('active');
      tabPedidos.classList.remove('active');
      panelSacola.style.display = 'block';
      panelPedidos.style.display = 'none';
    }
  }

  cartBarBtn.addEventListener('click', () => openBagModal('sacola'));
  document.querySelectorAll('[data-opens-bag]').forEach(el => {
    el.addEventListener('click', () => openBagModal(el.dataset.opensBag));
  });

  tabSacola.addEventListener('click', () => switchBagTab('sacola'));
  tabPedidos.addEventListener('click', () => switchBagTab('pedidos'));

  bagClose.addEventListener('click', closeBagModal);
  bagOverlay.addEventListener('click', (e) => {
    if(e.target === bagOverlay) closeBagModal();
  });

  bagCheckout.addEventListener('click', () => {
    if(cart.length === 0) return;
    cart.length = 0;
    renderCartBar();
    switchBagTab('pedidos');
    renderBagItems();
    alert('Pedido finalizado com sucesso! Acompanhe o status em "Meus pedidos".');
  });

  renderCartBar();
});
