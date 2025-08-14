document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const customExamBtn = document.getElementById('custom-exam-btn');
    const realExamBtn = document.getElementById('real-exam-btn'); // ★ 新しいボタンを取得
    const modal = document.getElementById('category-modal');
    const closeModalBtn = document.querySelector('.close-btn');
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');
    const numQuestionsSelect = document.getElementById('num-questions');
    
    // --- 猟具選択モーダル用の要素 ---
    const huntingMethodModal = document.getElementById('hunting-method-modal');
    const closeMethodModalBtn = document.getElementById('close-method-modal-btn');
    const startRealExamBtn = document.getElementById('start-real-exam-btn');


    // --- イベントリスナー ---

    // 「カスタム模擬試験」ボタンのクリックイベント
    if (customExamBtn) {
        customExamBtn.addEventListener('click', () => {
            modal.style.display = 'block';
        });
    }

    // ★★★ 「本番模擬試験」ボタンのクリックイベントを新設 ★★★
    if (realExamBtn) {
        realExamBtn.addEventListener('click', () => {
            huntingMethodModal.style.display = 'block';
        });
    }

    // カスタムモーダルの閉じるボタン
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // ★★★ 猟具選択モーダルの閉じるボタン ★★★
    if (closeMethodModalBtn) {
        closeMethodModalBtn.addEventListener('click', () => {
            huntingMethodModal.style.display = 'none';
        });
    }

    // カスタムモーダルの外側クリックで閉じる
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        // ★★★ 猟具選択モーダルの外側クリックで閉じる ★★★
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

    // ★★★ 「本番試験開始」ボタンのクリックイベントを新設 ★★★
    if (startRealExamBtn) {
        startRealExamBtn.addEventListener('click', () => {
            const selectedMethodRadio = document.querySelector('input[name="hunting-method"]:checked');
            
            if (!selectedMethodRadio) {
                alert('受験する猟具を1つ選択してください。');
                return;
            }

            const selectedMethod = selectedMethodRadio.value; // 例: "wana"
            const methodName = selectedMethodRadio.parentElement.textContent.trim(); // 例: "わな猟免許"

            // 本番試験用の情報を設定
            const quizInfo = {
                type: 'real',
                categories: ['common', selectedMethod], // 共通問題 + 選択した猟具
                categoryName: `本番模擬試験（${methodName}）`,
                numQuestions: 30 // 問題数は30問で固定
            };

            localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
            window.location.href = 'quiz.html';
        });
    }
});
