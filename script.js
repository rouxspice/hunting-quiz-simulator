// ★★★ script.js (2025-09-21 バグ修正版 + 食品衛生責任者クイズ対応) ★★★
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
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackSymbol = document.getElementById('feedback-symbol');
    const normalQuizNavigation = document.getElementById('normal-quiz-navigation');
    const prevNormalQuestionBtn = document.getElementById('prev-normal-question-btn');
    const nextNormalQuestionBtn = document.getElementById('next-normal-question-btn');
    const choujuuQuizNavigation = document.getElementById('choujuu-quiz-navigation');
    const prevChoujuuQuestionBtn = document.getElementById('prev-choujuu-question-btn');
    const nextChoujuuQuestionBtn = document.getElementById('next-choujuu-question-btn');

// --- 音声ファイルの読み込み ---
let correctSoundFiles = [];   // ★JSONから読み込むため、空の配列で初期化
let wrongSoundFiles = [];     // ★JSONから読み込むため、空の配列で初期化

// ★★★ JSONから音声ファイルリストを非同期で読み込む関数 ★★★
async function loadSoundList() {
    try {
        const response = await fetch('./sounds/sound-list.json');
        if (!response.ok) {
            throw new Error('sound-list.jsonの読み込みに失敗しました。');
        }
        const data = await response.json();
        correctSoundFiles = data.correct || [];
        wrongSoundFiles = data.incorrect || [];
        console.log('効果音リストを正常に読み込みました。');
    } catch (error) {
        console.error(error);
        // 読み込み失敗時は、フォールバックとして空のままにする
        correctSoundFiles = [];
        wrongSoundFiles = [];
    }
}

