document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const categoryButtons = document.querySelectorAll('.category-btn:not(.training-btn)');
    const trainingButtons = document.querySelectorAll('.training-btn'); // 特訓ボタン
    const realExamBtn = document.getElementById('real-exam-btn');
    const customExamBtn = document.getElementById('custom-exam-btn');
    // (モーダル関連のDOM取得は変更なし)
    // ...

    // --- イベントリスナー ---

    // 個別カテゴリボタン
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const quizInfo = {
                type: 'single',
                categories: [button.dataset.category],
                categoryName: button.textContent.trim(),
                numQuestions: 'all'
            };
            localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
            window.location.href = 'quiz.html';
        });
    });

    // ★★★ 特訓コースボタン (汎用ロジック) ★★★
    trainingButtons.forEach(button => {
        button.addEventListener('click', () => {
            const quizInfo = {
                type: 'training',
                title: button.dataset.title,
                csvFile: button.dataset.csvFile,
                questionType: button.dataset.questionType,
                questionColumn: button.dataset.questionColumn,
                answerColumn: button.dataset.answerColumn,
                options: button.dataset.options.split(',')
            };
            localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
            window.location.href = 'quiz.html';
        });
    });

    // (本番・カスタム模擬試験のロジックは変更なし)
    // ...
});
