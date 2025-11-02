var botaoAdicionar = document.querySelector("#adicionar-morador");
let moradoresCadastrados = [];
let blocoApartamentoComponent;
let editandoId = null;


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

    if (editandoId) {
        // Atualizar morador existente
        fetch(`http://localhost:3000/moradores/${editandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(morador)
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Morador atualizado com sucesso!', 'success');
                // Atualiza a linha na tabela
                const tr = document.querySelector(`tr[data-id="${editandoId}"]`);
                if (tr) tr.remove();
                adicionaMoradorNaTabela(data.morador); // Adiciona a versão atualizada

                // Reseta o formulário e o estado de edição
                form.reset();
                cancelarEdicao();
            })
            .catch(err => {
                console.error('Erro ao atualizar morador:', err);
                NotificationSystem.show('Erro ao atualizar morador', 'erro');
            });
    } else {

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

        // aciciona o morador na tabela
        adicionaMoradorNaTabela(morador)

        form.reset();
        var mensagensDeErro = document.querySelector("#mensagens-erro");
        mensagensDeErro.innerHTML = "";
    }

});

// Função para cancelar edição (resetar o formulário)
function cancelarEdicao() {
    editandoId = null;
    var botao = document.querySelector("#adicionar-morador");
    botao.textContent = "Adicionar Morador";
    botao.classList.remove("btn-success");
    botao.classList.add("btn-primary");
    document.querySelector("#form-adiciona").reset();
}

const botaoCancelar = document.querySelector("#cancelar-edicao");

botaoCancelar.addEventListener("click", function() {
    cancelarEdicao();
    botaoCancelar.style.display = 'none';
});

// Na função editarMorador, mostrar o botão cancelar
function editarMorador(morador) {
    // ... preencher formulário ...
    botaoCancelar.style.display = 'inline-block';
}

// Em cancelarEdicao, esconder o botão cancelar
function cancelarEdicao() {
    // ... resetar ...
    botaoCancelar.style.display = 'none';
}

function adicionaMoradorNaTabela(morador) {
    var moradorTr = montaTr(morador);
    var tabela = document.querySelector("#tabela-moradores");
    tabela.appendChild(moradorTr);
}

function obtemMoradorDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    var morador = {
        nomeMorador: form.nomeMorador.value,
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
    moradorTr.dataset.id = morador._id;

    moradorTr.appendChild(montaTd(morador.nomeMorador, "info-nome"));
    moradorTr.appendChild(montaTd(morador.cpf, "info-cpf"));
    moradorTr.appendChild(montaTd(morador.rg, "info-rg"));
    moradorTr.appendChild(montaTd(morador.telefone, "info-tel"));
    moradorTr.appendChild(montaTd(morador.bloco, "info-bloco"));
    moradorTr.appendChild(montaTd(morador.apartamento, "info-apt"));
    moradorTr.appendChild(montaTd(morador.sexo, "info-sexo"));
    moradorTr.appendChild(montaTd(morador.nascimento, "info-nasce"));

    // Coluna de ações
    const tdAcoes = document.createElement("td");
    tdAcoes.classList.add("text-center");

    const dropdownDiv = document.createElement("div");
    dropdownDiv.classList.add("dropdown");

    const botaoAcoes = document.createElement("button");
    botaoAcoes.classList.add("btn", "btn-secondary", "btn-sm", "dropdown-toggle");
    botaoAcoes.setAttribute("data-bs-toggle", "dropdown");
    botaoAcoes.innerHTML = `<i class="fas fa-ellipsis-v"></i>`;
    dropdownDiv.appendChild(botaoAcoes);

    const menu = document.createElement("ul");
    menu.classList.add("dropdown-menu");
    menu.innerHTML = `
        <li><a class="dropdown-item editar" href="#">Editar</a></li>
        <li><a class="dropdown-item excluir" href="#">Excluir</a></li>
    `;
    dropdownDiv.appendChild(menu);
    tdAcoes.appendChild(dropdownDiv);
    moradorTr.appendChild(tdAcoes);

    // Eventos dos botões do menu
    menu.querySelector(".editar").addEventListener("click", () => editarMorador(morador));
    menu.querySelector(".excluir").addEventListener("click", () => excluirMorador(morador._id));

    return moradorTr
}

/*function montaBotaoEditar(morador) {
    var botaoEditar = document.createElement("button");
    botaoEditar.textContent = "Editar";
    botaoEditar.classList.add("btn", "btn-warning", "btn-sm", "me-1");
    botaoEditar.addEventListener("click", function () {
        editarMorador(morador);
    });
    return botaoEditar;
}

function montaBotaoExcluir(id) {
    var botaoExcluir = document.createElement("button");
    botaoExcluir.textContent = "Excluir";
    botaoExcluir.classList.add("btn", "btn-danger", "btn-sm");
    botaoExcluir.addEventListener("click", function () {
        excluirMorador(id);
    });
    return botaoExcluir;
}*/

function editarMorador(morador) {
    // Preenche o formulário com os dados do morador
    document.querySelector("#nomeMorador").value = morador.nomeMorador;
    document.querySelector("#cpf").value = morador.cpf;
    document.querySelector("#rg").value = morador.rg;
    document.querySelector("#telefone").value = morador.telefone;
    blocoApartamentoComponent.setValues(morador.bloco, morador.apartamento);
    document.querySelector("#sexo").value = morador.sexo;

    // Formata a data para o input type="date" (yyyy-mm-dd)
    const data = new Date(morador.nascimento);
    const dataFormatada = data.toISOString().split('T')[0];
    document.querySelector("#nascimento").value = dataFormatada;

    // Altera o botão para "Atualizar"
    var botao = document.querySelector("#adicionar-morador");
    botao.textContent = "Atualizar Morador";
    botao.classList.remove("btn-primary");
    botao.classList.add("btn-success");

    // Define que estamos editando e qual o ID
    editandoId = morador._id;

    // Rola para o topo do formulário
    window.scrollTo(0, 0);
}

function excluirMorador(id) {
    if (confirm("Tem certeza que deseja excluir este morador?")) {
        fetch(`http://localhost:3000/moradores/${id}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Morador excluído com sucesso!', 'success');
                // Remove a linha da tabela
                const tr = document.querySelector(`tr[data-id="${id}"]`);
                if (tr) tr.remove();
            })
            .catch(err => {
                console.error('Erro ao excluir morador:', err);
                NotificationSystem.show('Erro ao excluir morador', 'erro');
            });
    }
}

