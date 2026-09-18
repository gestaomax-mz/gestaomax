function entrarCliente(){
  let telaLogin=document.getElementById('telaLogin'); if(telaLogin) telaLogin.style.display='none';
  let sistema=document.getElementById('sistema'); if(sistema) sistema.style.display='none';
  let velho=document.getElementById('sistemaCliente'); if(velho) velho.remove();
  let cfg=JSON.parse(localStorage.getItem('gm_config_pag')||'{"mpesa":"852573746","emola":"873370614","dinheiro":"Na loja","banco":"BCI - 000000"}');
  let produtos=JSON.parse(localStorage.getItem('produtosRH')||'[]');
  let novo=document.createElement('div'); novo.id='sistemaCliente';
  novo.innerHTML=`<div style="background:#0d6efd;color:#fff;padding:12px;display:flex;justify-content:space-between"><b>Catalogo - GESTAOMAX</b><button onclick="location.reload()" style="background:#fff;color:#0d6efd;border:0;padding:6px 12px;border-radius:5px">Voltar</button></div><div style="background:#fff;margin:15px;padding:15px;border-radius:8px"><b>Formas de Pagamento da Loja</b><div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:6px 0"><span>M-Pesa</span><b>${cfg.mpesa}</b></div><div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:6px 0"><span>Emola</span><b>${cfg.emola}</b></div><div style="display:flex;justify-content:space-between;border-bottom:1px solid #eee;padding:6px 0"><span>Dinheiro</span><b>${cfg.dinheiro}</b></div><div style="display:flex;justify-content:space-between;padding:6px 0"><span>Banco</span><b>${cfg.banco}</b></div></div><div style="background:#fff;margin:15px;padding:15px;border-radius:8px" id="areaProdutos"></div>`;
  document.body.appendChild(novo);
  let area=document.getElementById('areaProdutos');
  area.innerHTML="<b>Produtos ("+produtos.length+")</b><br><br>"+produtos.map(p=>{
    let num=(cfg.mpesa||'852573746').replace(/[^0-9]/g,'').slice(-9);
    return `<div style="border:1px solid #ddd;padding:12px;margin:8px 0;border-radius:8px;display:flex;justify-content:space-between;align-items:center"><div><b>${p.nome}</b><br><small>Stock:${p.estoque||p.stock||0}</small><br><b style="color:#0d6efd">MT ${p.precoVenda}</b></div><a target="_blank" href="https://wa.me/258${num}?text=Quero ${encodeURIComponent(p.nome)}" style="background:#25D366;color:#fff;padding:8px 12px;border-radius:6px;text-decoration:none">WhatsApp</a></div>`;
  }).join('');
}