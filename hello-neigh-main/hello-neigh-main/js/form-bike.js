var botaoAdicionar = document.querySelector("#adicionar-bicicleta");
var botaoAtualizar = document.querySelector("#atualizar-status");
let bicicletasCadastradas = [];
let blocoApartamentoComponent;
let imageUpload;

botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var bicicleta = obtemBicicletaDoFormulario(form);

    var erros = validaBicicleta(bicicleta);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    // Evitar ID duplicado
    const idRepetido = bicicletasCadastradas.some(b => b.bikeId === bicicleta.bikeId);
    if (idRepetido) {
        exibiMensagensDeErro(["Já existe uma bicicleta com este ID."]);
        return;
    }

    // Criar FormData para enviar imagem
    const formData = new FormData();
    
    // Adicionar campos normais
    Object.keys(bicicleta).forEach(key => {
        if (key !== 'imagemFile') {
            formData.append(key, bicicleta[key]);
        }
    });

    // Adicionar imagem se existir
    if (bicicleta.imagemFile) {
        formData.append('imagem', bicicleta.imagemFile);
    }

    // Enviar bicicleta para backend
    fetch('http://localhost:3000/bicicletas', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        NotificationSystem.show('Bicicleta cadastrada com sucesso!', 'success');
        form.reset();
        imageUpload.reset();
        document.querySelector("#mensagens-erro").innerHTML = "";
        // Recarregar a tabela
        setTimeout(() => atualizarStatusBicicletas(), 1000);
    })
    .catch(err => {
        console.error('Erro ao salvar bicicleta:', err);
        NotificationSystem.show('Erro ao cadastrar bicicleta', 'error');
    });
});

// Atualizar status de todas as bicicletas
botaoAtualizar.addEventListener("click", function() {
    atualizarStatusBicicletas();
});

function adicionaBicicletaNaTabela(bicicleta) {
    var bicicletaTr = montaTr(bicicleta);
    var tabela = document.querySelector("#tabela-bicicletas");
    tabela.appendChild(bicicletaTr);
}

function obtemBicicletaDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        bikeId: form.bikeId.value,
        modelo: form.modelo.value,
        cor: form.cor.value,
        status: form.status.value,
        localizacao: form.localizacao.value,
        moradorResponsavel: form.moradorResponsavel.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento,
        imagemFile: imageUpload.getImageFile()
    };
}

function montaTr(bicicleta) {
    var tr = document.createElement("tr");
    tr.appendChild(montaTd(bicicleta.bikeId, "info-bikeId"));
    tr.appendChild(montaTd(bicicleta.modelo, "info-modelo"));
    tr.appendChild(montaTd(bicicleta.cor, "info-cor"));
    
    const statusTd = montaTd(formatarStatus(bicicleta.status), "info-status");
    statusTd.className += ` ${getStatusClass(bicicleta.status)}`;
    tr.appendChild(statusTd);
    
    const localizacaoTd = montaTd(formatarLocalizacao(bicicleta.localizacao), "info-localizacao");
    localizacaoTd.className += ` ${getLocalizacaoClass(bicicleta.localizacao)}`;
    tr.appendChild(localizacaoTd);
    
    tr.appendChild(montaTd(bicicleta.bloco, "info-bloco"));
    tr.appendChild(montaTd(bicicleta.apartamento, "info-apartamento"));
    tr.appendChild(montaTd(bicicleta.moradorResponsavel, "info-morador"));
    tr.appendChild(montaTd(formatarData(new Date()), "info-atualizacao"));
    
    // Botões de ação
    const acoesTd = document.createElement("td");
    acoesTd.innerHTML = `
        <button class="btn btn-sm btn-warning btn-alterar-status" data-id="${bicicleta.bikeId}">
            Alterar Status
        </button>
    `;
    tr.appendChild(acoesTd);

    return tr;
}

function formatarStatus(status) {
    const statusMap = {
        'DISPONIVEL': 'Disponível',
        'EM_USO': 'Em uso',
        'MANUTENCAO': 'Manutenção'
    };
    return statusMap[status] || status;
}

