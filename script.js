document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const topPageContainer = document.getElementById('top-page-container');
    const quizContainer = document.getElementById('quiz');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const submitButton = document.getElementById('submit');
    const challengeButtons = document.querySelectorAll('.challenge-btn');

    // --- クイズデータ ---
    const quizData = {
        choujuu: [
            { question: "「ニホンジカ」は狩猟鳥獣である。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "「ニホンザル」は狩猟鳥獣である。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] },
            { question: "メスの「イタチ」は狩猟鳥獣である。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] },
            { question: "「ドバト」は狩猟鳥獣である。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }
        ],
        ami: [
            { question: "網猟免許で捕獲が許可されている鳥獣は？", answers: [{ text: "鳥類のみ", correct: true }, { text: "獣類のみ", correct: false }, { text: "鳥類と獣類の両方", correct: false }] },
            { question: "禁止されている網猟具は次のうちどれか？", answers: [{ text: "むそう網", correct: false }, { text: "はり網", correct: false }, { text: "かすみ網", correct: true }] },
            { question: "公道上で網を使用して鳥獣を捕獲することは、全面的に許可されている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }
        ],
        wana: [
            { question: "「くくりわな」を使用してクマ類（ヒグマ・ツキノワグマ）を捕獲することは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "使用が禁止されている「とらばさみ」は、内径の最大長が何cmを超えるものか？", answers: [{ text: "8cm", correct: false }, { text: "12cm", correct: true }, { text: "16cm", correct: false }] },
            { question: "法定猟具である「わな」を一人で31個以上使用して猟を行うことは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }
        ],
        jyu1: [
            { question: "第一種銃猟免許で扱える銃器は、装薬銃（散弾銃・ライフル銃）と空気銃である。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "住居が集合している地域では、流れ弾に注意すれば銃器による捕獲が認められている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] },
            { question: "銃の安全装置をかけておけば、脱包しなくても、銃を持ったまま跳びはねても暴発の危険はない。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }
        ],
        jyu2: [
            { question: "第二種銃猟免許で扱える銃器は、空気銃のみである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "狩猟鳥獣であるカモ類の捕獲数の制限は、1日あたり合計5羽までである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "獲物を手に入れるために発砲した場合、半矢で逃してしまっても「捕獲行為」をしたことになる。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }
        ],
        beginner: [
            { question: "銃砲所持許可は、都道府県公安委員会が発行する。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "銃砲刀剣類所持等取締法（銃刀法）は、原則として銃砲を所持することを許可している。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] },
            { question: "所持許可を受けた猟銃を他人に盗まれたときは、直ちにその旨を警察署に届け出なければならない。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }
        ]
    };

    let currentQuiz = [];
    let currentQuestionIndex = 0;

    // --- イベントリスナー ---
    challengeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonId = event.target.id;
            const quizCategoryKey = buttonId.replace('start-', '').replace('-btn', ''); 
            startQuiz(quizCategoryKey);
        });
    });

    submitButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.length) {
            showQuestion();
        } else {
            alert('クイズ終了です！お疲れ様でした。');
            quizContainer.style.display = 'none';
            topPageContainer.style.display = 'block';
        }
    });

    // --- 関数定義 ---
    function startQuiz(categoryKey) {
        currentQuiz = quizData[categoryKey] || [];
        if (currentQuiz.length === 0) {
            alert('このクイズは現在準備中です。');
            return;
        }
        currentQuestionIndex = 0;
        topPageContainer.style.display = 'none';
        quizContainer.style.display = 'block';
        showQuestion();
    }

    function showQuestion() {
        resetState();
        const question = currentQuiz[currentQuestionIndex];
        questionElement.innerText = question.question;
        
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('answer-btn');
            if (answer.correct) {
                button.dataset.correct = answer.correct;
            }
            button.addEventListener('click', selectAnswer);
            answerButtonsElement.appendChild(button);
        });
    }

    function resetState() {
        submitButton.style.display = 'none';
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
    }

    function selectAnswer(e) {
        const selectedButton = e.target;
        const correct = selectedButton.dataset.correct === "true";

        Array.from(answerButtonsElement.children).forEach(button => {
            setStatusClass(button, button.dataset.correct === "true");
            button.disabled = true; // 回答後は他のボタンを押せないようにする
        });

        submitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る";
        submitButton.style.display = 'block';
    }

    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }
});
