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
                    <option value="Unico">Bloco Único</option>
                </select>
            </div>
            <div class="grupo">
                <label for="apartamento" class="fs-5 text-uppercase">Apartamento *</label>
                <select type="number" id="apartamento" name="apartamento" class="campo campo-medio" required>
                    <option value="">Selecione uma opção</option>
                    <option value="10">10</option>
                    <option value="11">11</option>
                    <option value="12">12</option>
                    <option value="13">13</option>
                    <option value="21">21</option>
                    <option value="22">22</option>
                    <option value="23">23</option>
                    <option value="31">31</option>
                    <option value="32">32</option>
                    <option value="33">33</option>
                    <option value="41">41</option>
                    <option value="42">42</option>
                    <option value="43">43</option>
                    <option value="51">51</option>
                    <option value="52">52</option>
                    <option value="53">53</option>
                    <option value="61">61</option>
                    <option value="62">62</option>
                    <option value="63">63</option>
                    <option value="71">71</option>
                    <option value="72">72</option>
                    <option value="73">73</option>
                    <option value="81">81</option>
                    <option value="82">82</option>
                    <option value="83">83</option>
                    <option value="91">91</option>
                    <option value="92">92</option>
                    <option value="93">93</option>
                </select>
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