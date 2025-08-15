document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const resultTitleElement = document.getElementById('result-title');
    const resultSummaryElement = document.getElementById('result-summary');
    const reviewSection = document.getElementById('review-section');
    const mistakesList = document.getElementById('mistakes-list');
    const retryMistakesBtn = document.getElementById('retry-mistakes-btn');

    // --- localStorageから結果情報を取得 ---
    const resultInfoString = localStorage.getItem('resultInfo');
    if (!resultInfoString) {
        resultSummaryElement.innerHTML = '<p>試験結果を読み込めませんでした。トップページからもう一度お試しください。</p>';
        return;
    }

    const resultInfo = JSON.parse(resultInfoString);
    const { score, total, quizInfo, mistakes } = resultInfo;

    // --- 合否判定とサマリー表示 ---
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const isPass = percentage >= 70;

    let passFailMessageHTML = '';
    if (quizInfo.type === 'real') {
        passFailMessageHTML = `<p class="pass-fail-message ${isPass ? 'pass' : 'fail'}">${isPass ? '🎉 合格 🎉' : '不合格'}</p>`;
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
    resultSummaryElement.innerHTML = resultHTML;
    resultTitleElement.textContent = `${quizInfo.categoryName} の結果`;

    // --- ★★★ 間違えた問題の表示処理 ★★★ ---
    if (mistakes && mistakes.length > 0) {
        reviewSection.style.display = 'block';
        mistakes.forEach((q, index) => {
            const mistakeCard = document.createElement('div');
            mistakeCard.classList.add('mistake-card');
            
            let questionContent = '';
            if (q.image_file) { // 鳥獣判別問題
                questionContent = `
                    <img src="/images/${q.image_file}" class="mistake-image" alt="${q.correct_name}">
                    <p><strong>問題:</strong> この鳥獣の名前は？</p>
                    <p><strong>正解:</strong> ${q.correct_name}</p>
                `;
            } else { // 通常問題
                const correctOption = q[`option_${q.correct_answer}`];
                questionContent = `
                    <p><strong>問題:</strong> ${q.question_text}</p>
                    <p><strong>正解:</strong> ${correctOption}</p>
                `;
            }

            mistakeCard.innerHTML = `
                <h4>復習ポイント ${index + 1}</h4>
                ${questionContent}
                <p class="explanation"><strong>解説:</strong> ${q.explanation}</p>
            `;
            mistakesList.appendChild(mistakeCard);
        });

        // --- ★★★ 「間違えた問題だけを再挑戦」ボタンの処理 ★★★ ---
        retryMistakesBtn.addEventListener('click', () => {
            const retryQuizInfo = {
                type: 'retry', // 再挑戦モード
                questions: mistakes, // 間違えた問題のリストを渡す
                categoryName: '間違えた問題の復習',
                numQuestions: mistakes.length
            };
            localStorage.setItem('quizInfo', JSON.stringify(retryQuizInfo));
            window.location.href = 'quiz.html';
        });

    }
});
