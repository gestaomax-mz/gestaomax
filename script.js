// GESTAOMAX COMERCIAL V2 - CORRIGIDO - FINAL
const GMAX_KEY = 'gestaomax_licenca_v1';
const GMAX_EMPRESA = 'gestaomax_empresa_atual';
const GMX_LICENSE_LEGACY = 'GMX_LICENSE';
const MEUS_PAGAMENTOS = {
  mpesa: "852573746 - Stephan Jeque",
  emola: "868070614 - Elidio Jeque",
  nib: "904325160000026603348 - NEDBANK",
  chamadas: "868070614 / 879246937",
  whatsapp: "852573746 / 873370614"
};
const MEUS_PRECOS = "START 1.200MT | PRO 1.500MT | BUSINESS 2.500MT";

function validarChave(chave){
  if(!chave) return null;
  chave = chave.trim().toUpperCase();
  if(chave === 'DEMO' || chave === 'DEMO-7DIAS' || chave === 'ADMIN123' || chave === 'TESTE') {
    return {valida:true, empresa:'DEMO', expira:new Date(Date.now()+7*24*3600000)};
  }
  if(!chave.startsWith('GMAX-')) return null;
  let partes = chave.split('-');
  if(partes.length < 4) return null;
  let expStr = partes[partes.length-2];
  let check = partes[partes.length-1];
  let base = partes.slice(0,-1).join('-');
  let calc=0; for(let c of base) calc+=c.charCodeAt(0);
  if((calc%97).toString().padStart(2,'0')!== check) return null;
  let ano = expStr.slice(0,4), mes = expStr.slice(4,6), dia = expStr.slice(6,8);
  let expira = new Date(`${ano}-${mes}-${dia}`);
  if(isNaN(expira.getTime())) return null;
  if(new Date() > expira) return {expirada:true, data:expira};
  let nomeEmpresa = partes[1].replace(/_/g,' ');
  return {valida:true, empresa:nomeEmpresa, expira};
}

function verificarLicenca(){
  let chave = localStorage.getItem(GMAX_KEY) || localStorage.getItem(GMX_LICENSE_LEGACY) || localStorage.getItem('gmx_license') || localStorage.getItem('GMX_KEY');
  if(!chave) return {ok:false};
  let v = validarChave(chave);
  if(!v ||!v.valida) {
    if(v && v.expirada) return {ok:false, expirada:true, data:v.data};
    return {ok:false, msg:'Chave inválida'};
  }
  if(v.expirada) return {ok:false, expirada:true, data:v.data};
  return {ok:true, empresa:v.empresa, expira:v.expira, chave};
}

function telaLicenca(motivo=''){
  let telaLic = document.getElementById('telaLicenca');
  let telaLogin = document.getElementById('telaLogin');
  let sistema = document.getElementById('sistema');
  if(telaLic){
    telaLic.style.display='block';
    let pMotivo = document.getElementById('motivoLicenca');
    if(pMotivo) pMotivo.innerHTML = motivo || 'Sistema Licenciado - Insira sua chave';
  }
  if(telaLogin) telaLogin.style.display='none';
  if(sistema) sistema.style.display='none';
  let area = document.getElementById('areaLicencaInfo');
  if(area){
    area.innerHTML = `<b>M-Pesa:</b> ${MEUS_PAGAMENTOS.mpesa}<br><b>E-Mola:</b> ${MEUS_PAGAMENTOS.emola}<br><b>NIB:</b> ${MEUS_PAGAMENTOS.nib}<br><br><b>${MEUS_PRECOS}</b>`;
  }
}

window.ativarLicenca = function(){
  let input1 = document.getElementById('inputChave');
  let input2 = document.getElementById('codigoLicenca');
  let c = (input1? input1.value : '') || (input2? input2.value : '');
  c = c.trim().toUpperCase();
  if(!c){ alert('Digite a chave! Use DEMO'); return; }
  let v = validarChave(c);
  if(!v || (!v.valida &&!v.expirada)){ alert('Chave inválida! Tente DEMO'); return; }
  if(v.expirada){ alert('Expirada em '+v.data.toLocaleDateString()); return; }
  localStorage.setItem(GMAX_KEY, c);
  localStorage.setItem(GMAX_EMPRESA, v.empresa);
  localStorage.setItem(GMX_LICENSE_LEGACY, c);
  localStorage.setItem('GMX_KEY', c);
  location.reload();
}

function getEmpresaAtual(){ return localStorage.getItem(GMAX_EMPRESA) || 'GERAL'; }
function getKeyFuncionarios(){ return 'funcionariosRH_'+getEmpresaAtual().replace(/\s+/g,'_'); }
function getFuncionariosEmpresa(){
  try{
    let raw = localStorage.getItem(getKeyFuncionarios()) || localStorage.getItem('funcionariosRH') || '[]';
    return JSON.parse(raw);
  }catch{ return []; }
}
function setFuncionariosEmpresa(arr){
  let unicos = []; let vistos = new Set();
  arr.forEach(f=>{ let k=(f.nome||'').toLowerCase().trim(); if(k &&!vistos.has(k)){vistos.add(k); unicos.push(f);} });
  localStorage.setItem(getKeyFuncionarios(), JSON.stringify(unicos));
  localStorage.setItem('funcionariosRH', JSON.stringify(unicos));
  window.funcionarios = unicos;
  return unicos;
}

