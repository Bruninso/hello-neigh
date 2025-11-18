var botaoAdicionar = document.querySelector("#adicionar-visitante");
let visitantesCadastrados = [];
let blocoApartamentoComponent;
let editandoId = null;
const token = localStorage.getItem("token");


botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var visitante = obtemVisitanteDoFormulario(form);

    var erros = validaVisitante(visitante);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    if (editandoId) {
        // Atualizar visitante existente
        fetch(`http://localhost:3000/visitantes/${editandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(visitante)
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Visitante atualizado com sucesso!', 'success');
                // Atualiza a linha na tabela
                const tr = document.querySelector(`tr[data-id="${editandoId}"]`);
                if (tr) tr.remove();
                adicionaVisitanteNaTabela(data.visitante); // Adiciona a versão atualizada

                // Reseta o formulário e o estado de edição
                form.reset();
                cancelarEdicao();
            })
            .catch(err => {
                console.error('Erro ao atualizar visitante:', err);
                NotificationSystem.show('Erro ao atualizar visitante', 'erro');
            });
    } else {

        // Evitar CPF duplicado
        const cpfRepetido = visitantesCadastrados.some(v => v.cpfVisitante === visitante.cpfVisitante);
        if (cpfRepetido) {
            exibiMensagensDeErro(["Já existe um visitante com esse CPF."]);
            return;
        }
        // Enviar visitante para backend
        fetch('http://localhost:3000/visitantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Authorization": "Bearer " + localStorage.getItem("token") },
            body: JSON.stringify(visitante)
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Visitante cadastrado com sucesso!', 'success');
                document.querySelector("#mensagens-erro").innerHTML = "";
                adicionaVisitanteNaTabela(data.visitante);

                form.reset();
            })
            .catch(err => {
                console.error('Erro ao salvar visitante:', err);
                NotificationSystem.show('Erro ao cadastrar visitante', 'error');
            });


        var mensagensDeErro = document.querySelector("#mensagens-erro");
        mensagensDeErro.innerHTML = "";
    }

});

//Função para cancelar edição (resetar o formulário)
function cancelarEdicao() {
    editandoId = null;
    var botao = document.querySelector("#adicionar-visitante");
    botao.textContent = "Adicionar visitante";
    botao.classList.remove("btn-success");
    botao.classList.add("btn-primary");
    document.querySelector("#form-adiciona").reset();


}

const botaoCancelar = document.querySelector("#cancelar-edicao");

botaoCancelar.addEventListener("click", function () {
    cancelarEdicao();
    botaoCancelar.style.display = 'none';
});

// Na função editarVisitante, mostrar o botão cancelar
function editarVisitante(visitante) {
    // ... preencher formulário ...
    botaoCancelar.style.display = 'inline-block';
}

// Em cancelarEdicao, esconder o botão cancelar
function cancelarEdicao() {
    // ... resetar ...
    botaoCancelar.style.display = 'none';
}

function carregarMoradores() {
    fetch('http://localhost:3000/moradores', {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token")
        }
    })
    .then(async res => {
        const data = await res.json();

        if (!res.ok) {
            console.error("Erro ao carregar moradores:", data);
            return [];
        }

        return data;
    })
    .then(moradores => {
        if (!Array.isArray(moradores)) {
            console.warn("Resposta inesperada. Moradores não é array:", moradores);
            return;
        }

        const select = document.querySelector('#nomeMorador');
        select.innerHTML = '<option value="">Selecione um morador</option>';

        moradores.forEach(morador => {
            const option = document.createElement('option');
            option.value = morador.nomeMorador;
            option.textContent = morador.nomeMorador;
            option.setAttribute('data-bloco', morador.bloco);
            option.setAttribute('data-apartamento', morador.apartamento);
            select.appendChild(option);
        });
    })
    .catch(err => console.error("Erro ao carregar moradores:", err));
}


document.querySelector('#nomeMorador').addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption.value) {
        const bloco = selectedOption.getAttribute('data-bloco');
        const apartamento = selectedOption.getAttribute('data-apartamento');
        // Preencher os campos de bloco e apartamento
        blocoApartamentoComponent.setValues(bloco, apartamento);
    }
});

function adicionaVisitanteNaTabela(visitante) {
    var visitanteTr = montaTr(visitante);
    var tabela = document.querySelector("#tabela-visitantes");
    tabela.appendChild(visitanteTr);
}

function obtemVisitanteDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        nomeVisitante: form.nomeVisitante.value,
        cpfVisitante: form.cpfVisitante.value,
        nomeMorador: form.nomeMorador.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento
    };
}

function montaTr(visitante) {
    var visitanteTr = document.createElement("tr");
    visitanteTr.classList.add("visitante");
    visitanteTr.dataset.id = visitante._id;

    visitanteTr.appendChild(montaTd(visitante.nomeVisitante, "info-nome"));
    visitanteTr.appendChild(montaTd(visitante.cpfVisitante, "info-cpf"));
    visitanteTr.appendChild(montaTd(visitante.nomeMorador, "info-visitado"));
    visitanteTr.appendChild(montaTd(visitante.bloco, "info-bloco"));
    visitanteTr.appendChild(montaTd(visitante.apartamento, "info-ap"));

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
    visitanteTr.appendChild(tdAcoes);

    // Eventos dos botões do menu
    menu.querySelector(".editar").addEventListener("click", () => editarVisitante(visitante));
    menu.querySelector(".excluir").addEventListener("click", () => excluirVisitante(visitante._id));

    return visitanteTr
}

function editarVisitante(visitante) {
    // Preenche o formulário com os dados do visitante
    document.querySelector("#nomeVisitante").value = visitante.nomeVisitante;
    document.querySelector("#nomeMorador").value = visitante.nomeMorador;
    document.querySelector("#cpfVisitante").value = visitante.cpfVisitante;
    blocoApartamentoComponent.setValues(visitante.bloco, visitante.apartamento);

    // Altera o botão para "Atualizar"
    var botao = document.querySelector("#adicionar-visitante");
    botao.textContent = "Atualizar Visitante";
    botao.classList.remove("btn-primary");
    botao.classList.add("btn-success");

    // Define que estamos editando e qual o ID
    editandoId = visitante._id;

    // Rola para o topo do formulário
    window.scrollTo(0, 0);
}

function excluirVisitante(id) {
    if (confirm("Tem certeza que deseja excluir este visitante?")) {
        fetch(`http://localhost:3000/visitantes/${id}`, {
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('visitante excluído com sucesso!', 'success');
                // Remove a linha da tabela
                const tr = document.querySelector(`tr[data-id="${id}"]`);
                if (tr) tr.remove();
            })
            .catch(err => {
                console.error('Erro ao excluir visitante:', err);
                NotificationSystem.show('Erro ao excluir visitante', 'erro');
            });
    }
}

