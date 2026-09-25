/**
 * entrega.js
 * ---------------------------------------------------------------
 * Anima a tela de acompanhamento de entrega:
 *   1) Cronômetro regressivo de 25 minutos.
 *   2) Conforme o tempo passa, "acende" progressivamente o trecho
 *      percorrido da rota no mapa (SVG) e move o ícone da moto ao
 *      longo do caminho.
 * ---------------------------------------------------------------
 */
(function(){
  var totalSeconds = 25 * 60;
  var secondsLeft = totalSeconds;

  var etaEl = document.getElementById('etaTime');
  var routeDone = document.getElementById('routeDone');
  var marker = document.getElementById('courierMarker');
  var routePath = document.getElementById('route');

  var pathLength = routePath.getTotalLength();
  routeDone.setAttribute('stroke-dasharray', pathLength);
  routeDone.setAttribute('stroke-dashoffset', pathLength);

  function format(s){
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return String(m).padStart(2,'0') + ':' + String(sec).padStart(2,'0');
  }

  function render(){
    var progress = 1 - (secondsLeft / totalSeconds);
    progress = Math.min(Math.max(progress, 0), 1);

    etaEl.textContent = format(secondsLeft);
    routeDone.setAttribute('stroke-dashoffset', String(pathLength * (1 - progress)));

    var pt = routePath.getPointAtLength(pathLength * progress);
    marker.setAttribute('transform', 'translate(' + pt.x + ',' + pt.y + ')');

    if (secondsLeft <= 0){
      etaEl.textContent = 'Chegou';
    }
  }

  render();
  var timer = setInterval(function(){
    if (secondsLeft > 0){
      secondsLeft -= 1;
      render();
    } else {
      clearInterval(timer);
    }
  }, 1000);
})();