// ===================================================================
// ★★★ script.js (レイアウト統一・バグ修正 決定版) ★★★
// ===================================================================
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
    const retryQuizBtn = document.getElementById('retry-quiz-btn');
    const backToTopFromResultBtn = document.getElementById('back-to-top-from-result-btn');
    const trainingModeBtn = document.getElementById('training-mode-btn');
    const resetScoresBtn = document.getElementById('reset-scores-btn');
    const normalQuizImageContainer = document.getElementById('normal-quiz-image-container');
    const normalQuizImage = document.getElementById('normal-quiz-image');
    const additionalInfoContainer = document.getElementById('additional-info-container');
    const additionalInfoText = document.getElementById('additional-info-text');
    const resultDetailsSection = document.getElementById('result-details-section');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const soundToggleCheckbox = document.getElementById('sound-toggle-checkbox');
    
    // --- 音声ファイルの読み込み ---
    const correctSound = new Audio('./sounds/correct.mp3');
    const wrongSound = new Audio('./sounds/incorrect.mp3');
    correctSound.volume = 0.5;
    wrongSound.volume = 0.5;
    
    function playSound(sound) {
        if (soundToggleCheckbox && soundToggleCheckbox.checked) {
            sound.play();
        }
    }
    
    // --- 状態管理変数 ---
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let currentQuizCategoryKey = '';
    let currentQuizMode = 'all';
    let score = 0;
    let wrongQuestions = [];

    // --- ローカルストレージ関連関数 ---
    const storageKey = 'huntingQuizScores';
    function getScoresFromStorage() { const storedScores = localStorage.getItem(storageKey); return storedScores ? JSON.parse(storedScores) : {}; }
    function saveScoresToStorage(scores) { localStorage.setItem(storageKey, JSON.stringify(scores)); }
    
    // --- UI更新関数 ---
    function updateTopPageUI() {
        const quizModesConfig = {
            choujuu: [{ mode: 'all', text: 'ベーシック', class: '' }],
            ami: [{ mode: 'all', text: 'ベーシック', class: '' }],
            wana: [{ mode: 'all', text: 'ベーシック', class: '' }],
            jyu1: [{ mode: 'all', text: 'ベーシック', class: '' }, { mode: 'cram', text: '厳選問題', class: 'cram-mode-btn' }],
            jyu2: [{ mode: 'all', text: 'ベーシック', class: '' }],
            beginner: [{ mode: 'all', text: 'ベーシック', class: '' }],
            sushi: [
                { mode: 'basic3', text: 'ベーシック３級', class: '' },
                { mode: 'basic2', text: 'ベーシック２級', class: '' },
                { mode: 'basic1', text: 'ベーシック１級', class: '' },
                { mode: 'maniac', text: 'マニアック', class: 'cram-mode-btn' }
            ]
        };
        const scores = getScoresFromStorage();
        document.querySelectorAll('.quiz-card').forEach(card => {
            const category = card.dataset.quizCategory;
            const footer = card.querySelector('.quiz-card-footer-sushi');
            const modes = quizModesConfig[category];
            if (!footer || !modes) return;
            footer.innerHTML = '';
            let isAllModesCleared = true;
            modes.forEach(item => {
                const storageKeyForMode = (item.mode === 'all') ? category : `${category}-${item.mode}`;
                const modeScores = scores[storageKeyForMode] || { highScore: 0, cleared: false };
                if (!modeScores.cleared) isAllModesCleared = false;
                const buttonHTML = `<button class="challenge-btn-sushi ${item.class}" data-mode="${item.mode}"><span class="sushi-btn-label">${item.text}</span><span class="sushi-btn-score">達成率 ${modeScores.highScore}% ${modeScores.cleared ? '👑' : ''}</span></button>`;
                footer.innerHTML += buttonHTML;
            });
            const clearMarkEl = card.querySelector('.quiz-card-clear-mark');
            if (clearMarkEl) clearMarkEl.textContent = isAllModesCleared ? '👑' : '';
        });
    }

    // --- 汎用関数 ---
    function goToTopPage() {
        quizContainers.forEach(container => container.style.display = 'none');
        resultContainer.style.display = 'none';
        topPageContainer.style.display = 'block';
    }

    // --- クイズデータ読み込み＆状態リセット ---
    async function loadQuizData(categoryKey, mode = 'all') {
        let fileName = (categoryKey === 'sushi') ? `sushi_${mode}.json` : `${categoryKey}.json`;
        try {
            const response = await fetch(`./quiz_data/${fileName}`);
            if (!response.ok) throw new Error(`Failed to fetch quiz_data/${fileName}. Status: ${response.status}`);
            const data = await response.json();
            console.log(`Successfully loaded quiz data for '${categoryKey}' (mode: ${mode}) from external JSON: ${fileName}`);
            return data;
        } catch (error) {
            console.error(`Could not load from ./quiz_data/${fileName}. Reason: ${error.message}.`);
            alert(`クイズデータ（${fileName}）の読み込みに失敗しました。ファイルが存在するか、パスが正しいか確認してください。`);
            return [];
        }
    }

    async function resetQuizState(categoryKey, mode = 'all') {
        currentQuizCategoryKey = categoryKey;
        currentQuizMode = mode;
        const originalQuizData = await loadQuizData(categoryKey, mode);
        if (originalQuizData.length === 0) {
            currentQuiz = [];
            return;
        }
        let filteredData = (mode === 'cram') ? originalQuizData.filter(q => q.importance === 'high') : originalQuizData;
        currentQuiz = [...filteredData].sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        score = 0;
        wrongQuestions = [];
    }

    // --- イベントリスナー初期化 ---
    function initializeEventListeners() {
        if (soundToggleCheckbox) {
            const isSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
            soundToggleCheckbox.checked = isSoundEnabled;
            soundToggleCheckbox.addEventListener('change', () => localStorage.setItem('soundEnabled', soundToggleCheckbox.checked));
        }
        
        if (quizOptionsContainer) {
            quizOptionsContainer.addEventListener('click', (event) => {
                const button = event.target.closest('.challenge-btn-sushi');
                if (!button) return;
                const quizCard = button.closest('.quiz-card');
                if (!quizCard) return;
                const quizCategoryKey = quizCard.dataset.quizCategory;
                const selectedMode = button.dataset.mode || 'all';
                if (quizCategoryKey === 'choujuu') startChoujuuQuiz();
                else startNormalQuiz(quizCategoryKey, selectedMode);
            });
        }

        quizContainers.forEach(container => {
            const backBtn = container.querySelector('.back-to-top-btn');
            if (backBtn) backBtn.addEventListener('click', goToTopPage);
        });

        if (retryQuizBtn) {
            retryQuizBtn.addEventListener('click', () => {
                if (currentQuizCategoryKey === 'choujuu') startChoujuuQuiz();
                else startNormalQuiz(currentQuizCategoryKey, currentQuizMode);
            });
        }

        if (backToTopFromResultBtn) {
            backToTopFromResultBtn.addEventListener('click', () => {
                updateTopPageUI(); 
                goToTopPage();
            });
        }

        if (trainingModeBtn) {
            trainingModeBtn.addEventListener('click', startTrainingMode);
        }

        if (resetScoresBtn) {
            resetScoresBtn.addEventListener('click', () => {
                if (confirm('本当に、すべてのハイスコアをリセットしますか？この操作は、取り消せません。')) {
                    localStorage.removeItem(storageKey);
                    updateTopPageUI();
                    alert('すべてのハイスコアがリセットされました。');
                }
            });
        }

        if (submitButton) {
            submitButton.addEventListener('click', () => {
                if (currentQuizMode === 'training') {
                    currentQuestionIndex = Math.floor(Math.random() * currentQuiz.length);
                    showNormalQuestion();
                } else {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < currentQuiz.length) showNormalQuestion();
                    else showResult();
                }
            });
        }

        if (choujuuSubmitButton) {
            choujuuSubmitButton.addEventListener('click', () => {
                if (currentQuizMode === 'training') {
                    currentQuestionIndex = Math.floor(Math.random() * currentQuiz.length);
                    showChoujuuQuestion();
                } else {
                    currentQuestionIndex++;
                    if (currentQuestionIndex < currentQuiz.length) showChoujuuQuestion();
                    else showResult();
                }       
            });
        }

        // ★★★ ここが修正されたメインの箇所 ★★★
        if (choujuuStep1) {
            choujuuStep1.addEventListener('click', (e) => {
                if (!e.target.matches('.choujuu-choice-btn')) return;
                
                // イベントリスナーの「内側」で現在の問題を取得
                const question = currentQuiz[currentQuestionIndex];
                if (!question) return; // 安全対策

                const selectedBtn = e.target;
                const choice = selectedBtn.dataset.choice;
                const isCorrect = (choice === 'no') ? !question.isHuntable : question.isHuntable;

                if (isCorrect) {
                    if (choice === 'no') { playSound(correctSound); score++; }
                } else {
                    playSound(wrongSound);
                    wrongQuestions.push({ question: `この鳥獣は「${question.name}」です。捕獲できますか？`, correctAnswer: question.isHuntable ? '獲れます' : '獲れません' });
                }
                
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
                        let feedbackMessage = (choice === 'yes')
                            ? `不正解。この鳥獣（${question.name}）は、非狩猟鳥獣のため、捕獲できません。`
                            : `不正解。この鳥獣は「${question.name}」といい、狩猟対象です。`;
                        showChoujuuFeedback(false, feedbackMessage);
                    }
                }, 500);
            });
        }
    }

    // --- クイズ開始ロジック ---
    async function startQuiz(categoryKey, mode, startFunction) {
        loaderWrapper.style.display = 'flex'; // ローダーを再表示
        progressText.textContent = 'クイズデータを、読み込み中...';
        progressBar.style.width = '0%';
        try {
            await resetQuizState(categoryKey, mode);
            if (currentQuiz.length === 0) {
                goToTopPage();
                loaderWrapper.style.display = 'none'; // ローダーを非表示
                return;
            }
            const imageUrls = currentQuiz.filter(q => q.image).map(q => q.image);
            await preloadImages(imageUrls, (loaded, total, filename) => {
                const percentage = total > 0 ? (loaded / total) * 100 : 0;
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `画像を、読み込み中... (${loaded}/${total}) ${filename || ''}`;
            });
            progressText.textContent = 'クイズを、開始します...';
            topPageContainer.style.display = 'none';
            quizContainers.forEach(container => container.style.display = 'none');
            startFunction();
        } catch (error) {
            console.error("クイズの開始に失敗しました:", error);
            alert("クイズの開始に失敗しました。トップページに戻ります。");
            goToTopPage();
        } finally {
            setTimeout(() => loaderWrapper.style.display = 'none', 200);
        }
    }
    
    // --- 画像プリロード関数（変更なし） ---
    function preloadImages(urls, onProgress) {
        let loadedCount = 0;
        const totalCount = urls.length;
        if (totalCount === 0) {
            if(onProgress) onProgress(1, 1, "画像なし");
            return Promise.resolve([]);
        }
        if(onProgress) onProgress(0, totalCount, '');
        const promises = urls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => { loadedCount++; if(onProgress) onProgress(loadedCount, totalCount, url.split('/').pop()); resolve({ url, status: 'ok' }); };
                img.onerror = () => { loadedCount++; console.warn(`Warning: Failed to load image: ${url}`); if(onProgress) onProgress(loadedCount, totalCount, url.split('/').pop()); resolve({ url, status: 'error' }); };
                img.src = url;
            });
        });
        return Promise.all(promises);
    }

    // --- 各種クイズ開始・表示関数（変更なし） ---
    function startChoujuuQuiz() { startQuiz('choujuu', 'all', () => { quizContainerChoujuu.style.display = 'block'; showChoujuuQuestion(); }); }
    function startNormalQuiz(categoryKey, mode = 'all') { startQuiz(categoryKey, mode, () => { quizContainer.style.display = 'block'; showNormalQuestion(); }); }
    function startTrainingMode() { /* ... 変更なし ... */ }
    function showChoujuuQuestion() { /* ... 変更なし ... */ }
    function setupNameSelection(question) { /* ... 変更なし ... */ }
    function showChoujuuFeedback(isCorrect, message) { /* ... 変更なし ... */ }
    function showNormalQuestion() { /* ... 変更なし ... */ }
    function resetNormalState() { /* ... 変更なし ... */ }
    function selectNormalAnswer(e) { /* ... 変更なし ... */ }
    function showResult() { /* ... 変更なし ... */ }
    function handleNumericKeyPress(number) { /* ... 変更なし ... */ }
    function handleEnterKeyPress() { /* ... 変更なし ... */ }

    // --- キーボードイベントリスナー（変更なし） ---
    document.addEventListener('keydown', (event) => { /* ... 変更なし ... */ });

    // --- 初期化処理の、実行 ---
    initializeEventListeners();
    updateTopPageUI();
    goToTopPage();

    setTimeout(() => {
        loaderWrapper.style.display = 'none';
    }, 100); 
};
