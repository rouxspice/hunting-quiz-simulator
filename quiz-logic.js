'use strict';

// --- クイズデータ（まずは1問に絞る） ---
const quizData = [
    {
        question: "銃猟における水平射撃の危険性について、最も適切なものはどれか？",
        options: ["矢先の安全が確認できれば問題ない", "人家、人、家畜等の方向に撃つことは絶対に避けるべきである", "30度以下の角度であれば安全である", "弾丸の到達距離を把握していれば問題ない"],
        correct: "人家、人、家畜等の方向に撃つことは絶対に避けるべきである",
        explanation: "水平射撃は弾丸が予期せぬ長距離まで達する可能性があり、極めて危険です。特に、矢先に人家、人、家畜などが存在する可能性がある場所では、絶対に避けるべきです。"
    }
];

// --- DOM要素の取得 ---
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');

// --- メインの処理 ---

const firstQuiz = quizData[0];
questionElement.textContent = `第1問: ${firstQuiz.question}`;

firstQuiz.options.forEach(optionText => {
    const button = document.createElement('button');
    button.textContent = optionText;
    button.classList.add('option');
    
    // ボタンがクリックされた時の処理を「正誤判定」に進化させる
    button.addEventListener('click', (event) => {
        // クリックされたボタンのテキストを取得
        const selectedOption = event.target.textContent;

        // 全てのボタンを無効化して、連続クリックを防ぐ
        optionsContainer.querySelectorAll('.option').forEach(btn => {
            btn.disabled = true;
        });

        // 正解かどうかを判定
        if (selectedOption.trim() === firstQuiz.correct.trim()) {
            feedbackElement.textContent = `正解！ ${firstQuiz.explanation}`;
            feedbackElement.className = 'correct';
        } else {
            feedbackElement.textContent = `不正解。正解は「${firstQuiz.correct}」です。`;
            feedbackElement.className = 'incorrect';
        }

        // フィードバックと「次の問題へ」ボタンを表示
        feedbackElement.style.display = 'block';
        // nextButton.style.display = 'block'; // 次の機能で実装します
    });
    
    optionsContainer.appendChild(button);
});

// 最初は不要な要素を隠しておく
feedbackElement.style.display = 'none';
nextButton.style.display = 'none';

console.log("【再構築版 ステップ2】スクリプトの読み込みが完了しました。");
