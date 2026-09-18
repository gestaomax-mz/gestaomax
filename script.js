// GESTAOMAX COMERCIAL V2 - FINAL COM PAGAMENTOS
const GMAX_KEY = 'gestaomax_licenca_v1';
const GMAX_EMPRESA = 'gestaomax_empresa_atual';

const MEUS_PAGAMENTOS = {
  mpesa: "852573746 - Stephan Jeque",
  emola: "868070614 - Elidio Jeque",
  nib: "904325160000026603348 - NEDBANK",
  chamadas: "868070614 / 879246937",
  whatsapp: "852573746 / 873370614"
};

const MEUS_PRECOS = "START 1.200MT | PRO 1.500MT | BUSINESS 2.500MT";

function validarChave(chave){
  if(!chave ||!chave.startsWith('GMAX-')) return null;
  let partes = chave.split('-');
  if(partes.length < 4) return null;
  let expStr = partes[partes.length-2];
  let check = partes[partes.length-1];
  let base = partes.slice(0,-1).join('-');
  let calc=0; for(let c of base) calc+=c.charCodeAt(0);
  if((calc%97).toString().padStart(2,'0')!== check) return null;
  let ano = expStr.slice(0,4), mes = expStr.slice(4,6), dia = expStr.slice(6,8);
  let expira = new Date(`${ano}-${mes}-${dia}`);
  if(new Date() > expira) return {expirada:true, data:expira};
  let nomeEmpresa = partes[1].replace(/_/g,' ');
  return {valida:true, empresa:nomeEmpresa, expira};
}

function verificarLicenca(){
  let chave = localStorage.getItem(GMAX_KEY);
  if(!chave) return {ok:false};
  let v = validarChave(chave);
  if(!v ||!v.valida) return {ok:false, msg:'Chave inválida'};
  if(v.expirada) return {ok:false, expirada:true, data:v.data};
  return {ok:true, empresa:v.empresa, expira:v.expira, chave};
}

function telaLicenca(motivo=''){
  document.body.innerHTML = `<div style="min-height:100vh;background:#0d47a1;display:flex;align-items:center;justify-content:center;padding:15px;font-family:Arial;">
  <div style="background:white;border-radius:20px;max-width:420px;width:100%;padding:25px;text-align:center">
    <h2 style="color:#0d47a1">GESTAOMAX MZ</h2>
    <p style="color:#666;font-size:14px">${motivo || 'Sistema Licenciado'}</p>
    <div style="font-size:13px;background:#fff3e0;padding:12px;border-radius:8px;text-align:left;line-height:1.6">
      <b style="color:#e65100">FAÇA PAGAMENTO:</b><br>
      <b>M-Pesa:</b> ${MEUS_PAGAMENTOS.mpesa}<br>
      <b>E-Mola:</b> ${MEUS_PAGAMENTOS.emola}<br>
      <b>NIB:</b> ${MEUS_PAGAMENTOS.nib}<br><br>
      <b>PREÇOS:</b><br>${MEUS_PRECOS.replace(/\|/g,'<br>')}<br><br>
      Depois insira a chave abaixo
    </div>
    <input id="inputChave" placeholder="GMAX-..." style="width:100%;padding:14px;border:2px solid #ddd;border-radius:12px;margin-top:12px">
    <button onclick="ativarLicenca()" style="width:100%;margin-top:12px;padding:14px;background:#1565C0;color:white;border:none;border-radius:12px;font-weight:bold">Ativar Licença</button>
    <p style="font-size:11px;margin-top:15px">Chamadas: ${MEUS_PAGAMENTOS.chamadas}<br>WhatsApp: ${MEUS_PAGAMENTOS.whatsapp}</p>
  </div></div>`;
}

window.ativarLicenca = function(){
  let c = document.getElementById('inputChave').value.trim().toUpperCase();
  let v = validarChave(c);
  if(!v || (!v.valida &&!v.expirada)){ alert('Chave inválida!'); return; }
  if(v.expirada){ alert('Chave expirada em '+v.data.toLocaleDateString()); return; }
  localStorage.setItem(GMAX_KEY, c);
  localStorage.setItem(GMAX_EMPRESA, v.empresa);
  location.reload();
}

function getEmpresaAtual(){ return localStorage.getItem(GMAX_EMPRESA) || 'GERAL'; }
function getKeyFuncionarios(){ return 'funcionariosRH_'+getEmpresaAtual().replace(/\s+/g,'_'); }
function getFuncionariosEmpresa(){
  try{ return JSON.parse(localStorage.getItem(getKeyFuncionarios()) || localStorage.getItem('funcionariosRH') || '[]'); }catch{ return []; }
}
function setFuncionariosEmpresa(arr){
  let unicos = []; let vistos = new Set();
  arr.forEach(f=>{ let k=(f.nome||'').toLowerCase(); if(!vistos.has(k)){vistos.add(k); unicos.push(f);} });
  localStorage.setItem(getKeyFuncionarios(), JSON.stringify(unicos));
  localStorage.setItem('funcionariosRH', JSON.stringify(unicos));
  window.funcionarios = unicos;
  return unicos;
}

(function(){
  let lic = verificarLicenca();
  if(!lic.ok){
    if(lic.expirada) telaLicenca('Licença expirada em '+lic.data.toLocaleDateString()+'<br>Renove via M-Pesa<br>'+MEUS_PAGAMENTOS.mpesa);
    else telaLicenca();
    return;
  }
  window.funcionarios = getFuncionariosEmpresa();
  setTimeout(()=>{
    let h1=document.querySelector('h1');
    if(h1) h1.innerHTML += `<div style="font-size:12px;background:#e3f2fd;color:#0d47a1;padding:4px 8px;border-radius:20px;margin-top:5px;display:inline-block">Licenciado: ${lic.empresa} | até ${lic.expira.toLocaleDateString()}</div>`;
  },500);
})();

window.verMinhaSituacao = function(e){
  if(e) e.preventDefault();
  let funcs = getFuncionariosEmpresa();
  let input = document.querySelector('input[placeholder*="Código"]') || document.querySelectorAll('input')[0];
  let termo = (input?.value||'').trim().toLowerCase();
  if(!termo) termo = (prompt('Digite seu NOME:')||'').toLowerCase();
  if(!termo) return;
  let f = funcs.find(x=> (x.nome||'').toLowerCase().includes(termo) || String(x.id)===termo || (x.codigo||'').toLowerCase()===termo);
  if(!f){ alert('Não achei. Lista: '+funcs.map(x=>x.nome).join(', ')); return; }
  document.body.innerHTML = `<div style="background:#f0f2f5;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:15px;font-family:Arial;"><div style="background:white;border-radius:20px;max-width:420px;width:100%;overflow:hidden;box-shadow:0 15px 40px rgba(0,0,0,.2);"><div style="background:#1565C0;color:white;padding:25px;text-align:center;"><h2>${f.nome}</h2><p>${getEmpresaAtual()}</p></div><div style="padding:22px;"><p>Base: ${f.salarioBruto} MT</p><div style="background:#1565C0;color:white;padding:18px;border-radius:12px;font-size:18px;"><b>Líquido: ${Number(f.salarioLiquido).toFixed(2)} MT</b></div><button onclick="location.reload()" style="width:100%;margin-top:15px;padding:14px;background:#111;color:white;border:none;border-radius:12px">Sair</button></div></div></div>`;
}
setTimeout(()=>{
  document.querySelectorAll('button').forEach(b=>{
    if(b.textContent.toLowerCase().includes('ver minha')) b.onclick = window.verMinhaSituacao;
  });
},800);
