document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const resultTitleElement = document.getElementById('result-title');
    const resultSummaryElement = document.getElementById('result-summary');
    const retryBtn = document.getElementById('retry-btn');

    // --- localStorageから結果情報を取得 ---
    const resultInfoString = localStorage.getItem('resultInfo');
    if (!resultInfoString) {
        resultSummaryElement.innerHTML = '<p>試験結果を読み込めませんでした。トップページからもう一度お試しください。</p>';
        return;
    }

    const resultInfo = JSON.parse(resultInfoString);
    const { score, total, quizInfo } = resultInfo;

    // --- 合否判定ロジック ---
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const isPass = percentage >= 70; // 合格ラインは70%

    // --- 結果表示HTMLの生成 ---
    let passFailMessageHTML = '';
    if (quizInfo.type === 'real') { // 本番模擬試験の場合のみ合否を表示
        passFailMessageHTML = `
            <p class="pass-fail-message ${isPass ? 'pass' : 'fail'}">
                ${isPass ? '🎉 合格 🎉' : '不合格'}
            </p>
        `;
    }

    const resultHTML = `
        ${passFailMessageHTML}
        <div class="score-display">
            <p class="score-label">あなたの得点</p>
            <p class="score-value">${score} / ${total} 点</p>
            <p class="score-percentage">(正答率: ${percentage}%)</p>
        </div>
        <p class="quiz-type-info">挑戦した試験： ${quizInfo.categoryName}</p>
    `;

    // --- 画面への反映 ---
    resultSummaryElement.innerHTML = resultHTML;
    resultTitleElement.textContent = `${quizInfo.categoryName} の結果`;

    // --- 「もう一度挑戦する」ボタンの処理 ---
    if (retryBtn) {
        retryBtn.style.display = 'block'; // ボタンを表示
        retryBtn.addEventListener('click', () => {
            // 同じ設定でクイズを再開するために、quizInfoを再度localStorageに保存
            // (既に保存されているが、念のため)
            localStorage.setItem('quizInfo', JSON.stringify(quizInfo));
            window.location.href = 'quiz.html';
        });
    }
});
