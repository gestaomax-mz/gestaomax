// FIX FINAL - CORRIGE TIPO, DEPARTAMENTO E MODO FUNCIONARIO
(function(){
  const tipos = {
    EMP: ["Vendas", "Financas", "Financeiro", "RH", "TI", "Mkt", "Logistica", "Adm"],
    ESC: ["Direcao", "Secretaria", "Prof 1C", "Prof 2C", "Prof Sec", "Pedagogico", "Contab Esc", "Serv Gerais", "Seguranca", "Cantina"]
  };
  function getFuncionariosAtualizados(){
    try{
      let a = JSON.parse(localStorage.getItem('funcionariosRH')||'[]');
      if(a.length) return a;
      let b = JSON.parse(localStorage.getItem('funcionarios')||'[]');
      if(b.length) return b;
      return funcionarios || [];
    }catch(e){ return funcionarios || []; }
  }
  // 1. Corrige Tipo e Departamento
  function garantirTipo(){
    const s = document.getElementById('tipoInstituicao');
    if(!s) return;
    if(s.options.length <= 1){
      s.innerHTML = '<option value="">Tipo</option><option value="Empresa">Empresa</option><option value="Escola">Escola</option>';
    }
  }
  function popDept(valor){
    const sel = document.getElementById('departamento'); if(!sel) return;
    let lista = [];
    if(!valor) lista=[];
    else if(valor.toLowerCase().includes('empresa')) lista=tipos.EMP;
    else if(valor.toLowerCase().includes('escola')) lista=tipos.ESC;
    else lista=[...tipos.EMP,...tipos.ESC];
    sel.innerHTML='<option value="">Departamento</option>';
    lista.forEach(d=>{ let o=document.createElement('option'); o.value=d; o.textContent=d; sel.appendChild(o); });
  }
  // 2. SOBRESCREVE verMinhaSituacao com versão que recarrega do localStorage
  window.verMinhaSituacao = window.verSituacaoFuncionario = function(){
    // recarrega sempre
    let funcs = getFuncionariosAtualizados();
    // atualiza variavel global
    try{ funcionarios = funcs; }catch(e){}
    
    if(!funcs.length){
      alert("Nenhum funcionário encontrado no navegador. 1) Entra como Sou Dono 2) Clica em Carregar Backup e seleciona teu ficheiro JSON 3) Volta e tenta de novo como Funcionário.");
      return;
    }
    // pega do input da tela de funcionario
    let input = document.querySelector('input[placeholder*="Código"]') || document.getElementById('codigoFuncionario') || document.querySelector('input');
    let termo = "";
    if(input && input.value) termo = input.value;
    else termo = prompt("Digite seu NOME (ex: Adilson Michel):");
    if(!termo) return;
    termo = termo.toLowerCase().trim();
    
    let f = funcs.find(x=> 
      (x.nome||"").toLowerCase().includes(termo) || 
      (x.nome||"").toLowerCase()===termo ||
      (x.codigo||"").toLowerCase()===termo ||
      String(x.id)===termo
    );
    if(!f){
      alert("Não encontrei '"+termo+"'. Cadastrados agora: "+funcs.map(x=>x.nome).join(", "));
      return;
    }
    let base = Number(f.salarioBruto||0);
    let liq = Number(f.salarioLiquido||0);
    let faltas = Number(f.faltas||0);
    let bonus = Number(f.bonus||0);
    
    document.body.innerHTML = "";
    document.body.style="background:#f0f2f5;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:15px;font-family:Arial;";
    let card = document.createElement("div");
    card.style="background:white;border-radius:20px;max-width:420px;width:100%;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.2);";
    card.innerHTML = `<div style="background:#1565C0;color:white;padding:25px;text-align:center;"><div style="width:60px;height:60px;background:white;color:#1565C0;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:bold;margin:0 auto 10px;">${f.nome.charAt(0).toUpperCase()}</div><h2 style="margin:0;">${f.nome}</h2><p style="margin:5px 0 0;opacity:.9;">${f.codigo||""} - ${f.departamento||""}</p></div><div style="padding:22px;"><div style="display:grid;gap:10px;"><div style="background:#f5f7ff;padding:14px;border-radius:10px;display:flex;justify-content:space-between;"><span>Base</span><b>${base} MT</b></div><div style="background:#fff8e1;padding:14px;border-radius:10px;display:flex;justify-content:space-between;"><span>Faltas</span><b>${faltas} dias</b></div><div style="background:#e8f5e9;padding:14px;border-radius:10px;display:flex;justify-content:space-between;"><span>Bônus</span><b>${bonus} MT</b></div><div style="background:#1565C0;color:white;padding:16px;border-radius:10px;display:flex;justify-content:space-between;"><span>Líquido</span><b>${liq.toFixed(2)} MT</b></div></div><button onclick="location.reload()" style="width:100%;margin-top:15px;padding:14px;background:#111;color:white;border:none;border-radius:12px;font-weight:bold;">Sair</button></div></div>`;
    document.body.appendChild(card);
  };
  window.checkFuncionario = window.verMinhaSituacao;
  
  document.addEventListener('DOMContentLoaded', ()=>{
    garantirTipo();
    const selTipo = document.getElementById('tipoInstituicao');
    if(selTipo) selTipo.addEventListener('change', function(){ popDept(this.value); });
  });
  setTimeout(()=>{ garantirTipo(); }, 800);
})();
