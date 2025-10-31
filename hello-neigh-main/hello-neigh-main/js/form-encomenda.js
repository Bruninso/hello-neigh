var botaoAdicionar = document.querySelector("#adicionar-encomenda");
var botaoAtualizar = document.querySelector("#atualizar-lista");
let encomendasCadastradas = [];
let blocoApartamentoComponent;

botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var encomenda = obtemEncomendaDoFormulario(form);

    var erros = validaEncomenda(encomenda);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    adicionaEncomendaNaTabela(encomenda);

    // Enviar encomenda para backend
    fetch('http://localhost:3000/encomendas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encomenda)
    })
    .then(res => res.json())
    .then(data => {
        NotificationSystem.show('Encomenda registrada com sucesso!', 'success');
        form.reset();
        document.querySelector("#mensagens-erro").innerHTML = "";
        // Recarregar a tabela
        setTimeout(() => carregarEncomendas(), 1000);
    })
    .catch(err => {
        console.error('Erro ao salvar encomenda:', err);
        NotificationSystem.show('Erro ao registrar encomenda', 'error');
    });
});

// Atualizar lista de encomendas
botaoAtualizar.addEventListener("click", function() {
    carregarEncomendas();
});

function adicionaEncomendaNaTabela(encomenda) {
    var encomendaTr = montaTr(encomenda);
    var tabela = document.querySelector("#tabela-encomendas");
    tabela.appendChild(encomendaTr);
}

function obtemEncomendaDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        entregarPara: form.entregarPara.value,
        recebidaPor: form.recebidaPor.value,
        transportadora: form.transportadora.value,
        codigoRastreio: form.codigoRastreio.value,
        observacoes: form.observacoes.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento,
        status: 'RECEBIDA'
    };
}

function montaTr(encomenda) {
    var tr = document.createElement("tr");
    
    const statusTd = montaTd(formatarStatus(encomenda.status), "info-status");
    statusTd.className += ` ${getStatusClass(encomenda.status)}`;
    tr.appendChild(statusTd);
    
    tr.appendChild(montaTd(encomenda.entregarPara, "info-entregar-para"));
    tr.appendChild(montaTd(encomenda.recebidaPor, "info-recebida-por"));
    tr.appendChild(montaTd(encomenda.transportadora || '-', "info-transportadora"));
    tr.appendChild(montaTd(encomenda.bloco, "info-bloco"));
    tr.appendChild(montaTd(encomenda.apartamento, "info-apartamento"));
    tr.appendChild(montaTd(formatarData(new Date()), "info-data"));
    
    // Botões de ação
    const acoesTd = document.createElement("td");
    acoesTd.innerHTML = `
        <button class="btn btn-sm btn-success btn-entregar" data-id="${encomenda._id || ''}">
            Marcar Entregue
        </button>
    `;
    tr.appendChild(acoesTd);

    return tr;
}

function formatarStatus(status) {
    const statusMap = {
        'RECEBIDA': 'Recebida',
        'ENTREGUE': 'Entregue',
        'DEVOLVIDA': 'Devolvida'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classes = {
        'RECEBIDA': 'table-warning',
        'ENTREGUE': 'table-success',
        'DEVOLVIDA': 'table-danger'
    };
    return classes[status] || '';
}

function formatarData(data) {
    return new Date(data).toLocaleString('pt-BR');
}

function montaTd(dado, classe) {
    var td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

function validaEncomenda(encomenda) {
    var erros = [];
    if (!encomenda.entregarPara) erros.push("O campo 'Entregar para' é obrigatório.");
    if (!encomenda.recebidaPor) erros.push("O campo 'Recebida por' é obrigatório.");
    if (!encomenda.bloco) erros.push("O bloco é obrigatório.");
    if (!encomenda.apartamento) erros.push("O apartamento é obrigatório.");

    return erros;
}

function exibiMensagensDeErro(erros) {
    var ul = document.querySelector("#mensagens-erro");
    ul.innerHTML = "";
    erros.forEach(function (erro) {
        var li = document.createElement("li");
        li.textContent = erro;
        ul.appendChild(li);
    });
}

// Carregar encomendas do backend
function carregarEncomendas() {
    fetch('http://localhost:3000/encomendas')
        .then(res => res.json())
        .then(encomendas => {
            document.querySelector("#tabela-encomendas").innerHTML = "";
            encomendasCadastradas = encomendas;
            encomendas.forEach(e => adicionaEncomendaNaTabela(e));
            NotificationSystem.show('Lista de encomendas atualizada!', 'info');
        })
        .catch(err => console.error("Erro ao carregar encomendas:", err));
}

// Delegation para botões de entregar
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-entregar')) {
        const encomendaId = e.target.getAttribute('data-id');
        if (encomendaId) {
            marcarComoEntregue(encomendaId);
        }
    }
});

function marcarComoEntregue(encomendaId) {
    fetch(`http://localhost:3000/encomendas/${encomendaId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ENTREGUE' })
    })
    .then(res => res.json())
    .then(data => {
        NotificationSystem.show('Encomenda marcada como entregue!', 'success');
        carregarEncomendas();
    })
    .catch(err => {
        console.error('Erro ao atualizar encomenda:', err);
        NotificationSystem.show('Erro ao marcar como entregue', 'error');
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Inicializar componente de bloco e apartamento
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');

    // Carregar encomendas ao iniciar
    carregarEncomendas();
});