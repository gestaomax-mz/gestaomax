// GESTAOMAX - CORRIGIDO - MANTEM LOGICA ORIGINAL
if (typeof funcionarios === 'undefined') var funcionarios = JSON.parse(localStorage.getItem('funcionariosRH')) || [];
if (typeof produtos === 'undefined') var produtos = JSON.parse(localStorage.getItem('produtosRH')) || [];
if (typeof vendas === 'undefined') var vendas = JSON.parse(localStorage.getItem('vendasRH')) || [];
if (typeof compras === 'undefined') var compras = JSON.parse(localStorage.getItem('comprasRH')) || [];
if (typeof totalVendas === 'undefined') var totalVendas = 0;
if (typeof totalCompras === 'undefined') var totalCompras = 0;
if (typeof totalFolha === 'undefined') var totalFolha = 0;
if (typeof clientes === 'undefined') var clientes = JSON.parse(localStorage.getItem('clientesRH')) || [];
if (typeof metodosPagamento === 'undefined') var metodosPagamento = ["Dinheiro", "M-Pesa", "Emola", "Cartao", "Credito"];
if (typeof tentativasLogin === 'undefined') var tentativasLogin = 0;
if (typeof bloqueadoAte === 'undefined') var bloqueadoAte = null;
if (typeof indiceEditando === 'undefined') var indiceEditando = -1;
if (typeof historicoLog === 'undefined') var historicoLog = JSON.parse(localStorage.getItem('historicoRH')) || [];
const USUARIO_CORRETO = "rh";
const SENHA_CORRETA = "Folha2026@";
const deptPorTipo = {
  EMP: ["Vendas", "Financas", "RH", "TI", "Mkt", "Logistica", "Adm"],
  ESC: ["Direcao", "Secretaria", "Prof 1C", "Prof 2C", "Prof Sec", "Pedagogico", "Contab Esc", "Serv Gerais", "Seguranca", "Cantina"]
};
function salvarTudo(){
    localStorage.setItem('funcionariosRH', JSON.stringify(funcionarios));
    localStorage.setItem('historicoRH', JSON.stringify(historicoLog));
}
function salvarTudoGeral(){
    salvarTudo();
    localStorage.setItem('produtosRH', JSON.stringify(produtos));
    localStorage.setItem('vendasRH', JSON.stringify(vendas));
    localStorage.setItem('comprasRH', JSON.stringify(compras));
    localStorage.setItem('clientesRH', JSON.stringify(clientes));
}
function carregarTudoGeral(){
    try{
      produtos = JSON.parse(localStorage.getItem('produtosRH')) || [];
      vendas = JSON.parse(localStorage.getItem('vendasRH')) || [];
      compras = JSON.parse(localStorage.getItem('comprasRH')) || [];
      funcionarios = JSON.parse(localStorage.getItem('funcionariosRH')) || [];
      historicoLog = JSON.parse(localStorage.getItem('historicoRH')) || [];
    }catch(e){}
}
function fazerLogin(){
    if(bloqueadoAte && new Date() < new Date(bloqueadoAte)){
        let tempo = Math.ceil((new Date(bloqueadoAte) - new Date()) / 60000);
        const el=document.getElementById('erroLogin'); if(el){el.innerText=`Muitas tentativas! Tente novamente em ${tempo} minutos.`; el.style.display='block';}
        return;
    }
    let usuario = document.getElementById('usuario')?.value || "";
    let senha = document.getElementById('senha')?.value || "";
    if(usuario === USUARIO_CORRETO && senha === SENHA_CORRETA){
        tentativasLogin = 0; bloqueadoAte = null;
        document.getElementById('telaLogin').style.display='none';
        document.getElementById('sistema').style.display='block';
        listarFuncionarios(); atualizarTabelaLog(); atualizarRelatorio(); corrigirProdutos(); atualizarProdutos(); atualizarTabelaVendas(); atualizarCompras();
    } else {
        tentativasLogin++;
        const el=document.getElementById('erroLogin'); if(!el) return;
        if(tentativasLogin >= 3){
            bloqueadoAte = new Date(new Date().getTime() + 10*60000);
            el.innerText = "Conta bloqueada por 10 minutos!";
        } else {
            el.innerText = `Usuario ou senha incorretos! ${3-tentativasLogin} tentativa(s) restante(s).`;
        }
        el.style.display = 'block';
    }
}
function calcularSalario(salarioBruto, faltas, bonus){
    const inss = salarioBruto * 0.07;
    const ir = salarioBruto > 30000? salarioBruto * 0.10 : 0;
    const descontoFaltas = (salarioBruto / 30) * faltas;
    const salarioLiquido = salarioBruto - inss - ir - descontoFaltas + bonus;
    return {inss, ir, descontoFaltas, salarioLiquido};
}
function adicionarFuncionario(){ salvarEdicao(); }
function salvarEdicao(){
    const nome = document.getElementById('nome')?.value || "";
    const depto = document.getElementById('departamento')?.value || "";
    const salarioBruto = parseFloat(document.getElementById('salario')?.value) || 0;
    const faltas = parseInt(document.getElementById('faltas')?.value) || 0;
    const bonus = parseFloat(document.getElementById('bonus')?.value) || 0;
    if(!nome || salarioBruto <= 0){ alert('Preencha Nome e Salario!'); return; }
    const {salarioLiquido} = calcularSalario(salarioBruto, faltas, bonus);
    if(indiceEditando === -1){
        const novoFunc = {id: Date.now(), nome, departamento: depto, salarioBruto, salarioLiquido, faltas, bonus, codigo: "F"+Date.now().toString().slice(-4)};
        funcionarios.push(novoFunc);
        adicionarLog("Sistema", "Cadastro", "-", nome);
    } else {
        funcionarios[indiceEditando] = {...funcionarios[indiceEditando], nome, departamento: depto, salarioBruto, salarioLiquido, faltas, bonus };
        document.getElementById("btnAdicionar").innerText="Adicionar";
        indiceEditando = -1;
    }
    salvarTudo(); listarFuncionarios(); limparCampos();
}
function limparCampos(){['nome','salario','faltas','bonus','departamento','tipoInstituicao'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';});}
function listarFuncionarios(){ atualizarTabela(); }
function atualizarTabela(lista = funcionarios){
    const tbody = document.getElementById('tabelaFuncionarios'); if(!tbody) return;
    tbody.innerHTML = ''; let total = 0;
    lista.forEach(f => {
        total += Number(f.salarioLiquido) || 0;
        let qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${f.id}`;
        tbody.innerHTML += `<tr><td><img src="${qrCode}" width="40"></td><td>${f.nome}</td><td>${f.departamento||""}</td><td>${Number(f.salarioBruto||0).toFixed(2)} MT</td><td>${Number(f.salarioLiquido||0).toFixed(2)} MT</td><td><button onclick="gerarReciboPorId(${f.id})">Recibo</button></td><td><button onclick="editarFuncionario(${f.id})">Editar</button> <button onclick="removerFuncionario(${f.id})">Excluir</button></td></tr>`;
    });
    const totalEl=document.getElementById('totalFolha'); if(totalEl) totalEl.innerText=total.toFixed(2)+' MT';
}
function editarFuncionario(id){
  const func = funcionarios.find(f => f.id === id); if(!func) return;
  indiceEditando = funcionarios.findIndex(f => f.id === id);
  document.getElementById("nome").value=func.nome;
  document.getElementById("salario").value=func.salarioBruto;
  document.getElementById("faltas").value=func.faltas;
  document.getElementById("bonus").value=func.bonus;
  const btn=document.getElementById("btnAdicionar"); if(btn) btn.innerText="Salvar Edicao";
}
function removerFuncionario(id){ funcionarios = funcionarios.filter(f => f.id!== id); salvarTudo(); listarFuncionarios(); }
function adicionarLog(funcionario, campo, valorAntigo, valorNovo) {
  const agora = new Date(); historicoLog.push({data: agora.toLocaleString('pt-MZ'), usuario: "Admin", funcionario, campo, antigo: valorAntigo, novo: valorNovo});
  salvarTudo(); atualizarTabelaLog();
}
function atualizarTabelaLog() {
  const tbody = document.getElementById("tabelaLog"); if(!tbody) return;
  tbody.innerHTML = "";
  historicoLog.slice().reverse().forEach(log => {
    tbody.innerHTML += `<tr><td>${log.data}</td><td>${log.usuario}</td><td>${log.funcionario}</td><td>${log.campo}</td><td>${log.antigo}</td><td>${log.novo}</td></tr>`;
  });
}
function aplicarFiltros(){
  let termo = ""; const ids=['TC','pesquisaFuncionario','pesquisa','busca'];
  for(let id of ids){const el=document.getElementById(id); if(el&&el.value){termo=el.value; break;}}
  termo=termo.toLowerCase().trim();
  const dirEl=document.getElementById('Direcao') || document.getElementById('filtroDepto');
  const depto = dirEl?.value || "";
  let filtrados = funcionarios.filter(f => {
    let okNome =!termo || f.nome.toLowerCase().includes(termo) || String(f.id).includes(termo);
    let okDepto =!depto || depto==="" || f.departamento===depto;
    return okNome && okDepto;
  });
  atualizarTabela(filtrados);
}
function limparFiltros(){['TC','pesquisaFuncionario','pesquisa','busca','Direcao'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';}); atualizarTabela(funcionarios);}
function pesquisarFuncionario(){ aplicarFiltros(); }
function baixarBackup(){
    const blob = new Blob([JSON.stringify(funcionarios, null, 2)], {type: 'application/json'});
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'funcionarios_backup.json'; a.click();
}
function carregarBackup(event){
    const file = event.target.files[0]; if(!file) return;
    const reader = new FileReader();
    reader.onload = function(e){
        try{ funcionarios = JSON.parse(e.target.result); salvarTudo(); listarFuncionarios(); alert("Backup carregado!"); }catch(err){ alert("Backup invalido"); }
    };
    reader.readAsText(file);
}
function gerarReciboPorId(id){
    const func = funcionarios.find(f => f.id === id); if(!func) return;
    const html = `<html><body><h2>RECIBO - ${func.nome}</h2><p>Bruto: ${func.salarioBruto} MT</p><p>Liquido: ${func.salarioLiquido} MT</p><script>window.print()<\/script></body></html>`;
    const w = window.open('', '_blank'); w.document.write(html);
}
function gerarTodosRecibos(){ if(confirm(`Gerar ${funcionarios.length} recibos?`)){ funcionarios.forEach(f=>gerarReciboPorId(f.id)); } }
function exportarFuncionarios(){ if(!funcionarios.length){alert("Nao ha funcionarios");return;} const ws = XLSX.utils.json_to_sheet(funcionarios); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Funcionarios"); XLSX.writeFile(wb, "Backup_Funcionarios_RH.xlsx"); }
function corrigirProdutos(){ produtos.forEach(p=>{ if(p.estoque===undefined) p.estoque=Number(p.stock)||0; if(p.precoCompra===undefined) p.precoCompra=Number(p.custo)||0; if(p.precoVenda===undefined) p.precoVenda=Number(p.preco)||0; }); }
function atualizarProdutos(){
    const tbody = document.getElementById('tabelaProdutos'); if(!tbody) return;
    tbody.innerHTML = ''; let totalEstoque = 0; corrigirProdutos();
    produtos.forEach(p => {
        let stock = Number(p.estoque)||0; let custo = Number(p.precoCompra)||0; let preco = Number(p.precoVenda)||0; totalEstoque += stock * custo;
        tbody.innerHTML += `<tr><td>${p.nome}</td><td>${stock}</td><td>${custo.toFixed(2)} MT</td><td>${preco.toFixed(2)} MT</td><td><button onclick="editarProduto(${p.id})">Editar</button> <button onclick="removerProduto(${p.id})">Excluir</button></td></tr>`;
    });
    const te=document.getElementById('totalEstoque'); if(te) te.innerText=totalEstoque.toFixed(2)+' MT';
}
function atualizarTabelaProdutos(){ atualizarProdutos(); }
function adicionarProduto(){ const nome=document.getElementById('nomeProd')?.value||""; const pc=parseFloat(document.getElementById('precoCompra')?.value)||0; const pv=parseFloat(document.getElementById('precoVenda')?.value)||0; const est=parseInt(document.getElementById('estoque')?.value)||0; if(!nome||pv<=0){alert('Preencha Nome e Preco!');return;} produtos.push({id:Date.now(), nome, precoCompra:pc, precoVenda:pv, estoque:est}); salvarTudoGeral(); atualizarProdutos(); }
function removerProduto(id){ produtos = produtos.filter(p=>p.id!==id); salvarTudoGeral(); atualizarProdutos(); }
function editarProduto(id){ let p=produtos.find(x=>x.id===id); if(!p) return; let np=prompt(`Novo Preco para ${p.nome}:`, p.precoVenda); if(np!==null){p.precoVenda=parseFloat(np)||0; salvarTudoGeral(); atualizarProdutos();} }
function calcularTotais(){
    const filtroEl = document.getElementById('filtroMes');
    const mesFiltro = filtroEl?.value || "todos";
    totalVendas = 0; vendas.forEach(v=>totalVendas+=Number(v.total)||0);
    totalCompras = 0; compras.forEach(c=>totalCompras+=Number(c.total)||0);
    totalFolha = 0; funcionarios.forEach(f=>totalFolha+=Number(f.salarioLiquido||0));
}
function atualizarRelatorio(){
    try{ calcularTotais(); }catch(e){}
    let lucro = totalVendas - totalCompras - totalFolha;
    const ids = [['relVendas',totalVendas],['relCompras',totalCompras],['relFolha',totalFolha],['relLucro',lucro],['totalVendas',totalVendas],['totalCompras',totalCompras],['totalFolha',totalFolha],['totalLucro',lucro]];
    ids.forEach(([id,val])=>{const el=document.getElementById(id); if(el) el.innerText=val.toFixed(2)+' MT';});
}
function mostrarAba(idAba){ document.querySelectorAll('[id^=aba]').forEach(a=>{if(a) a.style.display='none';}); const aba=document.getElementById(idAba); if(aba) aba.style.display='block'; }
function verMinhaSituacao(){
  if(!funcionarios.length){ alert("Nenhum funcionario cadastrado."); return; }
  let termo = prompt("Digite seu NOME:"); if(!termo) return; termo=termo.toLowerCase().trim();
  let f = funcionarios.find(x=>x.nome.toLowerCase().includes(termo));
  if(!f){ alert("Nao encontrado: "+funcionarios.map(x=>x.nome).join(", ")); return; }
  document.body.innerHTML = `<div style="display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f0f2f5;padding:15px;"><div style="background:white;border-radius:20px;max-width:420px;width:100%;padding:25px;text-align:center;box-shadow:0 15px 40px rgba(0,0,0,.2);"><h2>${f.nome}</h2><p>${f.departamento||""}</p><hr><p><b>Bruto:</b> ${f.salarioBruto} MT</p><p><b>Liquido:</b> ${Number(f.salarioLiquido).toFixed(2)} MT</p><button onclick="location.reload()" style="width:100%;padding:14px;background:#111;color:white;border:none;border-radius:12px;margin-top:10px;">Sair</button></div></div>`;
}
window.verSituacaoFuncionario = verMinhaSituacao;
document.addEventListener('DOMContentLoaded', ()=>{ carregarTudoGeral(); atualizarProdutos(); atualizarRelatorio(); listarFuncionarios(); });