// ★★★ ランダム再生関数  ★★★
function playSound(type) {
    if (!soundToggleCheckbox || !soundToggleCheckbox.checked) return;

    let soundFiles;
    let folder;

    if (type === 'correct') {
        soundFiles = correctSoundFiles;
        folder = 'correct';
    } else if (type === 'wrong') {
        soundFiles = wrongSoundFiles;
        folder = 'incorrect';
    } else {
        return;
    }

    if (soundFiles.length === 0) return;

    const randomIndex = Math.floor(Math.random() * soundFiles.length);
    const randomSoundFile = soundFiles[randomIndex];
    
    const audio = new Audio(`./sounds/${folder}/${randomSoundFile}`);
    audio.volume = 0.5;
    audio.play().catch(error => console.error("Audio play failed:", error));
}

    // --- 状態管理変数 ---
    let currentQuiz = [];
    let currentQuestionIndex = 0;
    let currentQuizCategoryKey = '';
    let currentQuizMode = 'all';
    let score = 0;
    let wrongQuestions = [];
    let userAnswers = [];

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
            ],
            // ★★★ 食品衛生責任者クイズの設定を追加 ★★★
            'food-hygiene': [
                { mode: 'hygiene_science', text: '食品衛生学', class: '' },
                { mode: 'hygiene_law', text: '食品衛生法', class: '' },
                { mode: 'public_health', text: '公衆衛生学', class: '' },
                { mode: 'food_labeling', text: '食品表示', class: '' },
                { mode: 'related_laws', text: '食品衛生関連法規', class: '' }
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
                
                const progressWidth = modeScores.highScore;
                const completedClass = modeScores.cleared ? 'completed' : '';

                const buttonHTML = `
                    <button class="challenge-btn-sushi ${item.class}" data-mode="${item.mode}">
                        <span class="sushi-btn-label">${item.text}</span>
                    <!-- ★★★ ここから修正 ★★★ -->
                    <span class="sushi-btn-score">
                        達成率 ${modeScores.highScore}% ${modeScores.cleared ? '👑' : ''}
                        
                        <div class="sushi-btn-progress-track">
                            <div class="sushi-btn-progress-bar ${completedClass}" style="width: ${progressWidth}%;"></div>
                        </div>
                    </span>
                    <!-- ★★★ ここまで修正 ★★★ -->

                    </button>
                `;
                
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

    function navigateToQuestion(direction) {
        const nextIndex = currentQuestionIndex + direction;

        // クイズの範囲外には移動しない
        if (nextIndex < 0 || nextIndex >= currentQuiz.length) {
            // 最後の問題で「次へ」を押したら結果表示
            if (direction === 1 && nextIndex === currentQuiz.length) {
                showResult();
            }
            return;
        }

        currentQuestionIndex = nextIndex;

        if (currentQuizCategoryKey === 'choujuu') {
            showChoujuuQuestion();
        } else {
            showNormalQuestion();
        }
    }

    function showFeedbackAnimation(isCorrect) {
        if (!feedbackOverlay || !feedbackSymbol) return;
        feedbackSymbol.textContent = isCorrect ? '〇' : '×';
        feedbackOverlay.className = isCorrect ? 'correct' : 'wrong';
        setTimeout(() => {
            feedbackOverlay.classList.add('hidden');
        }, 800);
    }

    // --- クイズデータ読み込み＆状態リセット ---
    async function loadQuizData(categoryKey, mode = 'all') {
        let filesToLoad = [];
        
        // ★★★ 食品衛生責任者クイズの対応を追加 ★★★
        if (categoryKey === 'food-hygiene') {
            // 食品衛生責任者クイズの場合、モードに応じてファイル名を決定
            const modeFileMap = {
                'hygiene_science': 'food_hygiene_science',
                'hygiene_law': 'food_hygiene_law', 
                'public_health': 'public_health',
                'food_labeling': 'food_labeling',
                'related_laws': 'food_related_laws'
            };
            const fileName = `${modeFileMap[mode] || mode}.json`;
            filesToLoad.push(fileName);
        } else if (categoryKey === 'sushi') {
            let fileIndex = 1;
            while (true) {
                const fileName = `sushi_${mode}-${fileIndex}.json`;
                try {
                    const response = await fetch(`./quiz_data/${fileName}`, { method: 'HEAD' });
                    if (response.ok) {
                        filesToLoad.push(fileName);
                        fileIndex++;
                    } else {
                        break;
                    }
                } catch (error) {
                    break;
                }
            }
            if (filesToLoad.length === 0) {
                const singleFileName = `sushi_${mode}.json`;
                try {
                    const response = await fetch(`./quiz_data/${singleFileName}`, { method: 'HEAD' });
                    if (response.ok) {
                        filesToLoad.push(singleFileName);
                    }
                } catch (error) { /* 何もしない */ }
            }
        } else {
            filesToLoad.push(`${categoryKey}.json`);
        }

        if (filesToLoad.length === 0) {
            console.error(`No quiz data files found for category '${categoryKey}' and mode '${mode}'.`);
            alert(`クイズデータが見つかりませんでした。(カテゴリ: ${categoryKey}, モード: ${mode})`);
            return [];
        }

        let allQuizData = [];
        for (const fileName of filesToLoad) {
            try {
                const response = await fetch(`./quiz_data/${fileName}`);
                if (!response.ok) throw new Error(`Failed to fetch ${fileName}. Status: ${response.status}`);
                const data = await response.json();
                allQuizData = allQuizData.concat(data);
                console.log(`Successfully loaded and merged: ${fileName}`);
            } catch (error) {
                console.error(`Could not load ${fileName}. Reason: ${error.message}.`);
            }
        }
        return allQuizData;
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
        userAnswers = new Array(originalQuizData.length).fill(null);
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
                const button = event.target.closest('.challenge-btn, .challenge-btn-sushi');
                if (!button) return;
                const quizCard = button.closest('.quiz-card');
                if (!quizCard) return;
                const quizCategoryKey = quizCard.dataset.quizCategory;
                const selectedMode = button.dataset.mode || 'all';
                if (quizCategoryKey === 'choujuu') {
                    startChoujuuQuiz();
                } else {
                    startNormalQuiz(quizCategoryKey, selectedMode);
                }
            });
        }

        quizContainers.forEach(container => {
            const backBtn = container.querySelector('.back-to-top-btn');
            if (backBtn) backBtn.addEventListener('click', handleRetire);
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

        if (choujuuStep1) {
            choujuuStep1.addEventListener('click', (e) => {
                if (!e.target.matches('.choujuu-choice-btn')) return;
                const question = currentQuiz[currentQuestionIndex];
                if (!question) return;
                const selectedBtn = e.target;
                const choice = selectedBtn.dataset.choice;
                const isCorrect = (choice === 'no') ? !question.isHuntable : question.isHuntable;

                if (userAnswers[currentQuestionIndex] === null) {
                    userAnswers[currentQuestionIndex] = {
                        step1: {
                            selected: choice,
                            isCorrect: isCorrect
                        },
                        step2: null // step2の解答は別途保存
                    };

                    if (isCorrect) {
                        playSound('correct'); // ★★★ 'correct' に修正 ★★★
                        showFeedbackAnimation(true);
                        if (choice === 'no') {
                            score++;
                        }
                    } else {
                        playSound('wrong'); // ★★★ 'wrong' に修正 ★★★
                        showFeedbackAnimation(false);
                        wrongQuestions.push(JSON.parse(JSON.stringify(question)));
                    }
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
                            showChoujuuFeedback(true, `正解！「${question.name}」は非狩猟鳥獣のため、捕獲できません。`);
                        }
                    } else {
                        let feedbackMessage = (choice === 'yes')
                            ? `不正解。「${question.name}」は非狩猟鳥獣のため、捕獲できません。`
                            : `不正解。この鳥獣は「${question.name}」といい、狩猟対象です。`;
                        showChoujuuFeedback(false, feedbackMessage);
                    }
                }, 500);
            });
        }
            if (prevNormalQuestionBtn) {
                prevNormalQuestionBtn.addEventListener('click', () => navigateToQuestion(-1));
            }
            if (nextNormalQuestionBtn) {
                nextNormalQuestionBtn.addEventListener('click', () => navigateToQuestion(1));
            }
            if (prevChoujuuQuestionBtn) {
                prevChoujuuQuestionBtn.addEventListener('click', () => navigateToQuestion(-1));
            }
            if (nextChoujuuQuestionBtn) {
                nextChoujuuQuestionBtn.addEventListener('click', () => navigateToQuestion(1));
            }


    }
    // --- クイズ開始ロジック ---
    async function startQuiz(categoryKey, mode, startFunction) {
        loaderWrapper.style.display = 'flex';
        progressText.textContent = 'クイズデータを、読み込み中...';
        progressBar.style.width = '0%';
        try {
            await resetQuizState(categoryKey, mode);
            if (currentQuiz.length === 0) {
                goToTopPage();
                return;
            }
            const imageUrls = currentQuiz.filter(q => q.image).map(q => q.image);
            await preloadImages(imageUrls, (loaded, total, filename) => {
                const percentage = total > 0 ? (loaded / total) * 100 : 0;
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `画像を、読み込み中... (${loaded}/${total}) ${filename || ''}`;
            });
            progressText.textContent = 'クイズを、開始します...';
            await new Promise(resolve => setTimeout(resolve, 200));
            topPageContainer.style.display = 'none';
            quizContainers.forEach(container => container.style.display = 'none');
            startFunction();
        } catch (error) {
            console.error("クイズの開始に失敗しました:", error);
            alert("クイズの開始に失敗しました。トップページに戻ります。");
            goToTopPage();
        } finally {
            loaderWrapper.style.display = 'none';
        }
    }

    // --- 画像プリロード関数 ---
    function preloadImages(urls, onProgress) {
        let loadedCount = 0;
        const totalCount = urls.length;
        if (totalCount === 0) {
            if (onProgress) onProgress(1, 1, "画像なし");
            return Promise.resolve([]);
        }
        if (onProgress) onProgress(0, totalCount, '');
        const promises = urls.map(url => {
            return new Promise((resolve) => {
                const img = new Image();
                img.onload = () => { loadedCount++; if (onProgress) onProgress(loadedCount, totalCount, url.split('/').pop()); resolve({ url, status: 'ok' }); };
                img.onerror = () => { loadedCount++; console.warn(`Warning: Failed to load image: ${url}`); if (onProgress) onProgress(loadedCount, totalCount, url.split('/').pop()); resolve({ url, status: 'error' }); };
                img.src = url;
            });
        });
        return Promise.all(promises);
    }

    // --- 各種クイズ開始・表示関数 ---
    function startChoujuuQuiz() { startQuiz('choujuu', 'all', () => { quizContainerChoujuu.style.display = 'block'; showChoujuuQuestion(); }); }
    function startNormalQuiz(categoryKey, mode = 'all') { startQuiz(categoryKey, mode, () => { quizContainer.style.display = 'block'; showNormalQuestion(); }); }

    function startTrainingMode() {
        currentQuizMode = 'training';
        const uniqueWrongQuestions = [...new Map(wrongQuestions.map(item => [item.name || item.question, item])).values()];
        currentQuiz = uniqueWrongQuestions.sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        score = 0;
        wrongQuestions = [];
        resultContainer.style.display = 'none';
        if (currentQuizCategoryKey === 'choujuu') {
            quizContainerChoujuu.style.display = 'block';
            showChoujuuQuestion();
        } else {
            quizContainer.style.display = 'block';
            showNormalQuestion();
        }
    }

    function showChoujuuQuestion() {
        // --- 進捗バーの更新 (変更なし) ---
        const progressPercentage = (currentQuestionIndex / currentQuiz.length) * 100;
        const progressBarEl = document.getElementById('choujuu-quiz-progress-bar');
        const progressTextEl = document.getElementById('choujuu-quiz-progress-text');
        if (progressBarEl) progressBarEl.style.width = `${progressPercentage}%`;
        if (progressTextEl) progressTextEl.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;

        // --- 表示リセット ---
        choujuuStep1.style.display = 'block';
        choujuuStep2.style.display = 'none';
        choujuuFeedback.style.display = 'none';
        choujuuQuizNavigation.style.display = 'none';
        document.querySelectorAll('.choujuu-choice-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });

        // --- 問題データ取得 ---
        const question = currentQuiz[currentQuestionIndex];
        const userAnswer = userAnswers[currentQuestionIndex];
        if (question && question.image) choujuuImage.src = question.image;
        else choujuuImage.src = '';

        // ★★★ 解答済みの場合の復元処理を追加 ★★★
        if (userAnswer) {
            // --- Step1の復元 ---
            const step1Answer = userAnswer.step1;
            if (step1Answer) {
                document.querySelectorAll('.choujuu-choice-btn').forEach(btn => {
                    btn.disabled = true;
                    if (btn.dataset.choice === step1Answer.selected) {
                        btn.classList.add(step1Answer.isCorrect ? 'correct' : 'wrong');
                    }
                });

                // 正解が「獲れる」で、ユーザーも「獲れる」と答えていた場合 -> Step2へ
                if (question.isHuntable && step1Answer.isCorrect) {
                    choujuuStep1.style.display = 'none';
                    choujuuStep2.style.display = 'block';
                    setupNameSelectionForReview(question, userAnswer.step2); // 解答済み用の表示関数を呼ぶ
                } else {
                    // それ以外はフィードバック表示
                    const feedbackMessage = step1Answer.isCorrect
                        ? `正解！「${question.name}」は非狩猟鳥獣のため、捕獲できません。`
                        : (step1Answer.selected === 'yes'
                            ? `不正解。「${question.name}」は非狩猟鳥獣のため、捕獲できません。`
                            : `不正解。この鳥獣は「${question.name}」といい、狩猟対象です。`);
                    showChoujuuFeedback(step1Answer.isCorrect, feedbackMessage);
                }
            }
        }
        updateNavigationButtons();
    }

    function setupNameSelection(question) {
        choujuuNameOptions.innerHTML = '';
        const options = [...question.distractors, question.name].sort(() => Math.random() - 0.5);
        options.forEach((name, index) => {
            const button = document.createElement('button');
            button.innerText = `${index + 1}. ${name}`;
            button.classList.add('answer-btn');
            button.addEventListener('click', (e) => {
                const selectedButton = e.target;
                const isCorrect = (name === question.name);

            // ★★★ ここから修正・追加 ★★★
            const userAnswer = userAnswers[currentQuestionIndex];
            // step2の解答がまだ保存されていない場合のみ処理
            if (userAnswer && userAnswer.step2 === null) {
                userAnswer.step2 = {
                    selected: selectedButton.innerText,
                    isCorrect: isCorrect
                };

                if (isCorrect) {
                    playSound('correct'); // ★★★ 'correct' に修正 ★★★
                    score++;
                    showFeedbackAnimation(true);
                } else {
                    playSound('wrong'); // ★★★ 'wrong' に修正 ★★★
                    // wrongQuestionsへの追加はstep1で既に行っているので不要
                    showFeedbackAnimation(false);
                }
            }
            // ★★★ ここまで修正・追加 ★★★

                Array.from(choujuuNameOptions.children).forEach(btn => {
                    btn.disabled = true;
                    if (btn.innerText.endsWith(question.name) && !isCorrect && btn !== selectedButton) btn.classList.add('reveal-correct');
                });
                selectedButton.classList.add(isCorrect ? 'correct' : 'wrong');
                setTimeout(() => showChoujuuFeedback(isCorrect, isCorrect ? `正解！これは${question.name}です。` : `不正解。正しくは${question.name}です。`), 500);
            });
            choujuuNameOptions.appendChild(button);
        });
    }

    function setupNameSelectionForReview(question, step2Answer) {
        choujuuNameOptions.innerHTML = '';
        const options = [...question.distractors, question.name].sort(() => Math.random() - 0.5);

        options.forEach((name, index) => {
            const button = document.createElement('button');
            const buttonText = `${index + 1}. ${name}`;
            button.innerText = buttonText;
            button.classList.add('answer-btn');
            button.disabled = true; // 全てのボタンを非活性に

            if (name === question.name) {
                button.classList.add('reveal-correct'); // 正解をハイライト
            }
            if (step2Answer && step2Answer.selected === buttonText) {
                button.classList.add(step2Answer.isCorrect ? 'correct' : 'wrong'); // ユーザーの選択に色付け
            }
            choujuuNameOptions.appendChild(button);
        });

        const feedbackMessage = step2Answer.isCorrect
            ? `正解！これは${question.name}です。`
            : `不正解。正しくは${question.name}です。`;
        showChoujuuFeedback(step2Answer.isCorrect, feedbackMessage);
    }

    function showChoujuuFeedback(isCorrect, message) {
        choujuuFeedback.textContent = message;
        choujuuFeedback.className = 'feedback-container';
        choujuuFeedback.classList.add(isCorrect ? 'correct' : 'wrong');
        choujuuQuizNavigation.style.display = 'flex'; // 新しいナビゲーションを表示
        updateNavigationButtons(); // ボタンの状態を更新
    }

    function showNormalQuestion() {
        if (currentQuizMode === 'training') {
            const progressTextEl = document.getElementById('normal-quiz-progress-text');
            if (progressTextEl) progressTextEl.textContent = '💪 特訓中！';
            const progressBarEl = document.getElementById('normal-quiz-progress-bar');
            if (progressBarEl) progressBarEl.style.width = '100%';
        } else {
            const progressPercentage = (currentQuestionIndex / currentQuiz.length) * 100;
            const progressBarEl = document.getElementById('normal-quiz-progress-bar');
            const progressTextEl = document.getElementById('normal-quiz-progress-text');
            if (progressBarEl) progressBarEl.style.width = `${progressPercentage}%`;
            if (progressTextEl) progressTextEl.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;
        }

        resetNormalState();
        const question = currentQuiz[currentQuestionIndex];
        const userAnswer = userAnswers[currentQuestionIndex];

        if (question.image) { normalQuizImage.src = question.image; normalQuizImageContainer.style.display = 'block'; }
        else normalQuizImageContainer.style.display = 'none';
        questionElement.innerText = question.question;

        // --- 選択肢の生成と表示 ---
            const answers = (userAnswer && currentQuizMode !== 'training') 
                ? question.answers // 解答済みの場合は元の順番で表示
                : [...question.answers].sort(() => Math.random() - 0.5); // 未解答の場合はシャッフル

            answers.forEach((answer, index) => {
                const button = document.createElement('button');
                const buttonText = `${index + 1}. ${answer.text}`;
                button.innerText = buttonText;
                button.classList.add('answer-btn');
                if (answer.correct) button.dataset.correct = answer.correct;

                // ★★★ 解答済みの場合の処理を追加 ★★★
                if (userAnswer) {
                    button.disabled = true; // 解答済みならボタンは非活性
                    if (answer.correct) {
                        button.classList.add('reveal-correct'); // 正解をハイライト
                    }
                    if (userAnswer.selected === buttonText) {
                        button.classList.add(userAnswer.isCorrect ? 'correct' : 'wrong'); // ユーザーの選択に色付け
                    }
                } else {
                    button.addEventListener('click', selectNormalAnswer); // 未解答の場合のみイベントリスナーを追加
                }
                answerButtonsElement.appendChild(button);
            });

            // ★★★ ナビゲーション表示ロジックの追加 ★★★
            if (userAnswer) {
                if (question.additionalInfo) {
                    additionalInfoText.innerText = question.additionalInfo;
                    additionalInfoContainer.style.display = 'block';
                }
                normalQuizNavigation.style.display = 'flex';
            }
            updateNavigationButtons();
        }

    function resetNormalState() {
        normalQuizNavigation.style.display = 'none';
        additionalInfoContainer.style.display = 'none';
        normalQuizImageContainer.style.display = 'none';
        while (answerButtonsElement.firstChild) answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }

    function selectNormalAnswer(e) {
        const selectedButton = e.target;
        const isCorrect = selectedButton.dataset.correct === "true";
        const question = currentQuiz[currentQuestionIndex];

        if (userAnswers[currentQuestionIndex] === null) {
            userAnswers[currentQuestionIndex] = {
                selected: selectedButton.innerText,
                correct: question.answers.find(ans => ans.correct).text,
                isCorrect: isCorrect
            };

            if (isCorrect) {
            playSound('correct'); // ★★★ 'correct' に修正 ★★★
            score++;
            showFeedbackAnimation(true);
            } else {
            playSound('wrong'); // ★★★ 'wrong' に修正 ★★★
            wrongQuestions.push(JSON.parse(JSON.stringify(question)));
            showFeedbackAnimation(false);
            }
        }

        Array.from(answerButtonsElement.children).forEach(button => {
            button.disabled = true;
            if (button.dataset.correct === "true" && !isCorrect && button !== selectedButton) button.classList.add('reveal-correct');
        });
        selectedButton.classList.add(isCorrect ? 'correct' : 'wrong');
        if (question.additionalInfo) { additionalInfoText.innerText = question.additionalInfo; additionalInfoContainer.style.display = 'block'; }
        
        
        setTimeout(() => {
            normalQuizNavigation.style.display = 'flex'; // 新しいナビゲーションを表示
            updateNavigationButtons(); // ボタンの状態を更新
        }, 500);
    }

    function updateNavigationButtons() {
        const isNormalQuiz = currentQuizCategoryKey !== 'choujuu';
        const prevBtn = isNormalQuiz ? prevNormalQuestionBtn : prevChoujuuQuestionBtn;
        const nextBtn = isNormalQuiz ? nextNormalQuestionBtn : nextChoujuuQuestionBtn;

        if (!prevBtn || !nextBtn) return;

        // 「前へ」ボタンの状態制御
        prevBtn.disabled = currentQuestionIndex === 0;

        // 「次へ」ボタンのテキストと状態制御
        if (currentQuestionIndex === currentQuiz.length - 1) {
            nextBtn.innerText = '結果を見る ＞';
        } else {
            nextBtn.innerText = '次の問題へ ＞';
        }
        
        // 特訓モードでは常に有効
        if (currentQuizMode === 'training') {
            nextBtn.innerText = '次の特訓へ ＞';
            nextBtn.disabled = false;
        }
    }

    // ★★★ ここから新しい関数を追加 ★★★
    function handleRetire() {
        // 解答済みの問題数をカウント
        const answeredCount = userAnswers.filter(answer => answer !== null).length;

        // 1問も解答していない場合は、何もせずトップに戻る
        if (answeredCount === 0) {
            goToTopPage();
            return;
        }

        // 確認ダイアログを表示
        if (!confirm('クイズの途中です。ここまでの結果を保存してトップに戻りますか？\n（未解答の問題は不正解として扱われます）')) {
            return; // キャンセルされたら何もしない
        }

        // --- スコア計算 ---
        // 現在のスコアは、正しく解答した問題の数
        const finalScore = score; 
        const totalQuestions = currentQuiz.length;
        const percentage = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 0;

        // --- ハイスコア更新処理 (showResult関数から流用) ---
        if (currentQuizMode !== 'training') {
            const scores = getScoresFromStorage();
            const storageKeyForMode = (currentQuizMode === 'all') ? currentQuizCategoryKey : `${currentQuizCategoryKey}-${currentQuizMode}`;
            const currentModeScores = scores[storageKeyForMode] || { highScore: 0, cleared: false };

            // 今回のスコアがハイスコアを上回っていれば更新
            if (percentage > currentModeScores.highScore) {
                currentModeScores.highScore = percentage;
                scores[storageKeyForMode] = currentModeScores;
                saveScoresToStorage(scores);
            }
        }
        
        // UIを更新してからトップページへ戻る
        updateTopPageUI();
        goToTopPage();
    }
    // ★★★ ここまで追加 ★★★

    function showResult() {
        quizContainers.forEach(container => container.style.display = 'none');
        resultContainer.style.display = 'block';
        const totalQuestions = currentQuiz.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
        if (currentQuizMode !== 'training') {
            const scores = getScoresFromStorage();
            const storageKeyForMode = (currentQuizMode === 'all') ? currentQuizCategoryKey : `${currentQuizCategoryKey}-${currentQuizMode}`;
            const currentModeScores = scores[storageKeyForMode] || { highScore: 0, cleared: false };
            if (percentage > currentModeScores.highScore) currentModeScores.highScore = percentage;
            if (percentage === 100) currentModeScores.cleared = true;
            scores[storageKeyForMode] = currentModeScores;
            saveScoresToStorage(scores);
        }
        resultScore.textContent = `正答率: ${percentage}% (${score}/${totalQuestions}問)`;
        if (percentage === 100) resultMessage.textContent = '素晴らしい！全問正解です！';
        else if (percentage >= 80) resultMessage.textContent = 'お見事！あと一歩です！';
        else if (percentage >= 50) resultMessage.textContent = 'お疲れ様でした！';
        else resultMessage.textContent = 'もう少し頑張りましょう！';

        if (wrongQuestions.length > 0) {
            resultDetailsSection.style.display = 'block';
            trainingModeBtn.style.display = 'inline-block';
            wrongQuestionsList.innerHTML = '';
            // 特訓モード用に保存したオブジェクトからおさらいリストを生成
            const uniqueWrongQuestions = [...new Map(wrongQuestions.map(item => [item.name || item.question, item])).values()];
            uniqueWrongQuestions.forEach(item => {
                const li = document.createElement('li');
                const questionText = item.question || `この鳥獣（${item.name}）は獲れますか？`;
                const correctAnswerText = item.answers ? item.answers.find(a => a.correct).text : (item.isHuntable ? '獲れます' : '獲れません');
                let additionalInfoHTML = item.additionalInfo ? `<div class="wrong-question-additional-info">${String(item.additionalInfo).replace(/\n/g, ' ')}</div>` : '';
                li.innerHTML = `<div class="question-text">${questionText}</div><div class="correct-answer-text">正解: ${correctAnswerText}</div>${additionalInfoHTML}`;
                wrongQuestionsList.appendChild(li);
            });
        } else {
            resultDetailsSection.style.display = 'none';
            trainingModeBtn.style.display = 'none';
        }
    }

    function handleNumericKeyPress(number) {
        const isChoujuuQuiz = quizContainerChoujuu.style.display === 'block';
        let targetButtons = isChoujuuQuiz ? (choujuuStep1.style.display === 'block' ? choujuuStep1.querySelectorAll('.choujuu-choice-btn') : choujuuNameOptions.querySelectorAll('.answer-btn')) : answerButtonsElement.querySelectorAll('.answer-btn');
        if (targetButtons && targetButtons.length >= number && !targetButtons[number - 1].disabled) targetButtons[number - 1].click();
    }

    function handleEnterKeyPress() {
        const visibleSubmitButton = document.querySelector('#submit:not([style*="display: none"]), #choujuu-submit:not([style*="display: none"])');
        if (visibleSubmitButton) visibleSubmitButton.click();
    }

    // --- キーボードイベントリスナー ---
    document.addEventListener('keydown', (event) => {
        const isQuizActive = quizContainer.style.display === 'block' || quizContainerChoujuu.style.display === 'block';
        if (!isQuizActive) return;
        switch (event.key) {
            case '1': case '2': case '3': case '4': handleNumericKeyPress(parseInt(event.key, 10)); break;
            case ' ': case 'Enter': handleEnterKeyPress(); break;
            case 'Escape':
                const backButton = document.querySelector('.quiz-container:not([style*="display: none"]) .back-to-top-btn, .quiz-container-choujuu:not([style*="display: none"]) .back-to-top-btn');
                if (backButton) backButton.click();
                break;
        }
    });

    // --- アプリケーション初期化処理 ---
    async function initializeApp() { // ★★★ asyncを追加 ★★★
        await loadSoundList(); // ★★★ この行を追加 ★★★
        initializeEventListeners();
        updateTopPageUI();
        goToTopPage();
        loaderWrapper.style.display = 'none';
    }

    // --- 初期化処理の実行 ---
    initializeApp();
};