function montaTd(dado, classe) {

    var Td = document.createElement("td");
    Td.textContent = dado;
    Td.classList.add(classe);

    return Td;
}

function validaMorador(morador) {
    var erros = [];

    if (!morador.nomeMorador) erros.push("O nome não pode estar vazio.");
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(morador.nomeMorador)) erros.push("O nome deve conter apenas letras.");

    if (!morador.cpf) erros.push("O CPF não pode estar vazio.");
    if (!/^\d{11}$/.test(morador.cpf.replace(/\D/g, ''))) erros.push("O CPF deve conter 11 dígitos numéricos.");
    //morador.cpf.replace(/\D/g, ''): remove pontuação do CPF para validar somente números.

    if (!morador.rg) erros.push("O RG não pode estar vazio.");
    if (!/^\d{9}$/.test(morador.rg.replace(/\D/g, ''))) erros.push("O RG deve conter 9 dígitos numéricos.");

    if (!morador.telefone) erros.push("O telefone não pode estar vazio.");
    if (!/^\d{11}$/.test(morador.telefone.replace(/\D/g, ''))) erros.push("O Telefone deve conter o DDD e o numero completo.");

    if (!morador.bloco) erros.push("O bloco não pode estar vazio.");

    if (!morador.apartamento) erros.push("O apartamento não pode estar vazio.");
    else {
        // Lista de apartamentos válidos
        const apartamentosValidos = [10, 11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63, 71, 72, 73, 81, 82, 83, 91, 92, 93];
        if (!apartamentosValidos.includes(parseInt(morador.apartamento))) {
            erros.push("Apartamento inválido. Verifique a lista de apartamentos válidos.");
        }
    }

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

            e.target.value = value.slice(0, 14);
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
