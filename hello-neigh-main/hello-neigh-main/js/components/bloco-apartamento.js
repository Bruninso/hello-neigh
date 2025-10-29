class BlocoApartamentoComponent {
    constructor(containerId, onBlocoApartamentoChange = null) {
        this.container = document.getElementById(containerId);
        this.onBlocoApartamentoChange = onBlocoApartamentoChange;
        this.render();
    }

    render() {
        this.container.innerHTML = `
            <div class="grupo">
                <label for="bloco" class="fs-5 text-uppercase">Bloco *</label>
                <select id="bloco" name="bloco" class="campo campo-medio" required>
                    <option value="">Selecione uma opção</option>
                    <option value="A">Bloco A</option>
                    <option value="B">Bloco B</option>
                    <option value="C">Bloco C</option>
                </select>
            </div>
            <div class="grupo">
                <label for="apartamento" class="fs-5 text-uppercase">Apartamento *</label>
                <input type="text" id="apartamento" name="apartamento" class="campo campo-medio" required placeholder="Número do apartamento">
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
        return { bloco, apartamento };
    }

    validate() {
        const values = this.getValues();
        return values.bloco && values.apartamento;
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
        }

        return errors;
    }
}