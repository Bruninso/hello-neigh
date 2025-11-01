class BlocoApartamentoComponent {
    constructor(containerId, onBlocoApartamentoChange = null) {
        this.container = document.getElementById(containerId);
        this.onBlocoApartamentoChange = onBlocoApartamentoChange;
        this.apartamentosValidos = [10, 11, 12, 13, 21, 22, 23, 31, 32, 33, 41, 42, 43,
            51, 52, 53, 61, 62, 63, 71, 72, 73, 81, 82, 83, 91, 92, 93];
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="grupo">
                <label for="bloco" class="fs-5 text-uppercase">Bloco *</label>
                <select id="bloco" name="bloco" class="campo campo-medio" required>
                    <option value="">Selecione uma opção</option>
                    <option value="A">Bloco Único</option>
                </select>
            </div>
            <div class="grupo">
                <label for="apartamento" class="fs-5 text-uppercase">Apartamento *</label>
                <input type="number" id="apartamento" name="apartamento" class="campo campo-medio" required placeholder="Número do apartamento">
            </div>
        `;

        // Adiciona event listeners para notificar mudanças
        const blocoSelect = this.container.querySelector('#bloco');
        const apartamentoInput = this.container.querySelector('#apartamento');

        const notifyChange = () => {
            if (this.onBlocoApartamentoChange) {
                this.onBlocoApartamentoChange(this.getValues());
            }
        };

        blocoSelect.addEventListener('change', notifyChange);
        apartamentoInput.addEventListener('input', notifyChange);
    }

    getValues() {
        const bloco = document.getElementById('bloco')?.value || '';
        const apartamento = document.getElementById('apartamento')?.value || '';
        return { bloco, apartamento: parseInt(apartamento) || '' };
    }

    validate() {
        const values = this.getValues();
        let isValid = true;
        let errors = [];

        if (!values.bloco) {
            isValid = false;
            errors.push('O bloco é obrigatório.');
        }

        if (!values.apartamento) {
            isValid = false;
            errors.push('O apartamento é obrigatório.');
        } else if (!this.apartamentosValidos.includes(values.apartamento)) {
            isValid = false;
            errors.push('Apartamento inválido. Verifique a lista de apartamentos válidos.');
        }

        return { isValid, errors };
    }

    setValues(bloco, apartamento) {
        const blocoSelect = document.getElementById('bloco');
        const apartamentoInput = document.getElementById('apartamento');

        if (blocoSelect && bloco) {
            blocoSelect.value = bloco;
        }
        if (apartamentoInput && apartamento) {
            apartamentoInput.value = apartamento;
        }
    }

    reset() {
        const blocoSelect = document.getElementById('bloco');
        const apartamentoInput = document.getElementById('apartamento');

        if (blocoSelect) blocoSelect.value = '';
        if (apartamentoInput) apartamentoInput.value = '';
    }

    // Método para obter erros de validação
    getValidationErrors() {
        const values = this.getValues();
        const errors = [];

        if (!values.bloco) {
            errors.push('O bloco é obrigatório.');
        }

        if (!values.apartamento) {
            errors.push('O apartamento é obrigatório.');
        } else if (!this.apartamentosValidos.includes(values.apartamento)) {
            errors.push('Apartamento inválido.');
        }

        return errors;
    }
}