/**
 * admin-bridge.js
 * ---------------------------------------------------------------
 * Integração do Painel Administrativo com o shell/router externo.
 * Clicar na marca "Prato Salvo" (sidebar) retorna à página inicial.
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
