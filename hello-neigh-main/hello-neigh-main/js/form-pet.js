var botaoAdicionar = document.querySelector("#adicionar-pet");
let petsCadastrados = [];
let blocoApartamentoComponent;
let imageUpload;

botaoAdicionar.addEventListener("click", function (event) {
    event.preventDefault();

    var form = document.querySelector("#form-adiciona");
    var pet = obtemPetDoFormulario(form);

    var erros = validaPet(pet);
    if (erros.length > 0) {
        exibiMensagensDeErro(erros);
        return;
    }

    // Criar FormData para enviar imagem
    const formData = new FormData();
    
    // Adicionar campos normais
    Object.keys(pet).forEach(key => {
        if (key !== 'imagemFile') {
            formData.append(key, pet[key]);
        }
    });

    // Adicionar imagem se existir
    if (pet.imagemFile) {
        formData.append('imagem', pet.imagemFile);
    }

    // Enviar pet para backend
    fetch('http://localhost:3000/pets', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        NotificationSystem.show('Pet cadastrado com sucesso!', 'success');
        form.reset();
        imageUpload.reset();
        document.querySelector("#mensagens-erro").innerHTML = "";
        // Recarregar a tabela
        setTimeout(() => location.reload(), 1000);
    })
    .catch(err => {
        console.error('Erro ao salvar pet:', err);
        NotificationSystem.show('Erro ao cadastrar pet', 'error');
    });
});

function adicionaPetNaTabela(pet) {
    var petTr = montaTr(pet);
    var tabela = document.querySelector("#tabela-pets");
    tabela.appendChild(petTr);
}

function obtemPetDoFormulario(form) {
    const blocoApartamento = blocoApartamentoComponent.getValues();

    return {
        nome: form.nome.value,
        tipo: form.tipo.value,
        raca: form.raca.value,
        porte: form.porte.value,
        cor: form.cor.value,
        dataNascimento: form.dataNascimento.value,
        vacinado: form.vacinado.checked,
        castrado: form.castrado.checked,
        observacoes: form.observacoes.value,
        moradorResponsavel: form.moradorResponsavel.value,
        bloco: blocoApartamento.bloco,
        apartamento: blocoApartamento.apartamento,
        imagemFile: imageUpload.getImageFile()
    };
}

function montaTr(pet) {
    var tr = document.createElement("tr");
    tr.appendChild(montaTd(pet.nome, "info-nome"));
    tr.appendChild(montaTd(formatarTipo(pet.tipo), "info-tipo"));
    tr.appendChild(montaTd(pet.raca || '-', "info-raca"));
    tr.appendChild(montaTd(formatarPorte(pet.porte), "info-porte"));
    tr.appendChild(montaTd(pet.cor || '-', "info-cor"));
    tr.appendChild(montaTd(pet.vacinado ? 'Sim' : 'Não', "info-vacinado"));
    tr.appendChild(montaTd(pet.castrado ? 'Sim' : 'Não', "info-castrado"));
    tr.appendChild(montaTd(pet.bloco, "info-bloco"));
    tr.appendChild(montaTd(pet.apartamento, "info-apartamento"));
    tr.appendChild(montaTd(pet.moradorResponsavel, "info-morador"));
    return tr;
}

function formatarTipo(tipo) {
    const tipos = {
        'cachorro': 'Cachorro',
        'gato': 'Gato',
        'ave': 'Ave',
        'roedor': 'Roedor',
        'outro': 'Outro'
    };
    return tipos[tipo] || tipo;
}

function formatarPorte(porte) {
    const portes = {
        'pequeno': 'Pequeno',
        'medio': 'Médio',
        'grande': 'Grande'
    };
    return portes[porte] || porte;
}

function montaTd(dado, classe) {
    var td = document.createElement("td");
    td.textContent = dado;
    td.classList.add(classe);
    return td;
}

function validaPet(pet) {
    var erros = [];
    if (!pet.nome) erros.push("O nome do pet não pode estar vazio.");
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(pet.nome)) {
        erros.push("O nome deve conter apenas letras.");
    }
    if (!pet.tipo) erros.push("O tipo é obrigatório.");
    if (!pet.moradorResponsavel) erros.push("O morador responsável é obrigatório.");
    if (!pet.bloco) erros.push("O bloco é obrigatório.");
    if (!pet.apartamento) erros.push("O apartamento é obrigatório.");

    // Validação de data
    if (pet.dataNascimento && !/^\d{2}\/\d{2}\/\d{4}$/.test(pet.dataNascimento)) {
        erros.push("Data de nascimento deve estar no formato DD/MM/AAAA.");
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

// Máscara para data
document.addEventListener("DOMContentLoaded", function () {
    const dataInput = document.querySelector('input[name="dataNascimento"]');
    if (dataInput) {
        dataInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 2) value = value.replace(/^(\d{2})(\d)/, '$1/$2');
            if (value.length > 5) value = value.replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
            e.target.value = value.slice(0, 10);
        });
    }

    // Inicializar componente de bloco e apartamento
    blocoApartamentoComponent = new BlocoApartamentoComponent('bloco-apartamento-container');
    
    // Inicializar upload de imagem
    imageUpload = new ImageUpload('imagem-pet', 'preview-imagem-pet');

    // Buscar pets já cadastrados
    fetch('http://localhost:3000/pets')
        .then(res => res.json())
        .then(pets => {
            petsCadastrados = pets;
            pets.forEach(p => adicionaPetNaTabela(p));
        })
        .catch(err => console.error("Erro ao buscar pets:", err));
});