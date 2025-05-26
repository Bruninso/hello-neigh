document.addEventListener("DOMContentLoaded", function () {
    const visitantes = [];

    const botaoAdicionar = document.querySelector("#adicionar-visitante");
    const form = document.querySelector("#form-visitante");

    botaoAdicionar.addEventListener("click", function (event) {
        event.preventDefault();

        const visitante = obterVisitanteDoFormulario(form);

        const erros = validarVisitante(visitante);
        if (erros.length > 0) {
            exibirMensagensDeErro(erros);
            return;
        }

        visitantes.push(visitante);
        adicionarVisitanteNaTabela(visitante);

        // (Opcional) Enviar para backend:
        /*
        fetch('http://localhost:3000/visitantes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(visitante)
        })
        .then(res => res.json())
        .then(data => console.log('Visitante salvo:', data))
        .catch(err => console.error('Erro ao salvar visitante:', err));
        */

        form.reset();
        document.querySelector("#mensagens-erro").innerHTML = "";
    });

    function obterVisitanteDoFormulario(form) {
        return {
            nomeVisitante: form.nomeVisitante.value.trim(),
            cpfVisitante: form.cpfVisitante ? form.cpfVisitante.value.trim() : '',
            nomeMorador: form.nomeMorador.value.trim(),
            cpfMorador: form.cpfMorador ? form.cpfMorador.value.trim() : '',
            bloco: form.bloco.value.trim(),
            apartamento: form.apartamento.value.trim()
        };
    }

    function adicionarVisitanteNaTabela(visitante) {
        const tabela = document.querySelector("#tabela-visitantes");

        const tr = document.createElement("tr");
        tr.classList.add("visitante");

        tr.appendChild(montaTd(visitante.nomeVisitante));
        tr.appendChild(montaTd(visitante.nomeMorador));
        tr.appendChild(montaTd(visitante.bloco));
        tr.appendChild(montaTd(visitante.apartamento));

        tabela.appendChild(tr);
    }

    function montaTd(conteudo) {
        const td = document.createElement("td");
        td.textContent = conteudo;
        return td;
    }

    function validarVisitante(visitante) {
        const erros = [];

        if (!visitante.nomeVisitante) erros.push("O nome do visitante é obrigatório.");
        if (!visitante.nomeMorador) erros.push("O nome do morador é obrigatório.");
        if (!visitante.bloco) erros.push("O bloco é obrigatório.");
        if (!visitante.apartamento) erros.push("O apartamento é obrigatório.");

        return erros;
    }

    function exibirMensagensDeErro(erros) {
        const ul = document.querySelector("#mensagens-erro");
        ul.innerHTML = "";
        erros.forEach(erro => {
            const li = document.createElement("li");
            li.textContent = erro;
            ul.appendChild(li);
        });
    }

    
});

// MÁSCARA PARA CPF
document.addEventListener("DOMContentLoaded", function () {
    const inputCPFVisitante = document.querySelector('input[name="cpfVisitante"]');
    if (inputCPFVisitante) {
        inputCPFVisitante.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
            if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

            e.target.value = value.slice(0, 14);
        });
    }

    const inputCPFMorador = document.querySelector('input[name="cpfMorador"]');
    if (inputCPFMorador) {
        inputCPFMorador.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');

            if (value.length > 3) value = value.replace(/^(\d{3})(\d)/, '$1.$2');
            if (value.length > 6) value = value.replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3');
            if (value.length > 9) value = value.replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, '$1.$2.$3-$4');

            e.target.value = value.slice(0, 14);
        });
    }
});

