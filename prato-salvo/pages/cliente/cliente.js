/**
 * cliente.js
 * ---------------------------------------------------------------
 * Comportamento próprio do App do Cliente:
 *   1) Busca em tempo real: filtra os cartões da lista "Perto de
 *      você" conforme o usuário digita no campo de busca.
 *   2) Favoritar: alterna estado/emoji/cor do botão de coração em
 *      cada item da lista.
 *   3) Navegação inferior: alterna a classe `.active` entre os
 *      ícones da barra inferior ao clicar.
 *
 * Assim como em landing.js, a integração com o restante da
 * plataforma fica isolada em `cliente-bridge.js`.
 * ---------------------------------------------------------------
 */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.querySelector('.search input');
  const cards = [...document.querySelectorAll('.lcard')];
  const nav = [...document.querySelectorAll('.nav-item')];

  input?.addEventListener('input', () => {
    const term = input.value.trim().toLowerCase();
    cards.forEach(card => {
      card.style.display = card.innerText.toLowerCase().includes(term) ? 'flex' : 'none';
    });
  });

  document.querySelectorAll('.heart').forEach(btn => {
    btn.setAttribute('role','button');
    btn.setAttribute('aria-label','Favoritar');
    btn.style.cursor = 'pointer';
    btn.addEventListener('click', () => {
      const active = btn.dataset.active === '1';
      btn.dataset.active = active ? '0' : '1';
      btn.textContent = active ? '🤍' : '❤️';
      btn.style.background = active ? '#F5F3F7' : '#FFF0EB';
    });
  });

  nav.forEach(item => {
    item.addEventListener('click', () => {
      nav.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
    });
  });
});

