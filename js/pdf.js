// Função para gerar PDF de Relatórios com dados da API (Design Unificado Dark/Blue)
window.criarPDFRelatorio = function (dados) {
  const { jsPDF } = window.jspdf;
  // Formato Retrato (Portrait) para lista sequencial vertical
  const doc = new jsPDF('p', 'mm', 'a4');

  // Configurações de Cores
  const AZUL_ESCURO = [0, 61, 130];
  const AZUL_CLARO = [240, 248, 255];
  const AMARELO = [255, 215, 0];
  const VERDE = [40, 167, 69];
  const VERMELHO = [220, 53, 69];
  const CINZA_ESCURO = [50, 50, 50];

  // --- Cabeçalho ---
  doc.setFillColor(...AZUL_ESCURO);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...AMARELO);
  doc.text("RELATÓRIO DE CONTROLE DE PONTO", 15, 20);

  doc.setFontSize(10);
  doc.setTextColor(255, 255, 255);
  const dataGeracao = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR');
  doc.text(`Gerado em: ${dataGeracao}`, 15, 30);

  doc.setDrawColor(...AMARELO);
  doc.setLineWidth(1);
  doc.line(15, 35, 195, 35);

  // --- Tabela Header ---
  let y = 55;
  // Posições X ajustadas para A4 Portrait
  const colX = { data: 15, promotor: 60, marca: 120, tipo: 170 };

  doc.setFillColor(...AZUL_ESCURO);
  doc.rect(15, y - 6, 180, 8, 'F');

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);

  doc.text("Data/Hora", colX.data, y);
  doc.text("Promotor", colX.promotor, y);
  doc.text("Marca", colX.marca, y);
  doc.text("Tipo", colX.tipo, y);

  y += 10;
  doc.setFont("helvetica", "normal");

  // --- Tabela Body ---
  dados.forEach((reg, index) => {
    // Zebra Striping (Azul Claro)
    if (index % 2 !== 0) {
      doc.setFillColor(...AZUL_CLARO);
      doc.rect(15, y - 6, 180, 10, 'F');
    }

    const dataObj = new Date(reg.dataHora);
    const dataFormatada = dataObj.toLocaleDateString('pt-BR') + ' ' + dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    doc.setFontSize(9);
    doc.setTextColor(...CINZA_ESCURO);

    doc.text(dataFormatada, colX.data, y);
    doc.text(reg.promotorNome.substring(0, 25), colX.promotor, y);
    doc.text(reg.promotorMarca.substring(0, 20), colX.marca, y);

    // Tipo com Cor Destaque
    doc.setFont("helvetica", "bold");
    if (reg.tipo === 'ENTRADA') {
      doc.setTextColor(...VERDE);
      doc.text("ENTRADA", colX.tipo, y);
    } else {
      doc.setTextColor(...VERMELHO);
      doc.text("SAÍDA", colX.tipo, y);
    }
    doc.setFont("helvetica", "normal");

    y += 10;

    // Paginação
    if (y > 270) {
      doc.addPage();
      y = 20;
      // Opcional: Repetir cabeçalho simples na nova página para contexto
    }
  });

  // --- Footer ---
  // Desenha na parte inferior da página atual (ou nova se necessário, mas o loop cuida da quebra)
  // Se y estiver muito na ponta, add page
  if (y > 260) {
    doc.addPage();
  }

  const footerY = 280; // Perto do fim (297mm é o total)
  doc.setFillColor(...AMARELO);
  doc.rect(0, footerY, 210, 17, 'F');

  doc.setFontSize(8);
  doc.setTextColor(...AZUL_ESCURO);
  doc.setFont("helvetica", "bold");
  doc.text("Controle de Promotores - Relatório Oficial", 105, footerY + 6, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text("Documento gerado eletronicamente.", 105, footerY + 10, { align: "center" });

  doc.save("relatorio_ponto.pdf");
};

