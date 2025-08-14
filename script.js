document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const customExamBtn = document.getElementById('custom-exam-btn');
    const realExamBtn = document.getElementById('real-exam-btn');
    const categoryButtons = document.querySelectorAll('.category-btn'); // ★★★ 破壊した個別ボタンを再取得 ★★★
    const modal = document.getElementById('category-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    const numQuestionsSelect = document.getElementById('num-questions');
    const huntingMethodModal = document.getElementById('hunting-method-modal');
    const closeMethodModalBtn = document.getElementById('close-method-modal-btn');
    const startRealExamBtn = document.getElementById('start-real-exam-btn');

    // --- イベントリスナー ---

    // ★★★★★ 個別カテゴリボタンのクリックイベントを完全修復 ★★★★★
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            const categoryName = button.textContent;
            
            const quizInfo = {
                type: 'single', // 個別カテゴリ用のタイプ
                categories: [category],
                categoryName: categoryName,
                numQuestions: 'all' // 個別カテゴリは常に全問出題
            };

            localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
            window.location.href = 'quiz.html';
        });
    });

    // 「カスタム模擬試験」ボタンのクリックイベント
    if (customExamBtn) {
        customExamBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    // 「本番模擬試験」ボタンのクリックイベント
    if (realExamBtn) {
        realExamBtn.addEventListener('click', () => {
            huntingMethodModal.style.display = 'block';
        });
    }

    // モーダルの閉じるボタン
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    if (closeMethodModalBtn) {
        closeMethodModalBtn.addEventListener('click', () => {
            huntingMethodModal.style.display = 'none';
        });
    }

    // モーダルの外側クリックで閉じる
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == huntingMethodModal) {
            huntingMethodModal.style.display = 'none';
        }
    });

    // 「カスタム試験開始」ボタンのクリックイベント
    if (startQuizBtn) {
        startQuizBtn.addEventListener('click', () => {
            const selectedCategories = Array.from(categoryCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.value);

            if (selectedCategories.length === 0) {
                alert('挑戦するカテゴリを1つ以上選択してください。');
                return;
            }

            const categoryName = "カスタム模擬試験";
            const numQuestions = numQuestionsSelect.value;

            const quizInfo = {
                type: 'custom',
                categories: selectedCategories,
                categoryName: categoryName,
                numQuestions: numQuestions
            };

            localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
            window.location.href = 'quiz.html';
        });
    }

    // 「本番試験開始」ボタンのクリックイベント
    if (startRealExamBtn) {
        startRealExamBtn.addEventListener('click', () => {
            const selectedMethodRadio = document.querySelector('input[name="hunting-method"]:checked');
            
            if (!selectedMethodRadio) {
                alert('受験する猟具を1つ選択してください。');
                return;
            }

            const selectedMethod = selectedMethodRadio.value;
            const methodName = selectedMethodRadio.parentElement.textContent.trim();

            const quizInfo = {
                type: 'real',
                categories: ['common', selectedMethod],
                categoryName: `本番模擬試験（${methodName}）`,
                numQuestions: 30
            };

            localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
            window.location.href = 'quiz.html';
        });
    }
});
