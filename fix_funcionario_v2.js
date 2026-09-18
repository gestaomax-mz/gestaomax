// FIX V3 - SEM ERRO DE NULL
(function(){
  function getFuncs(){
    try{
      let d=JSON.parse(localStorage.getItem("funcionarios")||"[]");
      if(d.length) return d;
    }catch(e){}
    try{
      let d=JSON.parse(localStorage.getItem("gestaomax_funcionarios")||"[]");
      if(d.length) return d;
    }catch(e){}
    return window.funcionarios||[];
  }
  window.verMinhaSituacao=function(){
    // pega o valor digitado na hora, com segurança
    let termo = (document.querySelector('#codigoFuncionario')?.value || document.querySelector('input[placeholder*="digo"]')?.value || prompt("Digite seu nome ou código:") || "").toLowerCase().trim();
    if(!termo){ alert("Digite seu nome"); return; }
    let funcs=getFuncs();
    if(!funcs.length){ alert("Nenhum funcionário cadastrado ainda. Entre como DONO primeiro e cadastre."); return; }
    let f=funcs.find(x=> (x.nome||"").toLowerCase().includes(termo) || (x.codigo||x.id||"").toLowerCase()===termo );
    if(!f){ alert("Não encontrado. Cadastrados: "+funcs.map(x=>x.nome).join(", ")); return; }
    let base=f.salarioBase||f.salario||0, faltas=f.faltas||0, bonus=f.bonus||0;
    let liquido=f.salarioLiquido || (Number(base)+Number(bonus)-(Number(faltas)*(Number(base)/30)));
    let old=document.getElementById("modalF"); if(old) old.remove();
    let m=document.createElement("div"); m.id="modalF";
    m.style="position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:99999;display:flex;align-items:center;justify-content:center;padding:15px;";
    m.innerHTML=`<div style="background:#fff;border-radius:16px;max-width:400px;width:100%;overflow:hidden"><div style="background:#1565C0;color:#fff;padding:20px;text-align:center"><h2>${f.nome}</h2><p>${f.codigo||""}</p></div><div style="padding:20px"><p><b>Salário Base:</b> ${base} MT</p><p><b>Faltas:</b> ${faltas}</p><p><b>Bônus:</b> ${bonus} MT</p><div style="background:#1565C0;color:#fff;padding:15px;border-radius:10px;margin-top:10px"><b>Líquido: ${Number(liquido).toFixed(2)} MT</b></div><button onclick="this.closest('#modalF').remove()" style="width:100%;margin-top:15px;padding:14px;background:#111;color:#fff;border:none;border-radius:10px">Fechar</button></div></div>`;
    m.addEventListener("click",e=>{if(e.target===m) m.remove()});
    document.body.appendChild(m);
  };
  console.log("FIX V3 OK - funcionarios:", getFuncs().length);
})();
