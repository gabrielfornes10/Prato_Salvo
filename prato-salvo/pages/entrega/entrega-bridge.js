/**
 * entrega-bridge.js
 * ---------------------------------------------------------------
 * Integração da tela de Rota de entrega com o shell/router externo.
 * Clicar na marca "Prato Salvo" retorna ao App Cliente — não à
 * landing, como nas outras páginas — porque essa tela só existe no
 * meio de uma jornada de compra: faz mais sentido o cliente voltar
 * a navegar produtos do que cair na página institucional.
 * ---------------------------------------------------------------
 */
(function () {
  var marca = document.getElementById('ps-brand');
  if (marca) {
    marca.style.cursor = 'pointer';
    marca.title = 'Voltar para o App Cliente';
    marca.addEventListener('click', function () {
      parent.postMessage({ psNav: 'cliente' }, '*');
    });
  }
})();