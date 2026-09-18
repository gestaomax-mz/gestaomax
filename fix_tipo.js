// FIX TIPO + DEPARTAMENTO - NAO APAGA NADA, SO CORRIGE
(function(){
  const tipos = {
    EMP: ["Vendas", "Financas", "Financeiro", "RH", "TI", "Mkt", "Logistica", "Adm", "Administracao"],
    ESC: ["Direcao", "Secretaria", "Prof 1C", "Prof 2C", "Prof Sec", "Pedagogico", "Contab Esc", "Serv Gerais", "Seguranca", "Cantina"]
  };
  function garantirOpcoesTipo(){
    const selTipo = document.getElementById('tipoInstituicao');
    if(!selTipo) return;
    // Se estiver vazio ou só com "Tipo", cria as opções
    if(selTipo.options.length <= 1){
      selTipo.innerHTML = '<option value="">Tipo</option><option value="Empresa">Empresa</option><option value="Escola">Escola</option>';
    }
  }
  function popularDepartamento(tipoValor){
    const selDept = document.getElementById('departamento');
    if(!selDept) return;
    let lista = [];
    if(!tipoValor) lista = [];
    else if(tipoValor.toLowerCase().includes('empresa') || tipoValor==='EMP') lista = tipos.EMP;
    else if(tipoValor.toLowerCase().includes('escola') || tipoValor==='ESC') lista = tipos.ESC;
    else lista = [...tipos.EMP, ...tipos.ESC];
    
    selDept.innerHTML = '<option value="">Departamento</option>';
    lista.forEach(d=>{
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      selDept.appendChild(opt);
    });
  }
  function popularFiltroLista(){
    const selFiltro = document.getElementById('Direcao') || document.getElementById('filtroDepto');
    if(!selFiltro) return;
    const todos = [...tipos.EMP, ...tipos.ESC];
    // mantém o valor atual
    const atual = selFiltro.value;
    selFiltro.innerHTML = '<option value="">Selecione</option>';
    todos.forEach(d=>{
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      selFiltro.appendChild(opt);
    });
    if(atual) selFiltro.value = atual;
  }
  document.addEventListener('DOMContentLoaded', ()=>{
    garantirOpcoesTipo();
    popularFiltroLista();
    const selTipo = document.getElementById('tipoInstituicao');
    if(selTipo){
      selTipo.addEventListener('change', function(){ popularDepartamento(this.value); });
    }
  });
  // tenta também imediatamente
  setTimeout(()=>{ garantirOpcoesTipo(); popularFiltroLista(); }, 500);
})();