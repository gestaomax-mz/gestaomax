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

// TIPOS DE DEPARTAMENTOS
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
        document.getElementById('erroLogin').innerText = `Muitas tentativas! Tente novamente em ${tempo} minutos.`;
        document.getElementById('erroLogin').style.display = 'block';
        return;
    }
    let usuario = document.getElementById('usuario').value;
    let senha = document.getElementById('senha').value;
    if(usuario === USUARIO_CORRETO && senha === SENHA_CORRETA){
        tentativasLogin = 0; bloqueadoAte = null;
        document.getElementById('telaLogin').style.display = 'none';
        document.getElementById('sistema').style.display = 'block';
        listarFuncionarios();
        atualizarTabelaLog();
    } else {
        tentativasLogin++;
        let tentativasRestantes = 3 - tentativasLogin;
        if(tentativasLogin >= 3){
            bloqueadoAte = new Date(new Date().getTime() + 10*60000);
            document.getElementById('erroLogin').innerText = "Conta bloqueada por 10 minutos!";
        } else {
            document.getElementById('erroLogin').innerText = `Usuario ou senha incorretos! ${tentativasRestantes} tentativa(s) restante(s).`;
        }
        document.getElementById('erroLogin').style.display = 'block';
    }
}

document.addEventListener('keypress', function(e){
    if(e.key === 'Enter' && document.getElementById('telaLogin').style.display!== 'none'){ fazerLogin(); }
});

function logout(){
    document.getElementById('sistema').style.display = 'none';
    document.getElementById('telaLogin').style.display = 'block';
    document.getElementById('usuario').value = ''; document.getElementById('senha').value = '';
}

// CARREGAR DEPARTAMENTOS
if(document.getElementById("tipoInstituicao")){
document.getElementById("tipoInstituicao").addEventListener("change", function() {
  const tipo = this.value;
  const deptSelect = document.getElementById("departamento");
  deptSelect.innerHTML = '<option value="">Departamento</option>';
  if(tipo && deptPorTipo[tipo]) {
    deptPorTipo[tipo].forEach(function(dept) {
      deptSelect.innerHTML += '<option value="' + dept + '">' + dept + '</option>';
    });
  }
});
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
    const nome = document.getElementById('nome').value;
    const depto = document.getElementById('departamento').value;
    const salarioBruto = parseFloat(document.getElementById('salario').value) || 0;
    const faltas = parseInt(document.getElementById('faltas').value) || 0;
    const bonus = parseFloat(document.getElementById('bonus').value) || 0;

    if(!nome || salarioBruto <= 0){ alert('Preencha Nome e Salario!'); return; }
    const {salarioLiquido} = calcularSalario(salarioBruto, faltas, bonus);

    if(indiceEditando === -1){
        const novoFunc = {id: Date.now(), nome, departamento: depto, salarioBruto, salarioLiquido, faltas, bonus};
        funcionarios.push(novoFunc);
        adicionarLog("Sistema", "Cadastro", "-", nome);
    } else {
        const funcAntigo = {...funcionarios[indiceEditando]};
        funcionarios[indiceEditando] = {...funcionarios[indiceEditando], nome, departamento: depto, salarioBruto, salarioLiquido, faltas, bonus };
        adicionarLog(funcAntigo.nome, "Edição", `Salario: ${funcAntigo.salarioBruto}`, `Salario: ${salarioBruto}`);
        document.getElementById("btnAdicionar").innerText = "Adicionar Funcionário";
        indiceEditando = -1;
    }
    salvarTudo();
    listarFuncionarios();
    limparCampos();
}

function limparCampos() {
    document.getElementById('nome').value = ''; document.getElementById('salario').value = '';
    document.getElementById('faltas').value = ''; document.getElementById('bonus').value = '';
    document.getElementById('departamento').value = '';
    if(document.getElementById("tipoInstituicao")) document.getElementById("tipoInstituicao").value = '';
}

function listarFuncionarios() { atualizarTabela(); }

