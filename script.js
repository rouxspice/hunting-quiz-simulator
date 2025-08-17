document.addEventListener('DOMContentLoaded', () => {
    // 通常のカテゴリボタン
    document.querySelectorAll('.category-btn').forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            const name = encodeURIComponent(button.dataset.name); // URL用にエンコード
            // ★★★ URLクエリパラメータで情報を渡す ★★★
            window.location.href = `quiz.html?category=${category}&name=${name}`;
        });
    });

    // --- カスタムクイズ関連の要素取得 ---
    const customQuizBtn = document.getElementById('custom-quiz-btn');
    const modal = document.getElementById('custom-quiz-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const startCustomQuizBtn = document.getElementById('start-custom-quiz-btn');
    const selectAllCheckbox = document.getElementById('select-all-categories');
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');

    // --- モーダル表示/非表示 ---
    customQuizBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    const closeModal = () => {
        modal.style.display = 'none';
    };

    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // --- カスタムクイズのロジック ---
    selectAllCheckbox.addEventListener('change', () => {
        categoryCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    });

    startCustomQuizBtn.addEventListener('click', () => {
        const selectedCategories = Array.from(categoryCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);

        const numQuestions = document.querySelector('input[name="num-questions"]:checked').value;

        if (selectedCategories.length === 0) {
            alert('試験の種類を1つ以上選択してください。');
            return;
        }

        // ★★★ カスタムクイズの情報はsessionStorageで渡す（これは仕様通り） ★★★
        sessionStorage.setItem('customQuizConfig', JSON.stringify({
            categories: selectedCategories,
            numQuestions: numQuestions
        }));
        sessionStorage.setItem('quizCategory', 'custom'); // 識別用
        sessionStorage.setItem('quizCategoryName', 'カスタム模擬試験');

        window.location.href = 'quiz.html';
        closeModal();
    });
});
