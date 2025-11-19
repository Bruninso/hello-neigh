var botaoAdicionar = document.querySelector("#adicionar-pet");
let petsCadastrados = [];
let blocoApartamentoComponent;
let editandoId = null;
const token = localStorage.getItem("token");

// Cadastrar ou Atualizar Pet
botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var pet = obtemPetDoFormulario(form);

    var erros = validaPet(pet);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    if (editandoId) {
        // Atualiza Pet
        fetch(`http://localhost:3000/pets/${editandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(pet)
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Pet atualizado com sucesso!', 'success');

                const tr = document.querySelector(`tr[data-id="${editandoId}"]`);
                if (tr) tr.remove();

                adicionaPetNaTabela(data.pet);

                cancelarEdicao();
                form.reset();
            })
            .catch(err => {
                console.error('Erro ao atualizar pet:', err);
                NotificationSystem.show('Erro ao atualizar pet', 'error');
            });

    } else {
        // Cadastrar novo Pet
        fetch('http://localhost:3000/pets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(pet)
        })
            .then(async res => {
                const data = await res.json();

                if (!res.ok) {
                    console.error("❌ Erro do servidor:", data);
                    throw new Error(data.mensagens ? data.mensagens.join(", ") : "Erro ao salvar pet");
                }

                NotificationSystem.show('Pet cadastrado com sucesso!', 'success');
                adicionaPetNaTabela(data.pet);
                form.reset();
            })
            .catch(err => {
                console.error('Erro ao cadastrar pet:', err);
                NotificationSystem.show('Erro ao cadastrar pet', 'error');
            });
    }

    document.querySelector("#mensagens-erro").innerHTML = "";
});

// Cancelar edição
function cancelarEdicao() {
    editandoId = null;
    var botao = document.querySelector("#adicionar-pet");
    botao.textContent = "Cadastrar Pet";
    botao.classList.remove("btn-success");
    botao.classList.add("btn-primary");
    document.querySelector("#cancelar-edicao").style.display = 'none';
}

// Botão cancelar
document.querySelector("#cancelar-edicao").addEventListener("click", cancelarEdicao);

// Carregar moradores
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

// Preenche automaticamente bloco e apartamento
document.querySelector('#nomeMorador').addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex];
    if (selectedOption.value) {
        const bloco = selectedOption.getAttribute('data-bloco');
        const apartamento = selectedOption.getAttribute('data-apartamento');

        blocoApartamentoComponent.setValues(bloco, apartamento);
    }
});

// Obtém dados do formulário
function obtemPetDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        nomePet: form.nomePet.value,
        tipoPet: form.tipoPet.value,
        raca: form.raca.value,
        porte: form.porte.value,
        corPet: form.corPet.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento,
        nomeMorador: form.nomeMorador.value
    };
}

// Adiciona na tabela
function adicionaPetNaTabela(pet) {
    var petTr = montaTr(pet);
    document.querySelector("#tabela-pets").appendChild(petTr);
}

// Monta linha da tabela
function montaTr(pet) {
    var petTr = document.createElement("tr");
    petTr.dataset.id = pet._id;

    petTr.appendChild(montaTd(pet.nomePet, "info-nomePet"));
    petTr.appendChild(montaTd(pet.tipoPet, "info-tipoPet"));
    petTr.appendChild(montaTd(pet.raca, "info-raca"));
    petTr.appendChild(montaTd(pet.porte, "info-porte"));
    petTr.appendChild(montaTd(pet.corPet, "info-corPet"));
    petTr.appendChild(montaTd(pet.bloco, "info-bloco"));
    petTr.appendChild(montaTd(pet.apartamento, "info-ap"));
    petTr.appendChild(montaTd(pet.nomeMorador, "info-morador"));

    // Ações
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
    petTr.appendChild(tdAcoes);

    menu.querySelector(".editar").addEventListener("click", () => editarPet(pet));
    menu.querySelector(".excluir").addEventListener("click", () => excluirPet(pet._id));

    return petTr;
}

// Editar pet
function editarPet(pet) {
    document.querySelector("#nomePet").value = pet.nomePet;
    document.querySelector("#tipoPet").value = pet.tipoPet;
    document.querySelector("#raca").value = pet.raca;
    document.querySelector("#porte").value = pet.porte;
    document.querySelector("#corPet").value = pet.corPet;
    document.querySelector("#nomeMorador").value = pet.nomeMorador;

    blocoApartamentoComponent.setValues(pet.bloco, pet.apartamento);

    var botao = document.querySelector("#adicionar-pet");
    botao.textContent = "Atualizar Pet";
    botao.classList.add("btn-success");

    editandoId = pet._id;

    document.querySelector("#cancelar-edicao").style.display = 'inline-block';

    window.scrollTo(0, 0);
}

// Excluir pet
function excluirPet(id) {
    if (confirm("Tem certeza que deseja excluir este pet?")) {
        fetch(`http://localhost:3000/pets/${id}`, {
            method: 'DELETE',
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        })
            .then(res => res.json())
            .then(() => {
                NotificationSystem.show('Pet excluído com sucesso!', 'success');
                document.querySelector(`tr[data-id="${id}"]`).remove();
            })
            .catch(err => {
                console.error('Erro ao excluir pet:', err);
                NotificationSystem.show('Erro ao excluir pet', 'error');
            });
    }
}

function montaTd(dado, classe) {
    const td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

// Validação
function validaPet(pet) {
    const erros = [];
    if (!pet.nomePet) erros.push("O nome do pet é obrigatório.");
    if (!pet.tipoPet) erros.push("O tipo do pet é obrigatório.");
    if (!pet.raca) erros.push("O raça do pet é obrigatório.");
    if (!pet.nomeMorador) erros.push("O nome do morador é obrigatório.");
    if (!pet.bloco) erros.push("O bloco é obrigatório.");
    if (!pet.apartamento) erros.push("O apartamento é obrigatório.");
    return erros;
}

function exibiMensagensDeErro(erros) {
    var ul = document.querySelector("#mensagens-erro");
    ul.innerHTML = "";
    erros.forEach(erro => {
        var li = document.createElement("li");
        li.textContent = erro;
        ul.appendChild(li);
    });
}

// Carregar pets ao iniciar
function carregarPets() {
    fetch('http://localhost:3000/pets', {
        method: "GET",
        headers: { "Authorization": "Bearer " + token }
    })
        .then(res => res.json())
        .then(pets => {
            document.querySelector("#tabela-pets").innerHTML = "";
            petsCadastrados = pets;
            pets.forEach(p => adicionaPetNaTabela(p));
        })
        .catch(err => console.error("Erro ao buscar pets:", err));
}

document.addEventListener("DOMContentLoaded", function () {
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');

    carregarMoradores();
    carregarPets();
});
