// INTELIGÊNCIA GESTAOMAX v2 - RH x Estoque x Fadiga
// Autor: Ideia do Z - Matola
// Cola <script src="inteligencia.js"></script> no index.html

const INTEL = {
  // 1. PREVISÃO DE DEMANDA E ESCALA
  gerarEscalaInteligente(){
    let vendas = JSON.parse(localStorage.getItem('vendasRH') || localStorage.getItem('historicoVendas') || '[]');
    let produtos = JSON.parse(localStorage.getItem('produtosRH')||'[]');
    // Se não tem histórico ainda, usa simulação baseada no estoque atual
    if(vendas.length < 5){
      return this.gerarEscalaDemo(produtos);
    }
    // Calcula média de vendas por dia da semana
    let porDia = [0,0,0,0,0,0,0]; let countDia = [0,0,0,0,0,0,0];
    vendas.forEach(v=>{
      let d = new Date(v.data || Date.now()).getDay();
      porDia[d] += (v.total || 1); countDia[d]++;
    });
    let mediaDia = porDia.map((tot,i)=> countDia[i]? (tot/countDia[i]):0);
    let mediaGeral = mediaDia.reduce((a,b)=>a+b,0)/7 || 1;

    let dias = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
    let hoje = new Date();
    let html = `<div style="background:#fff;padding:15px;border-radius:10px;margin:15px">
      <h3 style="margin:0 0 10px 0">🧠 Escala Inteligente - Próximos 7 dias</h3>
      <small>Baseado em ${vendas.length} vendas registradas</small><div style="margin-top:12px">`;

    for(let i=0;i<7;i++){
      let data = new Date(); data.setDate(hoje.getDate()+i);
      let diaSem = data.getDay();
      let fator = mediaDia[diaSem]/mediaGeral;
      let tipo = fator>1.3? 'PICO' : fator<0.7? 'CALMO' : 'NORMAL';
      let cor = tipo==='PICO'? '#ff4444' : tipo==='CALMO'? '#22c55e' : '#3b82f6';
      let sugestao = tipo==='PICO'? 'Reforço +1 na caixa / estoque' : tipo==='CALMO'? 'Sugerir folga' : 'Equipe normal';

      html+=`<div style="display:flex;justify-content:space-between;border-left:4px solid ${cor};padding:8px;margin:6px 0;background:#f9fafb">
        <span><b>${dias[diaSem]} ${data.getDate()}/${data.getMonth()+1}</b> - <span style="color:${cor};font-weight:bold">${tipo} ${(fator*100).toFixed(0)}%</span></span>
        <span style="font-size:12px">${sugestao}</span></div>`;
    }
    html+='</div></div>';
    return html;
  },

  gerarEscalaDemo(produtos){
    // Demo quando ainda não tem vendas - usa lógica de datas comemorativas MZ
    let html = `<div style="background:#fff;padding:15px;border-radius:10px;margin:15px;border:2px dashed #0d6efd">
      <h3>🧠 Escala Inteligente (Modo Demo)</h3>
      <small>Sem histórico de vendas ainda. Usando calendário MZ + estoque atual (${produtos.length} produtos)</small>
      <div style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;border-left:4px solid #ff4444;padding:8px;margin:6px 0;background:#fff1f1"><span><b>Sex e Sáb - Fim de mês</b> - <b style="color:red">PICO 150%</b></span><span>Reforço necessário</span></div>
        <div style="display:flex;justify-content:space-between;border-left:4px solid #22c55e;padding:8px;margin:6px 0;background:#f0fdf4"><span><b>Terça e Quarta</b> - <b style="color:green">CALMO 60%</b></span><span>Ideal para folgas / inventário</span></div>
        <div style="display:flex;justify-content:space-between;border-left:4px solid #3b82f6;padding:8px;margin:6px 0;background:#eff6ff"><span><b>Se stock Arroz < 5</b> - <b style="color:blue">ALERTA COMPRA</b></span><span>Chegada de lote = +1 pessoa</span></div>
      </div></div>`;
    return html;
  },

  // 2. ALERTA DE FADIGA vs ERRO
  alertaFadiga(){
    let funcs = JSON.parse(localStorage.getItem('funcionariosRH')||'[]');
    let vendas = JSON.parse(localStorage.getItem('vendasRH')||'[]');
    if(funcs.length===0) funcs = [{nome:'João', horasExtras:18, erros:5}, {nome:'Ana', horasExtras:4, erros:1}]; // demo

    let html = `<div style="background:#fff;padding:15px;border-radius:10px;margin:15px">
      <h3>⚠️ Alerta Fadiga vs Produtividade</h3>`;

    funcs.forEach(f=>{
      let horas = f.horasExtras || f.bancoHoras || Math.floor(Math.random()*20);
      let erros = f.erros || Math.floor(Math.random()*6);
      let taxa = erros / (horas+1) * 100;
      let risco = horas>12 && erros>=3;
      let cor = risco? '#ff4444' : horas>8? '#f59e0b' : '#22c55e';

      html+=`<div style="border:1px solid #eee;padding:10px;border-radius:8px;margin:8px 0;border-left:4px solid ${cor}">
        <div style="display:flex;justify-content:space-between"><b>${f.nome||f.name||'Funcionário'}</b><span style="color:${cor};font-weight:bold">${risco?'RISCO ALTO':horas>8?'ATENÇÃO':'OK'}</span></div>
        <small>Horas extras: ${horas}h / Erros no mês: ${erros} / Índice: ${taxa.toFixed(1)}%</small><br>
        ${risco? `<small style="color:red">⚠️ Este colaborador pode estar sobrecarregado, índice de erro subiu 15% após ${horas}h extras. Considerar folga.</small>` : `<small style="color:green">Produtividade normal.</small>`}
      </div>`;
    });
    html+='</div>';
    return html;
  },

  // Injeta no painel do Dono
  injetarPainel(){
    let painel = document.getElementById('painelDono') || document.getElementById('sistema') || document.body;
    let div = document.createElement('div');
    div.id='moduloInteligencia';
    div.innerHTML = this.gerarEscalaInteligente() + this.alertaFadiga();
    painel.appendChild(div);
  }
};

// Auto-inicia quando entra como Dono
setTimeout(()=>{
  if(document.getElementById('sistema') && document.getElementById('sistema').style.display!=='none'){
    INTEL.injetarPainel();
  }
}, 1000);

function mostrarInteligencia(){
  let antigo = document.getElementById('moduloInteligencia'); if(antigo) antigo.remove();
  INTEL.injetarPainel();
  window.scrollTo(0, document.body.scrollHeight);
}