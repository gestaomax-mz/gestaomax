// FIX FUNCIONARIO V2 - GESTAOMAX
(function() {
  function getFuncionarios() {
    const keys = ["funcionarios", "gestaomax_funcionarios", "rh_funcionarios", "listaFuncionarios"];
    for (let k of keys) {
      try { let data = JSON.parse(localStorage.getItem(k) || "[]");
        if (data && data.length > 0) return data;
      } catch(e){}
    }
    return window.funcionarios || window.listaFuncionarios || [];
  }
  function normaliza(s){ return (s||"").toString().toLowerCase().trim(); }

  window.verMinhaSituacao = function() {
    let termo = "";
    const inputs = document.querySelectorAll('input');
    for (let el of inputs) { if (el.value) { termo = el.value; break; } }
    termo = normaliza(termo);
    if (!termo) { alert("Digite seu codigo ou nome."); return; }

    const funcionarios = getFuncionarios();
    let f = funcionarios.find(func => {
      const codigo = normaliza(func.codigo || func.id || func.matricula);
      const nome = normaliza(func.nome || func.name);
      return codigo === termo || nome === termo || nome.includes(termo) || codigo.includes(termo);
    });

    if (!f) { alert("Funcionário não encontrado. Você tem "+funcionarios.length+" cadastrados: "+funcionarios.map(x=>x.nome||x.name).join(", ")); return; }

    let salarioBase = f.salarioBase || f.salario_base || f.salario || 0;
    let faltas = f.faltas || f.numeroFaltas || 0;
    let bonus = f.bonus || 0;
    let liquido = f.salarioLiquido || f.liquido || (parseFloat(salarioBase)+parseFloat(bonus)-(parseFloat(faltas)*(parseFloat(salarioBase)/30)));

    let old = document.getElementById("modalFuncionarioRestrito"); if(old) old.remove();
    let modal = document.createElement("div");
    modal.id = "modalFuncionarioRestrito";
    modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;padding:15px;";
    modal.innerHTML = `<div style="background:white;border-radius:16px;max-width:400px;width:100%;overflow:hidden;">
        <div style="background:#1565C0;color:white;padding:20px;text-align:center;">
          <h2 style="margin:0;">${f.nome||"Funcionario"}</h2><p>${f.cargo||""} - ${f.codigo||f.id||""}</p>
        </div>
        <div style="padding:20px;">
          <div style="background:#f5f7ff;border-radius:10px;padding:15px;margin-bottom:12px;display:flex;justify-content:space-between;"><span>Salário Base:</span><strong>${Number(salarioBase).toLocaleString('pt-MZ')} MT</strong></div>
          <div style="background:#fff3e0;border-radius:10px;padding:15px;margin-bottom:12px;display:flex;justify-content:space-between;"><span>Nº de Faltas:</span><strong>${faltas}</strong></div>
          <div style="background:#e8f5e9;border-radius:10px;padding:15px;margin-bottom:12px;display:flex;justify-content:space-between;"><span>Bônus:</span><strong>${Number(bonus).toLocaleString('pt-MZ')} MT</strong></div>
          <div style="background:#1565C0;color:white;border-radius:10px;padding:15px;display:flex;justify-content:space-between;font-size:18px;"><span>Líquido:</span><strong>${Number(liquido).toLocaleString('pt-MZ')} MT</strong></div>
          <button onclick="document.getElementById('modalFuncionarioRestrito').remove()" style="width:100%;margin-top:15px;padding:14px;background:#111;color:white;border:none;border-radius:10px;font-weight:bold;">Fechar</button>
        </div></div>`;
    document.body.appendChild(modal);
  };
  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("button").forEach(b => {
      if (b.textContent.toLowerCase().includes("minha situa")) b.onclick = window.verMinhaSituacao;
    });
  });
})();