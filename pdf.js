// Monta o PDF de um pedido. Usado pelo app (navegador) e funciona também no Node para testes.
(function (root) {
  // As fontes padrão do PDF só têm os caracteres do Windows-1252. Símbolos fora dele (Ω, ″, ...)
  // embaralham a linha inteira, então são trocados por equivalentes antes de escrever.
  var TROCAS = {
    'Ω': ' ohm', 'Ω': ' ohm',            // Ω (letra grega) e Ω (símbolo de ohm)
    '″': '"', '′': "'",                   // ″ ′ (polegada, pé)
    '“': '"', '”': '"', '‘': "'", '’': "'",
    '–': '-', '—': '-', '≈': '~', '≤': '<=', '≥': '>=', '→': '->'
  };
  var EXTRA = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
  function limpa(s) {
    return String(s == null ? '' : s).replace(/[^\u0000-ÿ]/g, function (c) {
      if (TROCAS[c] != null) return TROCAS[c];
      return EXTRA.indexOf(c) >= 0 ? c : '';
    }).replace(/ {2,}/g, ' ');
  }
  function brl(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function dataBR(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' +
           d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  // logo (opcional): dataURL JPEG/PNG desenhado na faixa do topo, à esquerda.
  function gerar(jsPDF, p0, representante, logo) {
    // Cópia do pedido com os textos já limpos para a fonte do PDF.
    var p = {};
    for (var k in p0) p[k] = p0[k];
    ['num', 'empresaNome', 'clienteNome', 'clienteCidade', 'pagamento', 'obs'].forEach(function (k) { if (p[k] != null) p[k] = limpa(p[k]); });
    p.itens = (p0.itens || []).map(function (i) { return { id: i.id, nome: limpa(i.nome), un: limpa(i.un), q: i.q, preco: i.preco, tabela: i.tabela }; });
    representante = limpa(representante);
    var doc = new jsPDF({ unit: 'mm', format: 'a4' });
    var W = 210, M = 15, marinho = [10, 24, 56], azul = [47, 123, 255], tinta = [11, 22, 48], cinza = [86, 98, 125];
    var verde = marinho; // cor de cabeçalhos e títulos da tabela

    // Faixa do topo
    doc.setFillColor.apply(doc, marinho); doc.rect(0, 0, W, 30, 'F');
    doc.setFillColor.apply(doc, azul); doc.rect(0, 30, W, 2, 'F');
    var xTitulo = M;
    if (logo) {
      try {
        var fmt = /^data:image\/png/i.test(logo) ? 'PNG' : 'JPEG';
        doc.addImage(logo, fmt, M, 5, 20, 20);
        xTitulo = M + 20 + 5;
      } catch (e) { xTitulo = M; }
    }
    var tipo = p0.tipo === 'orcamento' ? 'Orçamento' : 'Pedido';
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
    doc.text(tipo + ' ' + p.num, xTitulo, 19);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(dataBR(p.data), W - M, 13, { align: 'right' });
    doc.text('Representante: ' + representante, W - M, 20, { align: 'right' });
    var rep = p0.rep || {};   // dados da representação: vão no rodapé, em letra pequena

    // Duas colunas simples, sem caixas: PEDIDO e CLIENTE, só o essencial.
    var y = 44;
    var c = p0.cli || {};
    var L = function (v) { return limpa(v == null ? '' : v); };
    var dBR = function (s) { return s ? String(s).split('-').reverse().join('/') : ''; };
    var curto = function (s) { return L(s).replace(/\s*\(.*\)\s*$/, ''); };   // "FOB (por conta do cliente)" -> "FOB"
    var enviado = ['Enviado ao fornecedor', 'Faturado', 'Entregue'].indexOf(p0.status) >= 0;
    var pag = [L(p.pagamento), c.frete ? curto(c.frete) : ''].filter(Boolean).join(' - ');
    function coluna(x, w, titulo, nome, linhas) {
      var yy = y;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8); doc.setTextColor.apply(doc, azul); doc.text(titulo, x, yy);
      yy += 6;
      doc.setFontSize(12); doc.setTextColor.apply(doc, tinta);
      var n = doc.splitTextToSize(L(nome), w); doc.text(n, x, yy); yy += n.length * 5.4 + 0.6;
      linhas.forEach(function (ln) {
        if (!ln || !ln[0]) return;
        doc.setFont('helvetica', ln[1] ? 'bold' : 'normal'); doc.setFontSize(9.5);
        doc.setTextColor.apply(doc, ln[1] ? tinta : cinza);
        var t = doc.splitTextToSize(L(ln[0]), w); doc.text(t, x, yy); yy += t.length * 4.5;
      });
      return yy;
    }
    var fimP = coluna(M, 84, tipo === 'Orçamento' ? 'ORÇAMENTO' : 'PEDIDO', p.empresaNome, [
      [pag],
      [p0.entrega ? 'Entrega desejada: ' + dBR(p0.entrega) : '', true],
      [p0.nf ? 'NF ' + p0.nf + (p0.dataFat ? ' de ' + dBR(p0.dataFat) : '') : '', true]
    ]);
    var doc_ = String(p.clienteCnpj || c.cnpj || '').replace(/\D/g, '');
    var fimC = coluna(M + 96, 84, 'CLIENTE', p.clienteNome, [
      [(doc_.length === 11 ? 'CPF ' : 'CNPJ ') + (p.clienteCnpj || c.cnpj || '-') + (c.ie ? '  -  IE ' + c.ie + (c.indicadorIe ? ' (' + c.indicadorIe + ')' : '') : ''), true],
      [[c.cidade || p.clienteCidade, [c.contato, c.telefone].filter(Boolean).join(' ')].filter(Boolean).join(' - ')],
      [p0.enderecoEntrega ? 'Entregar em: ' + p0.enderecoEntrega : (c.endereco || c.cep ? [c.endereco, c.cep ? 'CEP ' + c.cep : ''].filter(Boolean).join(' - ') : ''), true]
    ]);
    y = Math.max(fimP, fimC) + 6;

    // Tabela: Cód. | Produto | Un. | Qtd | (Desc.) | Preço | Subtotal  (Desc. só aparece se algum item tiver desconto)
    var descItem = function (i) { var t = Number(i.tabela) || 0, v = Number(i.preco) || 0; return t > v + 0.004 ? Math.round((1 - v / t) * 1000) / 10 : 0; };
    var temDesc = p.itens.some(function (i) { return descItem(i) > 0; });
    var codigo = function (i) { return limpa(String(i.id || '').replace(/^[A-Za-z]{2,4}-/, '')); };
    var col = { cod: M, prod: M + 20, un: 114, q: 130, desc: 146, preco: 170, sub: W - M };
    if (!temDesc) { col.un = 118; col.q = 142; col.preco = 168; }
    function cabecalho() {
      doc.setDrawColor.apply(doc, marinho); doc.setLineWidth(0.4); doc.line(M, y, W - M, y);
      y += 5.5;
      doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, cinza);
      doc.text('CÓD.', col.cod, y);
      doc.text('PRODUTO', col.prod, y);
      doc.text('UN.', col.un, y);
      doc.text('QTD', col.q, y, { align: 'right' });
      if (temDesc) doc.text('DESC.', col.desc, y, { align: 'right' });
      doc.text('PREÇO', col.preco, y, { align: 'right' });
      doc.text('SUBTOTAL', col.sub, y, { align: 'right' });
      y += 3; doc.setLineWidth(0.2); doc.setDrawColor(215, 223, 238); doc.line(M, y, W - M, y);
      y += 6;
    }
    cabecalho();
    p.itens.forEach(function (it) {
      doc.setFontSize(10);
      var nome = doc.splitTextToSize(it.nome, col.un - col.prod - 4);
      var alt = nome.length * 4.6;
      if (y + alt > 262) { doc.addPage(); y = 22; cabecalho(); }
      doc.setFont('helvetica', 'normal'); doc.setTextColor.apply(doc, cinza); doc.setFontSize(9); doc.text(doc.splitTextToSize(codigo(it), col.prod - col.cod - 2)[0] || '', col.cod, y); doc.setFontSize(10);
      doc.setTextColor.apply(doc, tinta); doc.text(nome, col.prod, y);
      doc.setTextColor.apply(doc, cinza); doc.text(String(it.un || ''), col.un, y);
      doc.setTextColor.apply(doc, tinta);
      doc.setFont('helvetica', 'bold'); doc.text(String(it.q), col.q, y, { align: 'right' });
      if (temDesc) { doc.setFont('helvetica', 'normal'); doc.setTextColor.apply(doc, cinza); doc.text(descItem(it) ? String(descItem(it)).replace('.', ',') + '%' : '', col.desc, y, { align: 'right' }); doc.setTextColor.apply(doc, tinta); }
      doc.setFont('helvetica', 'normal'); doc.text(brl(it.preco), col.preco, y, { align: 'right' });
      doc.setFont('helvetica', 'bold'); doc.text(brl(it.q * it.preco), col.sub, y, { align: 'right' });
      y += alt + 1.5;
      doc.setDrawColor(230, 235, 244); doc.setLineWidth(0.2); doc.line(M, y - 3.2, W - M, y - 3.2);
      y += 3;
    });
    y += 2;

    // Subtotal e desconto (quando houver)
    var desc = Number(p0.desconto) || 0;
    if (desc) {
      if (y > 240) { doc.addPage(); y = 22; }
      var bruto = Number(p0.bruto) || p.itens.reduce(function (s, i) { return s + i.q * i.preco; }, 0);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc, cinza);
      doc.text('Subtotal', W - M - 75, y); doc.text(brl(bruto), W - M - 5, y, { align: 'right' }); y += 6;
      doc.text('Desconto ' + String(desc).replace('.', ',') + '%', W - M - 75, y); doc.text('- ' + brl(bruto - p.total), W - M - 5, y, { align: 'right' }); y += 9;
    }

    // Total
    if (y > 250) { doc.addPage(); y = 22; }
    y += 2;
    doc.setFillColor.apply(doc, azul); doc.roundedRect(W - M - 80, y - 7, 80, 14, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.text('Total', W - M - 75, y + 1.8);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(brl(p.total), W - M - 5, y + 2.2, { align: 'right' });
    y += 18;

    if (p.obs) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, cinza);
      doc.text('Observação', M, y);
      doc.setFontSize(11); doc.setTextColor.apply(doc, tinta);
      var lo = doc.splitTextToSize(p.obs, W - 2 * M);
      doc.text(lo, M, y + 5.5);
      y += 10 + lo.length * 5;
    }
    // Condições e aceite do cliente (assinatura), no fim do documento.
    // (só o orçamento leva a frase de validade; no pedido fica só o aceite)
    if (y > 245) { doc.addPage(); y = 22; }
    doc.setTextColor.apply(doc, cinza);
    if (tipo === 'Orçamento') {
      doc.setFont('helvetica', 'italic'); doc.setFontSize(9);
      doc.text('Orçamento válido por 7 dias. Preços e disponibilidade sujeitos a confirmação do fornecedor.', M, y + 2);
      y += 10;
    } else y += 4;
    // (sem linhas de assinatura e data: o pedido segue por e-mail)

    // Rodapé
    var tot = doc.getNumberOfPages();
    for (var i = 1; i <= tot; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor.apply(doc, cinza);
      var repTxt = [rep.nome, rep.cnpj && 'CNPJ ' + rep.cnpj, rep.email, rep.telefone].filter(Boolean).join('  -  ');
      if (repTxt) doc.text(limpa(repTxt), M, 287);
      else doc.text(tipo + ' ' + p.num + ', ' + p.clienteNome, M, 287);
      doc.text('Página ' + i + ' de ' + tot, W - M, 287, { align: 'right' });
    }
    return doc;
  }

  function nomeArquivo(p) {
    var cli = String(p.clienteNome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (p.tipo === 'orcamento' ? 'Orcamento-' : 'Pedido-') + p.num + (cli ? '-' + cli : '') + '.pdf';
  }

  // Relatório do administrador: A4 deitado, com totais, itens mais pedidos, lojas e histórico detalhado.
  // d = { filtros: [texto], totais: {pedidos, itens, valor, lojas}, porProduto: [], porLoja: [], linhas: [] }
  function relatorio(jsPDF, d, logo) {
    var doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
    var W = 297, H = 210, M = 12, marinho = [10, 24, 56], azul = [47, 123, 255], tinta = [11, 22, 48], cinza = [86, 98, 125];
    var claro = [227, 236, 255], linha = [215, 223, 238];

    // Cabeçalho
    doc.setFillColor.apply(doc, marinho); doc.rect(0, 0, W, 24, 'F');
    doc.setFillColor.apply(doc, azul); doc.rect(0, 24, W, 1.5, 'F');
    var x0 = M;
    if (logo) {
      try { doc.addImage(logo, /^data:image\/png/i.test(logo) ? 'PNG' : 'JPEG', M, 4, 16, 16); x0 = M + 21; } catch (e) { x0 = M; }
    }
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.text('Relatório de pedidos', x0, 12);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
    doc.text(doc.splitTextToSize(limpa(d.filtros.join('   ·   ')), W - x0 - M - 50), x0, 18);
    var agora = new Date();
    doc.text('Gerado em ' + agora.toLocaleDateString('pt-BR') + ' às ' + agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }), W - M, 12, { align: 'right' });

    // Quadros de totais
    var quadros = [['Pedidos', String(d.totais.pedidos)], ['Itens (unidades)', d.totais.itens.toLocaleString('pt-BR')],
      ['Valor total', brl(d.totais.valor)], ['Lojas atendidas', String(d.totais.lojas)]];
    if (d.comissao) quadros.push(['Comissão a receber', brl(d.totais.comissaoMarcas)], ['Comissão a pagar', brl(d.totais.comissaoVendedores)]);
    var y = 32, cw = (W - 2 * M - (quadros.length - 1) * 4) / quadros.length;
    function desenharQuadros() {
      if (y > H - 40) { doc.addPage(); y = 16; }
    quadros.forEach(function (c, i) {
      var x = M + i * (cw + 4);
      doc.setFillColor.apply(doc, claro); doc.roundedRect(x, y, cw, 16, 2, 2, 'F');
      doc.setTextColor.apply(doc, cinza); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.text(c[0], x + 4, y + 5.5);
      doc.setTextColor.apply(doc, tinta); doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.text(c[1], x + 4, y + 12.5);
    });
    y += 24;
    }

    // Tabela com quebra de página, cabeçalho repetido e texto quebrado em até 3 linhas por célula.
    function tabela(titulo, cols, rows) {
      if (y > H - 40) { doc.addPage(); y = 16; }
      doc.setTextColor.apply(doc, tinta); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(titulo, M, y); y += 4;
      function cab() {
        doc.setFillColor.apply(doc, claro); doc.rect(M, y, W - 2 * M, 7, 'F');
        doc.setTextColor.apply(doc, marinho); doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
        var x = M;
        cols.forEach(function (c) { doc.text(c.t, c.a === 'r' ? x + c.w - 2 : x + 2, y + 4.8, c.a === 'r' ? { align: 'right' } : undefined); x += c.w; });
        y += 7;
      }
      cab();
      doc.setFontSize(8.3);
      rows.forEach(function (r) {
        doc.setFont('helvetica', 'normal');
        var partes = cols.map(function (c, i) { return doc.splitTextToSize(limpa(r[i]), c.w - 4).slice(0, 3); });
        var h = Math.max.apply(null, partes.map(function (p) { return p.length; })) * 3.6 + 2.6;
        if (y + h > H - 12) { doc.addPage(); y = 16; cab(); doc.setFontSize(8.3); doc.setFont('helvetica', 'normal'); }
        var x = M;
        cols.forEach(function (c, i) {
          doc.setTextColor.apply(doc, c.cinza ? cinza : tinta);
          doc.setFont('helvetica', c.b ? 'bold' : 'normal');
          doc.text(partes[i], c.a === 'r' ? x + c.w - 2 : x + 2, y + 3.9, c.a === 'r' ? { align: 'right' } : undefined);
          x += c.w;
        });
        y += h;
        doc.setDrawColor.apply(doc, linha); doc.setLineWidth(0.15); doc.line(M, y, W - M, y);
      });
      y += 9;
    }
    var n = function (v) { return Number(v).toLocaleString('pt-BR'); };
    var dt = function (s) { var x = new Date(s); return x.toLocaleDateString('pt-BR') + ' ' + x.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); };

    // Quadro por mês (produto x meses: quantidade e ticket médio), com as cores da tela. Só ele no PDF anual.
    function matrizPdf(titulo, mx) {
      var nm = mx.meses.length, wp = nm > 6 ? 46 : 70, wt = nm > 6 ? 20 : 30, wm = (W - 2 * M - wp - wt) / nm, wq = wm * 0.4, wk = wm * 0.6;
      var maxQ = 1; mx.linhas.forEach(function (x) { mx.meses.forEach(function (m) { var c = x.por[m.chave]; if (c && c.q > maxQ) maxQ = c.q; }); });
      function cab() {
        if (y > H - 40) { doc.addPage(); y = 16; }
        doc.setFillColor(219, 230, 243); doc.rect(M, y, wp, 12, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(7.5); doc.setTextColor.apply(doc, marinho); doc.text('Produto', M + 2, y + 7);
        var x = M + wp;
        mx.meses.forEach(function (m) {
          doc.setFillColor(219, 230, 243); doc.rect(x, y, wm, 6, 'F'); doc.setTextColor.apply(doc, marinho); doc.text(m.rot, x + wm / 2, y + 4.2, { align: 'center' });
          doc.setFillColor(232, 240, 250); doc.rect(x, y + 6, wq, 6, 'F'); doc.setFillColor(222, 242, 232); doc.rect(x + wq, y + 6, wk, 6, 'F');
          doc.setFontSize(6.3); doc.setTextColor.apply(doc, cinza); doc.text('quant', x + wq / 2, y + 10.2, { align: 'center' }); doc.text('ticket', x + wq + wk / 2, y + 10.2, { align: 'center' }); doc.setFontSize(7.5);
          x += wm;
        });
        doc.setFillColor(225, 228, 235); doc.rect(x, y, wt, 12, 'F'); doc.setTextColor.apply(doc, marinho); doc.text('Total', x + wt / 2, y + 4.2, { align: 'center' });
        doc.setFontSize(6.3); doc.setTextColor.apply(doc, cinza); doc.text('quant', x + wt * 0.2, y + 10.2, { align: 'center' }); doc.text('ticket', x + wt * 0.65, y + 10.2, { align: 'center' });
        y += 12;
      }
      doc.setTextColor.apply(doc, tinta); doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text(titulo, M, y); y += 4;
      cab();
      mx.linhas.forEach(function (x0) {
        if (y + 8 > H - 12) { doc.addPage(); y = 16; cab(); }
        var x = M + wp;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor.apply(doc, tinta);
        doc.text(doc.splitTextToSize(limpa(x0.produto), wp - 3).slice(0, 2), M + 2, y + 3.4);
        mx.meses.forEach(function (m) {
          var c = x0.por[m.chave];
          if (c) { var a = 0.08 + 0.32 * c.q / maxQ; doc.setFillColor(Math.round(255 - (255 - 61) * a), Math.round(255 - (255 - 123) * a), 255); doc.rect(x, y, wq, 8, 'F'); doc.setFillColor(238, 248, 243); doc.rect(x + wq, y, wk, 8, 'F'); }
          doc.setTextColor.apply(doc, tinta);
          doc.text(c ? String(c.q) : '·', x + wq / 2, y + 5, { align: 'center' }); doc.text(c && c.q ? brl(c.total / c.q) : '·', x + wq + wk / 2, y + 5, { align: 'center' });
          x += wm;
        });
        doc.setFont('helvetica', 'bold'); doc.text(String(x0.q), x + wt * 0.2, y + 5, { align: 'center' }); doc.text(x0.q ? brl(x0.total / x0.q) : '·', x + wt * 0.65, y + 5, { align: 'center' });
        y += 8; doc.setDrawColor.apply(doc, linha); doc.setLineWidth(0.15); doc.line(M, y, W - M, y);
      });
      y += 8;
    }
    if (d.matriz && d.matriz.linhas.length) matrizPdf(d.soMatriz ? 'Histórico de compra por mês · ' + d.matriz.meses.length + ' meses' : 'Histórico de compra por mês (últimos ' + d.matriz.meses.length + ' meses)', d.matriz);
    if (d.soMatriz) { var tt = doc.getNumberOfPages(); for (var ii = 1; ii <= tt; ii++) { doc.setPage(ii); doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor.apply(doc, cinza); doc.text('GYN Representações · Relatório anual', M, H - 6); doc.text('Página ' + ii + ' de ' + tt, W - M, H - 6, { align: 'right' }); } return doc; }

    // Primeiro o histórico de compra dos itens, depois o resumo.
    tabela('Histórico de compra dos itens', [
      { t: 'Produto', w: 110 }, { t: 'Empresa', w: 36, cinza: 1 }, { t: 'Código', w: 26, cinza: 1 }, { t: 'Pedidos', w: 18, a: 'r' },
      { t: 'Quantidade', w: 25, a: 'r', b: 1 }, { t: 'Ticket médio', w: 28, a: 'r' }, { t: 'Valor total', w: 30, a: 'r' }],
      d.porProduto.map(function (x) { return [x.produto, x.empresa, x.codigo, x.pedidos, n(x.q), brl(x.q ? x.total / x.q : 0), brl(x.total)]; }));
    desenharQuadros();

    if (d.comissao) {
      var pct = function (x) { return x.pct ? String(x.pct).replace('.', ',') + '%' : 'definir'; };
      tabela('Comissão por marca (a receber)', [
        { t: 'Marca', w: 113 }, { t: 'Pedidos', w: 30, a: 'r' }, { t: 'Vendas', w: 45, a: 'r' }, { t: '%', w: 30, a: 'r' }, { t: 'Comissão', w: 55, a: 'r', b: 1 }],
        d.comissao.marcas.map(function (x) { return [x.nome, x.pedidos, brl(x.vendas), pct(x), brl(x.comissao)]; }));
      tabela('Comissão por vendedor (a pagar)', [
        { t: 'Vendedor', w: 113 }, { t: 'Pedidos', w: 30, a: 'r' }, { t: 'Vendas', w: 45, a: 'r' }, { t: '%', w: 30, a: 'r' }, { t: 'Comissão', w: 55, a: 'r', b: 1 }],
        d.comissao.vendedores.map(function (x) { return [x.nome, x.pedidos, brl(x.vendas), pct(x), brl(x.comissao)]; }));
    }
    if (d.ritmo && d.ritmo.length && d.ritmoPdf) tabela('Ritmo de compra (quem precisa de atenção primeiro)', [
      { t: 'Cliente', w: 70 }, { t: 'Situação', w: 30, b: 1 }, { t: 'Última compra', w: 38 }, { t: 'Ritmo normal', w: 38, cinza: 1 },
      { t: 'Próxima compra', w: 47 }, { t: 'Tendência', w: 50 }],
      d.ritmo.map(function (s) { return d.ritmoPdf(s); }));
    tabela('Por loja', [
      { t: 'Loja', w: 82 }, { t: 'CNPJ', w: 38, cinza: 1 }, { t: 'Rede', w: 35, cinza: 1 }, { t: 'Cidade', w: 28, cinza: 1 },
      { t: 'Pedidos', w: 25, a: 'r' }, { t: 'Itens', w: 25, a: 'r' }, { t: 'Valor', w: 40, a: 'r', b: 1 }],
      d.porLoja.map(function (x) { return [x.loja, x.cnpj || '', x.rede || '', x.cidade, x.pedidos, n(x.q), brl(x.total)]; }));
    if (d.temRede && d.porRede) tabela('Por rede (soma das filiais)', [
      { t: 'Rede / loja', w: 120 }, { t: 'Tipo', w: 38, cinza: 1 }, { t: 'CNPJs', w: 25, a: 'r' },
      { t: 'Pedidos', w: 25, a: 'r' }, { t: 'Itens', w: 25, a: 'r' }, { t: 'Valor', w: 40, a: 'r', b: 1 }],
      d.porRede.map(function (x) { return [x.rede, x.ehRede ? 'Rede' : 'Loja sem rede', x.cnpjs, x.pedidos, n(x.q), brl(x.total)]; }));
    tabela('Histórico detalhado', [
      { t: 'Produto', w: 66 }, { t: 'Quantidade', w: 20, a: 'r', b: 1 }, { t: 'Ticket médio', w: 24, a: 'r' }, { t: 'Total', w: 24, a: 'r' },
      { t: 'Data', w: 26 }, { t: 'Pedido', w: 22 }, { t: 'Loja', w: 42 }, { t: 'Vendedor', w: 25, cinza: 1 }, { t: 'Situação', w: 24, cinza: 1 }],
      d.linhas.map(function (l) { return [l.produto, n(l.q), brl(l.preco), brl(l.total), dt(l.data), l.num, l.loja, l.vendedor, l.status]; }));

    // Rodapé
    var tot = doc.getNumberOfPages();
    for (var i = 1; i <= tot; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor.apply(doc, cinza);
      doc.text('GYN Representações · Relatório de pedidos', M, H - 6);
      doc.text('Página ' + i + ' de ' + tot, W - M, H - 6, { align: 'right' });
    }
    return doc;
  }

  var api = { gerar: gerar, nomeArquivo: nomeArquivo, relatorio: relatorio };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PedidoPDF = api;
})(this);
