// FIX V6 - LÊ A CHAVE CERTA funcionariosRH e BLOQUEIA PAINEL DO DONO
(function(){
  console.log("FIX V6 carregado - chave funcionariosRH");
  function getFuncs(){
    try{
      let d = JSON.parse(localStorage.getItem('funcionariosRH')||'[]');
      if(d.length) return d;
    }catch(e){}
    return [];
  }
  window.verMinhaSituacao = function(){
    localStorage.setItem('gestaomax_modo','funcionario');
    let funcs = getFuncs();
    console.log("Funcionarios encontrados:", funcs.length, funcs);
    if(!funcs.length){
      alert("Nenhum funcionário no navegador. Cadastre como DONO primeiro no mesmo navegador.");
      return;
    }
    let termo = prompt("Digite seu NOME (ex: Stephan):");
    if(!termo) return;
    termo = termo.toLowerCase().trim();
    let f = funcs.find(x => (x.nome||"").toLowerCase().includes(termo));
    if(!f){
      alert("Não achei '"+termo+"'. Cadastrados: "+funcs.map(x=>x.nome).join(", "));
      return;
    }
    let base = Number(f.salarioBruto||0);
    let faltas = Number(f.faltas||0);
    let bonus = Number(f.bonus||0);
    let liquido = Number(f.salarioLiquido||0);
    // APAGA TUDO E MOSTRA SÓ O CARTÃO
    document.body.innerHTML = "";
    document.body.style = "background:#f0f2f5;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:15px;font-family:Arial;";
    let card = document.createElement("div");
    card.style = "background:white;border-radius:20px;max-width:420px;width:100%;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.2);";
    card.innerHTML = `<div style="background:#1565C0;color:white;padding:25px;text-align:center;"><h2>${f.nome}</h2><p>${f.departamento||""} - ${f.codigo||f.id||""}</p></div><div style="padding:22px;"><p><b>Base:</b> ${base} MT</p><p><b>Faltas:</b> ${faltas}</p><p><b>Bônus:</b> ${bonus} MT</p><div style="background:#1565C0;color:white;padding:18px;border-radius:12px;margin-top:10px"><b>Líquido: ${liquido.toFixed(2)} MT</b></div><button onclick="location.reload()" style="width:100%;margin-top:15px;padding:14px;background:#111;color:white;border:none;border-radius:12px;font-weight:bold;">Sair</button></div>`;
    document.body.appendChild(card);
  };
  window.verSituacaoFuncionario = window.verMinhaSituacao;
})();