function montaTd(dado, classe) {
    var td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

function validaVisitante(visitante) {
    var erros = [];
    if (!visitante.nomeVisitante) erros.push("O nome do visitante não pode estar vazio.");
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(visitante.nomeVisitante)) erros.push("O nome deve conter apenas letras.");
    if (!visitante.cpfVisitante) erros.push("O CPF não pode estar vazio.");
    if (!/^\d{11}$/.test(visitante.cpfVisitante.replace(/\D/g, ''))) erros.push("O CPF deve conter 11 dígitos numéricos.");
    if (!visitante.nomeMorador) erros.push("O nome do morador visitado é obrigatório.");
    if (!visitante.bloco) erros.push("O bloco é obrigatório.");
    if (!visitante.apartamento) erros.push("O apartamento é obrigatório.");
    else {
        // Lista de apartamentos válidos
        const apartamentosValidos = [10, 11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43, 51, 52, 53, 61, 62, 63, 71, 72, 73, 81, 82, 83, 91, 92, 93];
        if (!apartamentosValidos.includes(parseInt(visitante.apartamento))) {
            erros.push("Apartamento inválido. Verifique a lista de apartamentos válidos.");
        }
    }
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
    var inputCPF = document.querySelector('input[name="cpfVisitante"]');
    if (inputCPF) {
        inputCPF.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
            if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');
            e.target.value = value.slice(0, 14);
        });
    }

    // Carregar moradores para o select
    carregarMoradores();

    // Inicializar componente de bloco e apartamento
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');

    // Buscar visitantes já cadastrados
    fetch('http://localhost:3000/visitantes', {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
        .then(res => res.json())
        .then(visitantes => {
            visitantesCadastrados = visitantes;
            visitantes.forEach(visitante => {
                adicionaVisitanteNaTabela(visitante);
            });
        })
        .catch(err => console.error("Erro ao buscar visitantes:", err));
});