function formatarLocalizacao(localizacao) {
    const localizacaoMap = {
        'CONDOMINIO': 'No condomínio',
        'FORA_CONDOMINIO': 'Fora do condomínio'
    };
    return localizacaoMap[localizacao] || localizacao;
}

function getStatusClass(status) {
    const classes = {
        'DISPONIVEL': 'table-success',
        'EM_USO': 'table-warning',
        'MANUTENCAO': 'table-danger'
    };
    return classes[status] || '';
}

function getLocalizacaoClass(localizacao) {
    return localizacao === 'FORA_CONDOMINIO' ? 'table-danger' : 'table-success';
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

function validaBicicleta(bicicleta) {
    var erros = [];
    if (!bicicleta.bikeId) erros.push("O ID da bicicleta é obrigatório.");
    if (!bicicleta.modelo) erros.push("O modelo é obrigatório.");
    if (!bicicleta.cor) erros.push("A cor é obrigatória.");
    if (!bicicleta.status) erros.push("O status é obrigatório.");
    if (!bicicleta.localizacao) erros.push("A localização é obrigatória.");
    if (!bicicleta.moradorResponsavel) erros.push("O morador responsável é obrigatório.");
    if (!bicicleta.bloco) erros.push("O bloco é obrigatório.");
    if (!bicicleta.apartamento) erros.push("O apartamento é obrigatório.");

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

// Atualizar status em tempo real
function atualizarStatusBicicletas() {
    fetch('http://localhost:3000/bicicletas')
        .then(res => res.json())
        .then(bicicletas => {
            document.querySelector("#tabela-bicicletas").innerHTML = "";
            bicicletasCadastradas = bicicletas;
            bicicletas.forEach(b => adicionaBicicletaNaTabela(b));
            NotificationSystem.show('Status das bicicletas atualizado!', 'info');
        })
        .catch(err => console.error("Erro ao atualizar bicicletas:", err));
}

// Delegation para botões de alterar status
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-alterar-status')) {
        const bikeId = e.target.getAttribute('data-id');
        alterarStatusBicicleta(bikeId);
    }
});

function alterarStatusBicicleta(bikeId) {
    const novoStatus = prompt(`Alterar status da bicicleta ${bikeId}:\n1 - DISPONIVEL\n2 - EM_USO\n3 - MANUTENCAO`);
    
    if (!novoStatus) return;

    const statusMap = {
        '1': 'DISPONIVEL',
        '2': 'EM_USO', 
        '3': 'MANUTENCAO'
    };

    const status = statusMap[novoStatus];
    if (!status) {
        NotificationSystem.show('Status inválido!', 'error');
        return;
    }

    const localizacao = status === 'EM_USO' ? 'FORA_CONDOMINIO' : 'CONDOMINIO';

    // Encontrar a bicicleta pelo bikeId
    const bicicleta = bicicletasCadastradas.find(b => b.bikeId === bikeId);
    if (!bicicleta) {
        NotificationSystem.show('Bicicleta não encontrada!', 'error');
        return;
    }

    fetch(`http://localhost:3000/bicicletas/${bicicleta._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, localizacao })
    })
    .then(res => res.json())
    .then(data => {
        NotificationSystem.show('Status atualizado com sucesso!', 'success');
        atualizarStatusBicicletas();
    })
    .catch(err => {
        console.error('Erro ao atualizar status:', err);
        NotificationSystem.show('Erro ao atualizar status', 'error');
    });
}

document.addEventListener("DOMContentLoaded", function () {
    // Inicializar componente de bloco e apartamento
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');
    
    // Inicializar upload de imagem
    imageUpload = new ImageUpload('imagem-bicicleta', 'preview-imagem-bicicleta');

    // Buscar bicicletas já cadastradas
    atualizarStatusBicicletas();

    // Atualizar automaticamente a cada 30 segundos
    setInterval(atualizarStatusBicicletas, 30000);
});