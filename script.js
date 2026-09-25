// GESTAOMAX COMERCIAL V2 - FINAL COM PAGAMENTOS - LIMPO
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
})();
function baixarBackup(){
  let dados = {
    funcionarios: localStorage.getItem(getKeyFuncionarios()),
    empresa: getEmpresaAtual(),
    data: new Date().toISOString()
  };
  let blob = new Blob([JSON.stringify(dados)], {type:'application/json'});
  let url = URL.createObjectURL(blob);
  let a = document.createElement('a');
  a.href = url; a.download = `backup_${getEmpresaAtual()}_${new Date().toISOString().slice(0,10)}.json`; a.click();
  URL.revokeObjectURL(url);
}
function carregarBackup(event){
  const file = event.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e){
    try{
      const dados = JSON.parse(e.target.result);
      if(dados.funcionarios){
        localStorage.setItem(getKeyFuncionarios(), dados.funcionarios);
        localStorage.setItem('funcionariosRH', dados.funcionarios);
      }
      alert("Backup carregado com sucesso!");
      location.reload();
    }catch(err){
      alert("Arquivo inválido: " + err.message);
    }
  };
  reader.readAsText(file);
}
