/**
 * shell.js
 * ---------------------------------------------------------------
 * "Router" da plataforma Prato Salvo.
 *
 * Responsabilidades:
 *   1) Carregar as 4 páginas (landing, cliente, fornecedor, admin)
 *      cada uma em seu próprio <iframe>, totalmente isoladas —
 *      evitando qualquer colisão de CSS/JS entre elas.
 *   2) Controlar qual "view" está visível, via classe `.on`.
 *   3) Escutar mensagens (`postMessage`) vindas de dentro dos
 *      iframes (emitidas pelos arquivos *-bridge.js de cada página)
 *      para navegar entre as áreas ou abrir o modal de login.
 *   4) Controlar a abertura/fechamento do modal "Entrar/Criar conta".
 *
 * Por que iframes em vez de juntar tudo num único DOM?
 * Cada página original define variáveis CSS (--purple, --ink, --bg...)
 * com valores DIFERENTES e usa seletores genéricos (body, header,
 * main). Se fossem injetadas juntas no mesmo documento, os estilos
 * colidiriam. Isolar cada uma em seu próprio iframe preserva o HTML/
 * CSS/JS originais sem precisar reescrever nada — e ainda garante
 * que cada página continue funcionando sozinha se aberta diretamente.
 * ---------------------------------------------------------------
 */
(function () {
  "use strict";

  // referências aos 4 iframes (o `src` já está definido no index.html)
  var views = {
    landing: document.getElementById("view-landing"),
    cliente: document.getElementById("view-cliente"),
    fornecedor: document.getElementById("view-fornecedor"),
    admin: document.getElementById("view-admin")
    // cadastro: document.getElementById("view-cadastro")
  };

  var navButtons = document.querySelectorAll("#ps-nav button");

  /**
   * Exibe a view solicitada e esconde as demais.
   * Também sincroniza o estado "ativo" da barra de navegação
   * e fecha o modal de login, se estiver aberto.
   */
  function showView(nome) {
    if (!views[nome]) return;

    Object.keys(views).forEach(function (chave) {
      views[chave].classList.toggle("on", chave === nome);
    });

    navButtons.forEach(function (btn) {
      btn.classList.toggle("on", btn.dataset.view === nome);
    });

    closePicker();
    closeCadastro();
  }

  // clique direto nos botões da barra superior
  navButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      showView(btn.dataset.view);
    });
  });

  // -------------------- modal "Entrar / Criar conta" --------------------

  var overlay = document.getElementById("ps-picker-overlay");

  function openPicker() {
    overlay.classList.add("on");
  }

  function closePicker() {
    overlay.classList.remove("on");
  }

  document.getElementById("ps-picker-close").addEventListener("click", closePicker);

  // fecha o modal ao clicar fora da caixa de diálogo
  overlay.addEventListener("click", function (evento) {
    if (evento.target === overlay) closePicker();
  });

  // cada opção do modal leva a uma área da plataforma
  document.querySelectorAll("#ps-picker .opt").forEach(function (opcao) {
    opcao.addEventListener("click", function () {
      showView(opcao.dataset.view);
    });
  });

  // -------------------- modal "Criar conta" (tela de cadastro) --------------------
  // Aberto pelo botão "Criar conta" da landing. Mostra o formulário de
  // cadastro (pages/Cadastro/cadastro.html) dentro de um iframe. Quando o
  // cadastro é concluído com sucesso, cadastro.html avisa este shell via
  // postMessage({ psNav: "cliente" }) e caímos direto no fluxo normal de
  // navegação (showView), que já fecha este modal.

  var cadastroOverlay = document.getElementById("ps-cadastro-overlay");

  function openCadastro() {
    cadastroOverlay.classList.add("on");
  }

  function closeCadastro() {
    cadastroOverlay.classList.remove("on");
  }

  document.getElementById("ps-cadastro-close").addEventListener("click", closeCadastro);

  // fecha o modal ao clicar fora da caixa de diálogo
  cadastroOverlay.addEventListener("click", function (evento) {
    if (evento.target === cadastroOverlay) closeCadastro();
  });

  // -------------------- ponte de mensagens (postMessage) --------------------
  // Cada página embutida (landing, cliente, fornecedor, admin) roda
  // isolada em seu iframe e não tem acesso direto a este script.
  // Quando o usuário clica em algo que deve navegar (ex: "Sou
  // fornecedor" na landing), o arquivo <pagina>-bridge.js dispara:
  //   parent.postMessage({ psNav: "fornecedor" }, "*")
  // e nós escutamos esse evento aqui.
  window.addEventListener("message", function (evento) {
    var dados = evento.data;
    if (!dados || !dados.psNav) return;

    if (dados.psNav === "picker") {
      openPicker();
    } else if (dados.psNav === "cadastro") {
      openCadastro();
    } else {
      showView(dados.psNav);
    }
  });
})();
