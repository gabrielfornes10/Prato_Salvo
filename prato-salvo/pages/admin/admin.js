/**
 * admin.js
 * ---------------------------------------------------------------
 * Comportamento próprio do Painel Administrativo:
 *   1) Menu lateral retrátil (abre/fecha, com "cortina" no mobile).
 *   2) Troca de seções ao clicar nos itens do menu (SPA dentro da
 *      própria página — sem recarregar, sem trocar de arquivo).
 *
 * Este arquivo não sabe nada sobre o shell/router externo — essa
 * integração fica isolada em admin-bridge.js (SRP).
 * ---------------------------------------------------------------
 */
(function () {
  "use strict";

  // MESMO valor usado no @media (max-width:900px) do admin.css.
  // Se um dia mudar o breakpoint no CSS, mude aqui também.
  var BREAKPOINT_MOBILE = 900;

  var app = document.querySelector(".app");
  var menuToggle = document.getElementById("menuToggle");
  var backdrop = document.getElementById("sidebarBackdrop");
  var navLinks = document.querySelectorAll(".nav a[data-section]");
  var viewTitle = document.getElementById("viewTitle");
  // -------------------- data de hoje --------------------

function atualizarData() {
  var elemento = document.getElementById('current-date');
  if (!elemento) return;

  var hoje = new Date();
  var texto = hoje.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // toLocaleDateString devolve tudo em minúsculas ("quarta-feira, 19...")
  // — deixamos só a primeira letra maiúscula, igual ao design original
  elemento.textContent = texto.charAt(0).toUpperCase() + texto.slice(1);
}

atualizarData();

  // -------------------- menu retrátil --------------------

  function isMobile() {
    return window.innerWidth <= BREAKPOINT_MOBILE;
  }

  function openSidebar() {
    app.classList.remove("sidebar-closed");
  }

  function closeSidebar() {
    app.classList.add("sidebar-closed");
  }

  function toggleSidebar() {
    app.classList.toggle("sidebar-closed");
  }

  // estado inicial: fechado no celular, aberto no desktop
  if (isMobile()) {
    closeSidebar();
  }

  menuToggle.addEventListener("click", toggleSidebar);
  backdrop.addEventListener("click", closeSidebar);

  // "clicar fora fecha" — funciona em qualquer tamanho de tela, não só no mobile
document.addEventListener("click", function (evento) {
  // se o menu já está fechado, não há nada a fazer
  if (app.classList.contains("sidebar-closed")) return;

  var sidebarEl = document.querySelector(".sidebar");
  var cliqueDentroDaSidebar = sidebarEl.contains(evento.target);
  var cliqueNoBotaoDeMenu = menuToggle.contains(evento.target);

  if (!cliqueDentroDaSidebar && !cliqueNoBotaoDeMenu) {
    closeSidebar();
  }
});

  // -------------------- troca de seções --------------------

  function mostrarSecao(nome) {
    // esconde todas as seções, exceto a escolhida
    document.querySelectorAll(".view").forEach(function (secao) {
      secao.hidden = secao.id !== "view-" + nome;
    });

    // marca o link correspondente como ativo
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.dataset.section === nome);
    });

    // atualiza o título no topo, se a seção tiver um data-title
    var secaoAtiva = document.getElementById("view-" + nome);
    if (secaoAtiva && viewTitle) {
      viewTitle.textContent = secaoAtiva.dataset.title || "";
    }

    // no celular, escolher uma seção também fecha o menu
    // (senão o usuário teria que fechar manualmente toda vez)
    if (isMobile()) {
      closeSidebar();
    }
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      mostrarSecao(link.dataset.section);
    });
  });
})();