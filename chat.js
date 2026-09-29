(function () {
  const API = "https://agente-vendas.edusiaia.workers.dev";
  const historico = [];

  const css = document.createElement("style");
  css.textContent = `
    /* Usa as mesmas cores do site (style.css), então acompanha o tema claro/escuro.
       Texto sobre a cor de destaque usa a cor de fundo do site: contraste alto nos dois temas. */
    #cv-btn,#cv-box{
      --cv-fundo:var(--cor-fundo,#021024);--cv-sup:var(--cor-superficie,#052659);
      --cv-dest:var(--cor-destaque,#5483b3);--cv-texto:var(--cor-texto,#e8eefb);
      --cv-suave:var(--cor-texto-suave,#7da0ca);--cv-borda:var(--cor-borda,rgba(125,160,202,.2))}
    #cv-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;
      border:2px solid var(--cv-texto);background:var(--cv-dest);color:var(--cv-fundo);
      font-size:26px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,.35);z-index:9999}
    #cv-box{position:fixed;bottom:90px;right:20px;width:340px;max-width:calc(100vw - 40px);
      height:460px;max-height:calc(100vh - 110px);background:var(--cv-sup);color:var(--cv-texto);
      border:1px solid var(--cv-borda);border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.35);
      display:none;flex-direction:column;overflow:hidden;z-index:9999;
      font-family:"Inter",-apple-system,"Segoe UI",Roboto,sans-serif}
    #cv-box.aberto{display:flex}
    #cv-topo{background:var(--cv-fundo);color:var(--cv-texto);padding:12px 16px;font-weight:600;
      border-bottom:1px solid var(--cv-borda)}
    #cv-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
    .cv-m{padding:8px 12px;border-radius:10px;max-width:85%;line-height:1.45;font-size:14px;white-space:pre-wrap}
    .cv-user{background:var(--cv-dest);color:var(--cv-fundo);align-self:flex-end}
    .cv-bot{background:var(--cv-fundo);color:var(--cv-texto);border:1px solid var(--cv-borda);align-self:flex-start}
    #cv-form{display:flex;border-top:1px solid var(--cv-borda)}
    #cv-input{flex:1;border:none;padding:12px;font:inherit;font-size:14px;outline:none;
      background:var(--cv-fundo);color:var(--cv-texto)}
    #cv-input::placeholder{color:var(--cv-suave);opacity:1}
    #cv-input:focus{box-shadow:inset 0 0 0 2px var(--cv-dest)}
    #cv-enviar{border:none;background:var(--cv-dest);color:var(--cv-fundo);font:inherit;
      font-size:14px;font-weight:600;padding:0 16px;cursor:pointer}
    #cv-enviar:disabled{opacity:.6;cursor:wait}
  `;
  document.head.appendChild(css);

  document.body.insertAdjacentHTML("beforeend", `
    <button id="cv-btn" aria-label="Abrir chat">💬</button>
    <div id="cv-box">
      <div id="cv-topo">Tire suas dúvidas 👋</div>
      <div id="cv-msgs"></div>
      <form id="cv-form">
        <input id="cv-input" placeholder="Digite sua pergunta..." maxlength="800" autocomplete="off">
        <button id="cv-enviar" type="submit">Enviar</button>
      </form>
    </div>`);

  const box = document.getElementById("cv-box");
  const msgs = document.getElementById("cv-msgs");
  const input = document.getElementById("cv-input");
  const btnEnviar = document.getElementById("cv-enviar");

  function adicionar(texto, classe) {
    const div = document.createElement("div");
    div.className = "cv-m " + classe;
    div.textContent = texto; // textContent evita injeção de HTML
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  document.getElementById("cv-btn").onclick = () => {
    box.classList.toggle("aberto");
    if (!msgs.children.length) adicionar("Olá! Como posso te ajudar com nossos serviços?", "cv-bot");
    input.focus();
  };

  document.getElementById("cv-form").onsubmit = async (e) => {
    e.preventDefault();
    const texto = input.value.trim();
    if (!texto || btnEnviar.disabled) return;

    input.value = "";
    btnEnviar.disabled = true;
    adicionar(texto, "cv-user");
    historico.push({ role: "user", content: texto });
    const aguardando = adicionar("Digitando...", "cv-bot");

    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: historico.slice(-20) }),
      });
      const dados = await r.json();

      if (dados.resposta) {
        aguardando.textContent = dados.resposta;
        historico.push({ role: "assistant", content: dados.resposta });
      } else {
        aguardando.textContent = dados.erro || "Não consegui responder agora.";
        historico.pop(); // remove a pergunta que ficou sem resposta
      }
    } catch {
      aguardando.textContent = "Erro de conexão. Tente novamente.";
      historico.pop();
    } finally {
      btnEnviar.disabled = false;
      input.focus();
    }
  };
})();
