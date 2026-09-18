// FIX V4 - BLOQUEIO TOTAL FUNCIONARIO
(function(){
  function getFuncs(){
    try{let d=JSON.parse(localStorage.getItem("funcionarios")||"[]"); if(d.length) return d;}catch(e){}
    return window.funcionarios||[];
  }
  window.verMinhaSituacao=function(){
    localStorage.setItem("gestaomax_modo","funcionario");
    let termo=(document.querySelector("#codigoFuncionario")?.value||prompt("Digite seu nome:")||"").toLowerCase().trim();
    if(!termo) return;
    let funcs=getFuncs();
    if(!funcs.length){ alert("Cadastre primeiro como DONO no site online"); return; }
    let f=funcs.find(x=>(x.nome||"").toLowerCase().includes(termo));
    if(!f){ alert("Não encontrado: "+funcs.map(x=>x.nome).join(", ")); return; }
    let base=Number(f.salarioBase||f.salario||0), faltas=Number(f.faltas||0), bonus=Number(f.bonus||0);
    let liquido=Number(f.salarioLiquido||0)||base+bonus-(faltas*(base/30));
    let old=document.getElementById("modalFuncionarioSeguro"); if(old) old.remove();
    let overlay=document.createElement("div");
    overlay.id="modalFuncionarioSeguro";
    overlay.style="position:fixed;top:0;left:0;width:100%;height:100%;background:#f0f2f5;z-index:999999;display:flex;align-items:center;justify-content:center;padding:15px;";
    overlay.innerHTML=`<div style="background:white;border-radius:20px;max-width:420px;width:100%;box-shadow:0 15px 40px rgba(0,0,0,0.2);overflow:hidden;"><div style="background:#1565C0;color:white;padding:25px;text-align:center;"><h2>${f.nome}</h2><p>${f.codigo||""}</p></div><div style="padding:22px;"><p><b>Base:</b> ${base} MT</p><p><b>Faltas:</b> ${faltas}</p><p><b>Bônus:</b> ${bonus} MT</p><div style="background:#1565C0;color:white;padding:18px;border-radius:12px;margin-top:10px"><b>Líquido: ${liquido} MT</b></div><button onclick="localStorage.setItem('gestaomax_modo','dono'); location.reload();" style="width:100%;margin-top:18px;padding:14px;background:#111;color:white;border:none;border-radius:12px;font-weight:bold;">Sair</button></div></div>`;
    document.body.appendChild(overlay);
  };
})();