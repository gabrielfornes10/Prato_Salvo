/**
 * fornecedor-bridge.js
 * ---------------------------------------------------------------
 * Mesma ideia de landing-bridge.js: este arquivo só cuida da
 * integração do Portal do Fornecedor com o shell/router externo.
 * Aqui a única ação é permitir voltar à página inicial clicando
 * na marca "Prato Salvo" do cabeçalho.
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
