window.onload = () => {

    // --- DOM要素の取得 ---
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
    const resultContainer = document.getElementById('result-container');
    const resultMessage = document.getElementById('result-message');
    const resultScore = document.getElementById('result-score');
    const wrongQuestionsList = document.getElementById('wrong-questions-list');
    const noWrongQuestionsMessage = document.getElementById('no-wrong-questions-message');
    const retryQuizBtn = document.getElementById('retry-quiz-btn');
    const backToTopFromResultBtn = document.getElementById('back-to-top-from-result-btn');
    const resetScoresBtn = document.getElementById('reset-scores-btn');

    // --- 音声ファイルの読み込み ---
    const correctSound = new Audio('sounds/correct.mp3');
    const wrongSound = new Audio('sounds/incorrect.mp3');
    correctSound.volume = 0.5;
    wrongSound.volume = 0.5;

    // 鳥獣データと通常クイズデータ
    const quizData = {
        choujuu: [
            { image: "/images/anaguma.jpg", isHuntable: true, name: "アナグマ", distractors: ["タヌキ", "ハクビシン", "テン"] },
            { image: "/images/araiguma.jpg", isHuntable: true, name: "アライグマ", distractors: ["タヌキ", "ハクビシン", "アナグマ"] },
            { image: "/images/ezoraichou.jpg", isHuntable: true, name: "エゾライチョウ", distractors: ["ライチョウ", "キジ", "ヤマドリ"] },
            { image: "/images/hakubishin.jpg", isHuntable: true, name: "ハクビシン", distractors: ["タヌキ", "テン", "アライグマ"] },
            { image: "/images/hashibirogamo.jpg", isHuntable: true, name: "ハシビロガモ", distractors: ["マガモ", "カルガモ", "オナガガモ"] },
            { image: "/images/hashibosogarasu.jpg", isHuntable: true, name: "ハシボソガラス", distractors: ["ハシブトガラス", "ミヤマガラス", "カワウ"] },
            { image: "/images/hashibutogarasu.jpg", isHuntable: true, name: "ハシブトガラス", distractors: ["ハシボソガラス", "ミヤマガラス", "カワウ"] },
            { image: "/images/hidorigamo.jpg", isHuntable: true, name: "ヒドリガモ", distractors: ["マガモ", "ヨシガモ", "カルガモ"] },
            { image: "/images/hiyodori.jpg", isHuntable: true, name: "ヒヨドリ", distractors: ["ムクドリ", "スズメ", "キジバト"] },
            { image: "/images/hoshihajiro.jpg", isHuntable: true, name: "ホシハジロ", distractors: ["キンクロハジロ", "スズガモ", "マガモ"] },
            { image: "/images/inoshishi.jpg", isHuntable: true, name: "イノシシ", distractors: ["ツキノワグマ", "ニホンジカ", "タヌキ"] },
            { image: "/images/kamoshika.jpg", isHuntable: false, name: "カモシカ", distractors: ["ニホンジカ", "イノシシ", "ツキノワグマ"] },
            { image: "/images/karugamo.jpg", isHuntable: true, name: "カルガモ", distractors: ["マガモ", "オナガガモ", "コガモ"] },
            { image: "/images/kawau.jpg", isHuntable: true, name: "カワウ", distractors: ["ハシボソガラス", "ウミネコ", "サギ"] },
            { image: "/images/kiji.jpg", isHuntable: true, name: "キジ", distractors: ["ヤマドリ", "エゾライチョウ", "コジュケイ"] },
            { image: "/images/kijibato.jpg", isHuntable: true, name: "キジバト", distractors: ["ハト", "ヒヨドリ", "ムクドリ"] },
            { image: "/images/kinkurohajiro.jpg", isHuntable: true, name: "キンクロハジロ", distractors: ["ホシハジロ", "スズガモ", "マガモ"] },
            { image: "/images/kogamo.jpg", isHuntable: true, name: "コガモ", distractors: ["マガモ", "カルガモ", "ヒドリガモ"] },
            { image: "/images/kojyukei.jpg", isHuntable: true, name: "コジュケイ", distractors: ["キジ", "ヤマドリ", "ウズラ"] },
            { image: "/images/kurogamo.jpg", isHuntable: true, name: "クロガモ", distractors: ["マガモ", "カルガモ", "スズガモ"] },
            { image: "/images/magamo.jpg", isHuntable: true, name: "マガモ", distractors: ["カルガモ", "オナガガモ", "コガモ"] },
            { image: "/images/mejiro.jpg", isHuntable: false, name: "メジロ", distractors: ["スズメ", "ウグイス", "シジュウカラ"] },
            { image: "/images/minku.jpg", isHuntable: true, name: "ミンク", distractors: ["テン", "イタチ", "ハクビシン"] },
            { image: "/images/miyamakarasu.jpg", isHuntable: true, name: "ミヤマガラス", distractors: ["ハシボソガラス", "ハシブトガラス", "カワウ"] },
            { image: "/images/momonga.jpg", isHuntable: false, name: "モモンガ", distractors: ["ムササビ", "ニホンリス", "シマリス"] },
            { image: "/images/mukudori.jpg", isHuntable: true, name: "ムクドリ", distractors: ["ヒヨドリ", "スズメ", "キジバト"] },
            { image: "/images/musasabi.jpg", isHuntable: false, name: "ムササビ", distractors: ["モモンガ", "ニホンリス", "シマリス"] },
            { image: "/images/nihonjika-mesu.jpg", isHuntable: true, name: "ニホンジカ", distractors: ["カモシカ", "イノシシ", "ツキノワグマ"] },
            { image: "/images/nihonjika-osu.jpg", isHuntable: true, name: "ニホンジカ", distractors: ["カモシカ", "イノシシ", "ツキノワグマ"] },
            { image: "/images/nihonrisu.jpg", isHuntable: false, name: "ニホンリス", distractors: ["シマリス", "モモンガ", "ムササビ"] },
            { image: "/images/nihonzaru.jpg", isHuntable: false, name: "ニホンザル", distractors: ["ツキノワグマ", "イノシシ", "タヌキ"] },
            { image: "/images/nousagi.jpg", isHuntable: true, name: "ノウサギ", distractors: ["タヌキ", "キツネ", "テン"] },
            { image: "/images/nyunaisuzume.jpg", isHuntable: true, name: "ニュウナイスズメ", distractors: ["スズメ", "メジロ", "ヒヨドリ"] },
            { image: "/images/onagagamo.jpg", isHuntable: true, name: "オナガガモ", distractors: ["マガモ", "カルガモ", "コガモ"] },
            { image: "/images/osuitachi.jpg", isHuntable: true, name: "イタチ", distractors: ["テン", "ミンク", "ハクビシン"] },
            { image: "/images/shimarisu.jpg", isHuntable: true, name: "シマリス", distractors: ["ニホンリス", "モモンガ", "ムササビ"] },
            { image: "/images/suzugamo.jpg", isHuntable: true, name: "スズガモ", distractors: ["ホシハジロ", "キンクロハジロ", "マガモ"] },
            { image: "/images/suzume.jpg", isHuntable: true, name: "スズメ", distractors: ["ニュウナイスズメ", "メジロ", "ヒヨドリ"] },
            { image: "/images/tanuki.jpg", isHuntable: true, name: "タヌキ", distractors: ["アナグマ", "ハクビシン", "アライグマ"] },
            { image: "/images/tashigi.jpg", isHuntable: true, name: "タシギ", distractors: ["ヤマシギ", "キジバト", "ヒヨドリ"] },
            { image: "/images/ten.jpg", isHuntable: true, name: "テン", distractors: ["イタチ", "ミンク", "ハクビシン"] },
            { image: "/images/tsukinowaguma.jpg", isHuntable: true, name: "ツキノワグマ", distractors: ["ヒグマ", "イノシシ", "ニホンジカ"] },
            { image: "/images/yamadori.jpg", isHuntable: true, name: "ヤマドリ", distractors: ["キジ", "エゾライチョウ", "コジュケイ"] },
            { image: "/images/yamashigi.jpg", isHuntable: true, name: "ヤマシギ", distractors: ["タシギ", "キジバト", "ヒヨドリ"] },
            { image: "/images/yoshigamo.jpg", isHuntable: true, name: "ヨシガモ", distractors: ["マガモ", "ヒドリガモ", "カルガモ"] }
        ],
        //
        // ===================================================================
        ami: [ { question: "網猟免許で捕獲が許可されている鳥獣は？", answers: [{ text: "鳥類のみ", correct: true }, { text: "獣類のみ", correct: false }, { text: "鳥類と獣類の両方", correct: false }] }, { question: "禁止されている網猟具は次のうちどれか？", answers: [{ text: "むそう網", correct: false }, { text: "はり網", correct: false }, { text: "かすみ網", correct: true }] }, { question: "公道上で網を使用して鳥獣を捕獲することは、全面的に許可されている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] } ],
        wana: [ { question: "「くくりわな」を使用してクマ類（ヒグマ・ツキノワグマ）を捕獲することは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "使用が禁止されている「とらばさみ」は、内径の最大長が何cmを超えるものか？", answers: [{ text: "8cm", correct: false }, { text: "12cm", correct: true }, { text: "16cm", correct: false }] }, { question: "法定猟具である「わな」を一人で31個以上使用して猟を行うことは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ],
        jyu1: [ { question: "第一種銃猟免許で扱える銃器は、装薬銃（散弾銃・ライフル銃）と空気銃である。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "住居が集合している地域では、流れ弾に注意すれば銃器による捕獲が認められている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }, { question: "銃の安全装置をかけておけば、脱包しなくても、銃を持ったまま跳びはねても暴発の危険はない。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] } ],
        jyu2: [ { question: "第二種銃猟免許で扱える銃器は、空気銃のみである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "狩猟鳥獣であるカモ類の捕獲数の制限は、1日あたり合計5羽までである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "獲物を手に入れるために発砲した場合、半矢で逃してしまっても「捕獲行為」をしたことになる。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ],
        beginner: [ { question: "銃砲所持許可は、都道府県公安委員会が発行する。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }, { question: "銃砲刀剣類所持等取締法（銃刀法）は、原則として銃砲を所持することを許可している。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }, { question: "所持許可を受けた猟銃を他人に盗まれたときは、直ちにその旨を警察署に届け出なければならない。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] } ]
    };

    // --- 状態管理変数 (変更なし) ---
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let currentQuizCategoryKey = '';
    let score = 0;
    let wrongQuestions = [];

    // --- ローカルストレージ関連関数 ---
    const storageKey = 'huntingQuizScores';
    function getScoresFromStorage() { const storedScores = localStorage.getItem(storageKey); return storedScores ? JSON.parse(storedScores) : {}; }
    function saveScoresToStorage(scores) { localStorage.setItem(storageKey, JSON.stringify(scores)); }
    function updateTopPageUI() { const scores = getScoresFromStorage(); document.querySelectorAll('.quiz-card').forEach(card => { const category = card.dataset.quizCategory; const categoryScores = scores[category] || { highScore: 0, cleared: false }; const highScoreEl = card.querySelector('.quiz-card-highscore'); const clearMarkEl = card.querySelector('.quiz-card-clear-mark'); highScoreEl.textContent = `ハイスコア: ${categoryScores.highScore}%`; if (categoryScores.cleared) { clearMarkEl.textContent = '👑'; } else { clearMarkEl.textContent = ''; } }); }

    // --- 画像プリロード関数 ---
    function preloadImages(urls) { const promises = urls.map(url => { return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error(`Failed to load image's URL: ${url}`)); img.src = url; }); }); return Promise.all(promises); }

    // --- 汎用関数 ---
    function goToTopPage() { quizContainers.forEach(container => container.style.display = 'none'); resultContainer.style.display = 'none'; topPageContainer.style.display = 'block'; updateTopPageUI(); }
    function resetQuizState(categoryKey) { currentQuizCategoryKey = categoryKey; const originalQuizData = quizData[categoryKey] || []; currentQuiz = [...originalQuizData].sort(() => Math.random() - 0.5); currentQuestionIndex = 0; score = 0; wrongQuestions = []; }

    // --- イベントリスナーの初期化 ---
    if (quizOptionsContainer) { quizOptionsContainer.addEventListener('click', (event) => { const button = event.target.closest('.challenge-btn'); if (!button) return; const quizCard = button.closest('.quiz-card'); const quizCategoryKey = quizCard.dataset.quizCategory; if (quizCategoryKey === 'choujuu') { startChoujuuQuiz(); } else { startNormalQuiz(quizCategoryKey); } }); }
    quizContainers.forEach(container => { container.addEventListener('click', (event) => { const button = event.target.closest('.back-to-top-btn'); if (!button) return; goToTopPage(); }); });
    retryQuizBtn.addEventListener('click', () => { if (currentQuizCategoryKey === 'choujuu') { startChoujuuQuiz(); } else { startNormalQuiz(currentQuizCategoryKey); } });
    backToTopFromResultBtn.addEventListener('click', goToTopPage);

    // --- 鳥獣判別クイズ ロジック ---
    async function startChoujuuQuiz() { resetQuizState('choujuu'); loaderWrapper.classList.remove('loaded'); try { const imageUrls = currentQuiz.map(q => q.image); await preloadImages(imageUrls); topPageContainer.style.display = 'none'; quizContainers.forEach(container => container.style.display = 'none'); quizContainerChoujuu.style.display = 'block'; showChoujuuQuestion(); } catch (error) { console.error("画像の読み込みに失敗しました:", error); alert("クイズ画像の読み込みに失敗しました。トップページに戻ります。"); goToTopPage(); } finally { loaderWrapper.classList.add('loaded'); } }
    function showChoujuuQuestion() { document.querySelectorAll('.choujuu-choice-btn').forEach(btn => { btn.disabled = false; btn.classList.remove('correct', 'wrong'); }); choujuuStep1.style.display = 'block'; choujuuStep2.style.display = 'none'; choujuuFeedback.style.display = 'none'; choujuuSubmitButton.style.display = 'none'; const question = currentQuiz[currentQuestionIndex]; choujuuImage.src = question.image; }
    
    choujuuStep1.addEventListener('click', (e) => {
        if (!e.target.matches('.choujuu-choice-btn')) return;
        const selectedBtn = e.target;
        const choice = selectedBtn.dataset.choice;
        const question = currentQuiz[currentQuestionIndex];
        const isCorrect = (choice === 'no') ? !question.isHuntable : question.isHuntable;
        
        if (isCorrect) {
            correctSound.play();
            if (choice === 'no') {
                score++;
            }
        } else {
            wrongSound.play();
        }
        
        if (!isCorrect) { wrongQuestions.push({ question: `この鳥獣（${question.name}）は捕獲できますか？`, correctAnswer: question.isHuntable ? '獲れます' : '獲れません' }); }

        document.querySelectorAll('.choujuu-choice-btn').forEach(btn => btn.disabled = true);
        selectedBtn.classList.add(isCorrect ? 'correct' : 'wrong');
        setTimeout(() => {
            if (isCorrect) {
                if (choice === 'yes') {
                    choujuuStep1.style.display = 'none';
                    choujuuStep2.style.display = 'block';
                    setupNameSelection(question);
                } else {
                    showChoujuuFeedback(true, `正解！この鳥獣（${question.name}）は非狩猟鳥獣のため、捕獲できません。`);
                }
            } else {
                let feedbackMessage = '';
                if (choice === 'yes') {
                    feedbackMessage = `不正解。この鳥獣（${question.name}）は、非狩猟鳥獣のため、捕獲できません。`;
                } else {
                    feedbackMessage = `不正解。この鳥獣は「${question.name}」といい、狩猟対象です。`;
                }
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
                             
                if (isCorrect) {
                    correctSound.play();
                    score++;
                } else {
                    wrongSound.play();
                }
                
                if (!isCorrect) { wrongQuestions.push({ question: `この鳥獣（${question.name}）の名前は？`, correctAnswer: question.name }); }

                e.target.classList.add(isCorrect ? 'correct' : 'wrong');
                Array.from(choujuuNameOptions.children).forEach(btn => btn.disabled = true);
                setTimeout(() => {
                    showChoujuuFeedback(isCorrect, isCorrect ? `正解！これは${question.name}です。` : `不正解。正しくは${question.name}です。`);
                }, 500);
            });
            choujuuNameOptions.appendChild(button);
        });
    }

    function showChoujuuFeedback(isCorrect, message) { choujuuFeedback.textContent = message; choujuuFeedback.className = 'feedback-container'; choujuuFeedback.classList.add(isCorrect ? 'correct' : 'wrong'); choujuuSubmitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る"; choujuuSubmitButton.style.display = 'block'; }
    choujuuSubmitButton.addEventListener('click', () => { currentQuestionIndex++; if (currentQuestionIndex < currentQuiz.length) { showChoujuuQuestion(); } else { showResult(); } });
    
    // --- 通常クイズ用ロジック ---
    function startNormalQuiz(categoryKey) { resetQuizState(categoryKey); if (currentQuiz.length === 0) { alert('このクイズは現在準備中です。'); return; } topPageContainer.style.display = 'none'; quizContainers.forEach(container => container.style.display = 'none'); resultContainer.style.display = 'none'; quizContainer.style.display = 'block'; showNormalQuestion(); }
    function showNormalQuestion() { resetNormalState(); const question = currentQuiz[currentQuestionIndex]; questionElement.innerText = question.question; question.answers.forEach(answer => { const button = document.createElement('button'); button.innerText = answer.text; button.classList.add('answer-btn'); if (answer.correct) { button.dataset.correct = answer.correct; } button.addEventListener('click', selectNormalAnswer); answerButtonsElement.appendChild(button); }); }
    function resetNormalState() { submitButton.style.display = 'none'; while (answerButtonsElement.firstChild) { answerButtonsElement.removeChild(answerButtonsElement.firstChild); } }
    function selectNormalAnswer(e) { const selectedButton = e.target; const isCorrect = selectedButton.dataset.correct === "true"; if (isCorrect) { correctSound.play(); score++; } else { wrongSound.play(); } if (!isCorrect) { const question = currentQuiz[currentQuestionIndex]; const correctAnswer = question.answers.find(ans => ans.correct).text; wrongQuestions.push({ question: question.question, correctAnswer: correctAnswer }); } Array.from(answerButtonsElement.children).forEach(button => { button.disabled = true; if (button.dataset.correct === "true") { if (!isCorrect && button !== selectedButton) { button.classList.add('reveal-correct'); } } }); selectedButton.classList.add(isCorrect ? 'correct' : 'wrong'); setTimeout(() => { submitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る"; submitButton.style.display = 'block'; }, 500); }
    submitButton.addEventListener('click', () => { currentQuestionIndex++; if (currentQuestionIndex < currentQuiz.length) { showNormalQuestion(); } else { showResult(); } });

    // --- リザルト画面表示用の関数 ---
    function showResult() { quizContainers.forEach(container => container.style.display = 'none'); resultContainer.style.display = 'block'; const totalQuestions = currentQuiz.length; const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0; const scores = getScoresFromStorage(); const currentCategoryScores = scores[currentQuizCategoryKey] || { highScore: 0, cleared: false }; if (percentage > currentCategoryScores.highScore) { currentCategoryScores.highScore = percentage; } if (percentage === 100) { currentCategoryScores.cleared = true; } scores[currentQuizCategoryKey] = currentCategoryScores; saveScoresToStorage(scores); resultScore.textContent = `正答率: ${percentage}% (${score}/${totalQuestions}問)`; if (percentage === 100) { resultMessage.textContent = '素晴らしい！全問正解です！'; } else if (percentage >= 80) { resultMessage.textContent = 'お見事！あと一歩です！'; } else if (percentage >= 50) { resultMessage.textContent = 'お疲れ様でした！'; } else { resultMessage.textContent = 'もう少し頑張りましょう！'; } wrongQuestionsList.innerHTML = ''; if (wrongQuestions.length > 0) { noWrongQuestionsMessage.style.display = 'none'; wrongQuestionsList.style.display = 'block'; wrongQuestions.forEach(item => { const li = document.createElement('li'); li.innerHTML = ` <div class="question-text">${item.question}</div> <div class="correct-answer-text">正解: ${item.correctAnswer}</div> `; wrongQuestionsList.appendChild(li); }); } else { wrongQuestionsList.style.display = 'none'; noWrongQuestionsMessage.style.display = 'block'; } }

    // --- 最後にロード画面を消して、メインコンテンツを表示 ---
    loaderWrapper.classList.add('loaded');
    goToTopPage();

        // ===================================================================
    // ★★★ ここから、新しい、イベントリスナーを、追加 ★★★
    // ===================================================================
    esetScoresBtn.addEventListener('click', () => {
        const isConfirmed = confirm('本当に、すべてのハイスコアをリセットしますか？この操作は、取り消せません。');
        if (isConfirmed) {
            localStorage.removeItem(storageKey);
            updateTopPageUI();
            alert('すべてのハイスコアがリセットされました。');
     }
    });
    // ===================================================================
    // ★★★ ここまで、追加 ★★★
    // ===================================================================
};