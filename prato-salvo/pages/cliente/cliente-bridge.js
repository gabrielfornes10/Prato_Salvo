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

  // quando o cliente.js avisar que uma compra foi concluída,
  // pede ao shell pra abrir a tela de acompanhamento da entrega
  document.addEventListener("pedido-finalizado", function () {
    irPara("entrega");
  });
})();