document.addEventListener('DOMContentLoaded', ()=>{
  let lic = verificarLicenca();
  if(!lic.ok){
    if(lic.expirada) telaLicenca('Licença expirada em '+lic.data.toLocaleDateString());
    else telaLicenca();
    return;
  }
  window.funcionarios = getFuncionariosEmpresa();
  let tLic = document.getElementById('telaLicenca');
  let tLogin = document.getElementById('telaLogin');
  if(tLic) tLic.style.display='none';
  if(tLogin) tLogin.style.display='block';
  listarFuncionarios();
});

window.funcionarios = getFuncionariosEmpresa();

function adicionarFuncionario(){
  let nome = document.getElementById('nome').value.trim();
  let tipo = document.getElementById('tipoInstituicao').value;
  let dep = document.getElementById('departamento').value;
  let salario = parseFloat(document.getElementById('salario').value) || 0;
  let faltas = parseInt(document.getElementById('faltas').value) || 0;
  let bonus = parseFloat(document.getElementById('bonus').value) || 0;
  if(!nome){ alert('Digite o nome'); return; }
  if(!tipo){ alert('Escolha Empresa ou Escola'); return; }
  if(!dep){ alert('Escolha Departamento'); return; }
  if(salario <= 0){ alert('Salario invalido'); return; }
  let lista = getFuncionariosEmpresa();
  lista.push({id: Date.now(), nome: nome, tipo: tipo, departamento: dep, salario: salario, faltas: faltas, bonus: bonus, data: new Date().toISOString()});
  setFuncionariosEmpresa(lista);
  document.getElementById('nome').value=''; document.getElementById('salario').value=''; document.getElementById('faltas').value=''; document.getElementById('bonus').value='';
  listarFuncionarios();
}

function listarFuncionarios(){
  let tbody = document.getElementById('tabelaFuncionarios');
  if(!tbody) return;
  let lista = getFuncionariosEmpresa();
  window.funcionarios = lista;
  let filtroNome = (document.getElementById('TC')?.value || '').toLowerCase().trim();
  let filtroDep = document.getElementById('Direcao')?.value || '';
  let filtrada = lista.filter(f=>{
    let okNome =!filtroNome || (f.nome||'').toLowerCase().includes(filtroNome);
    let okDep =!filtroDep || f.departamento === filtroDep;
    return okNome && okDep;
  });
  tbody.innerHTML = '';
  let totalFolha = 0;
  if(filtrada.length === 0){
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum funcionario. Clique em Listar Todos.</td></tr>';
  }
  filtrada.forEach(f=>{
    let bruto = (parseFloat(f.salario)||0) + (parseFloat(f.bonus)||0);
    let descontoFalta = (parseFloat(f.faltas)||0) * ((parseFloat(f.salario)||0)/30);
    let liquido = bruto - descontoFalta; if(liquido < 0) liquido = 0;
    totalFolha += liquido;
    let tr = document.createElement('tr');
    tr.innerHTML = `<td><b>${f.nome}</b><br><small>${f.tipo==='EMP'?'Empresa':'Escola'} - ${f.departamento}</small></td><td>${f.departamento}</td><td>${bruto.toFixed(2)} MT</td><td style="color:green;font-weight:bold">${liquido.toFixed(2)} MT</td><td><button onclick="removerFuncionario(${f.id})" class="btn btn-sm btn-danger">X</button></td>`;
    tbody.appendChild(tr);
  });
  let totalEl = document.getElementById('totalFolha');
  if(totalEl) totalEl.innerText = totalFolha.toFixed(2)+' MT';
}

function removerFuncionario(id){
  if(!confirm('Remover?')) return;
  let lista = getFuncionariosEmpresa().filter(f=>f.id!== id);
  setFuncionariosEmpresa(lista);
  listarFuncionarios();
}
function limparFiltros(){
  let tc = document.getElementById('TC'); let dir = document.getElementById('Direcao');
  if(tc) tc.value=''; if(dir) dir.value='';
  listarFuncionarios();
}
function baixarBackup(){
  let dados = {funcionarios: localStorage.getItem(getKeyFuncionarios()), empresa: getEmpresaAtual(), licenca: localStorage.getItem(GMAX_KEY), data: new Date().toISOString()};
  let blob = new Blob([JSON.stringify(dados)], {type:'application/json'});
  let url = URL.createObjectURL(blob); let a = document.createElement('a');
  a.href = url; a.download = `backup_${getEmpresaAtual()}_${new Date().toISOString().slice(0,10)}.json`; a.click();
  URL.revokeObjectURL(url);
}
function carregarBackup(event){
  const file = event.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const dados = JSON.parse(e.target.result);
      if(dados.funcionarios){ localStorage.setItem(getKeyFuncionarios(), dados.funcionarios); localStorage.setItem('funcionariosRH', dados.funcionarios); }
      alert("Backup carregado!"); location.reload();
    }catch(err){ alert("Arquivo inválido: " + err.message); }
  };
  reader.readAsText(file);
}
function mostrarAba(id){
  document.querySelectorAll('[id^=aba]').forEach(el=>el.style.display='none');
  let aba = document.getElementById(id); if(aba) aba.style.display='block';
}
document.addEventListener('DOMContentLoaded', ()=>{
  let tc = document.getElementById('TC'); if(tc) tc.addEventListener('input', listarFuncionarios);
  let dir = document.getElementById('Direcao'); if(dir) dir.addEventListener('change', listarFuncionarios);
});
function exportarFuncionarios(){ alert('Exportar - precisa XLSX'); }
function exportarFolha(){ exportarFuncionarios(); }
function imprimirFolha(){ window.print(); }
function mostrarCompras(){}
function mostrarInteligencia(){}
function adicionarProduto(){}
function registrarVenda(){}
function registrarCompra(){}
function gerarRecibo(){}
function gerarTodosRecibos(){}
