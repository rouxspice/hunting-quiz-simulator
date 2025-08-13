'use strict';

// --- 効果音の読み込み ---
const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');

// --- DOM要素の取得 ---
const homeContainer = document.getElementById('home-container');
const quizContainer = document.getElementById('quiz-container');
const resultContainer = document.getElementById('result-container');

const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');
const scoreElement = document.getElementById('score');

// ★★★ あなたのHTML構造に完全に合わせた要素取得 ★★★
const currentQuizTitleElement = document.getElementById('current-quiz-title');
const progressIndicatorElement = document.getElementById('progress-indicator');

// --- グローバル変数 ---
let currentQuizData = [];
let currentQuizIndex = 0;
let score = 0;

// --- 関数定義 -------------------------------------------------------------

function showScreen(screenName) {
    homeContainer.style.display = 'none';
    quizContainer.style.display = 'none';
    resultContainer.style.display = 'none';

    if (screenName === 'home') homeContainer.style.display = 'block';
    else if (screenName === 'quiz') quizContainer.style.display = 'block';
    else if (screenName === 'result') resultContainer.style.display = 'block';
}

function updateQuizProgress() {
    if (currentQuizData.length > 0) {
        progressIndicatorElement.textContent = `残り ${currentQuizData.length - (currentQuizIndex + 1)} / ${currentQuizData.length} 問`;
    } else {
        progressIndicatorElement.textContent = '';
    }
}

function displayQuiz(quizIndex) {
    const currentQuiz = currentQuizData[quizIndex];
    questionElement.textContent = `第${quizIndex + 1}問: ${currentQuiz.question}`;
    optionsContainer.innerHTML = '';

    if (currentQuiz.image) {
        const imageContainer = document.getElementById('question-image-container');
        const imageElement = document.getElementById('question-image');
        imageElement.src = currentQuiz.image;
        imageContainer.style.display = 'block';
    } else {
        document.getElementById('question-image-container').style.display = 'none';
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

function checkAnswer(event) {
    const selectedOptionText = event.target.textContent;
    const currentQuiz = currentQuizData[currentQuizIndex];
    const isCorrect = selectedOptionText === currentQuiz.correct;

    document.querySelectorAll('.option').forEach(button => {
        button.disabled = true;
        if (button.textContent === currentQuiz.correct) button.classList.add('correct');
        else if (button.textContent === selectedOptionText) button.classList.add('incorrect');
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

function nextQuiz() {
    currentQuizIndex++;
    if (currentQuizIndex < currentQuizData.length) {
        displayQuiz(currentQuizIndex);
    } else {
        showResult();
    }
}

function showResult() {
    scoreElement.textContent = `${currentQuizData.length}問中 ${score}問正解`;
    showScreen('result');
}

function goHome() {
    showScreen('home');
}

async function startQuiz(quizType, quizName) {
    const filePath = `data/${quizType}.json`;
    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`Network response was not ok. Status: ${response.status}`);
        currentQuizData = await response.json();
    } catch (error) {
        console.error(`[Data Fetch Error] Failed to load ${filePath}:`, error);
        alert(`「${quizName}」のクイズデータの読み込みに失敗しました。`);
        return;
    }

    if (!currentQuizData || currentQuizData.length === 0) {
        alert(`「${quizName}」のクイズは準備中です。`);
        return;
    }

    currentQuizIndex = 0;
    score = 0;
    currentQuizTitleElement.textContent = `現在挑戦中の試験：${quizName}`;
    showScreen('quiz');
    displayQuiz(currentQuizIndex);
}

// --- イベントリスナーの設定 ---
document.querySelectorAll('.quiz-type-button').forEach(button => {
    button.addEventListener('click', (event) => {
        const quizType = event.target.dataset.quizType;
        const quizName = event.target.dataset.quizName;
        startQuiz(quizType, quizName);
    });
});

nextButton.addEventListener('click', nextQuiz);

// ★★★ あなたのHTML構造に完全に合わせたイベントリスナー ★★★
document.getElementById('quiz-container').addEventListener('click', (event) => {
    if (event.target.id === 'back-to-home-from-quiz') {
        goHome();
    }
});

document.getElementById('result-container').addEventListener('click', (event) => {
    if (event.target.id === 'restart-button') {
        goHome(); // 結果画面のボタンはホームに戻る機能
    }
});

// --- 初期実行 ---
showScreen('home');
console.log("狩猟免許試験シミュレーターが正常に起動しました。");
