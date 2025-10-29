var botaoAdicionar = document.querySelector("#adicionar-veiculo");
let veiculosCadastrados = [];
let blocoApartamentoComponent;

botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var veiculo = obtemVeiculoDoFormulario(form);

    var erros = validaVeiculo(veiculo);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    // Evitar placa duplicada
    const placaRepetida = veiculosCadastrados.some(v => v.placa.replace(/\s/g, '') === veiculo.placa.replace(/\s/g, ''));
    if (placaRepetida) {
        exibiMensagensDeErro(["Já existe um veículo com essa placa."]);
        return;
    }

    adicionaVeiculoNaTabela(veiculo);

    // Enviar veículo para backend
    fetch('http://localhost:3000/veiculos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(veiculo)
    })
    .then(res => res.json())
    .then(data => {
        NotificationSystem.show('Veículo cadastrado com sucesso!', 'success');
        form.reset();
        document.querySelector("#mensagens-erro").innerHTML = "";
    })
    .catch(err => {
        console.error('Erro ao salvar veículo:', err);
        NotificationSystem.show('Erro ao cadastrar veículo', 'error');
    });
});

function adicionaVeiculoNaTabela(veiculo) {
    var veiculoTr = montaTr(veiculo);
    var tabela = document.querySelector("#tabela-veiculos");
    tabela.appendChild(veiculoTr);
}

function obtemVeiculoDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        placa: form.placa.value,
        modelo: form.modelo.value,
        cor: form.cor.value,
        tipo: form.tipo.value,
        vaga: form.vaga.value,
        moradorResponsavel: form.moradorResponsavel.value,
        observacoes: form.observacoes.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento
    };
}

function montaTr(veiculo) {
    var tr = document.createElement("tr");
    tr.appendChild(montaTd(veiculo.placa, "info-placa"));
    tr.appendChild(montaTd(veiculo.modelo, "info-modelo"));
    tr.appendChild(montaTd(veiculo.cor, "info-cor"));
    tr.appendChild(montaTd(veiculo.tipo, "info-tipo"));
    tr.appendChild(montaTd(veiculo.vaga, "info-vaga"));
    tr.appendChild(montaTd(veiculo.bloco, "info-bloco"));
    tr.appendChild(montaTd(veiculo.apartamento, "info-apartamento"));
    tr.appendChild(montaTd(veiculo.moradorResponsavel, "info-morador"));
    return tr;
}

function montaTd(dado, classe) {
    var td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

function validaVeiculo(veiculo) {
    var erros = [];
    if (!veiculo.placa) erros.push("A placa não pode estar vazia.");
    if (!/^[A-Za-z0-9]{7}$/.test(veiculo.placa.replace(/\s/g, ''))) {
        erros.push("A placa deve conter 7 caracteres (letras e números).");
    }
    if (!veiculo.modelo) erros.push("O modelo não pode estar vazio.");
    if (!veiculo.cor) erros.push("A cor não pode estar vazia.");
    if (!veiculo.tipo) erros.push("O tipo é obrigatório.");
    if (!veiculo.moradorResponsavel) erros.push("O morador responsável é obrigatório.");
    if (!veiculo.bloco) erros.push("O bloco é obrigatório.");
    if (!veiculo.apartamento) erros.push("O apartamento é obrigatório.");

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

// Máscara para placa
document.addEventListener("DOMContentLoaded", function () {
    var inputPlaca = document.querySelector('input[name="placa"]');
    if (inputPlaca) {
        inputPlaca.addEventListener('input', function (e) {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            if (value.length > 7) value = value.slice(0, 7);
            e.target.value = value;
        });
    }

    // Inicializar componente de bloco e apartamento
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');

    // Buscar veículos já cadastrados
    fetch('http://localhost:3000/veiculos')
        .then(res => res.json())
        .then(veiculos => {
            veiculosCadastrados = veiculos;
            veiculos.forEach(v => adicionaVeiculoNaTabela(v));
        })
        .catch(err => console.error("Erro ao buscar veículos:", err));
});