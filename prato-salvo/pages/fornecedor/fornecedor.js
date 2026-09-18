/**
 * fornecedor.js
 * ---------------------------------------------------------------
 * Comportamento próprio do Portal do Fornecedor:
 *   1) Abas do menu superior: alterna qual seção aparece (Painel /
 *      Produtos / Pedidos / Financeiro / Relatórios).
 *   2) Modal "Novo produto": abre um formulário e, ao confirmar,
 *      cria um novo card na lista "Produtos vencendo".
 *
 * A integração com o restante da plataforma (voltar pra home) fica
 * isolada em fornecedor-bridge.js (SRP).
 * ---------------------------------------------------------------
 */
(function () {
  "use strict";

  // -------------------- abas do menu superior --------------------

  var navLinks = document.querySelectorAll(".top-nav a[data-section]");

  function mostrarSecao(nome) {
    document.querySelectorAll(".view").forEach(function (secao) {
      secao.hidden = secao.id !== "view-" + nome;
    });
    navLinks.forEach(function (link) {
      link.classList.toggle("active", link.dataset.section === nome);
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      mostrarSecao(link.dataset.section);
    });
  });

  // -------------------- modal "Novo produto" --------------------

  var fab = document.querySelector(".fab");
  var overlay = document.getElementById("pm-overlay");
  var closeBtn = document.getElementById("pm-close");
  var form = document.getElementById("pm-form");
  var grid = document.querySelector(".grid");

  var nomeInput = document.getElementById("pm-nome");
  var loteInput = document.getElementById("pm-lote");
  var precoInput = document.getElementById("pm-preco");
  var validadeInput = document.getElementById("pm-validade");
  var precoField = document.getElementById("pm-preco-field");

  function abrirModal() {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function fecharModal() {
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    form.reset();
    precoField.style.display = "block";
  }

  fab.addEventListener("click", abrirModal);
  closeBtn.addEventListener("click", fecharModal);
  overlay.addEventListener("click", function (evento) {
    if (evento.target === overlay) fecharModal();
  });

  // esconde o campo de preço quando o tipo escolhido é "Doação"
  document.querySelectorAll('input[name="pm-tipo"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      precoField.style.display = (radio.value === "Doação" && radio.checked) ? "none" : "block";
    });
  });

  function diasAteVencer(dataStr) {
    var hoje = new Date();
    var vencimento = new Date(dataStr + "T00:00:00");
    var diffMs = vencimento - hoje;
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }

  function corDoBadge(dias) {
    if (dias <= 1) return "var(--red)";
    if (dias <= 3) return "var(--amber)";
    return "var(--green)";
  }

  function textoDoBadge(dias) {
    if (dias <= 0) return "Vence hoje";
    if (dias === 1) return "Vence em 1d";
    return "Vence em " + dias + "d";
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault(); // impede o navegador de recarregar a página

    var tipo = document.querySelector('input[name="pm-tipo"]:checked').value;
    var lote = loteInput.value.trim() || ("#" + Math.floor(1000 + Math.random() * 9000));
    var dias = diasAteVencer(validadeInput.value);
    var precoLabel = tipo === "Doação"
      ? "Doação"
      : "R$ " + parseFloat(precoInput.value || 0).toFixed(2).replace(".", ",");
    var imgClass = tipo === "Doação" ? "img p" : "img";

    var novoCard = document.createElement("div");
    novoCard.className = "card";
    novoCard.innerHTML =
      '<div class="' + imgClass + '"><span class="badge" style="background:' + corDoBadge(dias) + '">' + textoDoBadge(dias) + '</span>🆕</div>' +
      '<div class="body">' +
        '<h3>' + nomeInput.value + '</h3>' +
        '<div class="meta">Lote ' + lote + ' · ' + tipo + '</div>' +
        '<div class="foot"><span class="price">' + precoLabel + '</span><div class="acts"><span class="icb">✏️</span><span class="icb">⏸</span></div></div>' +
      '</div>';

    grid.prepend(novoCard); // adiciona no início da lista, bem visível
    fecharModal();
  });
})();