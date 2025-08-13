'use strict';

// --- 効果音の読み込み ---
const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');

// --- DOM要素の取得 ---
// スクリプトの最初に、使用する全てのHTML要素をまとめて取得します。
const homeContainer = document.getElementById('home-container');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');

const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');

const nextButton = document.getElementById('next-button');
const restartButton = document.getElementById('restart-button');
const backToHomeButton = document.getElementById('back-to-home');

const quizInfoElement = document.getElementById('quiz-info');
const quizProgressElement = document.getElementById('quiz-progress');

// --- グローバル変数 ---
// ★★★★★ 修正ポイント① ★★★★★
// currentQuizDataの初期宣言をここに一本化し、letで再代入可能にする。
// これで「has already been declared」エラーを完全に解決します。
let currentQuizData = []; 
let currentQuizIndex = 0;
let score = 0;

// --- 関数定義 -------------------------------------------------------------

/**
 * 特定の画面を表示し、他を非表示にする関数
 * @param {string} screenName - 表示する画面の名前 ('home', 'quiz', 'result')
 */
function showScreen(screenName) {
    homeContainer.style.display = 'none';
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    if (screenName === 'home') {
        homeContainer.style.display = 'block';
    } else if (screenName === 'quiz') {
        quizContainer.style.display = 'block';
    } else if (screenName === 'result') {
        resultContainer.style.display = 'block';
    }
}

/**
 * クイズの進捗状況をヘッダーに表示する関数
 */
function updateQuizProgress() {
    if (currentQuizData.length > 0) {
        quizProgressElement.textContent = `残り ${currentQuizData.length - (currentQuizIndex + 1)} / ${currentQuizData.length} 問`;
    } else {
        quizProgressElement.textContent = '';
    }
}

/**
 * クイズを表示する関数
 * @param {number} quizIndex - 表示するクイズのインデックス
 */
function displayQuiz(quizIndex) {
    const currentQuiz = currentQuizData[quizIndex];
    questionElement.textContent = `第${quizIndex + 1}問: ${currentQuiz.question}`;
    optionsContainer.innerHTML = '';

    if (currentQuiz.image) {
        const imageElement = document.createElement('img');
        imageElement.src = currentQuiz.image;
        imageElement.alt = "鳥獣判別問題の画像";
        imageElement.classList.add('quiz-image');
        optionsContainer.appendChild(imageElement);
    }

    currentQuiz.options.forEach(optionText => {
        const button = document.createElement('button');
        button.textContent = optionText;
        button.classList.add('option');
        button.addEventListener('click', checkAnswer);
        optionsContainer.appendChild(button);
    });

    feedbackElement.style.display = 'none';
    nextButton.style.display = 'none';
    updateQuizProgress();
}

/**
 * 回答をチェックする関数
 * @param {Event} event - クリックイベントオブジェクト
 */
function checkAnswer(event) {
    const selectedOptionText = event.target.textContent;
    const currentQuiz = currentQuizData[currentQuizIndex];
    const isCorrect = selectedOptionText === currentQuiz.correct;

    const optionButtons = optionsContainer.querySelectorAll('.option');
    optionButtons.forEach(button => {
        button.disabled = true;
        if (button.textContent === currentQuiz.correct) {
            button.classList.add('correct');
        } else if (button.textContent === selectedOptionText) {
            button.classList.add('incorrect');
        }
    });

    feedbackElement.style.display = 'block';
    if (isCorrect) {
        score++;
        feedbackElement.textContent = `正解！ ${currentQuiz.explanation}`;
        feedbackElement.className = 'feedback correct';
        correctSound.play();
    } else {
        feedbackElement.textContent = `不正解。正解は「${currentQuiz.correct}」です。 ${currentQuiz.explanation}`;
        feedbackElement.className = 'feedback incorrect';
        incorrectSound.play();
    }

    nextButton.style.display = 'block';
}

/**
 * 次の問題へ進む、または結果を表示する関数
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
 * 最終結果を表示する関数
 */
function showResult() {
    scoreElement.textContent = `${currentQuizData.length}問中 ${score}問正解`;
    showScreen('result');
}

/**
 * クイズを最初からやり直す（同じ種類のクイズで）
 */
function restartQuiz() {
    currentQuizIndex = 0;
    score = 0;
    showScreen('quiz');
    displayQuiz(currentQuizIndex);
}

/**
 * ホーム画面に戻る関数
 */
function goHome() {
    showScreen('home');
}

/**
 * クイズを開始する関数
 * @param {string} quizType - 選択されたクイズの種類 (例: 'wana')
 */
async function startQuiz(quizType) {
    const filePath = `data/${quizType}.json`;

    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`ネットワーク応答が正常ではありませんでした。ステータス: ${response.status}`);
        }
        const data = await response.json();
        
        // ★★★★★ 修正ポイント② ★★★★★
        // 新しく宣言(let)するのではなく、グローバルに存在する変数に「再代入」する。
        currentQuizData = data;

    } catch (error) {
        console.error(`[データ取得エラー] ${filePath} の読み込みに失敗しました:`, error);
        alert(`「${quizType}」のクイズデータの読み込みに失敗しました。ファイルが存在するか、JSONの形式が正しいか確認してください。`);
        return;
    }

    if (!currentQuizData || currentQuizData.length === 0) {
        alert(`「${quizType}」のクイズは準備中です。`);
        return;
    }

    currentQuizIndex = 0;
    score = 0;

    const quizTypeText = document.querySelector(`[data-quiz-type="${quizType}"]`).textContent;
    quizInfoElement.textContent = `現在挑戦中の試験：${quizTypeText}`;
    
    showScreen('quiz');
    displayQuiz(currentQuizIndex);
}

// --- イベントリスナーの設定 ---
// ホーム画面の各ボタンに、startQuiz関数を紐付け
document.querySelectorAll('.quiz-select-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const quizType = event.target.dataset.quizType;
        startQuiz(quizType);
    });
});

// その他のボタンに、各関数を紐付け
nextButton.addEventListener('click', nextQuiz);
restartButton.addEventListener('click', restartQuiz);
backToHomeButton.addEventListener('click', goHome);

// --- 初期実行 ---
// 最初にホーム画面を表示
showScreen('home');
console.log("狩猟免許試験シミュレーターが正常に起動しました。");
