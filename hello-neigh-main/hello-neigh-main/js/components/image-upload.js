class ImageUpload {
    constructor(inputId, previewId) {
        this.input = document.getElementById(inputId);
        this.preview = document.getElementById(previewId);
        this.currentImage = null;
        this.init();
    }

    init() {
        if (!this.input || !this.preview) {
            console.error('ImageUpload: Elementos não encontrados');
            return;
        }

        this.input.addEventListener('change', (e) => {
            this.handleImageSelect(e);
        });

        // Inicializar preview vazio
        this.preview.innerHTML = '<div class="text-muted">Nenhuma imagem selecionada</div>';
    }

    handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            // Validar tipo de arquivo
            if (!file.type.match('image.*')) {
                NotificationSystem.show('Por favor, selecione uma imagem válida (JPEG, PNG, etc.).', 'error');
                this.input.value = '';
                return;
            }

            // Validar tamanho do arquivo (5MB máximo)
            if (file.size > 5 * 1024 * 1024) {
                NotificationSystem.show('A imagem deve ter menos de 5MB.', 'error');
                this.input.value = '';
                return;
            }

            this.previewImage(file);
        }
    }

    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentImage = file;
            this.preview.innerHTML = `
                <div class="text-center">
                    <img src="${e.target.result}" class="img-thumbnail" style="max-height: 200px; max-width: 200px;">
                    <div class="mt-2">
                        <button type="button" class="btn btn-sm btn-danger" onclick="imageUpload.removeImage()">
                            <i class="fas fa-trash"></i> Remover Imagem
                        </button>
                    </div>
                </div>
            `;
        };
        reader.onerror = () => {
            NotificationSystem.show('Erro ao carregar a imagem.', 'error');
            this.input.value = '';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.input.value = '';
        this.currentImage = null;
        this.preview.innerHTML = '<div class="text-muted">Nenhuma imagem selecionada</div>';
        
        // Disparar evento para notificar mudanças
        this.input.dispatchEvent(new Event('change'));
    }

    getImageFile() {
        return this.currentImage;
    }

    hasImage() {
        return this.currentImage !== null;
    }

    reset() {
        this.removeImage();
    }

    // Para enviar como FormData
    appendToFormData(formData, fieldName = 'imagem') {
        if (this.currentImage) {
            formData.append(fieldName, this.currentImage);
        }
        return formData;
    }

    // Método para validar a imagem
    validate() {
        if (this.currentImage) {
            if (!this.currentImage.type.match('image.*')) {
                return 'Tipo de arquivo inválido. Selecione uma imagem.';
            }
            if (this.currentImage.size > 5 * 1024 * 1024) {
                return 'A imagem é muito grande. Tamanho máximo: 5MB.';
            }
        }
        return null; // Sem erros
    }

    // Método para obter URL da imagem para preview
    getImageURL() {
        if (this.currentImage) {
            return URL.createObjectURL(this.currentImage);
        }
        return null;
    }
}