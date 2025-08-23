window.onload = () => {

    // --- DOM要素の取得 (★★★ リザルト画面用の要素を追加) ---
    const loaderWrapper = document.getElementById('loader-wrapper');
    const topPageContainer = document.getElementById('top-page-container');
    const quizContainer = document.getElementById('quiz');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const submitButton = document.getElementById('submit');
    const quizContainerChoujuu = document.getElementById('quiz-choujuu');
    const choujuuImage = document.getElementById('choujuu-image');
    const choujuuStep1 = document.getElementById('choujuu-step1');
    const choujuuStep2 = document.getElementById('choujuu-step2');
    const choujuuNameOptions = document.getElementById('choujuu-name-options');
    const choujuuFeedback = document.getElementById('choujuu-feedback');
    const choujuuSubmitButton = document.getElementById('choujuu-submit');
    const quizOptionsContainer = document.querySelector('.quiz-options'); 
    const quizContainers = document.querySelectorAll('.quiz-container, .quiz-container-choujuu');
    // ★★★ ここから追加 ★★★
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const resultScore = document.getElementById('result-score');
    const wrongQuestionsList = document.getElementById('wrong-questions-list');
    const noWrongQuestionsMessage = document.getElementById('no-wrong-questions-message');
    const retryQuizBtn = document.getElementById('retry-quiz-btn');
    const backToTopFromResultBtn = document.getElementById('back-to-top-from-result-btn');
    // ★★★ ここまで追加 ★★★

    // --- 音声ファイルの読み込み (変更なし) ---
    const correctSound = new Audio('sounds/correct.mp3');
    const wrongSound = new Audio('sounds/incorrect.mp3');
    correctSound.volume = 0.5;
    wrongSound.volume = 0.5;

    // --- クイズデータ (変更なし) ---
    const quizData = {
        choujuu: [ { image: "/images/nihonjika-osu.jpg", isHuntable: true, name: "ニホンジカ", distractors: ["カモシカ", "ツキノワグマ", "イノシシ"] }, { image: "/images/kamoshika.jpg", isHuntable: false, name: "カモシカ" }, { image: "/images/kiji.jpg", isHuntable: true, name: "キジ", distractors: ["ヤマドリ", "ライチョウ", "ウズラ"] }, ],
        ami: [ { question: "網猟免許で捕獲が許可されている鳥獣は？", answers: [{ text: "鳥類のみ", correct: true }, { text: "獣類のみ", correct: false }, { text: "鳥類と獣類の両方", correct: false }] }, { question: "禁止されている網猟具は次のうちどれか？", answers: [{ text: "むそう網", correct: false }, { text: "はり網", correct: false }, { text: "かすみ網", correct: true }] }, { question: "公道上で網を使用して鳥獣を捕獲することは、全面的に許可されている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] } ],
        wana: [ { question: "「くくりわな」を使用してクマ類（ヒグマ・ツキノワグマ）を捕獲することは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "使用が禁止されている「とらばさみ」は、内径の最大長が何cmを超えるものか？", answers: [{ text: "8cm", correct: false }, { text: "12cm", correct: true }, { text: "16cm", correct: false }] }, { question: "法定猟具である「わな」を一人で31個以上使用して猟を行うことは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ],
        jyu1: [ { question: "第一種銃猟免許で扱える銃器は、装薬銃（散弾銃・ライフル銃）と空気銃である。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "住居が集合している地域では、流れ弾に注意すれば銃器による捕獲が認められている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }, { question: "銃の安全装置をかけておけば、脱包しなくても、銃を持ったまま跳びはねても暴発の危険はない。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] } ],
        jyu2: [ { question: "第二種銃猟免許で扱える銃器は、空気銃のみである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "狩猟鳥獣であるカモ類の捕獲数の制限は、1日あたり合計5羽までである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "獲物を手に入れるために発砲した場合、半矢で逃してしまっても「捕獲行為」をしたことになる。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ],
        beginner: [ { question: "銃砲所持許可は、都道府県公安委員会が発行する。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "銃砲刀剣類所持等取締法（銃刀法）は、原則として銃砲を所持することを許可している。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }, { question: "所持許可を受けた猟銃を他人に盗まれたときは、直ちにその旨を警察署に届け出なければならない。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ]
    };

    // --- 状態管理変数 (★★★ 結果記録用の変数を追加) ---
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let currentQuizCategoryKey = ''; // ★★★ 現在のクイズカテゴリを保持
    let score = 0; // ★★★ 正解数を記録
    let wrongQuestions = []; // ★★★ 間違えた問題を記録

    // --- 画像プリロード関数 (変更なし) ---
    function preloadImages(urls) {
        const promises = urls.map(url => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = () => reject(new Error(`Failed to load image's URL: ${url}`));
                img.src = url;
            });
        });
        return Promise.all(promises);
    }

    // --- 汎用関数 (★★★ 画面遷移ロジックを更新) ---
    function goToTopPage() {
        quizContainer.style.display = 'none';
        quizContainerChoujuu.style.display = 'none';
        resultContainer.style.display = 'none'; // ★★★
        topPageContainer.style.display = 'block';
    }

    // ★★★ クイズ開始時に状態をリセットする関数を追加 ★★★
    function resetQuizState(categoryKey) {
        currentQuizCategoryKey = categoryKey;
        currentQuiz = quizData[categoryKey] || [];
        currentQuestionIndex = 0;
        score = 0;
        wrongQuestions = [];
    }

    // --- イベントリスナーの初期化 (★★★ リザルト画面のボタンを追加) ---
    if (quizOptionsContainer) {
        quizOptionsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.challenge-btn');
            if (!button) return;
            const buttonId = button.id;
            const quizCategoryKey = buttonId.replace('start-', '').replace('-btn', '');
            if (quizCategoryKey === 'choujuu') { 
                startChoujuuQuiz();
            } else { 
                startNormalQuiz(quizCategoryKey); 
            }
        });
    }
    quizContainers.forEach(container => {
        container.addEventListener('click', (event) => {
            const button = event.target.closest('.back-to-top-btn');
            if (!button) return;
            goToTopPage();
        });
    });
    // ★★★ ここから追加 ★★★
    retryQuizBtn.addEventListener('click', () => {
        if (currentQuizCategoryKey === 'choujuu') {
            startChoujuuQuiz();
        } else {
            startNormalQuiz(currentQuizCategoryKey);
        }
    });
    backToTopFromResultBtn.addEventListener('click', goToTopPage);
    // ★★★ ここまで追加 ★★★

    // --- 鳥獣判別クイズ ロジック (★★★ 結果表示ロジックを追加) ---
    async function startChoujuuQuiz() {
        resetQuizState('choujuu'); // ★★★
        loaderWrapper.classList.remove('loaded');
        try {
            const imageUrls = quizData.choujuu.map(q => q.image);
            await preloadImages(imageUrls);
            topPageContainer.style.display = 'none';
            resultContainer.style.display = 'none'; // ★★★
            quizContainer.style.display = 'none';
            quizContainerChoujuu.style.display = 'block';
            showChoujuuQuestion();
        } catch (error) {
            console.error("画像の読み込みに失敗しました:", error);
            alert("クイズ画像の読み込みに失敗しました。トップページに戻ります。");
            goToTopPage();
        } finally {
            loaderWrapper.classList.add('loaded');
        }
    }

    function showChoujuuQuestion() {
        document.querySelectorAll('.choujuu-choice-btn').forEach(btn => { btn.disabled = false; btn.classList.remove('correct', 'wrong'); });
        choujuuStep1.style.display = 'block';
        choujuuStep2.style.display = 'none';
        choujuuFeedback.style.display = 'none';
        choujuuSubmitButton.style.display = 'none';
        const question = currentQuiz[currentQuestionIndex];
        choujuuImage.src = question.image;
    }
    
    choujuuStep1.addEventListener('click', (e) => {
        if (!e.target.matches('.choujuu-choice-btn')) return;
        const selectedBtn = e.target;
        const choice = selectedBtn.dataset.choice;
        const question = currentQuiz[currentQuestionIndex];
        let isCorrect;
        if (choice === 'no') { isCorrect = !question.isHuntable; } else { isCorrect = question.isHuntable; }
        
        if (isCorrect) { correctSound.play(); } else { wrongSound.play(); }
        if (isCorrect) { score++; } else { wrongQuestions.push({ question: `この鳥獣（${question.name}）は捕獲できますか？`, correctAnswer: question.isHuntable ? '獲れます' : '獲れません' }); } // ★★★

        document.querySelectorAll('.choujuu-choice-btn').forEach(btn => btn.disabled = true);
        selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
        setTimeout(() => {
            if (isCorrect) {
                if (choice === 'yes') {
                    choujuuStep1.style.display = 'none';
                    choujuuStep2.style.display = 'block';
                    setupNameSelection(question);
                } else {
                    showChoujuuFeedback(true, "正解！これは非狩猟鳥獣のため、捕獲できません。");
                }
            } else {
                const feedbackMessage = choice === 'yes' ? "不正解。これは非狩猟鳥獣のため、捕獲できません。" : `不正解。これは狩猟鳥獣（${question.name}）です。`;
                showChoujuuFeedback(false, feedbackMessage);
            }
        }, 500);
    });

    function setupNameSelection(question) {
        choujuuNameOptions.innerHTML = '';
        const options = [...question.distractors, question.name];
        options.sort(() => Math.random() - 0.5);
        options.forEach(name => {
            const button = document.createElement('button');
            button.innerText = name;
            button.classList.add('answer-btn');
            button.addEventListener('click', (e) => {
                const isCorrect = (name === question.name);
                if (isCorrect) { correctSound.play(); } else { wrongSound.play(); }
                if (!isCorrect) { wrongQuestions.push({ question: `この鳥獣（${question.name}）の名前は？`, correctAnswer: question.name }); } // ★★★

                e.target.classList.add(isCorrect ? 'correct' : 'wrong');
                Array.from(choujuuNameOptions.children).forEach(btn => btn.disabled = true);
                setTimeout(() => {
                    showChoujuuFeedback(isCorrect, isCorrect ? `正解！これは${question.name}です。` : `不正解。正しくは${question.name}です。`);
                }, 500);
            });
            choujuuNameOptions.appendChild(button);
        });
    }

    function showChoujuuFeedback(isCorrect, message) {
        choujuuFeedback.textContent = message;
        choujuuFeedback.className = 'feedback-container';
        choujuuFeedback.classList.add(isCorrect ? 'correct' : 'wrong');
        choujuuSubmitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る"; // ★★★
        choujuuSubmitButton.style.display = 'block';
    }

    choujuuSubmitButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.length) {
            showChoujuuQuestion();
        } else {
            showResult(); // ★★★
        }
    });
    
    // --- 通常クイズ用ロジック (★★★ 結果表示ロジックを追加) ---
    function startNormalQuiz(categoryKey) {
        resetQuizState(categoryKey); // ★★★
        if (currentQuiz.length === 0) { alert('このクイズは現在準備中です。'); return; }
        topPageContainer.style.display = 'none';
        resultContainer.style.display = 'none'; // ★★★
        quizContainerChoujuu.style.display = 'none';
        quizContainer.style.display = 'block';
        showNormalQuestion();
    }

    function showNormalQuestion() {
        resetNormalState();
        const question = currentQuiz[currentQuestionIndex];
        questionElement.innerText = question.question;
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('answer-btn');
            if (answer.correct) { button.dataset.correct = answer.correct; }
            button.addEventListener('click', selectNormalAnswer);
            answerButtonsElement.appendChild(button);
        });
    }

    function resetNormalState() {
        submitButton.style.display = 'none';
        while (answerButtonsElement.firstChild) { answerButtonsElement.removeChild(answerButtonsElement.firstChild); }
    }

    function selectNormalAnswer(e) {
        const selectedButton = e.target;
        const isCorrect = selectedButton.dataset.correct === "true";
        if (isCorrect) { correctSound.play(); score++; } else { wrongSound.play(); } // ★★★

        if (!isCorrect) { // ★★★
            const question = currentQuiz[currentQuestionIndex];
            const correctAnswer = question.answers.find(ans => ans.correct).text;
            wrongQuestions.push({ question: question.question, correctAnswer: correctAnswer });
        }

        Array.from(answerButtonsElement.children).forEach(button => {
            button.disabled = true;
            if (button.dataset.correct === "true") { if (!isCorrect && button !== selectedButton) { button.classList.add('reveal-correct'); } }
        });
        selectedButton.classList.add(isCorrect ? 'correct' : 'wrong');
        setTimeout(() => {
            submitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る";
            submitButton.style.display = 'block';
        }, 500);
    }
    
    submitButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.length) {
            showNormalQuestion();
        } else {
            showResult(); // ★★★
        }
    });

    // ★★★ ここからリザルト画面表示用の関数を追加 ★★★
    function showResult() {
        quizContainer.style.display = 'none';
        quizContainerChoujuu.style.display = 'none';
        resultContainer.style.display = 'block';

        const totalQuestions = currentQuiz.length;
        const percentage = Math.round((score / totalQuestions) * 100);

        resultScore.textContent = `正答率: ${percentage}% (${score}/${totalQuestions}問)`;

        if (percentage === 100) {
            resultMessage.textContent = '素晴らしい！全問正解です！';
        } else if (percentage >= 80) {
            resultMessage.textContent = 'お見事！あと一歩です！';
        } else if (percentage >= 50) {
            resultMessage.textContent = 'お疲れ様でした！';
        } else {
            resultMessage.textContent = 'もう少し頑張りましょう！';
        }

        wrongQuestionsList.innerHTML = '';
        if (wrongQuestions.length > 0) {
            noWrongQuestionsMessage.style.display = 'none';
            wrongQuestionsList.style.display = 'block';
            wrongQuestions.forEach(item => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div class="question-text">${item.question}</div>
                    <div class="correct-answer-text">正解: ${item.correctAnswer}</div>
                `;
                wrongQuestionsList.appendChild(li);
            });
        } else {
            wrongQuestionsList.style.display = 'none';
            noWrongQuestionsMessage.style.display = 'block';
        }
    }
    // ★★★ ここまで追加 ★★★

    // --- 最後にロード画面を消して、メインコンテンツを表示 (変更なし) ---
    loaderWrapper.classList.add('loaded');
    topPageContainer.style.display = 'block';
};
