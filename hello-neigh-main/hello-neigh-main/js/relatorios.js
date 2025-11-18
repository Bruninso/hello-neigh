const API_BASE = "http://localhost:3000";

// =============================
// 🔐 Função global para requisições autenticadas
// =============================
function fetchAutenticado(url, options = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Sessão expirada. Faça login novamente.");
    return location.href = "login.html";
  }

  return fetch(url, {
    ...options,
    headers: {
      "Authorization": "Bearer " + token,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
}

// =============================
// 🚫 Bloquear relatórios proibidos para funcionário
// (Opcional — ative se quiser esse comportamento)
// =============================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return location.href = "login.html";

  const payload = JSON.parse(atob(token.split(".")[1]));

  // Funcionário NÃO deve gerar relatório de moradores
  if (payload.role === "funcionario") {
    const opt = document.querySelector('option[value="moradores"]');
    if (opt) opt.remove();
  }
});

// =============================
// VARIÁVEIS GLOBAIS
// =============================
const gerarRelatorioBtn = document.querySelector("#gerarRelatorio");
const baixarPDFBtn = document.querySelector("#baixarPDF");
const tipoSelect = document.querySelector("#tipoRelatorio");
const tabela = document.querySelector("#tabelaRelatorio");

let dadosAtuais = [];
let entidadeAtual = "";

// =============================
// EVENTOS
// =============================
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

// =============================
// 📊 CARREGAR DADOS COM TOKEN
// =============================
async function carregarDados(tipo) {
  try {
    const resposta = await fetchAutenticado(`${API_BASE}/${tipo}`);

    if (!resposta.ok) {
      console.error("Erro:", resposta);
      throw new Error("Erro ao buscar dados.");
    }

    const dados = await resposta.json();
    dadosAtuais = dados;

    montarTabela(tipo, dados);
  } catch (err) {
    console.error(err);
    alert("Erro ao carregar relatório.");
  }
}

// =============================
// 🧱 MONTAR TABELA
// =============================
function montarTabela(tipo, dados) {
  const thead = tabela.querySelector("thead");
  const tbody = tabela.querySelector("tbody");

  thead.innerHTML = "";
  tbody.innerHTML = "";

  if (!dados.length) {
    tbody.innerHTML = "<tr><td colspan='8'>Nenhum dado encontrado.</td></tr>";
    return;
  }

  let colunas = Object.keys(dados[0]).filter(
    k => k !== "__v" && k !== "_id" && k !== "createdAt" && k !== "updatedAt"
  );

  // Cabeçalho da tabela
  const headerRow = document.createElement("tr");
  colunas.forEach(col => {
    const th = document.createElement("th");
    th.textContent = col.toUpperCase();
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Linhas de dados
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

// =============================
// 📄 GERAR PDF
// =============================
function gerarPDF() {
  if (!dadosAtuais.length) {
    alert("Nenhum relatório gerado para exportar.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const titulo =
    `Relatório de ${entidadeAtual.charAt(0).toUpperCase() + entidadeAtual.slice(1)}`;

  doc.text(titulo, 14, 15);

  doc.autoTable({
    startY: 25,
    html: "#tabelaRelatorio",
    styles: { fontSize: 10, halign: "center" },
    headStyles: { fillColor: [43, 113, 248] }
  });

  doc.save(`${entidadeAtual}-relatorio.pdf`);
}
