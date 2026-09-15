/* =====================================================================
   SCRIPT PRINCIPAL DO SITE
   ---------------------------------------------------------------------
   Cuida de 4 coisas:
   1. Alternar entre tema escuro e claro (e lembrar a escolha)
   2. Abrir e fechar o menu "três risquinhos" no celular
   3. Acordeão de Habilidades (um bloco aberto por vez)
   4. Animação das seções ao entrarem na tela + ano no rodapé
   ===================================================================== */

// "DOMContentLoaded" dispara quando o HTML terminou de montar.
document.addEventListener("DOMContentLoaded", function () {

  /* ===================================================================
     1. ALTERNAR TEMA (ESCURO / CLARO)
     ------------------------------------------------------------------
     O tema fica no atributo data-theme do <html>. O botão inverte
     entre "dark" e "light" e salva a escolha no localStorage.
     =================================================================== */
  var botaoTema = document.getElementById("temaBotao");
  var raiz = document.documentElement; // o elemento <html>

  // Deixa o ícone certo: lua no tema escuro, sol no tema claro
  function atualizarIconeTema() {
    var temaAtual = raiz.getAttribute("data-theme");
    var icone = botaoTema.querySelector(".tema-botao__icone");
    if (icone) {
      icone.textContent = temaAtual === "light" ? "☀" : "☽";
    }
  }

  atualizarIconeTema();

  botaoTema.addEventListener("click", function () {
    var temaAtual = raiz.getAttribute("data-theme") || "dark";
    var novoTema = temaAtual === "dark" ? "light" : "dark";

    raiz.setAttribute("data-theme", novoTema);

    try {
      localStorage.setItem("tema", novoTema);
    } catch (e) {
      // Se o navegador bloquear o localStorage, o tema muda mesmo assim,
      // só não fica salvo para a próxima visita.
    }

    atualizarIconeTema();
  });


  /* ===================================================================
     2. MENU "TRÊS RISQUINHOS" (HAMBÚRGUER) NO CELULAR
     ------------------------------------------------------------------
     O botão abre/fecha a lista de links. Ao clicar num link, fecha.
     =================================================================== */
  var botaoMenu = document.getElementById("menuBotao");
  var listaMenu = document.getElementById("menuLista");

  function fecharMenu() {
    listaMenu.classList.remove("aberto");
    botaoMenu.classList.remove("ativo");
    botaoMenu.setAttribute("aria-expanded", "false");
  }

  botaoMenu.addEventListener("click", function () {
    // .toggle() adiciona a classe se não tiver, e remove se já tiver
    var estaAberto = listaMenu.classList.toggle("aberto");
    botaoMenu.classList.toggle("ativo", estaAberto);
    botaoMenu.setAttribute("aria-expanded", estaAberto ? "true" : "false");
  });

  listaMenu.querySelectorAll(".menu__link").forEach(function (link) {
    link.addEventListener("click", fecharMenu);
  });


  /* ===================================================================
     3. ACORDEÃO DE HABILIDADES (UM ABERTO POR VEZ)
     ------------------------------------------------------------------
     Cada "item" tem um botão (o título) e um painel (a lista).
     - Ao clicar num título fechado: fecha todos e abre esse.
     - Ao clicar num título já aberto: fecha ele.
     Para animar a altura, definimos a altura real do painel no
     momento de abrir (scrollHeight) e voltamos para 0 ao fechar.
     =================================================================== */
  var acordeao = document.getElementById("acordeao");
  var itens = acordeao.querySelectorAll(".acordeao__item");

  // Fecha um item específico
  function fecharItem(item) {
    var botao = item.querySelector(".acordeao__titulo");
    var painel = item.querySelector(".acordeao__painel");
    item.classList.remove("aberto");
    botao.setAttribute("aria-expanded", "false");
    painel.style.maxHeight = "0px";
  }

  // Abre um item específico
  function abrirItem(item) {
    var botao = item.querySelector(".acordeao__titulo");
    var painel = item.querySelector(".acordeao__painel");
    item.classList.add("aberto");
    botao.setAttribute("aria-expanded", "true");
    // scrollHeight = altura total do conteúdo, mesmo escondido
    painel.style.maxHeight = painel.scrollHeight + "px";
  }

  itens.forEach(function (item) {
    var botao = item.querySelector(".acordeao__titulo");

    botao.addEventListener("click", function () {
      var jaEstavaAberto = item.classList.contains("aberto");

      // Primeiro fecha todos
      itens.forEach(fecharItem);

      // Se o clicado não estava aberto, agora abre
      if (!jaEstavaAberto) {
        abrirItem(item);
      }
    });
  });

  // Se a janela mudar de tamanho, recalcula a altura do item aberto
  // (evita que o texto fique "cortado" ao girar o celular)
  window.addEventListener("resize", function () {
    var aberto = acordeao.querySelector(".acordeao__item.aberto");
    if (aberto) {
      var painel = aberto.querySelector(".acordeao__painel");
      painel.style.maxHeight = painel.scrollHeight + "px";
    }
  });


  /* ===================================================================
     4a. ANIMAÇÃO DAS SEÇÕES AO ROLAR
     ------------------------------------------------------------------
     O IntersectionObserver avisa quando um elemento entra na tela.
     Aí adicionamos a classe "visivel", que faz a seção aparecer.
     =================================================================== */
  var secoesAnimadas = document.querySelectorAll(".secao--animada");

  if ("IntersectionObserver" in window) {
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (entrada) {
        if (entrada.isIntersecting) {
          entrada.target.classList.add("visivel");
          observador.unobserve(entrada.target); // anima só uma vez
        }
      });
    }, { threshold: 0.15 });

    secoesAnimadas.forEach(function (secao) {
      observador.observe(secao);
    });
  } else {
    // Navegador antigo: mostra tudo sem animação
    secoesAnimadas.forEach(function (secao) {
      secao.classList.add("visivel");
    });
  }


  /* ===================================================================
     4b. ANO ATUAL NO RODAPÉ
     =================================================================== */
  var spanAno = document.getElementById("ano");
  if (spanAno) {
    spanAno.textContent = new Date().getFullYear();
  }

});
