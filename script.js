// GESTAOMAX COMERCIAL V2 - COMPLETO COM GRAFICOS - FINAL v7
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

let chartRH=null, chartEstoque=null, chartVendas=null;

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
  if(telaLic) telaLic.style.display='block';
  let pMotivo = document.getElementById('motivoLicenca');
  if(pMotivo) pMotivo.innerHTML = motivo || 'Sistema Licenciado - Insira sua chave (use DEMO)';
  if(telaLogin) telaLogin.style.display='none';
  if(sistema) sistema.style.display='none';
  let area = document.getElementById('areaLicencaInfo');
  if(area){
    area.innerHTML = `<b>M-Pesa:</b> ${MEUS_PAGAMENTOS.mpesa}<br><b>E-Mola:</b> ${MEUS_PAGAMENTOS.emola}<br><b>NIB:</b> ${MEUS_PAGAMENTOS.nib}<br><br><b>${MEUS_PRECOS}</b>`;
  }
}

window.ativarLicenca = function(){
  let input1 = document.getElementById('inputChave');
  let c = (input1? input1.value : '').trim().toUpperCase();
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
function getProdutos(){ return JSON.parse(localStorage.getItem('produtos_'+getEmpresaAtual())||'[]'); }
function setProdutos(arr){ localStorage.setItem('produtos_'+getEmpresaAtual(), JSON.stringify(arr)); }
document.addEventListener('DOMContentLoaded', ()=>{
  let lic = verificarLicenca();
  if(!lic.ok){
    if(lic.expirada) telaLicenca('Licença expirada em '+lic.data.toLocaleDateString());
    else telaLicenca();
    return;
  }
  window.funcionarios = getFuncionariosEmpresa();
  let tLic = document.getElementById('telaLicenca'); if(tLic) tLic.style.display='none';
  let tLogin = document.getElementById('telaLogin'); if(tLogin) tLogin.style.display='block';
  let empNome = document.getElementById('empresaNome'); if(empNome) empNome.innerText = getEmpresaAtual();
  listarFuncionarios(); listarProdutos(); listarVendas(); listarCompras();
});
window.funcionarios = getFuncionariosEmpresa();

function getDepartamentosPorTipo(tipo){
  if(tipo==='ESC'){
    return ["Direção Geral","Direção Pedagógica","Secretaria","Professores","Financeiro / Tesouraria","Recursos Humanos","Limpeza / Higiene","Segurança","Cantina / Cozinha","Biblioteca","TI / Informática","Disciplina / Supervisão","Desporto / Cultura","Manutenção"];
  }
  if(tipo==='LOJA'){
    return ["Gerência","Vendas","Caixa","Estoque / Armazém","Atendimento ao Cliente","Marketing","Financeiro","Logística / Entregas","Compras","Segurança","Limpeza"];
  }
  return ["Administração","Financeiro","Vendas","Marketing","Recursos Humanos","Operações","TI / Sistemas","Logística","Atendimento","Produção","Contabilidade","Jurídico","Compras","Qualidade","Manutenção","Direção"];
}

function getSalarioSeguro(f){ 
  return parseFloat(f.salario ?? f.salarioBase ?? f.base ?? f.vencimento ?? 0) || 0; 
}

window.atualizarDepartamentos=function(){
  let tipo=document.getElementById('tipoInstituicao')?.value;
  let depSelect=document.getElementById('departamento');
  let filtroSelect=document.getElementById('Direcao');
  if(!depSelect) return;
  depSelect.innerHTML='<option value="">Escolha Departamento</option>';
  if(!tipo){
    depSelect.innerHTML='<option value="">Primeiro escolha o Tipo (Empresa/Escola/Loja)</option>';
    return;
  }
  let lista=getDepartamentosPorTipo(tipo);
  lista.forEach(d=>{
    let opt=document.createElement('option'); opt.value=d; opt.textContent=d; depSelect.appendChild(opt);
  });
  if(filtroSelect){
    let todos=[...new Set([...getDepartamentosPorTipo('EMP'),...getDepartamentosPorTipo('ESC'),...getDepartamentosPorTipo('LOJA')])].sort();
    filtroSelect.innerHTML='<option value="">Filtrar Departamento (Todos)</option>';
    todos.forEach(d=>{ let o=document.createElement('option'); o.value=d; o.textContent=d; filtroSelect.appendChild(o); });
  }
}

function mostrarAba(id){
  document.querySelectorAll('.aba').forEach(el=>{ el.classList.remove('ativa'); el.style.display='none'; });
  let aba = document.getElementById(id); if(aba){ aba.style.display='block'; aba.classList.add('ativa'); }
  document.querySelectorAll('.nav-tab').forEach(t=>t.classList.remove('ativa'));
  let tabMap = {abaRH:'tabRH', abaProdutos:'tabProdutos', abaVendas:'tabVendas', abaCompras:'tabCompras', abaRelatorio:'tabRelatorio', abaInteligencia:'tabInteligencia'};
  let tabId = tabMap[id]; let tabEl = document.getElementById(tabId); if(tabEl) tabEl.classList.add('ativa');
  if(id==='abaRH') setTimeout(()=>{ carregarGraficoRH(); },100);
  if(id==='abaProdutos') setTimeout(()=>{ carregarGraficoEstoque(); listarProdutos(); },100);
  if(id==='abaVendas') setTimeout(()=>{ carregarGraficoVendas(); listarVendas(); },100);
  if(id==='abaCompras') listarCompras();
  if(id==='abaInteligencia') mostrarInteligencia();
}

function adicionarFuncionario(){
  let nome = document.getElementById('nome').value.trim();
  let tipo = document.getElementById('tipoInstituicao').value;
  let dep = document.getElementById('departamento').value;
  let salario = parseFloat(document.getElementById('salario').value.replace(',', '.')) || 0;
  if(salario <= 0){ alert('ERRO: Digite um salario valido maior que 0. Ex: 25000'); document.getElementById('salario').focus(); return; }
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
  let tbody = document.getElementById('tabelaFuncionarios'); if(!tbody) return;
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
  if(filtrada.length === 0) tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">Nenhum funcionario</td></tr>';
  filtrada.forEach(f=>{
    let bruto = (parseFloat(f.salario)||0) + (parseFloat(f.bonus)||0);
    let descontoFalta = (parseFloat(f.faltas)||0) * ((parseFloat(f.salario)||0)/30);
    let liquido = bruto - descontoFalta; if(liquido < 0) liquido = 0;
    totalFolha += liquido;
    let tr = document.createElement('tr');
    tr.innerHTML = `<td><b>${f.nome}</b><br><small>${f.tipo==='EMP'?'Empresa':'Escola'} - ${f.departamento}</small></td><td>${f.departamento}</td><td>${bruto.toFixed(2)} MT</td><td style="color:green;font-weight:bold">${liquido.toFixed(2)} MT</td><td><button onclick="removerFuncionario(${f.id})" class="btn btn-sm btn-danger">X</button></td>`;
    tbody.appendChild(tr);
  });
  let totalEl = document.getElementById('totalFolha'); if(totalEl) totalEl.innerText = totalFolha.toFixed(2)+' MT';
  carregarGraficoRH();
}

function carregarGraficoRH(){
  let canvas = document.getElementById('graficoRH'); if(!canvas) return;
  let lista = getFuncionariosEmpresa();
  let counts = {}; lista.forEach(f=>{ counts[f.departamento] = (counts[f.departamento]||0)+1; });
  let labels = Object.keys(counts); let data = Object.values(counts);
  if(labels.length===0){ labels=['Sem dados']; data=[1]; }
  if(chartRH) chartRH.destroy();
  chartRH = new Chart(canvas, {type:'pie', data:{ labels:labels, datasets:[{ data:data, backgroundColor:['#0d6efd','#20c997','#ffc107','#dc3545','#6f42c1','#fd7e14','#198754'] }] }, options:{ responsive:true, plugins:{ legend:{position:'bottom'} } }});
}
function removerFuncionario(id){ if(!confirm('Remover?')) return; let lista = getFuncionariosEmpresa().filter(f=>f.id!== id); setFuncionariosEmpresa(lista); listarFuncionarios(); }
function limparFiltros(){ let tc = document.getElementById('TC'); let dir = document.getElementById('Direcao'); if(tc) tc.value=''; if(dir) dir.value=''; listarFuncionarios(); }
function baixarBackup(){
  let dados = {funcionarios: localStorage.getItem(getKeyFuncionarios()), produtos: localStorage.getItem('produtos_'+getEmpresaAtual()), vendas: localStorage.getItem('vendas_'+getEmpresaAtual()), compras: localStorage.getItem('compras_'+getEmpresaAtual()), empresa: getEmpresaAtual(), data: new Date().toISOString()};
  let blob = new Blob([JSON.stringify(dados)], {type:'application/json'}); let url = URL.createObjectURL(blob); let a = document.createElement('a'); a.href = url; a.download = `backup_${getEmpresaAtual()}_${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
}
function carregarBackup(event){
  const file = event.target.files[0]; if(!file) return; const reader = new FileReader();
  reader.onload = function(e){ try{ const dados = JSON.parse(e.target.result); if(dados.funcionarios){ localStorage.setItem(getKeyFuncionarios(), dados.funcionarios); } if(dados.produtos) localStorage.setItem('produtos_'+getEmpresaAtual(), dados.produtos); if(dados.vendas) localStorage.setItem('vendas_'+getEmpresaAtual(), dados.vendas); if(dados.compras) localStorage.setItem('compras_'+getEmpresaAtual(), dados.compras); alert("Backup carregado!"); location.reload(); }catch(err){ alert("Arquivo inválido: " + err.message); } }; reader.readAsText(file);
}
document.addEventListener('DOMContentLoaded', ()=>{ let tc = document.getElementById('TC'); if(tc) tc.addEventListener('input', listarFuncionarios); let dir = document.getElementById('Direcao'); if(dir) dir.addEventListener('change', listarFuncionarios); });

function listarProdutos(){
  let tbody = document.getElementById('tabelaProdutos'); let grid = document.getElementById('gridProdutos'); let lista = getProdutos();
  if(tbody){ tbody.innerHTML=''; if(lista.length===0) tbody.innerHTML='<tr><td colspan="4" class="text-muted">Sem produtos</td></tr>'; lista.forEach(p=>{ let tr = document.createElement('tr'); let valor = (p.preco||0)*(p.estoque||0); tr.innerHTML = `<td>${p.nome}</td><td>${(p.preco||0).toFixed(2)} MT</td><td>${p.estoque||0}</td><td>${valor.toFixed(2)} MT</td>`; tbody.appendChild(tr); }); }
  if(grid){ grid.innerHTML=''; if(lista.length===0) grid.innerHTML='<p class="text-muted">Nenhum produto</p>'; else lista.forEach(p=>{ grid.innerHTML+=`<div class="col-md-3 mb-3"><div class="card p-2 shadow-sm"><b>${p.nome}</b><p class="mb-1">${(p.preco||0).toFixed(2)} MT</p><small>Estoque: ${p.estoque}</small></div></div>`; }); }
  carregarGraficoEstoque();
}
function carregarGraficoEstoque(){
  let canvas = document.getElementById('graficoEstoque'); if(!canvas) return; let lista = getProdutos(); if(lista.length===0) return; let labels = lista.map(p=>p.nome); let data = lista.map(p=>p.estoque||0); if(chartEstoque) chartEstoque.destroy(); chartEstoque = new Chart(canvas, {type:'pie', data:{ labels:labels, datasets:[{ data:data, backgroundColor:['#0d6efd','#20c997','#ffc107','#dc3545','#6f42c1','#fd7e14','#198754','#0dcaf0'] }] }, options:{ responsive:true, plugins:{ legend:{position:'bottom'} } }});
}
function adicionarProduto(){ let nome = prompt('Nome do produto:'); if(!nome) return; let preco = parseFloat(prompt('Preco venda MT:')||'0'); let estoque = parseInt(prompt('Estoque inicial:')||'0'); let lista = getProdutos(); lista.push({id:Date.now(), nome:nome, preco:preco, estoque:estoque}); setProdutos(lista); listarProdutos(); alert('Produto '+nome+' adicionado!'); }
function registrarVenda(){ let nome = prompt('Produto vendido:'); if(!nome) return; let qtd = parseInt(prompt('Quantidade:')||'1'); let lista = getProdutos(); let p = lista.find(x=> x.nome.toLowerCase().includes(nome.toLowerCase())); if(!p){ alert('Produto nao encontrado'); return; } if((p.estoque||0) < qtd){ alert('Estoque insuficiente: '+p.estoque); return; } p.estoque -= qtd; setProdutos(lista); let vendas = JSON.parse(localStorage.getItem('vendas_'+getEmpresaAtual())||'[]'); vendas.push({id:Date.now(), produto:p.nome, qtd:qtd, preco:p.preco, total:qtd*p.preco, data:new Date().toLocaleString()}); localStorage.setItem('vendas_'+getEmpresaAtual(), JSON.stringify(vendas)); listarProdutos(); listarVendas(); alert(`Venda: ${qtd}x ${p.nome} = ${(qtd*p.preco).toFixed(2)} MT`); }
function registrarCompra(){ let nome = prompt('Produto comprado:'); if(!nome) return; let qtd = parseInt(prompt('Quantidade:')||'1'); let preco = parseFloat(prompt('Preco compra MT:')||'0'); let lista = getProdutos(); let p = lista.find(x=> x.nome.toLowerCase().includes(nome.toLowerCase())); if(p){ p.estoque += qtd; } else { lista.push({id:Date.now(), nome:nome, preco:preco*1.3, estoque:qtd}); } setProdutos(lista); let compras = JSON.parse(localStorage.getItem('compras_'+getEmpresaAtual())||'[]'); compras.push({id:Date.now(), produto:nome, qtd:qtd, preco:preco, total:qtd*preco, data:new Date().toLocaleString()}); localStorage.setItem('compras_'+getEmpresaAtual(), JSON.stringify(compras)); listarProdutos(); listarCompras(); alert('Compra registrada!'); }
function listarVendas(){ let div = document.getElementById('listaVendas'); if(!div) return; let vendas = JSON.parse(localStorage.getItem('vendas_'+getEmpresaAtual())||'[]'); if(vendas.length===0){ div.innerHTML='<p class="text-muted">Sem vendas</p>'; return; } let total = vendas.reduce((s,v)=>s+(v.total||0),0); div.innerHTML = `<p><b>Total Vendido:</b> ${total.toFixed(2)} MT</p><table class="table table-sm"><thead class="table-dark"><tr><th>Data</th><th>Produto</th><th>Qtd</th><th>Total</th></tr></thead><tbody>` + vendas.slice().reverse().map(v=>`<tr><td>${v.data}</td><td>${v.produto}</td><td>${v.qtd}</td><td>${(v.total||0).toFixed(2)} MT</td></tr>`).join('') + '</tbody></table>'; }
function carregarGraficoVendas(){ let canvas = document.getElementById('graficoVendas'); if(!canvas) return; let vendas = JSON.parse(localStorage.getItem('vendas_'+getEmpresaAtual())||'[]'); if(vendas.length===0) return; let map = {}; vendas.forEach(v=>{ map[v.produto]=(map[v.produto]||0)+v.total; }); let labels = Object.keys(map); let data = Object.values(map); if(chartVendas) chartVendas.destroy(); chartVendas = new Chart(canvas, {type:'bar', data:{ labels:labels, datasets:[{ label:'Vendas MT', data:data, backgroundColor:'#0d6efd' }] }, options:{ responsive:true }}); }
function listarCompras(){ let div = document.getElementById('listaCompras'); if(!div) return; let compras = JSON.parse(localStorage.getItem('compras_'+getEmpresaAtual())||'[]'); if(compras.length===0){ div.innerHTML='<p class="text-muted">Sem compras</p>'; return; } let total = compras.reduce((s,c)=>s+(c.total||0),0); div.innerHTML = `<p><b>Total Comprado:</b> ${total.toFixed(2)} MT</p><table class="table table-sm"><thead class="table-dark"><tr><th>Data</th><th>Produto</th><th>Qtd</th><th>Total</th></tr></thead><tbody>` + compras.slice().reverse().map(c=>`<tr><td>${c.data}</td><td>${c.produto}</td><td>${c.qtd}</td><td>${(c.total||0).toFixed(2)} MT</td></tr>`).join('') + '</tbody></table>'; }
function carregarCatalogo(){ listarProdutos(); }

function exportarFuncionarios(){ let lista = getFuncionariosEmpresa(); if(lista.length===0){ alert('Nenhum funcionario'); return; } let csv = "Nome,Tipo,Departamento,Salario,Bonus,Faltas,Bruto,Liquido\n"; lista.forEach(f=>{ let bruto = (parseFloat(f.salario)||0)+(parseFloat(f.bonus)||0); let liq = bruto - ((parseFloat(f.faltas)||0)*((parseFloat(f.salario)||0)/30)); if(liq<0) liq=0; csv += `"${f.nome}","${f.tipo}","${f.departamento}",${f.salario},${f.bonus},${f.faltas},${bruto.toFixed(2)},${liq.toFixed(2)}\n`; }); let blob = new Blob([csv], {type:'text/csv;charset=utf-8;'}); let url = URL.createObjectURL(blob); let a = document.createElement('a'); a.href=url; a.download=`funcionarios_${getEmpresaAtual()}_${new Date().toISOString().slice(0,10)}.csv`; a.click(); URL.revokeObjectURL(url); }
function exportarFolha(){ exportarFuncionarios(); }
function imprimirFolha(){ let lista = getFuncionariosEmpresa(); let w = window.open('','','width=800,height=600'); let html = `<html><head><title>Folha ${getEmpresaAtual()}</title><style>body{font-family:Arial} table{width:100%;border-collapse:collapse} th,td{border:1px solid #ccc;padding:8px} th{background:#0d6efd;color:white}</style></head><body><h2>Folha - ${getEmpresaAtual()}</h2><table><tr><th>Nome</th><th>Depto</th><th>Base</th><th>Bonus</th><th>Faltas</th><th>Liquido</th></tr>`; lista.forEach(f=>{ let liq = (parseFloat(f.salario)||0)+(parseFloat(f.bonus)||0) - ((parseFloat(f.faltas)||0)*((parseFloat(f.salario)||0)/30)); if(liq<0) liq=0; html+=`<tr><td>${f.nome}</td><td>${f.departamento}</td><td>${f.salario}</td><td>${f.bonus}</td><td>${f.faltas}</td><td>${liq.toFixed(2)} MT</td></tr>`; }); html+=`</table><script>window.print();<\/script></body></html>`; w.document.write(html); w.document.close(); }

function gerarTodosRecibos(){
  let lista = getFuncionariosEmpresa();
  if(lista.length===0){ alert('Sem funcionarios'); return; }
  let w = window.open('','','width=800,height=900');
  let html = `<html><head><style>body{font-family:Arial}.recibo{border:1px solid #000;padding:15px;margin-bottom:20px;page-break-after:always}</style></head><body><h1>Recibos - ${getEmpresaAtual()} - ${new Date().toLocaleDateString()}</h1>`;
  lista.forEach(f=>{
    let salarioNum = getSalarioSeguro(f);
    let bonusNum = parseFloat(f.bonus ?? f.bonusBase ?? 0);
    let faltasNum = parseInt(f.faltas ?? 0);
    let bruto = salarioNum + bonusNum;
    let desconto = faltasNum * (salarioNum/30);
    let liq = bruto - desconto; if(liq<0) liq=0;
    html+=`<div class="recibo"><h3>${f.nome} - ${f.departamento}</h3><p>Base: ${salarioNum.toFixed(2)} MT | Bonus: ${bonusNum.toFixed(2)} MT | Faltas: ${faltasNum}</p><p><b>Liquido: ${liq.toFixed(2)} MT</b></p><p>Ass: ___________________</p></div>`;
  });
  html+=`<script>window.print()<\/script></body></html>`;
  w.document.write(html); w.document.close();
}

function gerarRecibo(){
  let nome = prompt('Recibo para funcionario (nome):'); if(!nome) return;
  let f = getFuncionariosEmpresa().find(x=> x.nome.toLowerCase().includes(nome.toLowerCase()));
  if(!f){ alert('Funcionario nao encontrado'); return; }
  let salarioNum = getSalarioSeguro(f);
  let bonusNum = parseFloat(f.bonus ?? 0);
  let faltasNum = parseInt(f.faltas ?? 0);
  let bruto = salarioNum + bonusNum;
  let desconto = faltasNum * (salarioNum/30);
  let liquido = bruto - desconto; if(liquido<0) liquido=0;
  let w = window.open('','','width=600,height=700');
  w.document.write(`<html><head><style>body{font-family:Arial;padding:20px}.recibo{border:2px solid #000;padding:20px}</style></head><body><div class="recibo"><h2>RECIBO SALARIAL - ${getEmpresaAtual()}</h2><p><b>Funcionario:</b> ${f.nome}</p><p><b>Departamento:</b> ${f.departamento}</p><p><b>Salario Base:</b> ${salarioNum.toFixed(2)} MT</p><p><b>Bonus:</b> ${bonusNum.toFixed(2)} MT</p><p><b>Faltas:</b> ${faltasNum}</p><p><b>Bruto:</b> ${bruto.toFixed(2)} MT</p><p><b>Desconto Faltas:</b> ${desconto.toFixed(2)} MT</p><h3>Liquido: ${liquido.toFixed(2)} MT</h3><p>Data: ${new Date().toLocaleDateString()}</p><br><br><p>Assinatura: ___________________________</p></div><script>window.print()<\/script></body></html>`);
  w.document.close();
}
function mostrarInteligencia(){ let lista = getFuncionariosEmpresa(); let totalBruto = lista.reduce((s,f)=> s + ((parseFloat(f.salario)||0)+(parseFloat(f.bonus)||0)), 0); let totalLiquido = lista.reduce((s,f)=>{ let b=(parseFloat(f.salario)||0)+(parseFloat(f.bonus)||0); let d=(parseFloat(f.faltas)||0)*((parseFloat(f.salario)||0)/30); let l=b-d; if(l<0)l=0; return s+l; },0); let vendas = JSON.parse(localStorage.getItem('vendas_'+getEmpresaAtual())||'[]'); let compras = JSON.parse(localStorage.getItem('compras_'+getEmpresaAtual())||'[]'); let totalVendas = vendas.reduce((s,v)=>s+(v.total||0),0); let totalCompras = compras.reduce((s,c)=>s+(c.total||0),0); let produtos = getProdutos(); let valorEstoque = produtos.reduce((s,p)=>s+((p.preco||0)*(p.estoque||0)),0); let div = document.getElementById('inteligenciaDados'); if(div) div.innerHTML = `<p><b>Total Funcionarios:</b> ${lista.length}</p><p><b>Folha Bruta:</b> ${totalBruto.toFixed(2)} MT</p><p><b>Folha Liquida:</b> ${totalLiquido.toFixed(2)} MT</p><p><b>Valor Estoque:</b> ${valorEstoque.toFixed(2)} MT</p><p><b>Total Vendas:</b> ${totalVendas.toFixed(2)} MT</p><p><b>Total Compras:</b> ${totalCompras.toFixed(2)} MT</p><p><b>Lucro:</b> ${(totalVendas - totalCompras).toFixed(2)} MT</p>`; }
function entrarFunc(){
  let codInput = document.getElementById('codFunc'); if(!codInput){ alert('Campo nao encontrado'); return; }
  let cod = codInput.value.trim().toLowerCase(); if(!cod){ alert('Digite seu nome'); return; }
  let funcs = getFuncionariosEmpresa(); let f = funcs.find(x=> (x.nome||'').toLowerCase().includes(cod));
  if(!f){ alert('Funcionario "'+cod+'" nao encontrado. Cadastre como Dono primeiro.'); return; }
  let tLogin = document.getElementById('telaLogin'); if(tLogin) tLogin.style.display='none';
  let tSis = document.getElementById('sistema'); if(tSis) tSis.style.display='none';
  let tCli = document.getElementById('sistemaCliente'); if(tCli) tCli.style.display='none';
  let telaFunc = document.getElementById('sistemaFunc'); if(telaFunc) telaFunc.style.display='block';
  let dadosDiv = document.getElementById('dadosFunc');
  if(dadosDiv){
    let salarioNum = parseFloat(f.salario||0); let bonusNum = parseFloat(f.bonus||0); let faltasNum = parseInt(f.faltas||0);
    let bruto = salarioNum + bonusNum; let desconto = faltasNum * (salarioNum/30); let liquido = bruto - desconto; if(liquido < 0) liquido = 0;
    dadosDiv.innerHTML = `<div style="text-align:center"><div style="width:70px;height:70px;background:#0d6efd;color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:30px;margin:auto">${(f.nome||'S').charAt(0)}</div><h4>${f.nome}</h4><small>${f.departamento}</small></div><p><b>Base:</b> ${salarioNum.toFixed(2)} MT</p><p><b>Bonus:</b> ${bonusNum.toFixed(2)} MT</p><p><b>Faltas:</b> ${faltasNum}</p><p><b>Liquido:</b> <span style="color:green;font-weight:bold">${liquido.toFixed(2)} MT</span></p>`;
  }
}
function entrarCliente(){ let tLogin = document.getElementById('telaLogin'); if(tLogin) tLogin.style.display='none'; let tSis = document.getElementById('sistema'); if(tSis) tSis.style.display='none'; let tFunc = document.getElementById('sistemaFunc'); if(tFunc) tFunc.style.display='none'; let telaCli = document.getElementById('sistemaCliente'); if(telaCli) telaCli.style.display='block'; listarProdutos(); }
function logout(){ let t1 = document.getElementById('sistema'); if(t1) t1.style.display='none'; let t2 = document.getElementById('sistemaFunc'); if(t2) t2.style.display='none'; let t3 = document.getElementById('sistemaCliente'); if(t3) t3.style.display='none'; let tLogin = document.getElementById('telaLogin'); if(tLogin) tLogin.style.display='block'; let lic = verificarLicenca(); if(!lic.ok) telaLicenca(); }
function setRole(r){ document.querySelectorAll('.role-btn').forEach(b=>b.classList.remove('ativo')); let btn = document.getElementById('r'+r.charAt(0).toUpperCase()+r.slice(1)); if(btn) btn.classList.add('ativo'); let dDono = document.getElementById('loginDono'); if(dDono) dDono.style.display = r==='admin'?'block':'none'; let dFunc = document.getElementById('loginFunc'); if(dFunc) dFunc.style.display = r==='func'?'block':'none'; let dCli = document.getElementById('loginCliente'); if(dCli) dCli.style.display = r==='cliente'?'block':'none'; }
function fazerLogin(){ let u = document.getElementById('usuario').value; let s = document.getElementById('senha').value; if(u==='admin' && s==='1234'){ let tLogin = document.getElementById('telaLogin'); if(tLogin) tLogin.style.display='none'; let tSis = document.getElementById('sistema'); if(tSis) tSis.style.display='block'; let empNome = document.getElementById('empresaNome'); if(empNome) empNome.innerText = getEmpresaAtual(); listarFuncionarios(); listarProdutos(); }else{ let err = document.getElementById('erroLogin'); if(err) err.style.display='block'; } }

// ===== v12 - STOCK BAIXO + CALCULADORA KILOS =====
function verificarStockBaixo(){
  return getProdutos().filter(p => (p.estoque||0) <= (p.minStock||5) );
}
function mostrarAlertasStock(){
  let div=document.getElementById('alertasStock'); if(!div) return;
  let baixos=verificarStockBaixo();
  if(baixos.length===0){ div.innerHTML=`<div class="alert alert-success">✅ Stock OK</div>`; return; }
  let html=`<div class="alert alert-danger"><b>⚠️ ${baixos.length} produto(s) prestes a acabar!</b></div><table class="table table-sm table-danger"><tr><th>Produto</th><th>Atual</th><th>Mín</th><th>Repor</th><th></th></tr>`;
  baixos.forEach(p=>{
    let ideal=p.estoqueIdeal|| (p.unidade==='kg'?50:20);
    let repor=Math.max(0, ideal - (p.estoque||0));
    html+=`<tr><td><b>${p.nome}</b> (${p.unidade||'un'})</td><td>${p.estoque}</td><td>${p.minStock||5}</td><td style="color:green"><b>+${repor.toFixed(p.unidade==='kg'?3:0)} ${p.unidade||'un'}</b></td><td><button onclick="registrarCompraRapida('${p.nome}')" class="btn btn-sm btn-warning">Repor</button></td></tr>`;
  });
  html+=`</table>`; div.innerHTML=html;
}
function registrarCompraRapida(nome){
  let qtd=parseFloat(prompt(`Quanto repor de ${nome}?`)||'0'); if(qtd<=0) return;
  let lista=getProdutos(); let p=lista.find(x=>x.nome===nome);
  if(p){ p.estoque+=qtd; setProdutos(lista); listarProdutos(); alert(`Reposto! Stock: ${p.estoque}`); }
}
function atualizarSelectCalculadora(){
  let sel=document.getElementById('calcProdutoKilo'); if(!sel) return;
  let pesados=getProdutos().filter(p=>p.unidade==='kg'||p.unidade==='litro');
  sel.innerHTML='<option value="">Escolha produto KG/Litro</option>';
  pesados.forEach(p=>{ let o=document.createElement('option'); o.value=p.nome; o.textContent=`${p.nome} - ${p.preco.toFixed(2)} MT/${p.unidade}`; sel.appendChild(o); });
  if(pesados.length===0) sel.innerHTML='<option value="">Nenhum produto KG - Adicione com UN=KG</option>';
}
function calcularKilos(){
  let sel=document.getElementById('calcProdutoKilo'); let val=document.getElementById('calcValorCliente'); let res=document.getElementById('calcResultadoKilo'); if(!sel||!val||!res) return;
  let p=getProdutos().find(x=>x.nome===sel.value); if(!p){ res.innerHTML='<small>Escolha produto</small>'; return; }
  let valor=parseFloat(val.value.replace(',','.'))||0;
  if(valor<=0){ res.innerHTML=`<b>${p.nome}</b>: ${p.preco.toFixed(2)} MT/${p.unidade}<br><small>Digite valor que cliente quer pagar</small>`; return; }
  let kilos=valor/(p.preco||1); let ok=(p.estoque||0)>=kilos;
  res.innerHTML=`<div class="card p-2 ${ok?'bg-light':'bg-danger text-white'}"><b>${p.nome}</b><br>Cliente: ${valor.toFixed(2)} MT = <b style="font-size:1.3em">${kilos.toFixed(3)} ${p.unidade}</b><br>Stock: ${p.estoque} ${p.unidade} ${ok?'✅':'❌'}<br>${ok?`<button onclick="venderKilos('${p.nome}',${kilos},${valor})" class="btn btn-sm btn-success mt-1">Confirmar Venda</button>`:''}</div>`;
}
function venderKilos(nome,kilos,valor){
  if(!confirm(`Vender ${kilos.toFixed(3)} de ${nome} por ${valor.toFixed(2)} MT?`)) return;
  let lista=getProdutos(); let p=lista.find(x=>x.nome===nome); if(!p||p.estoque<kilos){ alert('Stock insuficiente'); return; }
  p.estoque-=kilos; setProdutos(lista);
  let vendas=JSON.parse(localStorage.getItem('vendas_'+getEmpresaAtual())||'[]');
  vendas.push({id:Date.now(), produto:`${p.nome} (${kilos.toFixed(3)}${p.unidade})`, qtd:kilos, preco:p.preco, total:valor, data:new Date().toLocaleString()});
  localStorage.setItem('vendas_'+getEmpresaAtual(), JSON.stringify(vendas));
  listarProdutos(); listarVendas(); alert(`Venda: ${kilos.toFixed(3)} ${p.unidade} = ${valor.toFixed(2)} MT`);
}

// Melhora adicionarProduto para perguntar KG
let adicionarProduto_old = adicionarProduto;
window.adicionarProduto = function(){
  let nome=prompt('Nome do produto:'); if(!nome) return;
  let uni=prompt('Unidade: UN, KG, L (padrão UN):','UN')||'UN'; uni=uni.toLowerCase();
  if(uni.startsWith('k')) uni='kg'; else if(uni.startsWith('l')) uni='litro'; else uni='un';
  let preco=parseFloat(prompt(`Preço por ${uni} em MT:`)||'0');
  let est=parseFloat(prompt(`Stock inicial em ${uni}:`)||'0');
  let min=parseInt(prompt(`Avisar quando for menor que? (5)`)||'5');
  let ideal=parseInt(prompt(`Stock ideal? (20)`)||'20');
  let lista=getProdutos(); lista.push({id:Date.now(), nome, unidade:uni, preco, estoque:est, minStock:min, estoqueIdeal:ideal});
  setProdutos(lista); listarProdutos();
}
function listarProdutos(){
  let tbody=document.getElementById('tabelaProdutos'); let lista=getProdutos();
  if(tbody){
    tbody.innerHTML=''; lista.forEach(p=>{
      let baixo=(p.estoque||0)<=(p.minStock||5);
      let tr=document.createElement('tr'); if(baixo) tr.className='table-danger';
      tr.innerHTML=`<td>${p.nome} (${p.unidade||'un'}) ${baixo?'<span class="badge bg-danger">BAIXO</span>':''}</td><td>${p.preco.toFixed(2)} MT/${p.unidade||'un'}</td><td>${p.estoque}</td><td>${(p.preco*p.estoque).toFixed(2)} MT</td><td>Min:${p.minStock||5}</td>`;
      tbody.appendChild(tr);
    });
  }
  if(typeof carregarGraficoEstoque==='function') carregarGraficoEstoque();
  mostrarAlertasStock(); atualizarSelectCalculadora();
}

// ===== v14 - CATÁLOGO CLIENTE COM FOTOS + WHATSAPP =====
function getEmpresaWhats(){ return localStorage.getItem('empresa_whats_'+getEmpresaAtual())||''; }
function setEmpresaWhats(num){ localStorage.setItem('empresa_whats_'+getEmpresaAtual(), num); }

function getClientesWhats(){ return JSON.parse(localStorage.getItem('clientes_whats_'+getEmpresaAtual())||'[]'); }
function setClientesWhats(arr){ localStorage.setItem('clientes_whats_'+getEmpresaAtual(), JSON.stringify(arr)); }
function addClienteWhats(nome, telefone, produto){
  let lista=getClientesWhats();
  lista.unshift({id:Date.now(), nome:nome||'Cliente', telefone, produto, data:new Date().toLocaleString()});
  if(lista.length>50) lista=lista.slice(0,50);
  setClientesWhats(lista); listarClientesWhats();
}

function getFotoProduto(nome){
  let n=(nome||'').toLowerCase();
  if(n.includes('arroz')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
  if(n.includes('feijao')||n.includes('feijão')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400';
  if(n.includes('acucar')||n.includes('açucar')) return 'https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=400';
  if(n.includes('oleo')||n.includes('óleo')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400';
  if(n.includes('farinha')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400';
  if(n.includes('milho')) return 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400';
  // generico
  return `https://via.placeholder.com/400x300/0d6efd/ffffff?text=${encodeURIComponent(nome)}`;
}

window.carregarCatalogo=function(){
  let grid=document.getElementById('gridCatalogo'); if(!grid) return;
  let lista=getProdutos(); let busca=(document.getElementById('buscaCatalogo')?.value||'').toLowerCase();
  if(busca) lista=lista.filter(p=>p.nome.toLowerCase().includes(busca));
  let whats=getEmpresaWhats();
  if(lista.length===0){
    grid.innerHTML=`<div class="col-12 text-center p-5"><h4>📦 Nenhum produto cadastrado</h4><p>Vai em <b>Produtos / Estoque > + Produto</b> e adicione Arroz, Feijão etc</p><p>As fotos baixam online automaticamente</p></div>`;
    return;
  }
  grid.innerHTML='';
  lista.forEach(p=>{
    let foto=p.foto||getFotoProduto(p.nome);
    let card=document.createElement('div'); card.className='col-md-3 col-6';
    card.innerHTML=`
      <div class="card shadow-sm h-100">
        <img src="${foto}" class="card-img-top" style="height:180px;object-fit:cover" onerror="this.src='https://via.placeholder.com/300?text=${p.nome}'">
        <div class="card-body d-flex flex-column">
          <h6 class="card-title">${p.nome} <small class="text-muted">(${p.unidade||'un'})</small></h6>
          <p class="mb-1"><b style="color:#0d6efd">${p.preco.toFixed(2)} MT</b> / ${p.unidade||'un'}</p>
          <p class="small ${p.estoque<= (p.minStock||5)?'text-danger':'text-success'}">Stock: ${p.estoque} ${p.unidade||'un'} ${p.estoque<=5?'⚠️ Baixo':''}</p>
          <div class="mt-auto d-grid gap-1">
            <button onclick="pedirWhats('${p.nome}', ${p.preco})" class="btn btn-success btn-sm">💬 Pedir no WhatsApp</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

window.pedirWhats=function(nomeProduto, preco){
  let whats=getEmpresaWhats();
  if(!whats || whats.length<9){ alert('Primeiro configura o número da empresa no topo! Ex: 258841234567'); document.getElementById('inputEmpresaWhats').focus(); return; }
  let nomeCliente=prompt('Seu nome:')||'Cliente';
  let telCliente=prompt('Seu WhatsApp (para a loja te responder):')||'';
  let msg=`Olá ${getEmpresaAtual()}! Quero ${nomeProduto} por ${preco.toFixed(2)} MT. Sou ${nomeCliente}`;
  addClienteWhats(nomeCliente, telCliente, nomeProduto);
  let url=`https://wa.me/${whats.replace(/\D/g,'')}?text=${encodeURIComponent(msg)}`;
  window.open(url, '_blank');
}

function listarClientesWhats(){
  let div=document.getElementById('listaClientesWhats'); if(!div) return;
  let lista=getClientesWhats();
  if(lista.length===0){ div.innerHTML='<p class="text-muted">Nenhum cliente ainda - quando cliente clicar em Pedir no WhatsApp, aparece aqui</p>'; return; }
  let html=`<table class="table table-sm"><tr><th>Data</th><th>Cliente</th><th>Telefone</th><th>Produto</th><th>Ação</th></tr>`;
  lista.forEach(c=>{
    let whats=getEmpresaWhats();
    let url=`https://wa.me/${(c.telefone||'').replace(/\D/g,'')}?text=${encodeURIComponent('Olá '+c.nome+' sobre '+c.produto)}`;
    html+=`<tr><td>${c.data}</td><td>${c.nome}</td><td>${c.telefone||'-'}</td><td>${c.produto}</td><td><a href="${url}" target="_blank" class="btn btn-sm btn-outline-success">Responder</a></td></tr>`;
  });
  html+=`</table>`; div.innerHTML=html;
}

window.entrarCliente=function(){
  document.getElementById('telaLogin').style.display='none';
  document.getElementById('sistema').style.display='none';
  document.getElementById('sistemaCliente').style.display='block';
  document.getElementById('catalogoEmpresaNome').innerText=getEmpresaAtual();
  let inputWhats=document.getElementById('inputEmpresaWhats');
  if(inputWhats){
    inputWhats.value=getEmpresaWhats();
    inputWhats.onchange=function(){ setEmpresaWhats(this.value); atualizarBtnWhats(); }
    inputWhats.oninput=function(){ setEmpresaWhats(this.value); atualizarBtnWhats(); }
  }
  function atualizarBtnWhats(){
    let btn=document.getElementById('btnWhatsEmpresa'); let num=getEmpresaWhats();
    if(btn){ if(num){ btn.href=`https://wa.me/${num.replace(/\D/g,'')}?text=${encodeURIComponent('Olá '+getEmpresaAtual())}`; btn.style.display='inline-block'; } else { btn.style.display='none'; } }
  }
  atualizarBtnWhats(); carregarCatalogo(); listarClientesWhats();
}

// Melhora adicionarProduto v14 com foto online automática
window.adicionarProduto=function(){
  let nome=prompt('Nome do produto:'); if(!nome) return;
  let uni=prompt('Unidade: UN, KG, L (padrão UN):','UN')||'UN'; uni=uni.toLowerCase();
  if(uni.startsWith('k')) uni='kg'; else if(uni.startsWith('l')) uni='litro'; else uni='un';
  let preco=parseFloat(prompt(`Preço por ${uni} em MT:`)||'0');
  let est=parseFloat(prompt(`Stock inicial em ${uni}:`)||'0');
  let min=parseInt(prompt(`Avisar quando for menor que? (5)`)||'5');
  let ideal=parseInt(prompt(`Stock ideal? (20)`)||'20');
  let fotoUrl=prompt('Link da foto (ou deixa vazio que baixa online automaticamente):','')||'';
  if(!fotoUrl) fotoUrl=getFotoProduto(nome);
  let lista=getProdutos(); lista.push({id:Date.now(), nome, unidade:uni, preco, estoque:est, minStock:min, estoqueIdeal:ideal, foto:fotoUrl});
  setProdutos(lista); listarProdutos(); if(typeof carregarCatalogo==='function') carregarCatalogo();
  alert(`Produto ${nome} adicionado com foto!`);
}
