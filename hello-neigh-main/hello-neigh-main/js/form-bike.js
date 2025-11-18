var botaoAdicionar = document.querySelector("#adicionar-bicicleta");
let bicicletasCadastradas = [];
let blocoApartamentoComponent;
/*let imageUpload;*/
let editandoId = null;
const token = localStorage.getItem("token");


botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var bicicleta = obtemBicicletaDoFormulario(form);

    var erros = validaBicicleta(bicicleta);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    if (editandoId) {
        // Atualizar bicicleta existente
        fetch(`http://localhost:3000/bicicletas/${editandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + localStorage.getItem("token")

            },
            body: JSON.stringify(bicicleta)
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Bicicleta atualizada com sucesso!', 'success');
                // Atualiza a linha na tabela
                const tr = document.querySelector(`tr[data-id="${editandoId}"]`);
                if (tr) tr.remove();
                adicionaBicicletaNaTabela(data.bicicleta);

                // Reseta o formulário e o estado de edição
                form.reset();
                /*imageUpload.reset();*/
                cancelarEdicao();
            })
            .catch(err => {
                console.error('Erro ao atualizar bicicleta:', err);
                NotificationSystem.show('Erro ao atualizar bicicleta', 'error');
            });
    } else {
        // Cadastrar nova bicicleta
        fetch('http://localhost:3000/bicicletas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json',  "Authorization": "Bearer " + localStorage.getItem("token") },
            body: JSON.stringify(bicicleta)
        })
            .then(async res => {
                const data = await res.json();

                if (!res.ok) {
                    console.error("❌ Erro do servidor:", data);
                    throw new Error(data.mensagens ? data.mensagens.join(", ") : "Erro ao salvar bicicleta");
                }

                NotificationSystem.show('Bicicleta cadastrada com sucesso!', 'success');
                document.querySelector("#mensagens-erro").innerHTML = "";
                adicionaBicicletaNaTabela(data.bicicleta); // agora só roda se realmente existir bicicleta
                form.reset();
            })
            .then(data => {
                console.log("📦 Resposta recebida:", data);
            })
            .catch(err => {
                console.error('Erro ao salvar bicicleta:', err);
                NotificationSystem.show('Erro ao cadastrar bicicleta', 'error');
            });
        var mensagensDeErro = document.querySelector("#mensagens-erro");
        mensagensDeErro.innerHTML = "";
    }
});

// Função para cancelar edição
function cancelarEdicao() {
    editandoId = null;
    var botao = document.querySelector("#adicionar-bicicleta");
    botao.textContent = "Cadastrar Bicicleta";
    botao.classList.remove("btn-success");
    document.querySelector("#form-adiciona").reset();
    /*imageUpload.reset();*/
    document.querySelector("#cancelar-edicao").style.display = 'none';
}

// Botão cancelar
const botaoCancelar = document.querySelector("#cancelar-edicao");
botaoCancelar.addEventListener("click", function () {
    cancelarEdicao();
});

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

function adicionaBicicletaNaTabela(bicicleta) {
    var bicicletaTr = montaTr(bicicleta);
    var tabela = document.querySelector("#tabela-bicicletas");
    tabela.appendChild(bicicletaTr);
}

function obtemBicicletaDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        modeloBike: form.modeloBike.value,
        corBike: form.corBike.value,
        /*imagemBike: imageUpload.getImageFile() ? 'imagem_uploadada.jpg' : '', // Ajustar conforme necessidade*/
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento,
        nomeMorador: form.nomeMorador.value
    };
}

function montaTr(bicicleta) {
    var bicicletaTr = document.createElement("tr");
    bicicletaTr.classList.add("bicicleta");
    bicicletaTr.dataset.id = bicicleta._id;

    bicicletaTr.appendChild(montaTd(bicicleta.modeloBike, "info-modelo"));
    bicicletaTr.appendChild(montaTd(bicicleta.corBike, "info-cor"));
    bicicletaTr.appendChild(montaTd(bicicleta.bloco, "info-bloco"));
    bicicletaTr.appendChild(montaTd(bicicleta.apartamento, "info-apartamento"));
    bicicletaTr.appendChild(montaTd(bicicleta.nomeMorador, "info-morador"));

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
    bicicletaTr.appendChild(tdAcoes);

    menu.querySelector(".editar").addEventListener("click", () => editarBicicleta(bicicleta));
    menu.querySelector(".excluir").addEventListener("click", () => excluirBicicleta(bicicleta._id));

    return bicicletaTr;
}

function editarBicicleta(bicicleta) {
    // Preenche o formulário com os dados da bicicleta
    document.querySelector("#modeloBike").value = bicicleta.modeloBike;
    document.querySelector("#corBike").value = bicicleta.corBike;
    document.querySelector("#nomeMorador").value = bicicleta.nomeMorador;
    blocoApartamentoComponent.setValues(bicicleta.bloco, bicicleta.apartamento);

    // Altera o botão para "Atualizar"
    var botao = document.querySelector("#adicionar-bicicleta");
    botao.textContent = "Atualizar Bicicleta";
    botao.classList.add("btn-success");

    // Define que estamos editando e qual o ID
    editandoId = bicicleta._id;

    // Mostra botão cancelar
    document.querySelector("#cancelar-edicao").style.display = 'inline-block';

    // Rola para o topo do formulário
    window.scrollTo(0, 0);
}

function excluirBicicleta(id) {
    if (confirm("Tem certeza que deseja excluir esta bicicleta?")) {
        fetch(`http://localhost:3000/bicicletas/${id}`, {
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Bicicleta excluída com sucesso!', 'success');
                // Remove a linha da tabela
                const tr = document.querySelector(`tr[data-id="${id}"]`);
                if (tr) tr.remove();
            })
            .catch(err => {
                console.error('Erro ao excluir bicicleta:', err);
                NotificationSystem.show('Erro ao excluir bicicleta', 'error');
            });
    }
}

function montaTd(dado, classe) {
    var td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

function validaBicicleta(bicicleta) {
    var erros = [];
    if (!bicicleta.modeloBike) erros.push("O modelo da bicicleta é obrigatório.");
    if (!bicicleta.corBike) erros.push("A cor da bicicleta é obrigatória.");
    if (!bicicleta.nomeMorador) erros.push("O nome do morador é obrigatório.");
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

// Carregar bicicletas ao iniciar
function carregarBicicletas() {
    fetch('http://localhost:3000/bicicletas', {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
        .then(res => res.json())
        .then(bicicletas => {
            document.querySelector("#tabela-bicicletas").innerHTML = "";
            bicicletasCadastradas = bicicletas;
            bicicletas.forEach(b => adicionaBicicletaNaTabela(b));
        })
        .catch(err => console.error("Erro ao buscar bicicletas:", err));
}

document.addEventListener("DOMContentLoaded", function () {
    // Inicializar componente de bloco e apartamento
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');
    carregarMoradores();
    /* Inicializar upload de imagem
    imageUpload = new ImageUpload('imagemBike', 'preview-imagem-bicicleta');*/

    // Buscar bicicletas já cadastradas
    carregarBicicletas();
});
