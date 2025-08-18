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

// クイズ選択ボタンのIDリスト
const quizTypes = [
    { id: "start-choujuu-btn", name: "狩猟鳥獣判別クイズ" },
    { id: "start-ami-btn", name: "網猟クイズ" },
    { id: "start-wana-btn", name: "わな猟クイズ" },
    { id: "start-jyu1-btn", name: "第一種銃猟クイズ" },
    { id: "start-jyu2-btn", name: "第二種銃猟クイズ" },
    { id: "start-beginner-btn", name: "初心者講習用クイズ" }
];

quizTypes.forEach(type => {
    const btn = document.getElementById(type.id);
    if (btn) {
        btn.addEventListener("click", () => {
            if (type.id === "start-choujuu-btn") {
                // 狩猟鳥獣判別クイズだけは専用関数で表示
                startChoujuuQuiz();
            } else {
                // 通常クイズの表示
                document.getElementById("top-page-container").style.display = "none";
                document.getElementById("quiz").style.display = "block";
                const questionHeader = document.getElementById("question");
                if (questionHeader) {
                    questionHeader.textContent = `${type.name} - 問題`;
                }
                currentQuiz = 0;
                score = 0;
                loadQuiz();
            }
        });
    }
});

// 初期状態でクイズ画面を非表示にする
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("quiz").style.display = "none";
});

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

// 狩猟鳥獣判別クイズ用データ
const choujuuQuizData = [
    {
        image: "images/kiji.jpg", // ←ここを修正
        isHuntable: true,
        options: ["キジ", "ヒヨドリ", "スズメ", "ドバト"],
        correct: "キジ"
    },
    {
        image: "images/suzume.jpg", // ←ここを修正
        isHuntable: false,
        options: [],
        correct: ""
    },
    // 必要に応じて追加
];

let choujuuCurrent = 0;
let choujuuScore = 0;

// 狩猟鳥獣判別クイズの表示・進行
function startChoujuuQuiz() {
    // スコアとカウンタをリセット
    choujuuCurrent = 0;
    choujuuScore = 0;

    // トップページと通常クイズ画面を非表示
    if (topPageContainer) topPageContainer.style.display = 'none';
    if (quizContainer) quizContainer.style.display = 'none';

    // 判別クイズ用エリア生成・表示
    let choujuuArea = document.getElementById('choujuu-area');
    if (!choujuuArea) {
        choujuuArea = document.createElement('div');
        choujuuArea.id = 'choujuu-area';
        choujuuArea.className = 'quiz-container';
        // bodyの最後に追加
        document.body.appendChild(choujuuArea);
    }
    choujuuArea.style.display = 'block';

    loadChoujuuQuiz();
}

function loadChoujuuQuiz() {
    const data = choujuuQuizData[choujuuCurrent];
    let html = `
        <div class="quiz-header">
            <h2>狩猟鳥獣判別クイズ - 問題${choujuuCurrent + 1}</h2>
        </div>
        <div class="choujuu-image-container">
            <img src="${data.image}" alt="鳥獣画像" style="max-width:300px;">
        </div>
        <p>この鳥獣は狩猟鳥獣ですか？</p>
        <button id="huntable-yes" class="option-btn">獲れる（狩猟鳥獣）</button>
        <button id="huntable-no" class="option-btn">獲れない（非狩猟鳥獣）</button>
        <div id="choujuu-options"></div>
        <div id="choujuu-feedback"></div>
    `;
    document.getElementById('choujuu-area').innerHTML = html;

    document.getElementById('huntable-yes').onclick = () => {
        if (data.isHuntable) {
            let optionsHtml = `<p>この鳥獣の名前を選んでください：</p>`;
            data.options.forEach(opt => {
                optionsHtml += `<button class="option-btn choujuu-name-btn">${opt}</button>`;
            });
            document.getElementById('choujuu-options').innerHTML = optionsHtml;
            document.querySelectorAll('.choujuu-name-btn').forEach(btn => {
                btn.onclick = () => {
                    if (btn.textContent === data.correct) {
                        choujuuScore++;
                        document.getElementById('choujuu-feedback').innerHTML = `<span style="color:green;">正解！</span>`;
                    } else {
                        document.getElementById('choujuu-feedback').innerHTML = `<span style="color:red;">不正解。正解は「${data.correct}」です。</span>`;
                    }
                    setTimeout(nextChoujuuQuiz, 1200);
                };
            });
        } else {
            document.getElementById('choujuu-feedback').innerHTML = `<span style="color:red;">不正解。この鳥獣は獲れません。</span>`;
            setTimeout(nextChoujuuQuiz, 1200);
        }
    };
    document.getElementById('huntable-no').onclick = () => {
        if (!data.isHuntable) {
            choujuuScore++;
            document.getElementById('choujuu-feedback').innerHTML = `<span style="color:green;">正解！この鳥獣は獲れません。</span>`;
        } else {
            document.getElementById('choujuu-feedback').innerHTML = `<span style="color:red;">不正解。獲れる鳥獣です。</span>`;
        }
        setTimeout(nextChoujuuQuiz, 1200);
    };
}

function nextChoujuuQuiz() {
    choujuuCurrent++;
    if (choujuuCurrent < choujuuQuizData.length) {
        loadChoujuuQuiz();
    } else {
        document.getElementById('choujuu-area').innerHTML = `
            <h2>終了！正解数：${choujuuScore}/${choujuuQuizData.length}</h2>
            <button onclick="location.reload()">トップに戻る</button>
        `;
    }
}

// ...existing code...
