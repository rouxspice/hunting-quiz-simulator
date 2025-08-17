const quizData = [
    {
        question: "日本の狩猟鳥獣ではないものは次のうちどれ？",
        a: "キジ",
        b: "ヒヨドリ",
        c: "ドバト",
        d: "スズメ",
        correct: "c",
    },
    {
        question: "銃の保管に関する説明で正しいものは？",
        a: "弾と一緒に保管する",
        b: "鍵のかかるロッカーに銃と弾を別々に保管する",
        c: "家族も使えるように鍵の場所を共有する",
        d: "車の中に保管する",
        correct: "b",
    },
    {
        question: "わな猟で禁止されている猟具は？",
        a: "はこわな",
        b: "くくりわな",
        c: "とらばさみ",
        d: "囲いわな",
        correct: "c",
    },
    {
        question: "狩猟期間として一般的に定められている期間は？",
        a: "一年中",
        b: "11月15日から翌年2月15日",
        c: "春から夏にかけて",
        d: "冬の間だけ",
        correct: "b",
    },
];

// HTML要素を取得
const topPageContainer = document.getElementById('top-page-container');
const quizContainer = document.getElementById('quiz');
const startQuizBtn = document.getElementById('start-quiz-btn');

const answerEls = document.querySelectorAll('.answer');
const questionEl = document.getElementById('question');
const a_text = document.getElementById('a_text');
const b_text = document.getElementById('b_text');
const c_text = document.getElementById('c_text');
const d_text = document.getElementById('d_text');
const submitBtn = document.getElementById('submit');

let currentQuiz = 0;
let score = 0;

// --- 関数定義 ---

function loadQuiz() {
    deselectAnswers();
    const currentQuizData = quizData[currentQuiz];
    questionEl.innerText = currentQuizData.question;
    a_text.innerText = currentQuizData.a;
    b_text.innerText = currentQuizData.b;
    c_text.innerText = currentQuizData.c;
    d_text.innerText = currentQuizData.d;
}

function deselectAnswers() {
    answerEls.forEach(answerEl => answerEl.checked = false);
}

function getSelected() {
    let answer;
    answerEls.forEach(answerEl => {
        if (answerEl.checked) {
            answer = answerEl.id;
        }
    });
    return answer;
}

// --- イベントリスナーの設定 ---

// 「挑戦する」ボタンがクリックされた時の処理
startQuizBtn.addEventListener('click', () => {
    // トップページを隠し、クイズコンテナを表示する
    topPageContainer.style.display = 'none';
    quizContainer.style.display = 'block';
    
    // クイズの初期化と最初の問題の読み込み
    currentQuiz = 0;
    score = 0;
    loadQuiz();
});

// 「Submit」ボタンがクリックされた時の処理
submitBtn.addEventListener('click', () => {
    const answer = getSelected();
    if (answer) {
        if (answer === quizData[currentQuiz].correct) {
            score++;
        }
        currentQuiz++;
        if (currentQuiz < quizData.length) {
            loadQuiz();
        } else {
            quizContainer.innerHTML = `
                <h2>You answered ${score}/${quizData.length} questions correctly</h2>
                <button onclick="location.reload()">Reload</button>
            `;
        }
    }
});
