var botaoAdicionar = document.querySelector("#adicionar-morador");
let moradoresCadastrados = [];
let blocoApartamentoComponent;


botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");

    // extrai informacoes do morador
    var morador = obtemMoradorDoFormulario(form);

    var erros = validaMorador(morador);

    if (erros.length > 0) {
        exibiMensagensDeErro(erros)
        return
    }

    // Verificação de CPF e RG duplicados
    const cpfRepetido = moradoresCadastrados.some(m => m.cpf === morador.cpf);
    const rgRepetido = moradoresCadastrados.some(m => m.rg === morador.rg);

    if (cpfRepetido || rgRepetido) {
        let errosDuplicados = [];
        if (cpfRepetido) errosDuplicados.push("Já existe um morador com esse CPF.");
        if (rgRepetido) errosDuplicados.push("Já existe um morador com esse RG.");
        exibiMensagensDeErro(errosDuplicados);
        return;
    }

    // aciciona o morador na tabela
    adicionaMoradorNaTabela(morador)

    form.reset();
    var mensagensDeErro = document.querySelector("#mensagens-erro");
    mensagensDeErro.innerHTML = "";

});

function adicionaMoradorNaTabela(morador) {
    var moradorTr = montaTr(morador);
    var tabela = document.querySelector("#tabela-moradores");
    tabela.appendChild(moradorTr);

    // Envia o morador para o backend
    fetch('http://localhost:3000/moradores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(morador)
    })
        .then(res => res.json())
        .then(data => {
            NotificationSystem.show('Morador cadastrado com sucesso!', 'success');
            document.querySelector("#mensagens-erro").innerHTML = "";
        })
        .catch(err => {
            console.error('Erro ao salvar no MongoDB:', err);
            NotificationSystem.show('Erro ao cadastrar morador', 'erro');
        });

}

function obtemMoradorDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    var morador = {
        nome: form.nome.value,
        cpf: form.cpf.value,
        rg: form.rg.value,
        telefone: form.telefone.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento,
        sexo: form.sexo.value,
        nascimento: form.nascimento.value
    }

    return morador;
}

function montaTr(morador) {

    var moradorTr = document.createElement("tr");
    moradorTr.classList.add("morador");

    moradorTr.appendChild(montaTd(morador.nome, "info-nome"));
    moradorTr.appendChild(montaTd(morador.cpf, "info-cpf"));
    moradorTr.appendChild(montaTd(morador.rg, "info-rg"));
    moradorTr.appendChild(montaTd(morador.telefone, "info-tel"));
    moradorTr.appendChild(montaTd(morador.bloco, "info-bloco"));
    moradorTr.appendChild(montaTd(morador.apartamento, "info-apt"));
    moradorTr.appendChild(montaTd(morador.sexo, "info-sexo"));
    moradorTr.appendChild(montaTd(morador.nascimento, "info-nasce"));

    return moradorTr
}

function montaTd(dado, classe) {

    var Td = document.createElement("td");
    Td.textContent = dado;
    Td.classList.add(classe);

    return Td;
}

function validaMorador(morador) {
    var erros = [];

    if (!morador.nome) erros.push("O nome não pode estar vazio.");
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(morador.nome)) erros.push("O nome deve conter apenas letras.");

    if (!morador.cpf) erros.push("O CPF não pode estar vazio.");
    if (!/^\d{11}$/.test(morador.cpf.replace(/\D/g, ''))) erros.push("O CPF deve conter 11 dígitos numéricos.");
    //morador.cpf.replace(/\D/g, ''): remove pontuação do CPF para validar somente números.

    if (!morador.rg) erros.push("O RG não pode estar vazio.");
    if (!/^\d+$/.test(morador.rg.replace(/\D/g, ''))) erros.push("O RG deve conter apenas números.");

    if (!morador.telefone) erros.push("O telefone não pode estar vazio.");

    if (!morador.bloco) erros.push("O bloco não pode estar vazio.");

    if (!morador.apartamento) erros.push("O apartamento não pode estar vazio.");

    if (!morador.sexo) erros.push("O sexo deve ser selecionado.");

    if (!morador.nascimento) erros.push("A data de nascimento não pode estar vazia.");
    const data = new Date(morador.nascimento);
    const hoje = new Date();
    
    if (isNaN(data.getTime())) {
        erros.push("Data de nascimento inválida.");
    } else if (data > hoje) {
        erros.push("Data de nascimento não pode ser futura.");
    }

    return erros;
}



function exibiMensagensDeErro(erros) {
    var ul = document.querySelector("#mensagens-erro")
    ul.innerHTML = "";

    erros.forEach(function (erro) {
        var li = document.createElement("li")
        li.textContent = erro;
        ul.appendChild(li);
    });
}

// MASCARAS AUTOMATICAS
document.addEventListener("DOMContentLoaded", function () {
    // CPF	
    var inputCPF = document.querySelector('input[name="cpf"]');
    if (inputCPF) {
        inputCPF.addEventListener('input', function (e) {
            let value = e.target.value;

            // Remove tudo que não for número
            value = value.replace(/\D/g, '');

            // Aplica a máscara: xxx.xxx.xxx-xx
            if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
            if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

            e.target.value = value.slice(0,14);
        });
    }

    // TELEFONE
    const telefoneInput = document.querySelector('input[name="telefone"]');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) value = value.replace(/^(\d{2})(\d)/, '($1) $2');
            if (value.length > 6) value = value.replace(/(\d{5})(\d)/, '$1-$2');
            e.target.value = value.slice(0, 15);
        });
    }

    // RG
    const rgInput = document.querySelector('input[name="rg"]');
    if (rgInput) {
        rgInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) value = value.replace(/^(\d{2})(\d)/, '$1.$2');
            if (value.length > 5) value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
            if (value.length > 8) value = value.replace(/^(\d{2})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
            e.target.value = value.slice(0, 12);
        });
    }


});

// Inicializar componente de bloco e apartamento
blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');


//Buscar moradores para a tabela
document.addEventListener("DOMContentLoaded", function () {
    fetch('http://localhost:3000/moradores')
        .then(res => res.json())
        .then(moradores => {
            moradoresCadastrados = moradores;
            moradores.forEach(morador => {
                adicionaMoradorNaTabela(morador);
            });
        })
        .catch(err => {
            console.error("Erro ao buscar moradores:", err);
        });
});
