window.onload = () => {

    // --- DOM要素の取得 (変更なし) ---
    const loaderWrapper = document.getElementById('loader-wrapper');
    const topPageContainer = document.getElementById('top-page-container');
    // ★ feedbackOverlay, feedbackIcon は不要になったので削除
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
    const challengeButtons = document.querySelectorAll('.challenge-btn');

    // --- クイズデータ (変更なし) ---
    const quizData = {
        choujuu: [
            { image: "assets/images/nihonjika.jpg", isHuntable: true, name: "ニホンジカ", distractors: ["カモシカ", "ツキノワグマ", "イノシシ"] },
            { image: "assets/images/kamoshika.jpg", isHuntable: false, name: "カモシカ" },
            { image: "assets/images/kiji.jpg", isHuntable: true, name: "キジ", distractors: ["ヤマドリ", "ライチョウ", "ウズラ"] },
            { image: "assets/images/raichou.jpg", isHuntable: false, name: "ライチョウ" }
        ],
        ami: [ { question: "網猟免許で捕獲が許可されている鳥獣は？", answers: [{ text: "鳥類のみ", correct: true }, { text: "獣類のみ", correct: false }, { text: "鳥類と獣類の両方", correct: false }] }, { question: "禁止されている網猟具は次のうちどれか？", answers: [{ text: "むそう網", correct: false }, { text: "はり網", correct: false }, { text: "かすみ網", correct: true }] }, { question: "公道上で網を使用して鳥獣を捕獲することは、全面的に許可されている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] } ],
        wana: [ { question: "「くくりわな」を使用してクマ類（ヒグマ・ツキノワグマ）を捕獲することは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "使用が禁止されている「とらばさみ」は、内径の最大長が何cmを超えるものか？", answers: [{ text: "8cm", correct: false }, { text: "12cm", correct: true }, { text: "16cm", correct: false }] }, { question: "法定猟具である「わな」を一人で31個以上使用して猟を行うことは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ],
        jyu1: [ { question: "第一種銃猟免許で扱える銃器は、装薬銃（散弾銃・ライフル銃）と空気銃である。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "住居が集合している地域では、流れ弾に注意すれば銃器による捕獲が認められている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }, { question: "銃の安全装置をかけておけば、脱包しなくても、銃を持ったまま跳びはねても暴発の危険はない。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] } ],
        jyu2: [ { question: "第二種銃猟免許で扱える銃器は、空気銃のみである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "狩猟鳥獣であるカモ類の捕獲数の制限は、1日あたり合計5羽までである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "獲物を手に入れるために発砲した場合、半矢で逃してしまっても「捕獲行為」をしたことになる。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ],
        beginner: [ { question: "銃砲所持許可は、都道府県公安委員会が発行する。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "銃砲刀剣類所持等取締法（銃刀法）は、原則として銃砲を所持することを許可している。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }, { question: "所持許可を受けた猟銃を他人に盗まれたときは、直ちにその旨を警察署に届け出なければならない。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ]
    };

    let currentQuiz = [];
    let currentQuestionIndex = 0;

    // ★★★ showFeedbackAnimation 関数は、ここから削除されました ★★★

    // --- イベントリスナーの初期化 (変更なし) ---
    challengeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonId = event.target.id;
            const quizCategoryKey = buttonId.replace('start-', '').replace('-btn', '');
            if (quizCategoryKey === 'choujuu') {
                startChoujuuQuiz();
            } else {
                startNormalQuiz(categoryKey);
            }
        });
    });

    // ===================================================================
    // ★★★ 鳥獣判別クイズ ロジック【新フィードバック方式】★★★
    // ===================================================================
    function startChoujuuQuiz() { /* 変更なし */ }
    function showChoujuuQuestion() { /* 変更なし */ }
    
    choujuuStep1.addEventListener('click', (e) => {
        if (!e.target.matches('.choujuu-choice-btn')) return;
        
        const selectedBtn = e.target;
        const choice = selectedBtn.dataset.choice;
        const question = currentQuiz[currentQuestionIndex];
        let isCorrect;
        if (choice === 'no') { isCorrect = !question.isHuntable; } else { isCorrect = question.isHuntable; }

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
        }, 500); // 0.5秒待ってから次に進む
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
                e.target.classList.add(isCorrect ? 'correct' : 'wrong');
                Array.from(choujuuNameOptions.children).forEach(btn => btn.disabled = true);
                setTimeout(() => {
                    showChoujuuFeedback(isCorrect, isCorrect ? `正解！これは${question.name}です。` : `不正解。正しくは${question.name}です。`);
                }, 500);
            });
            choujuuNameOptions.appendChild(button);
        });
    }

    function showChoujuuFeedback(isCorrect, message) { /* 変更なし */ }
    choujuuSubmitButton.addEventListener('click', () => { /* 変更なし */ });
    
    // ===================================================================
    // ★★★ 通常クイズ用ロジック【新フィードバック方式】★★★
    // ===================================================================
    function startNormalQuiz(categoryKey) { /* 変更なし */ }
    function showNormalQuestion() { /* 変更なし */ }
    function resetNormalState() { /* 変更なし */ }

    function selectNormalAnswer(e) {
        const selectedButton = e.target;
        const isCorrect = selectedButton.dataset.correct === "true";

        Array.from(answerButtonsElement.children).forEach(button => {
            button.disabled = true;
            if (button.dataset.correct === "true") {
                // 不正解の場合、正解の選択肢をハイライトする
                if (!isCorrect && button !== selectedButton) {
                    button.classList.add('reveal-correct');
                }
            }
        });
        
        selectedButton.classList.add(isCorrect ? 'correct' : 'wrong');

        setTimeout(() => {
            submitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る";
            submitButton.style.display = 'block';
        }, 500);
    }
    
    submitButton.addEventListener('click', () => { /* 変更なし */ });

    // ★★★ setStatusClass, clearStatusClass は不要になったので削除 ★★★

    // --- 最後にロード画面を消して、メインコンテンツを表示 (変更なし) ---
    loaderWrapper.classList.add('loaded');
    topPageContainer.style.display = 'block';
};
