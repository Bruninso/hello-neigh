var botaoAdicionar = document.querySelector("#adicionar-veiculo");
let veiculosCadastrados = [];
let blocoApartamentoComponent;
let editandoId = null;
const token = localStorage.getItem("token");


botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var veiculo = obtemVeiculoDoFormulario(form);

    var erros = validaVeiculo(veiculo);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    if (editandoId) {
        // Atualizar veiculo existente
        fetch(`http://localhost:3000/veiculos/${editandoId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + localStorage.getItem("token")
            },
            body: JSON.stringify(veiculo)
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Veiculo atualizado com sucesso!', 'success');
                // Atualiza a linha na tabela
                const tr = document.querySelector(`tr[data-id="${editandoId}"]`);
                if (tr) tr.remove();
                adicionaVeiculoNaTabela(data.veiculo); // Adiciona a versão atualizada

                // Reseta o formulário e o estado de edição
                form.reset();
                cancelarEdicao();
            })
            .catch(err => {
                console.error('Erro ao atualizar veiculo:', err);
                NotificationSystem.show('Erro ao atualizar veiculo', 'erro');
            });
    } else {

        // Evitar CPF duplicado
        const placaRepetida = veiculosCadastrados.some(v => v.placa.replace(/\s/g, '') === veiculo.placa.replace(/\s/g, ''));
		if (placaRepetida) {
		exibiMensagensDeErro(["Já existe um veículo com essa placa."]);
        return;
    }
        // Enviar veiculo para backend
        fetch('http://localhost:3000/veiculos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', "Authorization": "Bearer " + localStorage.getItem("token") },
            body: JSON.stringify(veiculo)
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('Veiculo cadastrado com sucesso!', 'success');
                document.querySelector("#mensagens-erro").innerHTML = "";
                adicionaVeiculoNaTabela(data.veiculo);

                form.reset();
            })
            .catch(err => {
                console.error('Erro ao salvar veiculo:', err);
                NotificationSystem.show('Erro ao cadastrar veiculo', 'error');
            });


        var mensagensDeErro = document.querySelector("#mensagens-erro");
        mensagensDeErro.innerHTML = "";
    }

});

//Função para cancelar edição (resetar o formulário)
function cancelarEdicao() {
    editandoId = null;
    var botao = document.querySelector("#adicionar-veiculo");
    botao.textContent = "Adicionar veiculo";
    botao.classList.remove("btn-success");
    botao.classList.add("btn-primary");
    document.querySelector("#form-adiciona").reset();


}

const botaoCancelar = document.querySelector("#cancelar-edicao");

botaoCancelar.addEventListener("click", function () {
    cancelarEdicao();
    botaoCancelar.style.display = 'none';
});

// Na função editarVeiculo, mostrar o botão cancelar
function editarVeiculo(veiculo) {
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

function adicionaVeiculoNaTabela(veiculo) {
    var veiculoTr = montaTr(veiculo);
    var tabela = document.querySelector("#tabela-veiculos");
    tabela.appendChild(veiculoTr);
}

function obtemVeiculoDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        placa: form.placa.value,
        modeloVeiculo: form.modeloVeiculo.value,
        corVeiculo: form.corVeiculo.value,
		tipoVeiculo: form.tipoVeiculo.value,
		vaga: form.vaga.value,		
		nomeMorador: form.nomeMorador.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento
    };
}

function montaTr(veiculo) {
    var veiculoTr = document.createElement("tr");
    veiculoTr.classList.add("veiculo");
    veiculoTr.dataset.id = veiculo._id;

    veiculoTr.appendChild(montaTd(veiculo.placa, "info-placa"));
    veiculoTr.appendChild(montaTd(veiculo.modeloVeiculo, "info-modelo"));
    veiculoTr.appendChild(montaTd(veiculo.corVeiculo, "info-cor"));
	veiculoTr.appendChild(montaTd(veiculo.tipoVeiculo, "info-tipo"));
	veiculoTr.appendChild(montaTd(veiculo.vaga, "info-vaga"));
	veiculoTr.appendChild(montaTd(veiculo.nomeMorador, "info-morador"));
    veiculoTr.appendChild(montaTd(veiculo.bloco, "info-bloco"));
    veiculoTr.appendChild(montaTd(veiculo.apartamento, "info-ap"));

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
    veiculoTr.appendChild(tdAcoes);

    // Eventos dos botões do menu
    menu.querySelector(".editar").addEventListener("click", () => editarVeiculo(veiculo));
    menu.querySelector(".excluir").addEventListener("click", () => excluirVeiculo(veiculo._id));

    return veiculoTr
}

function editarVeiculo(veiculo) {
    // Preenche o formulário com os dados do veiculo
    document.querySelector("#placa").value = veiculo.placa;
	document.querySelector("#vaga").value = veiculo.vaga;
	document.querySelector("#modeloVeiculo").value = veiculo.modeloVeiculo;
	document.querySelector("#tipoVeiculo").value = veiculo.tipoVeiculo;
	document.querySelector("#corVeiculo").value = veiculo.corVeiculo;
    document.querySelector("#nomeMorador").value = veiculo.nomeMorador;
    blocoApartamentoComponent.setValues(veiculo.bloco, veiculo.apartamento);

    // Altera o botão para "Atualizar"
    var botao = document.querySelector("#adicionar-veiculo");
    botao.textContent = "Atualizar Veiculo";
    botao.classList.remove("btn-primary");
    botao.classList.add("btn-success");

    // Define que estamos editando e qual o ID
    editandoId = veiculo._id;

    // Rola para o topo do formulário
    window.scrollTo(0, 0);
}

function excluirVeiculo(id) {
    if (confirm("Tem certeza que deseja excluir este veiculo?")) {
        fetch(`http://localhost:3000/veiculos/${id}`, {
            method: 'DELETE',
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        })
            .then(res => res.json())
            .then(data => {
                NotificationSystem.show('veiculo excluído com sucesso!', 'success');
                // Remove a linha da tabela
                const tr = document.querySelector(`tr[data-id="${id}"]`);
                if (tr) tr.remove();
            })
            .catch(err => {
                console.error('Erro ao excluir veiculo:', err);
                NotificationSystem.show('Erro ao excluir veiculo', 'erro');
            });
    }
}

