// Monta o PDF de um pedido. Usado pelo app (navegador) e funciona também no Node para testes.
(function (root) {
  function brl(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
  function dataBR(iso) {
    var d = new Date(iso);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' +
           d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }

  function gerar(jsPDF, p, representante) {
    var doc = new jsPDF({ unit: 'mm', format: 'a4' });
    var W = 210, M = 15, verde = [47, 93, 70], ipe = [233, 176, 30], tinta = [30, 39, 34], cinza = [92, 104, 97];

    // Faixa do topo
    doc.setFillColor.apply(doc, verde); doc.rect(0, 0, W, 30, 'F');
    doc.setFillColor.apply(doc, ipe); doc.rect(0, 30, W, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(22);
    doc.text('Pedido ' + p.num, M, 19);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
    doc.text(dataBR(p.data), W - M, 13, { align: 'right' });
    doc.text('Representante: ' + representante, W - M, 20, { align: 'right' });

    // Dados do pedido
    var y = 44;
    function campo(rot, val, x, yy, larg) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, cinza);
      doc.text(rot, x, yy);
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor.apply(doc, tinta);
      var linhas = doc.splitTextToSize(String(val || ''), larg);
      doc.text(linhas, x, yy + 5.5);
      return linhas.length;
    }
    var n1 = campo('Empresa', p.empresaNome, M, y, 85);
    var n2 = campo('Cliente', p.clienteNome + (p.clienteCidade ? ' (' + p.clienteCidade + ')' : ''), 110, y, 85);
    y += 8 + Math.max(n1, n2) * 5.5;
    campo('Pagamento', p.pagamento, M, y, 85);
    campo('Itens', p.itens.length + (p.itens.length === 1 ? ' produto' : ' produtos'), 110, y, 85);
    y += 16;

    // Tabela
    var col = { q: 27, prod: 32, un: 120, preco: 165, sub: W - M };
    function cabecalho() {
      doc.setFillColor(228, 237, 230); doc.rect(M, y - 5.5, W - 2 * M, 8, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor.apply(doc, verde);
      doc.text('Qtd.', col.q, y, { align: 'right' });
      doc.text('Produto', col.prod, y);
      doc.text('Unidade', col.un, y);
      doc.text('Preço', col.preco, y, { align: 'right' });
      doc.text('Subtotal', col.sub, y, { align: 'right' });
      y += 8;
    }
    cabecalho();
    doc.setFontSize(10.5);
    p.itens.forEach(function (it) {
      var nome = doc.splitTextToSize(it.nome, col.un - col.prod - 4);
      var alt = nome.length * 5 + 3;
      if (y + alt > 262) { doc.addPage(); y = 22; cabecalho(); doc.setFontSize(10.5); }
      doc.setTextColor.apply(doc, tinta);
      doc.setFont('helvetica', 'bold'); doc.text(String(it.q), col.q, y, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.text(nome, col.prod, y);
      doc.setTextColor.apply(doc, cinza); doc.text(String(it.un || ''), col.un, y);
      doc.setTextColor.apply(doc, tinta);
      doc.text(brl(it.preco), col.preco, y, { align: 'right' });
      doc.setFont('helvetica', 'bold'); doc.text(brl(it.q * it.preco), col.sub, y, { align: 'right' });
      y += alt - 3;
      doc.setDrawColor(220, 225, 218); doc.setLineWidth(0.2); doc.line(M, y, W - M, y);
      y += 6;
    });

    // Total
    if (y > 250) { doc.addPage(); y = 22; }
    y += 2;
    doc.setFillColor.apply(doc, ipe); doc.roundedRect(W - M - 80, y - 7, 80, 14, 2, 2, 'F');
    doc.setTextColor(42, 33, 4);
    doc.setFont('helvetica', 'normal'); doc.setFontSize(11); doc.text('Total', W - M - 75, y + 1.8);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(16); doc.text(brl(p.total), W - M - 5, y + 2.2, { align: 'right' });
    y += 18;

    if (p.obs) {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, cinza);
      doc.text('Observação', M, y);
      doc.setFontSize(11); doc.setTextColor.apply(doc, tinta);
      doc.text(doc.splitTextToSize(p.obs, W - 2 * M), M, y + 5.5);
    }

    // Rodapé
    var tot = doc.getNumberOfPages();
    for (var i = 1; i <= tot; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor.apply(doc, cinza);
      doc.text('Pedido ' + p.num + ', ' + p.clienteNome, M, 287);
      doc.text('Página ' + i + ' de ' + tot, W - M, 287, { align: 'right' });
    }
    return doc;
  }

  function nomeArquivo(p) {
    var cli = String(p.clienteNome || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return 'Pedido-' + p.num + (cli ? '-' + cli : '') + '.pdf';
  }

  var api = { gerar: gerar, nomeArquivo: nomeArquivo };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.PedidoPDF = api;
})(this);
