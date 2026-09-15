/**
 * cliente-bridge.js
 * ---------------------------------------------------------------
 * Integração do App do Cliente com o shell/router externo.
 * Clicar no selo "🍅 Prato Salvo · Cliente" retorna à página inicial.
 * ---------------------------------------------------------------
 */
(function () {
  function irPara(destino) {
    parent.postMessage({ psNav: destino }, "*");
  }

  var marca = document.getElementById("ps-brand");
  if (marca) {
    marca.style.cursor = "pointer";
    marca.title = "Voltar para a página inicial";
    marca.addEventListener("click", function () {
      irPara("landing");
    });
  }
})();
