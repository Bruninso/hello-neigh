class NotificationSystem {
    static show(message, type = 'info', duration = 5000) {
        // Remover notificações antigas
        this.removeOldNotifications();

        const notification = document.createElement('div');
        notification.className = `alert alert-${this.getAlertType(type)} alert-dismissible fade show position-fixed`;
        notification.style.cssText = `
            top: 80px; 
            right: 20px; 
            z-index: 1050; 
            min-width: 300px;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-left: 4px solid ${this.getBorderColor(type)};
        `;
        
        const icon = this.getIcon(type);
        
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="me-2" style="font-size: 1.2rem;">
                    ${icon}
                </div>
                <div class="flex-grow-1">
                    ${message}
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        `;

        document.body.appendChild(notification);

        // Inicializar tooltips do Bootstrap se existirem
        if (typeof bootstrap !== 'undefined') {
            new bootstrap.Alert(notification);
        }

        // Auto-remove após o tempo especificado
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    this.fadeOut(notification);
                }
            }, duration);
        }

        return notification;
    }

    static getAlertType(type) {
        const types = {
            'success': 'success',
            'error': 'danger',
            'warning': 'warning',
            'info': 'info'
        };
        return types[type] || 'info';
    }

    static getBorderColor(type) {
        const colors = {
            'success': '#198754',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#0dcaf0'
        };
        return colors[type] || '#6c757d';
    }

    static getIcon(type) {
        const icons = {
            'success': '<i class="fas fa-check-circle text-success"></i>',
            'error': '<i class="fas fa-exclamation-circle text-danger"></i>',
            'warning': '<i class="fas fa-exclamation-triangle text-warning"></i>',
            'info': '<i class="fas fa-info-circle text-info"></i>'
        };
        return icons[type] || '<i class="fas fa-info-circle text-info"></i>';
    }

    static removeOldNotifications() {
        const oldNotifications = document.querySelectorAll('.alert.position-fixed');
        oldNotifications.forEach(notification => {
            if (notification.parentNode) {
                notification.remove();
            }
        });
    }

    static fadeOut(element) {
        element.style.opacity = '0';
        element.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            if (element.parentNode) {
                element.remove();
            }
        }, 500);
    }

    // Métodos estáticos para tipos específicos
    static success(message, duration = 5000) {
        return this.show(message, 'success', duration);
    }

    static error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    }

    static warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    static info(message, duration = 5000) {
        return this.show(message, 'info', duration);
    }

    // Método para mostrar loading
    static showLoading(message = 'Carregando...') {
        const loadingNotification = document.createElement('div');
        loadingNotification.className = 'alert alert-info alert-dismissible fade show position-fixed';
        loadingNotification.style.cssText = `
            top: 80px; 
            right: 20px; 
            z-index: 1050; 
            min-width: 200px;
        `;
        
        loadingNotification.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Carregando...</span>
                </div>
                <div>${message}</div>
            </div>
        `;

        document.body.appendChild(loadingNotification);
        return loadingNotification;
    }

    // Método para esconder loading
    static hideLoading(loadingElement) {
        if (loadingElement && loadingElement.parentNode) {
            loadingElement.remove();
        }
    }
}

// Adicionar estilos CSS dinamicamente para melhor aparência
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .alert.position-fixed {
            animation: slideInRight 0.3s ease;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .alert.fade {
            transition: opacity 0.5s ease, transform 0.5s ease;
        }
    `;
    document.head.appendChild(style);
}