// Função para gerar PDF da Lista de Promotores (Design Moderno Dark/Blue + Últimas Entradas)
window.gerarPDFPromotores = async function () {
  try {
    const res = await fetch('/api/promotores');
    const promotores = await res.json();

    if (promotores.length === 0) {
      alert("Nenhum promotor para gerar PDF.");
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4'); // Paisagem

    // Configurações de Cores
    const AZUL_ESCURO = [0, 61, 130];
    const AZUL_CLARO = [240, 248, 255];
    const CINZA_CLARO = [245, 245, 245];
    const AMARELO = [255, 215, 0];
    const VERDE = [40, 167, 69];
    const VERMELHO = [220, 53, 69];

    // --- Cabeçalho ---
    doc.setFillColor(...AZUL_ESCURO);
    doc.rect(0, 0, 297, 40, 'F');

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...AMARELO);
    doc.text("LISTA DE PROMOTORES CADASTRADOS", 15, 20);

    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    const dataGeracao = new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR');
    doc.text(`Gerado em: ${dataGeracao}`, 15, 30);

    doc.setDrawColor(...AMARELO);
    doc.setLineWidth(1);
    doc.line(15, 35, 282, 35);

    // --- Barra de Total ---
    doc.setFillColor(...CINZA_CLARO);
    doc.roundedRect(15, 45, 267, 12, 3, 3, 'F');

    doc.setFontSize(12);
    doc.setTextColor(...AZUL_ESCURO);
    doc.text(`Total de Promotores Cadastrados: ${promotores.length}`, 20, 52);

    // --- Tabela Header ---
    let y = 65;
    const colX = { id: 15, nome: 30, marca: 90, cpf: 130, entrada: 180, saida: 240 };

    doc.setFillColor(...AZUL_ESCURO);
    doc.rect(15, y - 6, 267, 8, 'F');

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);

    doc.text("#", colX.id, y);
    doc.text("Nome", colX.nome, y);
    doc.text("Marca", colX.marca, y);
    doc.text("CPF", colX.cpf, y);
    doc.text("Última Entrada", colX.entrada, y);
    doc.text("Última Saída", colX.saida, y);

    y += 10;

    // --- Tabela Body ---
    promotores.forEach((p, index) => {
      if (index % 2 !== 0) {
        doc.setFillColor(...AZUL_CLARO);
        doc.rect(15, y - 6, 267, 14, 'F');
      }

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50);

      doc.text(`${index + 1}`, colX.id, y);
      doc.setFont("helvetica", "bold");
      doc.text(p.nome.substring(0, 30), colX.nome, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...AZUL_ESCURO);
      doc.text(p.marca.substring(0, 20), colX.marca, y);
      doc.setTextColor(50);
      doc.text(p.cpf, colX.cpf, y);

      doc.setFontSize(8);

      // Entrada
      if (p.ultimaEntrada) {
        doc.setTextColor(...VERDE);
        doc.setFont("helvetica", "bold");
        doc.text("ENTRADA", colX.entrada, y - 2);

        doc.setTextColor(80);
        doc.setFont("helvetica", "normal");
        const dtE = new Date(p.ultimaEntrada);
        doc.text(dtE.toLocaleDateString('pt-BR'), colX.entrada, y + 2);
        doc.text(dtE.toLocaleTimeString('pt-BR'), colX.entrada, y + 5);
      } else {
        doc.setTextColor(150);
        doc.text("-", colX.entrada, y);
      }

      // Saída
      if (p.ultimaSaida) {
        doc.setTextColor(...VERMELHO);
        doc.setFont("helvetica", "bold");
        doc.text("SAÍDA", colX.saida, y - 2);

        doc.setTextColor(80);
        doc.setFont("helvetica", "normal");
        const dtS = new Date(p.ultimaSaida);
        doc.text(dtS.toLocaleDateString('pt-BR'), colX.saida, y + 2);
        doc.text(dtS.toLocaleTimeString('pt-BR'), colX.saida, y + 5);
      } else {
        doc.setTextColor(150);
        doc.text("-", colX.saida, y);
      }

      y += 14;

      if (y > 180) {
        doc.addPage('l');
        y = 20;
      }
    });

    // --- Footer Legenda ---
    if (y > 170) {
      doc.addPage('l');
      y = 20;
    }

    const footerY = 185;

    doc.setFillColor(...AMARELO);
    doc.rect(15, footerY, 267, 15, 'F');

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Legenda:", 135, footerY + 5);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");

    doc.setTextColor(...VERDE);
    doc.text("Última Entrada", 20, footerY + 8);

    doc.setTextColor(...VERMELHO);
    doc.text("Última Saída", 20, footerY + 12);

    doc.setTextColor(50);
    doc.text("| As datas e horários mostram os registros mais recentes de cada promotor!", 45, footerY + 12);

    doc.save("lista_promotores_detalhada.pdf");

  } catch (err) {
    console.error(err);
    alert("Erro ao gerar PDF de promotores. Verifique o console.");
  }
};