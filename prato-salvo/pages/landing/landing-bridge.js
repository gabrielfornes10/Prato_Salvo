/**
 * landing-bridge.js
 * ---------------------------------------------------------------
 * "Ponte" entre a Landing Page (que roda isolada dentro de um
 * <iframe>) e o shell/router da plataforma (index.html na raiz).
 *
 * Como funciona:
 *   - Cada elemento clicável que deve levar o usuário a outra área
 *     da plataforma recebeu um `id` (ver landing.html).
 *   - Ao clicar, disparamos `parent.postMessage({ psNav: <destino> })`.
 *   - O shell (assets/shell/shell.js), que está fora do iframe,
 *     escuta esse evento `message` e troca a view visível.
 *
 * Vantagem dessa abordagem: a landing continua sendo um arquivo
 * HTML/CSS/JS 100% independente (pode ser aberta sozinha, testada
 * ou reaproveitada em outro projeto) — ela não importa nada do
 * shell, apenas emite eventos que ele pode (ou não) escutar.
 * ---------------------------------------------------------------
 */
(function () {
  function irPara(destino) {
    parent.postMessage({ psNav: destino }, "*");
  }

  // mapa: id do elemento -> destino de navegação no shell
  var mapaDeNavegacao = {
    "ps-brand": "landing",
    "ps-entrar": "picker",              // abre o seletor de perfil (modal)
    "ps-criar-conta": "picker",         // idem, para cadastro
    "ps-card-fornecedor": "fornecedor", // card "Tenho alimentos a oferecer"
    "ps-card-cliente": "cliente",       // card "Quero encontrar comida perto"
    "ps-cta-fornecedor": "fornecedor",  // CTA final "Sou fornecedor"
    "ps-cta-cliente": "cliente",        // CTA final "Encontrar comida perto"
    "ps-footer-fornecedor": "fornecedor",
    "ps-footer-cliente": "cliente",
    "ps-footer-admin": "admin"
  };

  Object.keys(mapaDeNavegacao).forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return; // elemento pode não existir se a página mudar no futuro
    el.style.cursor = "pointer";
    el.addEventListener("click", function (evento) {
      evento.preventDefault();
      irPara(mapaDeNavegacao[id]);
    });
  });
})();
