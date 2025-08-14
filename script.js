document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-grid .btn');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const categoryFile = button.dataset.category;
            const categoryName = button.textContent;
            localStorage.setItem('selectedCategory', categoryFile);
            localStorage.setItem('selectedCategoryName', categoryName);
            window.location.href = 'quiz.html';
        });
    });
});
