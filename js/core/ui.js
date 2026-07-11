// 📄 js/core/ui.js

export const ui = {
    init() {
        // Dëgjo për klikime jashtë panelit (për ta mbyllur atë)
        const overlay = document.getElementById('global-overlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeBottomSheet());
        }
    },

    openBottomSheet(htmlContent) {
        const sheet = document.getElementById('global-bottom-sheet');
        const overlay = document.getElementById('global-overlay');
        const content = document.getElementById('bottom-sheet-content');

        if (!sheet || !overlay || !content) return;

        // Injekto përmbajtjen (psh: videon, titullin)
        content.innerHTML = htmlContent;
        
        // Rifresko ikonat e Lucide nëse ka
        if (window.lucide) {
            window.lucide.createIcons();
        }

        // Shfaq panelin
        overlay.classList.add('is-open');
        sheet.classList.add('is-open');
    },

    closeBottomSheet() {
        const sheet = document.getElementById('global-bottom-sheet');
        const overlay = document.getElementById('global-overlay');

        if (!sheet || !overlay) return;

        // Fshih panelin
        overlay.classList.remove('is-open');
        sheet.classList.remove('is-open');
        
        // Pastro përmbajtjen pas përfundimit të animacionit (0.3s)
        setTimeout(() => {
            const content = document.getElementById('bottom-sheet-content');
            if (content) content.innerHTML = '';
        }, 300);
    }
};
