// FIX DEFINITIVO - FORÇA BOTAO FUNCIONARIO
(function(){
  function getFuncs(){
    try{
      let raw = localStorage.getItem('funcionariosRH') || localStorage.getItem('funcionarios') || '[]';
      let arr = JSON.parse(raw);
      // atualiza global
      window.funcionarios = arr;
      return arr;
    }catch(e){ return []; }
  }

  function mostrarCartao(f){
    document.body.innerHTML = "";
    document.body.style="background:#f0f2f5;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:15px;font-family:Arial;";
    let d = document.createElement("div");
    d.style="background:white;border-radius:20px;max-width:420px;width:100%;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.2);";
    d.innerHTML = `<div style="background:#1565C0;color:white;padding:25px;text-align:center;"><h2>${f.nome}</h2><p>${f.codigo||f.id} - ${f.departamento||""}</p></div><div style="padding:22px;"><p><b>Base:</b> ${f.salarioBruto} MT</p><p><b>Faltas:</b> ${f.faltas}</p><p><b>Bonus:</b> ${f.bonus} MT</p><div style="background:#1565C0;color:white;padding:18px;border-radius:12px;margin-top:10px;font-size:18px;"><b>Líquido: ${Number(f.salarioLiquido).toFixed(2)} MT</b></div><button onclick="location.reload()" style="width:100%;margin-top:15px;padding:14px;background:#111;color:white;border:none;border-radius:12px;font-weight:bold;">Sair</button></div></div>`;
    document.body.appendChild(d);
  }

  function novaVerSituacao(e){
    if(e) e.preventDefault();
    let funcs = getFuncs();
    console.log("FUNCIONARIOS CARREGADOS:", funcs.length, funcs.map(x=>x.nome));

    let input = document.querySelector('input[placeholder*="Código"]') || document.querySelectorAll('input')[0];
    let termo = (input && input.value? input.value : "").trim();
    if(!termo) termo = prompt("Digite seu NOME:");
    if(!termo) return;
    termo = termo.toLowerCase();

    let f = funcs.find(x=> (x.nome||"").toLowerCase().includes(termo) || String(x.id)===termo || (x.codigo||"").toLowerCase()===termo );

    if(!f){
      alert("Não achei '"+termo+"'. Tenho: "+funcs.map(x=>x.nome).join(", "));
      return;
    }
    mostrarCartao(f);
  }

  // sobrescreve tudo
  window.verMinhaSituacao = novaVerSituacao;
  window.verSituacaoFuncionario = novaVerSituacao;
  window.checkFuncionario = novaVerSituacao;

  function ligarBotao(){
    // pega todos os botoes com texto Ver Minha Situacao
    document.querySelectorAll('button').forEach(btn=>{
      if(btn.textContent.toLowerCase().includes('ver minha')){
        console.log("LIGANDO BOTAO NOVO");
        btn.onclick = novaVerSituacao;
      }
    });
  }

  document.addEventListener('DOMContentLoaded', ligarBotao);
  setTimeout(ligarBotao, 1000);
  setTimeout(ligarBotao, 2000);
})();
