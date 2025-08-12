'use strict';

// --- クイズデータ ---------------------------------------------------------
const quizData = [
    {
        question: "銃猟における水平射撃の危険性について、最も適切なものはどれか？",
        options: ["矢先の安全が確認できれば問題ない", "人家、人、家畜等の方向に撃つことは絶対に避けるべきである", "30度以下の角度であれば安全である", "弾丸の到達距離を把握していれば問題ない"],
        correct: "人家、人、家畜等の方向に撃つことは絶対に避けるべきである",
        explanation: "水平射撃は弾丸が予期せぬ長距離まで達する可能性があり、極めて危険です。特に、矢先に人家、人、家畜などが存在する可能性がある場所では、絶対に避けるべきです。"
    },
    {
        question: "鳥獣保護管理法において、捕獲が原則として禁止されている鳥獣はどれか？",
        options: ["ニホンジカ", "イノシシ", "ツキノワグマ（メス）", "カワウ"],
        correct: "ツキノワグマ（メス）",
        explanation: "種の保存のため、多くの地域でメスのツキノワグマの捕獲は禁止または厳しく制限されています。ただし、地域や年度によって規定が異なる場合があるため、常に最新の情報を確認する必要があります。"
    },
    {
        question: "散弾銃の保管に関する記述として、正しいものはどれか？",
        options: ["弾を込めたまま保管できる", "家族がすぐに使えるように、分かりやすい場所に置く", "ガンロッカー等、施錠できる設備に保管する", "分解して、各部品を別々の部屋に保管する"],
        correct: "ガンロッカー等、施錠できる設備に保管する",
        explanation: "銃砲刀剣類所持等取締法（銃刀法）により、銃は盗難や不正使用を防ぐため、施錠できる堅牢なガンロッカーなどに保管することが義務付けられています。"
    }
];
console.log(`[初期化] クイズデータ読み込み完了。全${quizData.length}問。`);

// --- グローバル変数 -------------------------------------------------------
let currentQuizIndex = 0;
let score = 0;
console.log("[初期化] グローバル変数を設定しました。");

// --- DOM要素の取得 --------------------------------------------------------
const quizContainer = document.getElementById('quiz-container');
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');
console.log("[初期化] 必要なDOM要素を取得しました。");

// --- 関数定義 -------------------------------------------------------------

/**
 * クイズを表示する関数
 * @param {number} quizIndex - 表示するクイズのインデックス
 */
function displayQuiz(quizIndex) {
    console.log(`[表示処理] ${quizIndex + 1}問目のクイズ表示を開始します。`);
    const currentQuiz = quizData[quizIndex];

    if (!currentQuiz) {
        console.error(`[エラー] 指定されたインデックス ${quizIndex} にクイズデータが存在しません。処理を中断します。`);
        return;
    }

    questionElement.textContent = `第${quizIndex + 1}問: ${currentQuiz.question}`;
    optionsContainer.innerHTML = '';

    currentQuiz.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.classList.add('option');
        button.addEventListener('click', checkAnswer);
        optionsContainer.appendChild(button);
    });

    feedbackElement.textContent = '';
    feedbackElement.className = '';
    nextButton.style.display = 'none';
    console.log(`[表示処理] ${quizIndex + 1}問目の表示が完了しました。`);
}
/**
 * 回答をチェックする関数
 * @param {Event} event - クリックイベントオブジェクト
 */
function checkAnswer(event) {
    const selectedOptionText = event.target.textContent;
    const currentQuiz = quizData[currentQuizIndex];
    
    console.log(`[回答処理] ユーザーが「${selectedOptionText}」を選択しました。`);

    // ★★★★★ 最終修正点 ★★★★★
    // 比較する前に、両方の文字列から前後の空白を完全に取り除く .trim() を追加。
    // これにより、目に見えない空白による比較ミスを完全に防ぎます。
    const isCorrect = selectedOptionText.trim() === currentQuiz.correct.trim();

    // すべての選択肢ボタンを無効化
    const optionButtons = optionsContainer.querySelectorAll('.option');
    optionButtons.forEach(button => {
        button.disabled = true;
        // こちらの比較にも .trim() を追加し、堅牢性を高めます。
        if (button.textContent.trim() === currentQuiz.correct.trim()) {
            button.classList.add('correct');
        }
        if (!isCorrect && button.textContent.trim() === selectedOptionText.trim()) {
            button.classList.add('incorrect');
        }
    });

    if (isCorrect) {
        score++;
        feedbackElement.textContent = `正解！ ${currentQuiz.explanation}`;
        feedbackElement.className = 'correct';
        console.log(`[回答処理] 正解です。現在のスコア: ${score}`);
    } else {
        feedbackElement.textContent = `不正解。正解は「${currentQuiz.correct}」です。 ${currentQuiz.explanation}`;
        feedbackElement.className = 'incorrect';
        console.log(`[回答処理] 不正解です。現在のスコア: ${score}`);
    }

    nextButton.style.display = 'block';
}

/**
 * 次の問題へ進む、または結果を表示する関数
 */
function nextQuiz() {
    currentQuizIndex++;
    console.log(`[進行処理] 「次の問題へ」がクリックされました。次のインデックス: ${currentQuizIndex}`);
    if (currentQuizIndex < quizData.length) {
        displayQuiz(currentQuizIndex);
    } else {
        console.log("[進行処理] 全ての問題が終了しました。結果を表示します。");
        showResult();
    }
}

/**
 * 最終結果を表示する関数
 */
function showResult() {
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'block';
    scoreElement.textContent = `${quizData.length}問中 ${score}問正解`;
    console.log(`[結果表示] 最終スコア: ${score}/${quizData.length}`);
}

/**
 * クイズを最初からやり直す関数
 */
function restartQuiz() {
    console.log("[リスタート処理] クイズをリスタートします。");
    currentQuizIndex = 0;
    score = 0;
    resultContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    displayQuiz(currentQuizIndex);
    console.log("[リスタート処理] 初期化が完了し、最初の問題を表示しました。");
}

// --- イベントリスナーの設定 -------------------------------------------------
nextButton.addEventListener('click', nextQuiz);
restartButton.addEventListener('click', restartQuiz);
console.log("[初期化] イベントリスナーを設定しました。");

// --- 初期実行 -------------------------------------------------------------
displayQuiz(currentQuizIndex);
