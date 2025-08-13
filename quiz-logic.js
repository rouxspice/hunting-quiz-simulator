'use strict';

// --- クイズデータ（全てのデータを有効化） ---
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

// --- グローバル変数 ---
let currentQuizIndex = 0; // 現在のクイズが何問目かを示すインデックス
let score = 0; // 正解数

// --- DOM要素の取得 ---
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const resultContainer = document.getElementById('result-container');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');


// --- 関数定義 ---

/**
 * 指定された番号のクイズを表示する関数
 * @param {number} quizIndex - 表示したいクイズの番号（0から始まる）
 */
function displayQuiz(quizIndex) {
    // 以前のフィードバックを隠す
    feedbackElement.style.display = 'none';
    nextButton.style.display = 'none';

    // 表示するクイズデータを取得
    const currentQuiz = quizData[quizIndex];

    // 質問文を表示
    questionElement.textContent = `第${quizIndex + 1}問: ${currentQuiz.question}`;

    // 選択肢をクリア
    optionsContainer.innerHTML = '';

    // 新しい選択肢ボタンを生成
    currentQuiz.options.forEach(optionText => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option');
        button.addEventListener('click', checkAnswer); // クリック時の処理を紐付け
        optionsContainer.appendChild(button);
    });
}
/**
 * 回答をチェックする関数
 * @param {Event} event - クリックイベントオブジェクト
 */
function checkAnswer(event) {
    const selectedOption = event.target.textContent;
    const currentQuiz = quizData[currentQuizIndex];

    // 全てのボタンを無効化
    optionsContainer.querySelectorAll('.option').forEach(btn => {
        btn.disabled = true;
    });

    // 正解・不正解を判定し、フィードバックを表示
    if (selectedOption.trim() === currentQuiz.correct.trim()) {
        score++; // 正解ならスコアを1増やす
        feedbackElement.textContent = `正解！ ${currentQuiz.explanation}`;
        feedbackElement.className = 'correct';
    } else {
        feedbackElement.textContent = `不正解。正解は「${currentQuiz.correct}」です。`;
        feedbackElement.className = 'incorrect';
    }

    feedbackElement.style.display = 'block';
    nextButton.style.display = 'block'; // 「次の問題へ」ボタンを表示
}

/**
 * 次の問題へ進む、または結果を表示する関数
 */
function nextQuiz() {
    currentQuizIndex++; // 次の問題へインデックスを進める

    // まだ次の問題がある場合
    if (currentQuizIndex < quizData.length) {
        displayQuiz(currentQuizIndex); // 次の問題を表示
    } else {
        // 全ての問題が終わった場合
        showResult();
    }
}

/**
 * 最終結果を表示する関数
 */
function showResult() {
    // クイズ画面を隠し、結果画面を表示
    document.getElementById('quiz-container').style.display = 'none';
    resultContainer.style.display = 'block';
    
    // 最終スコアを表示
    scoreElement.textContent = `${quizData.length}問中 ${score}問正解`;
}

/**
 * クイズを最初からやり直す関数
 */
function restartQuiz() {
    // 各種変数を初期状態に戻す
    currentQuizIndex = 0;
    score = 0;

    // 結果画面を隠し、クイズ画面を表示
    resultContainer.style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';

    // 最初の問題を表示
    displayQuiz(currentQuizIndex);
}


// --- イベントリスナーの設定 ---
nextButton.addEventListener('click', nextQuiz);
restartButton.addEventListener('click', restartQuiz);


// --- 初期実行 ---
// ページが読み込まれたら、最初のクイズを表示する
displayQuiz(currentQuizIndex);

console.log("【再構築版 ステップ3】スクリプトの読み込みが完了しました。");
