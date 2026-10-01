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
function gerarRecibo(){ let nome = prompt('Recibo para funcionario:'); if(!nome) return; let f = getFuncionariosEmpresa().find(x=> x.nome.toLowerCase().includes(nome.toLowerCase())); if(!f){ alert('Nao encontrado'); return; } let bruto = (parseFloat(f.salario)||0)+(parseFloat(f.bonus)||0); let desconto = (parseFloat(f.faltas)||0)*((parseFloat(f.salario)||0)/30); let liquido = bruto - desconto; if(liquido<0) liquido=0; let w = window.open('','','width=600,height=700'); w.document.write(`<html><body><div style="border:2px solid #000;padding:20px"><h2>RECIBO - ${getEmpresaAtual()}</h2><p>Funcionario: ${f.nome}</p><p>Depto: ${f.departamento}</p><p>Base: ${f.salario} MT</p><p>Bonus: ${f.bonus} MT</p><p>Faltas: ${f.faltas}</p><h3>Liquido: ${liquido.toFixed(2)} MT</h3><p>Data: ${new Date().toLocaleDateString()}</p><p>Ass: ___________________</p></div><script>window.print()<\/script></body></html>`); w.document.close(); }
function gerarTodosRecibos(){ let lista = getFuncionariosEmpresa(); if(lista.length===0){ alert('Sem funcionarios'); return; } let w = window.open('','','width=800,height=900'); let html = `<html><body><h1>Recibos - ${getEmpresaAtual()}</h1>`; lista.forEach(f=>{ let liq = (parseFloat(f.salario)||0)+(parseFloat(f.bonus)||0) - ((parseFloat(f.faltas)||0)*((parseFloat(f.salario)||0)/30)); if(liq<0) liq=0; html+=`<div style="border:1px solid #000;padding:15px;margin-bottom:20px;"><h3>${f.nome} - ${f.departamento}</h3><p>Liquido: ${liq.toFixed(2)} MT</p></div>`; }); html+=`<script>window.print()<\/script></body></html>`; w.document.write(html); w.document.close(); }
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
