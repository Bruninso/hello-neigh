var botaoAdicionar = document.querySelector("#adicionar-encomenda");
let encomendasCadastradas = [];
let blocoApartamentoComponent;
let editandoId = null;
const token = localStorage.getItem("token");


botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var encomenda = obtemEncomendaDoFormulario(form);

    var erros = validaEncomenda(encomenda);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    if (editandoId) {
        // Atualizar encomenda existente
        fetch(`http://localhost:3000/encomendas/${editandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(encomenda)
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Encomenda atualizado com sucesso!', 'success');
                // Atualiza a linha na tabela
                const tr = document.querySelector(`tr[data-id="${editandoId}"]`);
                if (tr) tr.remove();
                adicionaEncomendaNaTabela(data.encomenda); // Adiciona a versão atualizada

                // Reseta o formulário e o estado de edição
                form.reset();
                cancelarEdicao();
            })
            .catch(err => {
                console.error('Erro ao atualizar encomenda:', err);
                NotificationSystem.show('Erro ao atualizar encomenda', 'erro');
            });
    } else {
        // Cadastrar nova encomenda
        fetch('http://localhost:3000/encomendas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Authorization": "Bearer " + localStorage.getItem("token") },
            body: JSON.stringify(encomenda)
        })
            .then(async res => {
                const data = await res.json();

                if (!res.ok) {
                    console.error("❌ Erro do servidor:", data);
                    throw new Error(data.mensagens ? data.mensagens.join(", ") : "Erro ao salvar encomenda");
                }

                NotificationSystem.show('Encomenda cadastrada com sucesso!', 'success');
                document.querySelector("#mensagens-erro").innerHTML = "";
                adicionaEncomendaNaTabela(data.encomenda); // agora só roda se realmente existir encomenda
                form.reset();
            })
            .then(data => {
                console.log("📦 Resposta recebida:", data);
            })
            .catch(err => {
                console.error('Erro ao salvar encomenda:', err);
                NotificationSystem.show(err.message || 'Erro ao cadastrar encomenda', 'error');
            })


        var mensagensDeErro = document.querySelector("#mensagens-erro");
        mensagensDeErro.innerHTML = "";
    }
});

// Função para cancelar edição
function cancelarEdicao() {
    editandoId = null;
    var botao = document.querySelector("#adicionar-encomenda");
    botao.textContent = "Registrar Encomenda";
    botao.classList.remove("btn-success");
    botao.classList.add("btn-primary");
    document.querySelector("#form-adiciona").reset();

}

const botaoCancelar = document.querySelector("#cancelar-edicao");
botaoCancelar.addEventListener("click", function () {
    cancelarEdicao();
    botaoCancelar.style.display = 'none';

});

// Na função editarEncomenda, mostrar o botão cancelar
function editarEncomenda(encomenda) {
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


// Evento para preencher bloco e apartamento automaticamente
document.querySelector('#nomeMorador').addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption.value) {
        const bloco = selectedOption.getAttribute('data-bloco');
        const apartamento = selectedOption.getAttribute('data-apartamento');
        // Preencher os campos de bloco e apartamento
        blocoApartamentoComponent.setValues(bloco, apartamento);
    }
});

function adicionaEncomendaNaTabela(encomenda) {
    var encomendaTr = montaTr(encomenda);
    var tabela = document.querySelector("#tabela-encomendas");
    tabela.appendChild(encomendaTr);
}

function obtemEncomendaDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        nomeMorador: form.nomeMorador.value,
        recebidaPor: form.recebidaPor.value,
        transportadora: form.transportadora.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento
    };
}

function montaTr(encomenda) {
    var encomendaTr = document.createElement("tr");
    encomendaTr.classList.add("encomenda");
    encomendaTr.dataset.id = encomenda._id;


    encomendaTr.appendChild(montaTd(encomenda.nomeMorador, "info-morador"));
    encomendaTr.appendChild(montaTd(encomenda.recebidaPor, "info-recebida-por"));
    encomendaTr.appendChild(montaTd(encomenda.transportadora, "info-transportadora"));
    encomendaTr.appendChild(montaTd(encomenda.bloco, "info-bloco"));
    encomendaTr.appendChild(montaTd(encomenda.apartamento, "info-ap"));
    encomendaTr.appendChild(montaTd(encomenda.createdAt, "info-data"));

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
    encomendaTr.appendChild(tdAcoes);

    menu.querySelector(".editar").addEventListener("click", () => editarEncomenda(encomenda));
    menu.querySelector(".excluir").addEventListener("click", () => excluirEncomenda(encomenda._id));


    return encomendaTr;
}

function editarEncomenda(encomenda) {
    // Preenche o formulário com os dados da encomenda
    document.querySelector("#nomeMorador").value = encomenda.nomeMorador;
    document.querySelector("#recebidaPor").value = encomenda.recebidaPor;
    document.querySelector("#transportadora").value = encomenda.transportadora;
    blocoApartamentoComponent.setValues(encomenda.bloco, encomenda.apartamento);


    // Altera o botão para "Atualizar"
    var botao = document.querySelector("#adicionar-encomenda");
    botao.textContent = "Atualizar Encomenda";
    botao.classList.remove("btn-primary");
    botao.classList.add("btn-success");

    // Define que estamos editando e qual o ID
    editandoId = encomenda._id;

    // Rola para o topo do formulário
    window.scrollTo(0, 0);
}

function excluirEncomenda(id) {
    if (confirm("Tem certeza que deseja excluir esta encomenda?")) {
        fetch(`http://localhost:3000/encomendas/${id}`, {
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('encomenda excluído com sucesso!', 'success');
                // Remove a linha da tabela
                const tr = document.querySelector(`tr[data-id="${id}"]`);
                if (tr) tr.remove();
            })
            .catch(err => {
                console.error('Erro ao excluir encomenda:', err);
                NotificationSystem.show('Erro ao excluir encomenda', 'erro');
            });
    }
}

function montaTd(dado, classe) {
    var td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

function validaEncomenda(encomenda) {
    var erros = [];
    if (!encomenda.nomeMorador) erros.push("O nome do morador é obrigatório.");
    if (!encomenda.recebidaPor) erros.push("O campo 'Recebida por' é obrigatório.");
    if (!encomenda.transportadora) erros.push("A transportadora é obrigatória.");
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

document.addEventListener("DOMContentLoaded", function () {
    // Carregar moradores para o select
    carregarMoradores();

    // Inicializar componente de bloco e apartamento
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');

    // Buscar encomendas já cadastradas
    fetch('http://localhost:3000/encomendas', {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
        .then(res => res.json())
        .then(encomendas => {
            encomendasCadastradas = encomendas;
            encomendas.forEach(encomenda => {
                adicionaEncomendaNaTabela(encomenda);
            });
        })
        .catch(err => console.error("Erro ao buscar encomendas:", err));
});