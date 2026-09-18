let funcionarios = JSON.parse(localStorage.getItem('funcionariosRH')) || [];
let produtos = JSON.parse(localStorage.getItem('produtosRH')) || [];
let vendas = JSON.parse(localStorage.getItem('vendasRH')) || [];
let compras = JSON.parse(localStorage.getItem('comprasRH')) || [];
let totalVendas = 0;
let totalCompras = 0;
let totalFolha = 0;
let clientes = JSON.parse(localStorage.getItem('clientesRH')) || [];
let metodosPagamento = ["Dinheiro", "M-Pesa", "Emola", "Cartao", "Credito"];
let tentativasLogin = 0;
let bloqueadoAte = null;
let indiceEditando = -1;
let historicoLog = JSON.parse(localStorage.getItem('historicoRH')) || [];
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
        listarFuncionarios(); atualizarTabelaLog(); atualizarRelatorio();
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
        const btn=document.getElementById("btnAdicionar"); if(btn) btn.innerText="Adicionar Funcionário";
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
        tbody.innerHTML += `<tr><td>${f.nome}</td><td>${f.departamento||""}</td><td>${Number(f.salarioBruto||0).toFixed(2)} MT</td><td>${Number(f.salarioLiquido||0).toFixed(2)} MT</td><td><button onclick="gerarReciboPorId(${f.id})">Recibo</button> <button onclick="editarFuncionario(${f.id})">Editar</button> <button onclick="removerFuncionario(${f.id})">Excluir</button></td></tr>`;
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
  document.getElementById("departamento").value=func.departamento;
  document.getElementById("btnAdicionar").innerText="Salvar Edição";
}
function removerFuncionario(id){ funcionarios = funcionarios.filter(f => f.id!== id); salvarTudo(); listarFuncionarios(); }
// PESQUISA CORRIGIDA
function aplicarFiltros(){
  let termo = ""; const ids=['TC','pesquisaFuncionario','pesquisa','busca'];
  for(let id of ids){const el=document.getElementById(id); if(el&&el.value){termo=el.value; break;}}
  termo=termo.toLowerCase().trim();
  let filtrados = funcionarios.filter(f => f.nome.toLowerCase().includes(termo) || String(f.id).includes(termo));
  atualizarTabela(filtrados);
}
function limparFiltros(){['TC','pesquisaFuncionario','pesquisa','busca','Direcao'].forEach(id=>{const el=document.getElementById(id); if(el) el.value='';}); atualizarTabela(funcionarios);}
function pesquisarFuncionario(){ aplicarFiltros(); }

// PRODUTOS E RELATORIO SEM ERRO NULL
function salvarTudoGeral(){ salvarTudo(); localStorage.setItem('produtosRH', JSON.stringify(produtos)); localStorage.setItem('vendasRH', JSON.stringify(vendas)); localStorage.setItem('comprasRH', JSON.stringify(compras)); }
function calcularTotais(){
    const filtroEl = document.getElementById('filtroMes');
    const mesFiltro = filtroEl?.value || "todos";
    totalVendas = 0; vendas.forEach(v => totalVendas += Number(v.total)||0);
    totalCompras = 0; compras.forEach(c => totalCompras += Number(c.total)||0);
    totalFolha = 0; funcionarios.forEach(f => totalFolha += Number(f.salarioLiquido||f.salarioBruto||0));
}
function atualizarRelatorio(){
    try{ calcularTotais(); }catch(e){}
    let lucro = totalVendas - totalCompras - totalFolha;
    const ev=document.getElementById('relVendas'); if(ev) ev.innerText=totalVendas.toFixed(2)+' MT';
    const ec=document.getElementById('relCompras'); if(ec) ec.innerText=totalCompras.toFixed(2)+' MT';
    const ef=document.getElementById('relFolha'); if(ef) ef.innerText=totalFolha.toFixed(2)+' MT';
    const el=document.getElementById('relLucro'); if(el) el.innerText=lucro.toFixed(2)+' MT';
}
function mostrarAba(idAba){
    document.querySelectorAll('[id^=aba]').forEach(a => { if(a) a.style.display = 'none'; });
    const aba = document.getElementById(idAba); if(aba) aba.style.display = 'block';
}
window.onload = function(){ listarFuncionarios(); atualizarRelatorio(); }
// MODO FUNCIONARIO SEGURO
function verMinhaSituacao(){
  let funcs = funcionarios;
  if(!funcs.length){ alert("Cadastre como DONO primeiro"); return; }
  let termo = prompt("Digite seu NOME:"); if(!termo) return;
  termo = termo.toLowerCase().trim();
  let f = funcs.find(x=> x.nome.toLowerCase().includes(termo));
  if(!f){ alert("Não encontrado. Cadastrados: "+funcs.map(x=>x.nome).join(", ")); return; }
  let base = Number(f.salarioBruto||0); let faltas = Number(f.faltas||0); let bonus = Number(f.bonus||0); let liquido = Number(f.salarioLiquido||0);
  document.body.innerHTML = "";
  document.body.style = "background:#f0f2f5;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:15px;";
  let card = document.createElement("div");
  card.style = "background:white;border-radius:20px;max-width:420px;width:100%;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.2);";
  card.innerHTML = `<div style="background:#1565C0;color:white;padding:25px;text-align:center;"><h2>${f.nome}</h2><p>${f.departamento||""}</p></div><div style="padding:22px;"><p><b>Base:</b> ${base} MT</p><p><b>Faltas:</b> ${faltas}</p><p><b>Bônus:</b> ${bonus} MT</p><div style="background:#1565C0;color:white;padding:18px;border-radius:12px;margin-top:10px"><b>Líquido: ${liquido.toFixed(2)} MT</b></div><button onclick="location.reload()" style="width:100%;margin-top:15px;padding:14px;background:#111;color:white;border:none;border-radius:12px;">Sair</button></div>`;
  document.body.appendChild(card);
}
window.verSituacaoFuncionario = verMinhaSituacao;
document.addEventListener('DOMContentLoaded', ()=>{
  const ids=['TC','pesquisaFuncionario','pesquisa','busca'];
  ids.forEach(id=>{const el=document.getElementById(id); if(el) el.addEventListener('input', aplicarFiltros);});
});
