const API_BASE = "http://localhost:3000"; // ajuste se precisar

const gerarRelatorioBtn = document.querySelector("#gerarRelatorio");
const baixarPDFBtn = document.querySelector("#baixarPDF");
const tipoSelect = document.querySelector("#tipoRelatorio");
const tabela = document.querySelector("#tabelaRelatorio");

let dadosAtuais = [];
let entidadeAtual = "";

gerarRelatorioBtn.addEventListener("click", async () => {
  const tipo = tipoSelect.value;
  if (!tipo) {
    alert("Selecione um tipo de relatório!");
    return;
  }

  entidadeAtual = tipo;
  await carregarDados(tipo);
});

baixarPDFBtn.addEventListener("click", gerarPDF);

async function carregarDados(tipo) {
  try {
    const resposta = await fetch(`${API_BASE}/${tipo}`);
    if (!resposta.ok) throw new Error("Erro ao buscar dados.");
    const dados = await resposta.json();
    dadosAtuais = dados;

    montarTabela(tipo, dados);
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar relatório.");
  }
}

function montarTabela(tipo, dados) {
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");
  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (!dados.length) {
    tbody.innerHTML = "<tr><td colspan='8'>Nenhum dado encontrado.</td></tr>";
    return;
  }

  let colunas = Object.keys(dados[0]).filter(k => k !== "__v" && k !== "_id" && k !== "createdAt" && k !== "updatedAt");

  // Cabeçalho
  const headerRow = document.createElement("tr");
  colunas.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col.toUpperCase();
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Linhas
  dados.forEach(item => {
    const tr = document.createElement("tr");
    colunas.forEach(campo => {
      const td = document.createElement("td");
      let valor = item[campo];

      // Formata datas
      if (campo.includes("data") || campo.includes("nascimento")) {
        valor = new Date(valor).toLocaleDateString("pt-BR");
      }

      td.textContent = valor ?? "-";
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

function gerarPDF() {
  if (!dadosAtuais.length) {
    alert("Nenhum relatório gerado para exportar.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const titulo = `Relatório de ${entidadeAtual.charAt(0).toUpperCase() + entidadeAtual.slice(1)}`;
  doc.text(titulo, 14, 15);

  doc.autoTable({
    startY: 25,
    html: "#tabelaRelatorio",
    styles: { fontSize: 10, halign: "center" },
    headStyles: { fillColor: [43, 113, 248] },
  });

  doc.save(`${entidadeAtual}-relatorio.pdf`);
}
