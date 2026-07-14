/**
 * 🕋 Hayat - Moduli i Mburojës
 * Menaxhon shfaqjen e kategorive dhe kërkimin
 */

document.addEventListener('DOMContentLoaded', async () => {
    const categoriesContainer = document.getElementById('categories-container');
    const searchInput = document.getElementById('search-dua');

    // 1. Ngarkojmë Kategoritë nga JSON
    try {
        const response = await fetch('../js/data/categories.json');
        const data = await response.json();
        
        renderCategories(data.categories);

        // Funksionaliteti i kërkimit (Filter i thjeshtë për momentin)
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filteredCategories = data.categories.filter(cat => 
                cat.name.toLowerCase().includes(searchTerm)
            );
            renderCategories(filteredCategories);
        });

    } catch (error) {
        console.error("Gabim në ngarkimin e kategorive të Mburojës:", error);
        categoriesContainer.innerHTML = '<p style="text-align: center; color: var(--color-danger);">Gabim në ngarkimin e të dhënave.</p>';
    }

    // 2. Funksioni për vizatimin e kategorive në DOM
    function renderCategories(categories) {
        let html = '';
        categories.forEach(cat => {
            // Përdorim klasat e 'list-item' nga components.css
            html += `
                <div class="list-item" onclick="window.location.href='mburoja-category.html?id=${cat.id}'" style="cursor: pointer;">
                    <div class="list-item__left">
                        <div style="background-color: ${cat.color}20; padding: 10px; border-radius: 50%; color: ${cat.color}; display: flex; align-items: center; justify-content: center;">
                            <i data-lucide="${cat.icon}"></i>
                        </div>
                        <div class="list-item__info">
                            <span class="list-item__title">${cat.name}</span>
                            <span class="list-item__subtitle">${cat.dua_count} lutje</span>
                        </div>
                    </div>
                    <div class="list-item__right">
                        <i data-lucide="chevron-right"></i>
                    </div>
                </div>
            `;
        });
        
        categoriesContainer.innerHTML = html;
        
        // Rinicializojmë ikonat e reja Lucide që sapo injektuam
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }
});