function atualizarTabela(lista = funcionarios){
    const tbody = document.getElementById('tabelaFuncionarios');
    if(!tbody) return;
    tbody.innerHTML = '';
    let total = 0;
    lista.forEach(f => {
        total += f.salarioLiquido;
        let qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=50x50&data=${f.id}`;
        tbody.innerHTML += `<tr>
            <td><img src="${qrCode}" alt="QR" width="50"></td>
            <td>${f.nome}</td>
            <td>${f.departamento}</td>
            <td>${f.salarioBruto.toFixed(2)} MT</td>
            <td>${f.salarioLiquido.toFixed(2)} MT</td>
            <td><button class="btn btn-sm btn-info" onclick="gerarReciboPorId(${f.id})">Recibo</button></td>
            <td><button class="btn btn-sm btn-warning" onclick="editarFuncionario(${f.id})">Editar</button></td>
            <td><button class="btn btn-sm btn-danger" onclick="removerFuncionario(${f.id})">Excluir</button></td>
        </tr>`;
    });
    document.getElementById('totalFolha').innerText = total.toFixed(2) + ' MT';
    if(document.getElementById('graficoDepto')) atualizarGrafico();
}

function editarFuncionario(id) {
  const func = funcionarios.find(f => f.id === id);
  if(!func) return;
  indiceEditando = funcionarios.findIndex(f => f.id === id);
  document.getElementById("nome").value = func.nome;
  let tipo = Object.keys(deptPorTipo).find(k => deptPorTipo[k].includes(func.departamento));
  if(tipo && document.getElementById("tipoInstituicao")){
    document.getElementById("tipoInstituicao").value = tipo;
    document.getElementById("tipoInstituicao").dispatchEvent(new Event('change'));
  }
  document.getElementById("departamento").value = func.departamento;
  document.getElementById("salario").value = func.salarioBruto;
  document.getElementById("faltas").value = func.faltas;
  document.getElementById("bonus").value = func.bonus;
  document.getElementById("btnAdicionar").innerText = "Salvar Edição";
  window.scrollTo(0,0);
}

function removerFuncionario(id){
    const func = funcionarios.find(f => f.id === id);
    funcionarios = funcionarios.filter(f => f.id!== id);
    adicionarLog(func.nome, "Exclusão", "Ativo", "Removido");
    salvarTudo(); listarFuncionarios();
}

function adicionarLog(funcionario, campo, valorAntigo, valorNovo) {
  const agora = new Date(); const dataHora = agora.toLocaleString('pt-MZ');
  historicoLog.push({data: dataHora, usuario: "Admin", funcionario, campo, antigo: valorAntigo, novo: valorNovo});
  atualizarTabelaLog();
}

function atualizarTabelaLog() {
  const tbody = document.getElementById("tabelaLog");
  if(!tbody) return;
  tbody.innerHTML = "";
  historicoLog.slice().reverse().forEach(function(log) {
    tbody.innerHTML += `<tr><td>${log.data}</td><td>${log.usuario}</td><td>${log.funcionario}</td><td>${log.campo}</td><td>${log.antigo}</td><td>${log.novo}</td></tr>`;
  });
}

// ==================  ==================

let grafico = null;
function atualizarGrafico() {
    const ctx = document.getElementById('graficoDepto');
    if (!ctx) return;
    const totais = {};
    funcionarios.forEach(f => { totais[f.departamento] = (totais[f.departamento] || 0) + f.salarioLiquido; });
    if(grafico) grafico.destroy();
    grafico = new Chart(ctx, {
        type: 'pie',
        data: {labels: Object.keys(totais), datasets: [{label: 'Total Liquido por Depto', data: Object.values(totais), backgroundColor: ['#0d6efd','#198754','#ffc107','#dc3545','#6f42c1']} ]},
        options: {responsive: true, plugins: {title: {display: true, text: 'Gasto com Salarios por Departamento'}}}
    });
}

function aplicarFiltros() {
  let termo = document.getElementById('TC').value.toLowerCase();
  let depto = document.getElementById('Direcao').value;
  let filtrados = funcionarios.filter(func => func.nome.toLowerCase().includes(termo) && (depto === "" || func.departamento === depto));
  atualizarTabela(filtrados);
}

function limparFiltros() {
  document.getElementById('TC').value = '';
  document.getElementById('Direcao').value = '';
  atualizarTabela(funcionarios);
}

function baixarBackup() {
    const dados = JSON.stringify(funcionarios, null, 2);
    const blob = new Blob([dados], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'funcionarios_backup.json'; a.click();
}

function carregarBackup(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        funcionarios = JSON.parse(e.target.result);
        salvarTudo();
        listarFuncionarios();
    };
    reader.readAsText(file);
}

function gerarReciboPorId(id){
    const func = funcionarios.find(f => f.id === id);
    if(!func) return;
    const recibo = `<!DOCTYPE html><html><head><title>Recibo - ${func.nome}</title><style>body{font-family:Arial; padding:20px;}.recibo{border:2px solid #000; padding:20px; max-width:600px; margin:auto;}h2{text-align:center; background:#0d6efd; color:white; padding:10px;}.linha{display:flex; justify-content:space-between; margin:8px 0;}</style></head><body><div class="recibo"><h2>RECIBO DE PAGAMENTO</h2><div class="linha"><b>Funcionario:</b> <span>${func.nome}</span></div><div class="linha"><b>Departamento:</b> <span>${func.departamento}</span></div><hr><div class="linha"><b>Salario Bruto:</b> <span>${func.salarioBruto.toFixed(2)} MT</span></div><div class="linha"><b>Descontos:</b> <span>${(func.salarioBruto - func.salarioLiquido + func.bonus).toFixed(2)} MT</span></div><div class="linha"><b>Bonus:</b> <span>${func.bonus.toFixed(2)} MT</span></div><hr><div class="linha"><h3>Salario Liquido:</h3> <h3>${func.salarioLiquido.toFixed(2)} MT</h3></div><p style="text-align:center; margin-top:30px;">Assinatura: ____________________</p></div><script>window.print()</script></body></html>`;
    const novaJanela = window.open('', '_blank'); novaJanela.document.write(recibo);
}

function gerarTodosRecibos() {
    if(funcionarios.length === 0) { alert('Nao ha funcionarios cadastrados'); return; }
    if(!confirm(`Deseja gerar ${funcionarios.length} recibos?`)) { return; }
    const { jsPDF } = window.jspdf;
    funcionarios.forEach((func, index) => {
        setTimeout(() => {
            const doc = new jsPDF();
            const {inss, ir, descontoFaltas} = calcularSalario(func.salarioBruto, func.faltas, func.bonus);
            doc.setFontSize(18); doc.text("RECIBO DE SALARIO", 105, 20, { align: 'center' });
            doc.setFontSize(12); doc.text(`Nome: ${func.nome}`, 20, 40); doc.text(`Departamento: ${func.departamento}`, 20, 50);
            doc.text(`Salario Bruto: ${func.salarioBruto.toFixed(2)} MT`, 20, 65); doc.text(`----------------------------------------`, 20, 70);
            doc.text(`(-) INSS 7%: ${inss.toFixed(2)} MT`, 20, 80); doc.text(`(-) IR 10%: ${ir.toFixed(2)} MT`, 20, 90);
            doc.text(`(-) Faltas ${func.faltas} dias: ${descontoFaltas.toFixed(2)} MT`, 20, 100); doc.text(`(+) Bonus: ${func.bonus.toFixed(2)} MT`, 20, 110);
            doc.text(`----------------------------------------`, 20, 115); doc.setFontSize(14); doc.text(`Salario Liquido: ${func.salarioLiquido.toFixed(2)} MT`, 20, 130);
            doc.setFontSize(12); doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 145); doc.save(`Recibo_${func.nome}.pdf`);
        }, index * 500);
    });
    alert(`${funcionarios.length} recibos serao baixados!`);
}

function exportarFuncionarios(){
    if(funcionarios.length === 0){ alert("Nao ha funcionarios cadastrados para exportar!"); return; }
    const ws = XLSX.utils.json_to_sheet(funcionarios);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Funcionarios");
    XLSX.writeFile(wb, "Backup_Funcionarios_RH.xlsx");
}

function exportarFolha(){
    let tabela = document.querySelector("#tabelaFuncionarios");
    let linhas = tabela.querySelectorAll("tr");
    let dadosFolha = [];
    linhas.forEach(linha => {
        let colunas = linha.querySelectorAll("td");
        if(colunas.length > 0){
            dadosFolha.push({
                Nome: colunas[1].innerText,
                Departamento: colunas[2].innerText,
                "Salario Bruto MT": colunas[3].innerText.replace(' MT',''),
                "Salario Liquido MT": colunas[4].innerText.replace(' MT','')
            });
        }
    });
    if(dadosFolha.length === 0){ alert("Nao ha dados na tabela para exportar!"); return; }
    const ws = XLSX.utils.json_to_sheet(dadosFolha);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Folha Pagamento");
    let data = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Folha_Pagamento_${data}.xlsx`);
    alert("Folha exportada com sucesso!");
}

function imprimirFolha() {
    let conteudo = document.querySelector('.table-responsive').outerHTML + `<h3>Total: ${document.getElementById('totalFolha').innerText}</h3>`;
    let janela = window.open('', '', 'width=800,height=600');
    janela.document.write(`<html><head><title>Folha</title><style>body{font-family:Arial;padding:20px} h2{text-align:center} table{width:100%;border-collapse:collapse} table,th,td{border:1px solid #000;padding:8px} th{background:#f2f2f2} th:last-child, td:last-child{ display: none; }</style></head><body><h2>Sistema RH - Folha de Pagamento</h2>${conteudo}</body></html>`);
    janela.document.close(); janela.print();
}

window.onload = function(){
    listarFuncionarios();
    atualizarTabelaLog();
}

// ================== MODULO ESTOQUE E VENDAS ==================

function salvarTudoGeral(){
    salvarTudo(); 
    localStorage.setItem('produtosRH', JSON.stringify(produtos));
    localStorage.setItem('vendasRH', JSON.stringify(vendas));
    localStorage.setItem('comprasRH', JSON.stringify(compras));
    localStorage.setItem('clientesRH', JSON.stringify(clientes));
}

// 1. PRODUTOS / ESTOQUE
function adicionarProduto(){
    const nome = document.getElementById('nomeProd').value;
    const precoCompra = parseFloat(document.getElementById('precoCompra').value) || 0;
    const precoVenda = parseFloat(document.getElementById('precoVenda').value) || 0;
    const estoque = parseInt(document.getElementById('estoque').value) || 0;

    if(!nome || precoVenda <= 0){ alert('Preencha Nome e Preco de Venda!'); return; }

    const novoProd = {id: Date.now(), nome, precoCompra, precoVenda, estoque};
    produtos.push(novoProd);
    salvarTudoGeral();
    atualizarTabelaProdutos();
    limparCamposProduto();
}

function removerProduto(id){
    produtos = produtos.filter(p => p.id !== id);
    salvarTudoGeral(); atualizarTabelaProdutos();
}

function limparCamposProduto() {
    document.getElementById('nomeProd').value = '';
    document.getElementById('precoCompra').value = '';
    document.getElementById('precoVenda').value = '';
    document.getElementById('estoque').value = '';
}

function atualizarTabelaVendas(){
    const tbody = document.getElementById('tabelaVendas');
    if(!tbody) return;
    tbody.innerHTML = '';
    let totalVendas = 0;
    vendas.slice().reverse().forEach(v => {
        totalVendas += v.total;
        tbody.innerHTML += `<tr>
            <td>${v.data}</td>
            <td>${v.cliente}</td>
            <td>${v.produto}</td>
            <td>${v.qtd}</td>
            <td>${v.total.toFixed(2)} MT</td>
            <td>${v.metodo}</td>
        </tr>`;
    });
    document.getElementById('totalVendas').innerText = totalVendas.toFixed(2) + ' MT';
}

function gerarReciboVenda(venda){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("RECIBO DE VENDA", 105, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Cliente: ${venda.cliente}`, 20, 40);
    doc.text(`Data: ${venda.data}`, 20, 50);
    doc.text(`Produto: ${venda.produto}`, 20, 65);
    doc.text(`Qtd: ${venda.qtd}`, 20, 75);
    doc.text(`Preco Unit: ${venda.precoUnit.toFixed(2)} MT`, 20, 85);
    doc.text(`Total: ${venda.total.toFixed(2)} MT`, 20, 95);
    doc.text(`Pagamento: ${venda.metodo}`, 20, 105);
    
    // QR Code do recibo
    let qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=Recibo:${venda.id}`;
    // 
    doc.text(`ID Recibo: ${venda.id}`, 20, 120);

    doc.save(`Recibo_Venda_${venda.id}.pdf`);
}

function limparCamposVenda() {
    document.getElementById('qtdVenda').value = '';
    carregarProdutosVendas(); 
}

function atualizarCompras(){
    let tbody = document.getElementById('listaCompras');
    if(!tbody) return; 
    
    let html = '';
    compras.forEach(c => {
        html += `<tr>
          <td>${c.data}</td>
          <td>${c.produto}</td>
          <td>${c.qtd}</td>
          <td>${c.total.toFixed(2)} MT</td>
          <td>${c.fornecedor}</td>
        </tr>`
    });
    tbody.innerHTML = html;
}

function atualizarRelatorio(){
    let vendas = totalVendas;
    let compras = totalCompras;
    let folha = totalFolha;
    let lucro = vendas - compras - folha;

    
    if(document.getElementById('totalVendas')) 
        document.getElementById('totalVendas').innerText = vendas.toFixed(2) + ' MT';
    
    if(document.getElementById('totalCompras')) 
        document.getElementById('totalCompras').innerText = compras.toFixed(2) + ' MT';
    
    if(document.getElementById('totalFolha')) 
        document.getElementById('totalFolha').innerText = folha.toFixed(2) + ' MT';
    
    if(document.getElementById('totalLucro')) 
        document.getElementById('totalLucro').innerText = lucro.toFixed(2) + ' MT';
}

function corrigirProdutos(){
    produtos.forEach(p => {
        if(p.stock === undefined)p.stock = 0;
        if(p.custo === undefined)p.custo = 0;
    });
}
corrigirProdutos();

// ==================  ==================

// CONVERCCAO DE TUDO
function corrigirProdutos(){
    produtos.forEach(p => {
        if(p.estoque === undefined) p.estoque = Number(p.stock) || 0;
        if(p.precoCompra === undefined) p.precoCompra = Number(p.custo) || 0;
        if(p.precoVenda === undefined) p.precoVenda = Number(p.preco) || 0;
    });
}

// 1. TABELA PRODUTOS - CARREGA AUTOMATICAMENTE AO ABRIR
function atualizarProdutos(){
    const tbody = document.getElementById('tabelaProdutos');
    if(!tbody) return;
    tbody.innerHTML = '';
    let totalEstoque = 0;
    corrigirProdutos();
    
    produtos.forEach(p => {
        let stock = Number(p.estoque) || 0;
        let custo = Number(p.precoCompra) || 0;
        let preco = Number(p.precoVenda) || 0;
        totalEstoque += stock * custo;
        
        tbody.innerHTML += `<tr>
            <td>${p.nome}</td>
            <td>${stock}</td>
            <td>${custo.toFixed(2)} MT</td>
            <td>${preco.toFixed(2)} MT</td>
            <td><button class="btn btn-sm btn-warning" onclick="editarProduto(${p.id})">Editar</button></td>
            <td><button class="btn btn-sm btn-danger" onclick="removerProduto(${p.id})">Excluir</button></td>
        </tr>`;
    });
    if(document.getElementById('totalEstoque'))
        document.getElementById('totalEstoque').innerText = totalEstoque.toFixed(2) + ' MT';
}

// 2. FUNCAO EDITAR PRODUTO
function editarProduto(id){
    let p = produtos.find(x => x.id === id);
    if(!p) return;
    let novoPreco = prompt(`Novo Preço de Venda para ${p.nome}:`, p.precoVenda);
    if(novoPreco !== null){
        p.precoVenda = parseFloat(novoPreco) || 0;
        salvarTudoGeral();
        atualizarProdutos();
        alert("Preço atualizado!");
    }
}

// 3. SELECT  VENDAS
function carregarProdutosVenda(){
    const select = document.getElementById('produtoVenda');
    if(!select) return;
    select.innerHTML = '<option value="">Selecione o Produto</option>';
    corrigirProdutos();
    produtos.forEach(p => {
        let stock = Number(p.estoque) || 0;
        let preco = Number(p.precoVenda) || 0;
        if(stock > 0) 
            select.innerHTML += `<option value="${p.id}">${p.nome} - Stock: ${stock} - ${preco.toFixed(2)} MT</option>`;
    });
}

// 4. SELECT COMPRAS 
function carregarProdutosCompra(){
    let select = document.getElementById('produtoCompra');
    if(!select) return;
    
    corrigirProdutos();
    select.innerHTML = '<option value="">Selecione Produto</option>';
    
    if(produtos.length === 0){
        select.innerHTML += '<option disabled>⚠️ Cadastre produtos primeiro</option>';
        return;
    }
    
    produtos.forEach(p => {
        let stock = Number(p.estoque) || 0;
        select.innerHTML += `<option value="${p.nome}">${p.nome} - Stock Atual: ${stock}</option>`;
    });
}

// 5. FUNCAO REGISTRAR COMPRA
function registrarCompra(){
    let pNome = document.getElementById('produtoCompra').value;
    let q = parseFloat(document.getElementById('qtdCompra').value) || 0;
    let c = parseFloat(document.getElementById('custoCompra').value) || 0;
    let f = document.getElementById('fornecedorCompra').value;
    
    if(!pNome){ alert("Selecione um produto"); return; }
    if(q<=0 || c<=0){ alert("Qtd e Custo precisam ser maiores que 0"); return; }

    compras.push({produto:pNome, qtd:q, total:c, fornecedor:f, data: new Date().toLocaleDateString()});
    totalCompras += c;
    
    let prod = produtos.find(x => x.nome === pNome);
    if(prod){ 
        prod.estoque = (Number(prod.estoque) || 0) + q; // AGORA USA ESTOQUE
        prod.precoCompra = c / q;
    }
    
    salvarTudoGeral();
    atualizarCompras();
    atualizarProdutos();
    atualizarRelatorio();
    carregarProdutosCompra();
    
    document.getElementById('qtdCompra').value = '';
    document.getElementById('custoCompra').value = '';
    document.getElementById('fornecedorCompra').value = '';
    alert(`Compra feita! Novo Stock de ${pNome}: ${prod.estoque}`);
}

// 6. REGISTRAR VENDA - DESCONTA ESTOQUE
function registrarVenda(){
    const prodId = parseInt(document.getElementById('produtoVenda').value);
    const qtd = parseInt(document.getElementById('qtdVenda').value) || 0;
    const metodo = document.getElementById('metodoPagamento').value;
    const cliente = document.getElementById('clienteVenda').value || "Cliente Balcão";

    const produto = produtos.find(p => p.id === prodId);
    if(!produto){ alert('Selecione um produto!'); return; }
    if(produto.estoque < qtd){ alert(`Estoque insuficiente! Stock: ${produto.estoque}`); return; }

    produto.estoque -= qtd; // DESCONTA
    
    const total = produto.precoVenda * qtd;
    const novaVenda = {id: Date.now(), data: new Date().toLocaleString('pt-MZ'), produto: produto.nome, qtd, precoUnit: produto.precoVenda, total, metodo, cliente};
    vendas.push(novaVenda);
    
    salvarTudoGeral();
    atualizarProdutos();
    atualizarTabelaVendas();
    atualizarRelatorio();
    carregarProdutosVenda();
    gerarReciboVenda(novaVenda);
    limparCamposVenda();
}

// 7. FUNCAO DE TROCA E CARREGAMENTO DE ABA AUTOMATICO
function mostrarAba(idAba){
    document.querySelectorAll('[id^=aba]').forEach(a => a.style.display = 'none');
    document.getElementById(idAba).style.display = 'block';
    
    if(idAba === 'abaCompras'){ carregarProdutosCompra(); }
    if(idAba === 'abaVendas'){ carregarProdutosVenda(); atualizarRelatorio();}
    if(idAba === 'abaRelatorios'){ atualizarRelatorio(); }
    if(idAba === 'abaProdutos'){ atualizarProdutos(); }
}

// CARREGA TUDO AO ABRIR
document.addEventListener('DOMContentLoaded', () => {
    corrigirProdutos();
    atualizarProdutos();
    atualizarTabelaVendas();
    atualizarCompras();
});

// ================== 1. PESQUISA DE PRODUTOS ==================
function pesquisarProduto(){
    const termo = document.getElementById('pesquisaProd').value.toLowerCase();
    const filtrados = produtos.filter(p => p.nome.toLowerCase().includes(termo));
    atualizarTabelaProdutos(filtrados); // reutiliza a tabela
}

// 
function atualizarTabelaProdutos(lista = produtos){
    const tbody = document.getElementById('tabelaProdutos');
    if(!tbody) return;
    tbody.innerHTML = '';
    let totalEstoque = 0;
    corrigirProdutos();
    
    lista.forEach(p => { // usa "lista" em vez de "produtos"
        let stock = Number(p.estoque) || 0;
        let custo = Number(p.precoCompra) || 0;
        let preco = Number(p.precoVenda) || 0;
        totalEstoque += stock * custo;
        
        tbody.innerHTML += `<tr>
            <td>${p.nome}</td>
            <td>${stock}</td>
            <td>${custo.toFixed(2)} MT</td>
            <td>${preco.toFixed(2)} MT</td>
            <td><button class="btn btn-sm btn-warning" onclick="editarProduto(${p.id})">Editar</button></td>
            <td><button class="btn btn-sm btn-danger" onclick="removerProduto(${p.id})">Excluir</button></td>
        </tr>`;
    });
    if(document.getElementById('totalEstoque'))
        document.getElementById('totalEstoque').innerText = totalEstoque.toFixed(2) + ' MT';
}

// ================== 2. RECIBO PDF AUTOMÁTICO ==================
function gerarReciboVenda(venda){
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // CABEÇALHO
    doc.setFontSize(20); 
    doc.text("RH PRO MZ", 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.text("RECIBO DE VENDA", 105, 30, { align: 'center' });
    doc.setLineWidth(0.5); doc.line(20, 35, 190, 35);
    
    // DADOS
    doc.setFontSize(11);
    doc.text(`Nº Recibo: ${venda.id}`, 20, 45);
    doc.text(`Data: ${venda.data}`, 20, 52);
    doc.text(`Cliente: ${venda.cliente}`, 20, 59);
    doc.text(`Pagamento: ${venda.metodo}`, 20, 66);
    
    doc.line(20, 72, 190, 72);
    doc.text("PRODUTO", 25, 80);
    doc.text("QTD", 100, 80);
    doc.text("P. UNIT", 130, 80);
    doc.text("TOTAL", 165, 80);
    doc.line(20, 83, 190, 83);
    
    doc.text(venda.produto, 25, 90);
    doc.text(String(venda.qtd), 100, 90);
    doc.text(`${venda.precoUnit.toFixed(2)} MT`, 130, 90);
    doc.text(`${venda.total.toFixed(2)} MT`, 165, 90);
    
    doc.line(20, 97, 190, 97);
    doc.setFontSize(14);
    doc.text(`TOTAL GERAL: ${venda.total.toFixed(2)} MT`, 130, 107);
    
    doc.setFontSize(10);
    doc.text("Obrigado pela preferência!", 105, 120, { align: 'center' });
    
    doc.save(`Recibo_${venda.id}.pdf`);
}

// ================== 3. GRÁFICO RELATÓRIOS ==================

// 1. CALCULA TUDO COM FILTRO DE MÊS + FOLHA RH
function calcularTotais(){
    const filtroEl = document.getElementById('filtroMes');
    const mesFiltro = filtroEl?.value || "todos";
    let vendasFiltradas = vendas;
    if(mesFiltro !== "todos"){
        vendasFiltradas = vendas.filter(v => {
            try{ return new Date(v.data).getMonth() == mesFiltro; }catch(e){ return true; }
        });
    }
    totalVendas = 0; vendasFiltradas.forEach(v => totalVendas += Number(v.total)||0);
    totalCompras = 0; compras.forEach(c => totalCompras += Number(c.total)||0);
    totalFolha = 0; funcionarios.forEach(f => totalFolha += Number(f.salarioLiquido||f.salarioBruto||0));
}
// 2. ATUALIZA OS CARDS + GRAFICO
function atualizarRelatorio(){
    try{ calcularTotais(); }catch(e){}
    let lucro = totalVendas - totalCompras - totalFolha;
    const elV = document.getElementById('relVendas'); if(elV) elV.innerText = totalVendas.toFixed(2)+' MT';
    const elC = document.getElementById('relCompras'); if(elC) elC.innerText = totalCompras.toFixed(2)+' MT';
    const elF = document.getElementById('relFolha'); if(elF) elF.innerText = totalFolha.toFixed(2)+' MT';
    const elL = document.getElementById('relLucro'); if(elL) elL.innerText = lucro.toFixed(2)+' MT';
}

// 1. SALVA TUDO NO NAVEGADOR
function salvarTudoGeral(){
    localStorage.setItem('produtosRH', JSON.stringify(produtos));
    localStorage.setItem('vendasRH', JSON.stringify(vendas));
    localStorage.setItem('comprasRH', JSON.stringify(compras));
}

// 2. CARREGA TUDO QUANDO ABRE A PÁGINA
function carregarTudoGeral(){
    produtos = JSON.parse(localStorage.getItem('produtosRH')) || [];
    vendas = JSON.parse(localStorage.getItem('vendasRH')) || [];
    compras = JSON.parse(localStorage.getItem('comprasRH')) || [];
}

// CHAMA AO ABRIR A PÁGINA
carregarTudoGeral();
atualizarProdutos();
atualizarRelatorio();

function carregarProdutosVenda(){
    const select = document.getElementById('produtoVenda');
    if(!select) return;
    select.innerHTML = '';
    produtos.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nome} - Estoque: ${p.estoque}</option>`
    });
}

function mostrarCompras(){
 let produtos = JSON.parse(localStorage.getItem('produtosRH')||'[]');
 let area = document.getElementById('areaCompras');
 if(produtos.length==0){
   area.innerHTML='<p style="margin-top:10px;color:red">Cadastre produtos em Stock primeiro.</p>';
   return;
 }
 let html='<div style="margin-top:12px">';
 produtos.forEach(p=>{
   let stock = parseInt(p.estoque||p.stock||0);
   let status = '';
   if(stock<=2){ status = '<span style="color:red;font-weight:bold">🔴 URGENTE - Vai acabar em 2 dias</span><br><b>Sugestão: Comprar 5 unidades</b>'; }
   else if(stock<=5){ status = '<span style="color:#f59e0b;font-weight:bold">🟡 ATENÇÃO - Stock baixo</span><br><b>Sugestão: Comprar 3 unidades</b>'; }
   else { status = '<span style="color:green">🟢 Stock OK</span>'; }
   html+=`<div style="border-left:4px solid ${stock<=2?'red':stock<=5?'orange':'green'};background:#fff;padding:10px;margin:8px 0;border-radius:6px"><b>${p.nome}</b> - Stock atual: ${stock}<br>${status}</div>`;
 });
 html+='</div>';
 area.innerHTML=html;
}
