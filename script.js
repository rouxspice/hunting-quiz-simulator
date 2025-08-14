document.addEventListener('DOMContentLoaded', () => {
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
        // --- 個別カテゴリ開始処理 ---
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                const quizInfo = {
                    type: 'single',
                    categories: [button.dataset.category],
                    categoryName: button.dataset.name,
                    numQuestions: 'all' // 個別カテゴリは常に全問出題
                };
                localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
                window.location.href = 'quiz.html';
            });
        });

        // --- モーダル関連処理 ---
        const customQuizBtn = document.getElementById('custom-quiz-btn');
        const modal = document.getElementById('custom-quiz-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const selectAllCheckbox = document.getElementById('select-all-categories');
        const categoryCheckboxes = document.querySelectorAll('.checkbox-group input[name="category"]');
        const startCustomQuizBtn = document.getElementById('start-custom-quiz-btn');

        customQuizBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
        closeModalBtn.addEventListener('click', () => { modal.style.display = 'none'; });
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        selectAllCheckbox.addEventListener('change', () => {
            categoryCheckboxes.forEach(checkbox => { checkbox.checked = selectAllCheckbox.checked; });
        });

        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                selectAllCheckbox.checked = Array.from(categoryCheckboxes).every(cb => cb.checked);
            });
        });
        
        // ▼▼▼ 「試験を開始する」ボタンの最終ロジック ▼▼▼
        startCustomQuizBtn.addEventListener('click', () => {
            const selectedCategories = Array.from(categoryCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedCategories.length === 0) {
                alert('試験の種類を1つ以上選択してください。');
                return;
            }

            const selectedNum = document.querySelector('input[name="num-questions"]:checked').value;

            const quizInfo = {
                type: 'custom',
                categories: selectedCategories,
                categoryName: 'カスタム模擬試験',
                numQuestions: selectedNum
            };
            
            localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
            window.location.href = 'quiz.html';
        });
    }
});
