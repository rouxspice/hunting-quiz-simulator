'use strict';

// --- 全てのクイズデータを一元管理するオブジェクト ---
const allQuizzes = {
    wana: [ // わな猟免許
        {
            question: "わな猟における法定猟具でないものはどれか？",
            options: ["くくりわな", "はこわな", "とらばさみ", "はこおとし"],
            correct: "とらばさみ",
            explanation: "とらばさみは、鳥獣に大きな苦痛を与える可能性があるため、現在は使用が禁止されている猟具です。"
        },
        {
            question: "くくりわなの輪の直径の規制について、正しいものはどれか？",
            options: ["制限はない", "12cm以下", "20cm以下", "30cm以下"],
            correct: "12cm以下",
            explanation: "錯誤捕獲（対象外の動物を捕獲すること）を防ぐため、くくりわなの輪の直径は原則として12cm以下と定められています（イノシシ・シカを除く）。"
        }
    ],
    ami: [], // 網猟免許（後で追加）
    dai1shu: [], // 第一種銃猟免許（後で追加）
    dai2shu: [], // 第二種銃猟免許（後で追加）
    koshukai: [] // 猟銃等講習会（後で追加）
};
console.log("【初期化】全クイズデータを読み込みました。");

// --- グローバル変数 ---
let currentQuizData = []; // 現在挑戦中のクイズデータ
let currentQuizIndex = 0;
let score = 0;

// --- DOM要素の取得 ---
const homeContainer = document.getElementById('home-container');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');

// UI改善で追加した要素
const quizHeader = document.getElementById('quiz-header');
const currentQuizTitle = document.getElementById('current-quiz-title');
const progressIndicator = document.getElementById('progress-indicator');
const backToHomeButton = document.getElementById('back-to-home-button');

const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const scoreElement = document.getElementById('score');
const restartButton = document.getElementById('restart-button');
console.log("【初期化】必要なDOM要素を取得しました。");



// --- 関数定義 ---

/**
 * 指定された画面を表示し、他を非表示にする関数
 * @param {string} screenName - 表示したい画面の名前 ('home', 'quiz', 'result')
 */
function showScreen(screenName) {
    // 全てのコンテナを一旦非表示に
    homeContainer.style.display = 'none';
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    // 指定されたコンテナのみ表示
    if (screenName === 'home') {
        homeContainer.style.display = 'block';
    } else if (screenName === 'quiz') {
        quizContainer.style.display = 'block';
    } else if (screenName === 'result') {
        resultContainer.style.display = 'block';
    }
    console.log(`[画面遷移] ${screenName}画面を表示しました。`);
}
/**
 * クイズを開始する関数
 * @param {string} quizType - 開始するクイズの種類 ('wana', 'ami'など)
 * @param {string} quizName - 開始するクイズの正式名称
 */
function startQuiz(quizType, quizName) {
    console.log(`[クイズ開始] ${quizName}(${quizType})が選択されました。`);
    currentQuizData = allQuizzes[quizType];

    if (!currentQuizData || currentQuizData.length === 0) {
        alert('申し訳ありません。このクイズは現在準備中です。');
        console.warn(`[クイズ開始失敗] ${quizType}のデータが見つかりません。`);
        return;
    }

    // 変数を初期化
    currentQuizIndex = 0;
    score = 0;

    // ★★★★★ 追加ロジック ★★★★★
    // クイズのタイトルを表示
    currentQuizTitle.textContent = quizName;

    // クイズ画面を表示して、最初の問題を描画
    showScreen('quiz');
    displayQuiz(currentQuizIndex);
}


/**
 * 指定された番号のクイズを表示する関数
 * @param {number} quizIndex - 表示したいクイズの番号
 */
function displayQuiz(quizIndex) {
    feedbackElement.style.display = 'none';
    nextButton.style.display = 'none';

    // ★★★★★ 追加ロジック ★★★★★
    // 進捗状況を更新
    progressIndicator.textContent = `${quizIndex + 1} / ${currentQuizData.length} 問`;

    const currentQuiz = currentQuizData[quizIndex];
    questionElement.textContent = `第${quizIndex + 1}問: ${currentQuiz.question}`;
    optionsContainer.innerHTML = '';

    currentQuiz.options.forEach(optionText => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option');
        button.addEventListener('click', checkAnswer);
        optionsContainer.appendChild(button);
    });
}


/**
 * 回答をチェックする関数 (以前のロジックを再利用)
 * @param {Event} event - クリックイベントオブジェクト
 */
function checkAnswer(event) {
    const selectedOption = event.target.textContent;
    const currentQuiz = currentQuizData[currentQuizIndex];

    optionsContainer.querySelectorAll('.option').forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.trim() === currentQuiz.correct.trim()) {
            btn.classList.add('correct');
        }
    });

    if (selectedOption.trim() === currentQuiz.correct.trim()) {
        score++;
        feedbackElement.textContent = `正解！ ${currentQuiz.explanation}`;
        feedbackElement.className = 'correct';
    } else {
        event.target.classList.add('incorrect');
        feedbackElement.textContent = `不正解。正解は「${currentQuiz.correct}」です。`;
        feedbackElement.className = 'incorrect';
    }

    feedbackElement.style.display = 'block';
    nextButton.style.display = 'block';
}

/**
 * 次の問題へ進む、または結果を表示する関数 (以前のロジックを再利用)
 */
function nextQuiz() {
    currentQuizIndex++;
    if (currentQuizIndex < currentQuizData.length) {
        displayQuiz(currentQuizIndex);
    } else {
        showResult();
    }
}

/**
 * 最終結果を表示する関数 (以前のロジックを再利用)
 */
function showResult() {
    scoreElement.textContent = `${currentQuizData.length}問中 ${score}問正解`;
    showScreen('result');
}

/**
 * ホーム画面に戻る関数 (リスタート処理を改修)
 */
function backToHome() {
    showScreen('home');
}


// --- イベントリスナーの設定 ---

// ホーム画面の各クイズ選択ボタンにリスナーを設定
document.querySelectorAll('.quiz-type-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const quizType = event.target.dataset.quizType;
        startQuiz(quizType);
    });
});

// 「次の問題へ」ボタン
nextButton.addEventListener('click', nextQuiz);

// 「もう一度挑戦する」ボタンは「ホームに戻る」機能に変更
restartButton.textContent = '他の試験に挑戦する'; // ボタンのテキストも変更
restartButton.addEventListener('click', backToHome);


// --- 初期実行 ---
// ページが読み込まれたら、ホーム画面を表示する
showScreen('home');
console.log("【初期化完了】アプリケーションの準備が整いました。ユーザーの操作を待っています。");