function montaTd(dado, classe) {
    var td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

function validaVeiculo(veiculo) {
    var erros = [];
    if (!veiculo.placa) {
        erros.push("A placa não pode estar vazia.");
    } else if (!/^[A-Za-z0-9]{7}$/.test(veiculo.placa.replace(/[^A-Za-z0-9]/g, ''))) {
        erros.push("A placa deve conter exatamente 7 caracteres (letras e números).");
    }

    if (!veiculo.modeloVeiculo) erros.push("O modelo não pode estar vazio.");
    if (!veiculo.corVeiculo) erros.push("A cor não pode estar vazia.");
    if (!veiculo.tipoVeiculo) erros.push("O tipo é obrigatório.");
    if (!veiculo.nomeMorador) erros.push("O morador responsável é obrigatório.");
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

// Máscara CPF
document.addEventListener("DOMContentLoaded", function () {
    var inputPlaca = document.querySelector('#placa');
    if (inputPlaca) {
        inputPlaca.addEventListener('input', function (e) {
            let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            
            // Formatação automática
            if (value.length <= 3) {
                value = value;
            } else if (value.length <= 4) {
                value = value.replace(/^([A-Z0-9]{3})([A-Z0-9])/, '$1$2');
            } else if (value.length <= 7) {
                // Formato Mercosul: AAA0A00
                if (/[A-Za-z]{3}[0-9][A-Za-z][0-9]{2}/.test(value)) {
                    value = value.replace(/^([A-Z0-9]{3})([A-Z0-9])([A-Z0-9])([A-Z0-9]{2})/, '$1$2$3$4');
                } 
                // Formato tradicional: AAA0000
                else if (/[A-Za-z]{3}[0-9]{4}/.test(value)) {
                    value = value.replace(/^([A-Z0-9]{3})([A-Z0-9]{4})/, '$1$2');
                }
            }
            
            e.target.value = value.slice(0, 7);
        });
    }


    // Carregar moradores para o select
    carregarMoradores();

    // Inicializar componente de bloco e apartamento
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');

    // Buscar veiculos já cadastrados
    fetch('http://localhost:3000/veiculos', {
        method: "GET",
        headers: {
            "Authorization": "Bearer " + token
        }
    })
        .then(res => res.json())
        .then(veiculos => {
            veiculosCadastrados = veiculos;
            veiculos.forEach(veiculo => {
                adicionaVeiculoNaTabela(veiculo);
            });
        })
        .catch(err => console.error("Erro ao buscar veiculos:", err));
});