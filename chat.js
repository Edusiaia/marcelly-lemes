(function () {
  const API = "https://agente-vendas.SEU-SUBDOMINIO.workers.dev"; // <- seu endereço do passo 6
  const historico = [];

  const css = document.createElement("style");
  css.textContent = `
    #cv-btn{position:fixed;bottom:20px;right:20px;width:60px;height:60px;border-radius:50%;
      border:none;background:#1e3a8a;color:#fff;font-size:26px;cursor:pointer;
      box-shadow:0 4px 12px rgba(0,0,0,.25);z-index:9999}
    #cv-box{position:fixed;bottom:90px;right:20px;width:340px;max-width:calc(100vw - 40px);
      height:460px;background:#fff;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.25);
      display:none;flex-direction:column;overflow:hidden;z-index:9999;font-family:sans-serif}
    #cv-box.aberto{display:flex}
    #cv-topo{background:#1e3a8a;color:#fff;padding:12px 16px;font-weight:bold}
    #cv-msgs{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
    .cv-m{padding:8px 12px;border-radius:10px;max-width:85%;line-height:1.4;font-size:14px;white-space:pre-wrap}
    .cv-user{background:#1e3a8a;color:#fff;align-self:flex-end}
    .cv-bot{background:#f1f1f1;color:#222;align-self:flex-start}
    #cv-form{display:flex;border-top:1px solid #ddd}
    #cv-input{flex:1;border:none;padding:12px;font-size:14px;outline:none}
    #cv-enviar{border:none;background:#1e3a8a;color:#fff;padding:0 16px;cursor:pointer}
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
