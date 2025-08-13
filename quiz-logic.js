'use strict';
// --- 効果音の読み込み ---
const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');

// --- 全てのクイズデータを一元管理するオブジェクト ---
const allQuizzes = {
    // わな猟免許データに、画像クイズを追加
    wana: [
        {
            question: "この画像に写っている鳥獣の名前として、最も適切なものはどれか？",
            // ★★★★★ 画像パスを指定 ★★★★★
            image: "images/tanuki.jpg", 
            options: ["タヌキ", "アライグマ", "ハクビシン", "アナグマ"],
            correct: "タヌキ",
            explanation: "正解はタヌキです。タヌキは目の周りの黒い模様がメガネのように見え、足が黒いのが特徴です。アライグマは尾に縞模様があり、ハクビシンは額から鼻にかけて白い線があります。"
        },
        {
            question: "銃猟における水平射撃の危険性について、最も適切なものはどれか？",
            options: ["矢先の安全が確認できれば問題ない", "人家、人、家畜等の方向に撃つことは絶対に避けるべきである", "30度以下の角度であれば安全である", "弾丸の到達距離を把握していれば問題ない"],
            correct: "人家、人、家畜等の方向に撃つことは絶対に避けるべきである",
            explanation: "水平射撃は弾丸が予期せぬ長距離まで達する可能性があり、極めて危険です。特に、矢先に人家、人、家畜などが存在する可能性がある場所では、絶対に避けるべきです。"
        },
        {
            question: "鳥獣保護管理法において、捕獲が原則として禁止されている鳥獣はどれか？",
            options: ["ニホンジカ", "イノシシ", "ツキノワグマ（メス）", "カワウ"],
            correct: "ツキノワ-グマ（メス）",
            explanation: "種の保存のため、多くの地域でメスのツキノワグマの捕獲は禁止または厳しく制限されています。ただし、地域や年度によって規定が異なる場合があるため、常に最新の情報を確認する必要があります。"
        }
    ],
    // 他免許のデータは、今は空のまま
    ami: [],
    dai1shu: [],
    dai2shu: [],
    koshukai: []
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

// ★★★★★ 画像クイズ用の要素を追加 ★★★★★
const questionImageContainer = document.getElementById('question-image-container');
const questionImage = document.getElementById('question-image');

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
    // まずは不要な要素を隠す
    feedbackElement.style.display = 'none';
    nextButton.style.display = 'none';
    questionImageContainer.style.display = 'none'; // ★★★★★ 画像コンテナも隠す ★★★★★

    // 進捗状況を更新
    progressIndicator.textContent = `${quizIndex + 1} / ${currentQuizData.length} 問`;

    const currentQuiz = currentQuizData[quizIndex];
    questionElement.textContent = `第${quizIndex + 1}問: ${currentQuiz.question}`;

    // ★★★★★ 画像がある問題の場合の処理 ★★★★★
    if (currentQuiz.image) {
        questionImage.src = currentQuiz.image; // 画像パスを設定
        questionImageContainer.style.display = 'block'; // 画像コンテナを表示
        console.log(`[画像表示] ${currentQuiz.image} を表示しました。`);
    }

    // 選択肢ボタンを生成
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

       // 正解・不正解を判定し、フィードバックを表示
    if (selectedOption.trim() === currentQuiz.correct.trim()) {
        score++;
        feedbackElement.textContent = `正解！ ${currentQuiz.explanation}`;
        feedbackElement.className = 'correct';
        correctSound.play(); // ★★★★★ 正解音を再生 ★★★★★
    } else {
        event.target.classList.add('incorrect');
        feedbackElement.textContent = `不正解。正解は「${currentQuiz.correct}」です。`;
        feedbackElement.className = 'incorrect';
        incorrectSound.play(); // ★★★★★ 不正解音を再生 ★★★★★
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
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// 全ての関数定義が終わった、このファイルの一番最後に移動させることで、
// 「関数が未定義」というエラーを完全に防ぎます。
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

// ホーム画面の各クイズ選択ボタンにリスナーを設定
document.querySelectorAll('.quiz-type-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const buttonElement = event.currentTarget;
        const quizType = buttonElement.dataset.quizType;
        const quizName = buttonElement.dataset.quizName;
        startQuiz(quizType, quizName);
    });
});

// 「次の問題へ」ボタン
nextButton.addEventListener('click', nextQuiz);

// 「他の試験に挑戦する」ボタン（結果画面）
restartButton.addEventListener('click', backToHome);

// 「ホームに戻る」ボタン（クイズ画面）
backToHomeButton.addEventListener('click', () => {
    if (confirm('クイズを中断してホーム画面に戻りますか？\n（現在の成績は保存されません）')) {
        backToHome();
    }
});


// --- 初期実行 ---
// ページが読み込まれたら、ホーム画面を表示する
showScreen('home');
console.log("【初期化完了】アプリケーションの準備が整いました。ユーザーの操作を待っています。");
