var botaoAdicionar = document.querySelector("#adicionar-visitante");
let visitantesCadastrados = [];

botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var visitante = obtemVisitanteDoFormulario(form);

    var erros = validaVisitante(visitante);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    // Evitar CPF duplicado
    const cpfRepetido = visitantesCadastrados.some(v => v.cpf.replace(/\D/g, '') === visitante.cpf.replace(/\D/g, ''));
    if (cpfRepetido) {
        exibiMensagensDeErro(["Já existe um visitante com esse CPF."]);
        return;
    }

    adicionaVisitanteNaTabela(visitante);

    form.reset();
    document.querySelector("#mensagens-erro").innerHTML = "";
});

function adicionaVisitanteNaTabela(visitante) {
    var visitanteTr = montaTr(visitante);
    var tabela = document.querySelector("#tabela-visitantes");
    tabela.appendChild(visitanteTr);

    // Enviar visitante para backend
    fetch('http://localhost:3000/visitantes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitante)
    })
    .then(res => res.json())
    .then(data => console.log('Visitante salvo no MongoDB:', data))
    .catch(err => console.error('Erro ao salvar visitante:', err));
}

function obtemVisitanteDoFormulario(form) {
    return {
        nome: form.nome.value,
        cpf: form.cpf.value,
        visitado: form.visitado.value,
        bloco: form.bloco.value,
        apartamento: form.ap.value
    };
}

function montaTr(visitante) {
    var tr = document.createElement("tr");
    tr.appendChild(montaTd(visitante.nome, "info-nome"));
    tr.appendChild(montaTd(visitante.cpf, "info-cpf"));
    tr.appendChild(montaTd(visitante.visitado, "info-visitado"));
    tr.appendChild(montaTd(visitante.bloco, "info-bloco"));
    tr.appendChild(montaTd(visitante.apartamento, "info-ap"));
    return tr;
}

function montaTd(dado, classe) {
    var td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

function validaVisitante(visitante) {
    var erros = [];
    if (!visitante.nome) erros.push("O nome do visitante não pode estar vazio.");
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(visitante.nome)) erros.push("O nome deve conter apenas letras.");
    if (!visitante.cpf) erros.push("O CPF não pode estar vazio.");
    if (!/^\d{11}$/.test(visitante.cpf.replace(/\D/g, ''))) erros.push("O CPF deve conter 11 dígitos numéricos.");
    if (!visitante.visitado) erros.push("O nome do morador visitado é obrigatório.");
    if (!visitante.bloco) erros.push("O bloco é obrigatório.");
    if (!visitante.apartamento) erros.push("O apartamento é obrigatório.");
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

// Máscara CPF
document.addEventListener("DOMContentLoaded", function () {
    var inputCPF = document.querySelector('input[name="cpf"]');
    if (inputCPF) {
        inputCPF.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
            if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
            e.target.value = value;
        });
    }

    // Buscar visitantes já cadastrados
    fetch('http://localhost:3000/visitantes')
        .then(res => res.json())
        .then(visitantes => {
            visitantesCadastrados = visitantes;
            visitantes.forEach(v => adicionaVisitanteNaTabela(v));
        })
        .catch(err => console.error("Erro ao buscar visitantes:", err));
});
