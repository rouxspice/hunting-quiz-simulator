// ===================================================================
// ★★★ script.js (真・完全再構築・最終版) ★★★
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
    const normalQuizProgress = document.getElementById('normal-quiz-progress');
    const choujuuQuizProgress = document.getElementById('choujuu-quiz-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const soundToggleCheckbox = document.getElementById('sound-toggle-checkbox');
    
    // --- 音声ファイルの読み込み ---
    const correctSound = new Audio('sounds/correct.mp3');
    const wrongSound = new Audio('sounds/incorrect.mp3');
    correctSound.volume = 0.5;
    wrongSound.volume = 0.5;
    /**
     * 設定に応じて効果音を再生する関数
     * @param {HTMLAudioElement} sound - 再生するAudioオブジェクト
     */
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
    function updateTopPageUI() {
        const scores = getScoresFromStorage();
        document.querySelectorAll('.quiz-card').forEach(card => {
            const category = card.dataset.quizCategory;

            // ★★★ 寿司クイズカードの特別な処理 ★★★
            if (category === 'sushi') {
                const footer = card.querySelector('.quiz-card-footer-sushi');
                if (!footer) return;
                footer.innerHTML = ''; // 中身を一旦空にする

                const modes = [
                    { mode: 'basic3', text: 'ベーシック３級', class: '' },
                    { mode: 'basic2', text: 'ベーシック２級', class: '' },
                    { mode: 'basic1', text: 'ベーシック１級', class: '' },
                    { mode: 'maniac', text: 'マニアック', class: 'cram-mode-btn' }
                ];

                modes.forEach(item => {
                    const storageKeyForMode = `${category}-${item.mode}`;
                    const modeScores = scores[storageKeyForMode] || { highScore: 0, cleared: false };
                    
                    const buttonHTML = `
                        <button class="challenge-btn-sushi ${item.class}" data-mode="${item.mode}">
                            <span class="sushi-btn-label">${item.text}</span>
                            <span class="sushi-btn-score">
                                達成率 ${modeScores.highScore}% ${modeScores.cleared ? '👑' : ''}
                            </span>
                        </button>
                    `;
                    footer.innerHTML += buttonHTML;
                });

            } else { // ★★★ 寿司クイズ以外のカードの処理 ★★★
                const buttons = card.querySelectorAll('.challenge-btn');
                if (buttons.length === 1 && !buttons[0].dataset.mode) {
                    const categoryScores = scores[category] || { highScore: 0, cleared: false };
                    const highScoreEl = card.querySelector('.quiz-card-highscore');
                    const clearMarkEl = card.querySelector('.quiz-card-clear-mark');
                    if (highScoreEl) highScoreEl.textContent = `ハイスコア: ${categoryScores.highScore}%`;
                    if (clearMarkEl) clearMarkEl.textContent = categoryScores.cleared ? '👑' : '';
                } 
                else if (buttons.length > 0) {
                    let highScoreText = '';
                    buttons.forEach(button => {
                        const mode = button.dataset.mode;
                        const storageKeyForMode = `${category}-${mode}`;
                        const modeScores = scores[storageKeyForMode] || { highScore: 0, cleared: false };
                        const modeName = button.textContent;
                        highScoreText += `<div>${modeName}: ${modeScores.highScore}% ${modeScores.cleared ? '👑' : ''}</div>`;
                    });
                    const highScoreEl = card.querySelector('.quiz-card-highscore');
                    if (highScoreEl) highScoreEl.innerHTML = highScoreText;
                    const clearMarkEl = card.querySelector('.quiz-card-clear-mark');
                    if (clearMarkEl) clearMarkEl.textContent = '';
                }
            }
        });
    }

    // --- 画像プリロード関数 ---
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
                img.onerror = () => { loadedCount++; console.warn(`Warning: Failed to load image, but continuing. URL: ${url}`); if(onProgress) onProgress(loadedCount, totalCount, url.split('/').pop()); resolve({ url, status: 'error' }); };
                img.src = url;
            });
        });
        return Promise.all(promises);
    }

    // --- 汎用関数 ---
    function goToTopPage() {
        quizContainers.forEach(container => container.style.display = 'none');
        resultContainer.style.display = 'none';
        topPageContainer.style.display = 'block';
        updateTopPageUI();
    }

    // --- クイズデータ読み込み＆状態リセット ---
    async function loadQuizData(categoryKey, mode = 'all') {
        // デフォルトのファイル名を決定
        let fileName = `${categoryKey}.json`;

        // 寿司クイズの場合、モードによってファイル名を変更
        if (categoryKey === 'sushi') {
            if (mode === 'basic1') {
                fileName = 'sushi_basic1.json';
            } else if (mode === 'basic2') {
                fileName = 'sushi_basic2.json';
            } else if (mode === 'basic3') {
                fileName = 'sushi_basic3.json';
            } else if (mode === 'maniac') {
                fileName = 'sushi_maniac.json';
            }
        }

        try {
            const response = await fetch(`quiz_data/${fileName}`);
            if (!response.ok) { throw new Error(`Failed to fetch quiz_data/${fileName}. Status: ${response.status}`); }
            const data = await response.json();
            console.log(`Successfully loaded quiz data for '${categoryKey}' (mode: ${mode}) from external JSON: ${fileName}`);
            return data;
        } catch (error) {
            console.warn(`Could not load from quiz_data/${fileName}. Reason: ${error.message}.`);
            return [];
        }
    }

    async function resetQuizState(categoryKey, mode = 'all') {
        currentQuizCategoryKey = categoryKey;
        currentQuizMode = mode;
        const originalQuizData = await loadQuizData(categoryKey, mode);
        let filteredData = originalQuizData.filter(q => q.question || q.image);
        if (mode === 'cram') {
            filteredData = filteredData.filter(q => q.importance === 'high');
        }
        currentQuiz = [...filteredData].sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        score = 0;
        wrongQuestions = [];
    }

    // --- イベントリスナー初期化 ---
    function initializeEventListeners() {
 
        // サウンド設定の読み込みとイベントリスナー
        if (soundToggleCheckbox) {
            // ページ読み込み時に保存された設定を反映
            const isSoundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // デフォルトはON
            soundToggleCheckbox.checked = isSoundEnabled;

            // トグルが変更されたら設定を保存
            soundToggleCheckbox.addEventListener('change', () => {
                localStorage.setItem('soundEnabled', soundToggleCheckbox.checked);
            });
        }
        
        if (quizOptionsContainer) {
            quizOptionsContainer.addEventListener('click', (event) => {
                const button = event.target.closest('.challenge-btn');
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
            if (backBtn) {
                backBtn.addEventListener('click', goToTopPage);
            }
        });

        if (retryQuizBtn) {
            retryQuizBtn.addEventListener('click', () => {
                if (currentQuizCategoryKey === 'choujuu') {
                    startChoujuuQuiz();
                } else {
                    // currentQuizMode を渡して、正しいモードでリトライするようにする
                    startNormalQuiz(currentQuizCategoryKey, currentQuizMode);
                }
            });
        }

        if (backToTopFromResultBtn) {
            backToTopFromResultBtn.addEventListener('click', goToTopPage);
        }

        // ★★★ ここから追加 ★★★
        if (trainingModeBtn) {
            trainingModeBtn.addEventListener('click', startTrainingMode);
        }
        // ★★★ ここまで追加 ★★★

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
                // ★★★ ここから変更 ★★★
                if (currentQuizMode === 'training') {
                    // 特訓モードの場合、ランダムに次の問題へ
                    currentQuestionIndex = Math.floor(Math.random() * currentQuiz.length);
                    showNormalQuestion();
                } else {
                    // 通常モードの場合
                    currentQuestionIndex++;
                    if (currentQuestionIndex < currentQuiz.length) {
                        showNormalQuestion();
                    } else {
                        showResult();
                    }
                }
                // ★★★ ここまで変更 ★★★
            });
        }

        if (choujuuSubmitButton) {
            choujuuSubmitButton.addEventListener('click', () => {
                // ★★★ ここから変更 ★★★
                if (currentQuizMode === 'training') {
                    // 特訓モードの場合、ランダムに次の問題へ
                    currentQuestionIndex = Math.floor(Math.random() * currentQuiz.length);
                showChoujuuQuestion();
            } else {
                    // 通常モードの場合
                    currentQuestionIndex++;
                    if (currentQuestionIndex < currentQuiz.length) {
                        showChoujuuQuestion();
                    } else {
                        showResult();
                    }
                }       
                // ★★★ ここまで変更 ★★★
    });
}

        if (choujuuStep1) {
            choujuuStep1.addEventListener('click', (e) => {
                if (!e.target.matches('.choujuu-choice-btn')) return;
                const selectedBtn = e.target;
                const choice = selectedBtn.dataset.choice;
                const question = currentQuiz[currentQuestionIndex];
                const isCorrect = (choice === 'no') ? !question.isHuntable : question.isHuntable;
                if (isCorrect) {
                    if (choice === 'no') { playSound(correctSound); score++; }
                } else {
                    playSound(wrongSound);
                }
                if (!isCorrect) { wrongQuestions.push({ question: `この鳥獣は「${question.name}」です。捕獲できますか？`, correctAnswer: question.isHuntable ? '獲れます' : '獲れません' }); }
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
        }


    }

    // --- クイズ開始ロジック ---
    async function startQuiz(categoryKey, mode, startFunction) {
        loaderWrapper.classList.remove('loaded');
        progressText.textContent = 'クイズデータを、読み込み中...';
        progressBar.style.width = '0%';
        try {
            await resetQuizState(categoryKey, mode);
            if (currentQuiz.length === 0) {
                alert('このモードで表示できる問題がありません。');
                goToTopPage();
                return;
            }
            const imageUrls = currentQuiz.filter(q => q.image).map(q => q.image);
            const onProgressCallback = (loaded, total, filename) => {
                const percentage = total > 0 ? (loaded / total) * 100 : 0;
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `画像を、読み込み中... (${loaded}/${total}) ${filename || ''}`;
            };
            await preloadImages(imageUrls, onProgressCallback);
            progressText.textContent = 'クイズを、開始します...';
            topPageContainer.style.display = 'none';
            quizContainers.forEach(container => container.style.display = 'none');
            startFunction();
        } catch (error) {
            console.error("クイズの開始に失敗しました:", error);
            alert("クイズの開始に失敗しました。トップページに戻ります。");
            goToTopPage();
        } finally {
            setTimeout(() => loaderWrapper.classList.add('loaded'), 200);
        }
    }

    function startChoujuuQuiz() {
        startQuiz('choujuu', 'all', () => {
            quizContainerChoujuu.style.display = 'block';
            showChoujuuQuestion();
        });
    }

            // ★★★ ここから追加 ★★★
        /**
         * 間違えた問題だけで特訓モードを開始する
         */
        function startTrainingMode() {
            // 現在のクイズタイプとモードを「特訓」に設定
            currentQuizMode = 'training';
            
            // 間違えた問題のリストを現在のクイズセットとして設定
            // 各問題オブジェクトをディープコピーして、元の配列に影響が出ないようにする
            currentQuiz = JSON.parse(JSON.stringify(wrongQuestions));
            
            // 状態をリセット
            currentQuestionIndex = 0;
            score = 0;
            wrongQuestions = []; // 特訓モードでの間違いは、ここでは記録しない

            // クイズ画面を表示
            resultContainer.style.display = 'none';
            
            // クイズの種類に応じて適切な画面を表示
            if (currentQuizCategoryKey === 'choujuu') {
                quizContainerChoujuu.style.display = 'block';
                showChoujuuQuestion();
            } else {
                quizContainer.style.display = 'block';
                showNormalQuestion();
            }
        }
        // ★★★ ここまで追加 ★★★


    function startNormalQuiz(categoryKey, mode = 'all') {
        startQuiz(categoryKey, mode, () => {
            quizContainer.style.display = 'block';
            showNormalQuestion();
        });





    }

    // --- 鳥獣判別クイズ表示 ---
    function showChoujuuQuestion() {
    // ★ここから変更・追加★
    const progressPercentage = (currentQuestionIndex / currentQuiz.length) * 100;
    const progressBarEl = document.getElementById('choujuu-quiz-progress-bar'); // IDを修正
    const progressTextEl = document.getElementById('choujuu-quiz-progress-text'); // IDを修正

    if(progressBarEl) progressBarEl.style.width = `${progressPercentage}%`;
    if(progressTextEl) progressTextEl.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;
    // ★ここまで変更・追加★

    // 元の進捗表示テキストを削除（またはコメントアウト）
    // choujuuQuizProgress.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;

    document.querySelectorAll('.choujuu-choice-btn').forEach(btn => { btn.disabled = false; btn.classList.remove('correct', 'wrong'); });
    choujuuStep1.style.display = 'block';
        choujuuStep2.style.display = 'none';
        choujuuFeedback.style.display = 'none';
        choujuuSubmitButton.style.display = 'none';
        const question = currentQuiz[currentQuestionIndex];
        if (question && question.image) {
            choujuuImage.src = question.image;
        } else {
            choujuuImage.src = '';
        }
    }

    function setupNameSelection(question) {
        choujuuNameOptions.innerHTML = '';
        const options = [...question.distractors, question.name].sort(() => Math.random() - 0.5);
        options.forEach((name, index) => { // ← (name, index) のように index を受け取る
            const button = document.createElement('button');
            button.innerText = `${index + 1}. ${name}`; 
            button.classList.add('answer-btn');
            button.addEventListener('click', (e) => {
                const selectedButton = e.target;
                const isCorrect = (name === question.name);
                if (isCorrect) {
                    playSound(correctSound);
                    score++;
                } else {
                    playSound(wrongSound);
                    wrongQuestions.push({ question: `この鳥獣（${question.name}）の名前は？`, correctAnswer: question.name });
                }
                Array.from(choujuuNameOptions.children).forEach(btn => {
                    btn.disabled = true;
                    if (btn.innerText === question.name) {
                        if (!isCorrect && btn !== selectedButton) {
                            btn.classList.add('reveal-correct');
                        }
                    }
                });
                selectedButton.classList.add(isCorrect ? 'correct' : 'wrong');
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
        choujuuSubmitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る";
        choujuuSubmitButton.style.display = 'block';
    }

    // --- 通常クイズ表示 ---
    function showNormalQuestion() {
    
    // ★ここから変更・追加★
    if (currentQuizMode === 'training') {
        const progressTextEl = document.getElementById('normal-quiz-progress-text');
        if(progressTextEl) progressTextEl.textContent = '💪 特訓中！';
        // 特訓モードではプログレスバーを非表示にするか、満タン表示にする
        const progressBarEl = document.getElementById('normal-quiz-progress-bar');
        if(progressBarEl) progressBarEl.style.width = '100%';
    } else {
        const progressPercentage = (currentQuestionIndex / currentQuiz.length) * 100;
        const progressBarEl = document.getElementById('normal-quiz-progress-bar');
        const progressTextEl = document.getElementById('normal-quiz-progress-text');
        if(progressBarEl) progressBarEl.style.width = `${progressPercentage}%`;
        if(progressTextEl) progressTextEl.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;
    }
    // ★★★ ここまで変更 ★★★

    resetNormalState();
        const question = currentQuiz[currentQuestionIndex];
        if (question.image) {
            normalQuizImage.src = question.image;
            normalQuizImageContainer.style.display = 'block';
        } else {
            normalQuizImageContainer.style.display = 'none';
        }
        questionElement.innerText = question.question;
        const shuffledAnswers = [...question.answers].sort(() => Math.random() - 0.5);
        shuffledAnswers.forEach((answer, index) => { // ← index を受け取る
            const button = document.createElement('button');
            // ★★★ ここを変更 ★★★
            button.innerText = `${index + 1}. ${answer.text}`; // 番号とドット、スペースを追加
            // ★★★ ここまで ★★★
            button.classList.add('answer-btn');
            if (answer.correct) {
                button.dataset.correct = answer.correct;
            }
            button.addEventListener('click', selectNormalAnswer);
            answerButtonsElement.appendChild(button);
        });
    }

    function resetNormalState() {
        submitButton.style.display = 'none';
        additionalInfoContainer.style.display = 'none';
        normalQuizImageContainer.style.display = 'none';
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
    }

    function selectNormalAnswer(e) {
        const selectedButton = e.target;
        const isCorrect = selectedButton.dataset.correct === "true";
        const question = currentQuiz[currentQuestionIndex];
        if (isCorrect) {
            playSound(correctSound);
            score++;
        } else {
            playSound(wrongSound);
            const correctAnswer = question.answers.find(ans => ans.correct).text;
            wrongQuestions.push({ question: question.question, correctAnswer: correctAnswer, additionalInfo: question.additionalInfo, answers: question.answers });
        }
        Array.from(answerButtonsElement.children).forEach(button => {
            button.disabled = true;
            if (button.dataset.correct === "true") {
                if (!isCorrect && button !== selectedButton) {
                    button.classList.add('reveal-correct');
                }
            }
        });
        selectedButton.classList.add(isCorrect ? 'correct' : 'wrong');
        if (question.additionalInfo) {
            additionalInfoText.innerText = question.additionalInfo;
            additionalInfoContainer.style.display = 'block';
        }
        setTimeout(() => {
            // ★★★ ここから変更 ★★★
            if (currentQuizMode === 'training') {
                submitButton.innerText = "次の特訓へ";
            } else {
                submitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る";
            }
            // ★★★ ここまで変更 ★★★
            submitButton.style.display = 'block';
        }, 500);
    }

    // --- 結果表示 ---
    function showResult() {
        quizContainers.forEach(container => container.style.display = 'none');
        resultContainer.style.display = 'block';
        const totalQuestions = currentQuiz.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        // ★★★ ここから追加 ★★★
        // 特訓モードでない場合のみ、スコアを保存する
        if (currentQuizMode !== 'training') {
            const scores = getScoresFromStorage();
            const storageKeyForMode = `${currentQuizCategoryKey}-${currentQuizMode}`;
            
            const currentModeScores = scores[storageKeyForMode] || { highScore: 0, cleared: false };
            if (percentage > currentModeScores.highScore) {
                currentModeScores.highScore = percentage;
            }
            if (percentage === 100) {
                currentModeScores.cleared = true;
            }
            scores[storageKeyForMode] = currentModeScores;
            saveScoresToStorage(scores);
        }
        
        resultScore.textContent = `正答率: ${percentage}% (${score}/${totalQuestions}問)`;
        if (percentage === 100) { resultMessage.textContent = '素晴らしい！全問正解です！'; }
        else if (percentage >= 80) { resultMessage.textContent = 'お見事！あと一歩です！'; }
        else if (percentage >= 50) { resultMessage.textContent = 'お疲れ様でした！'; }
        else { resultMessage.textContent = 'もう少し頑張りましょう！'; }
        if (wrongQuestions.length > 0) {
            resultDetailsSection.style.display = 'block';
            trainingModeBtn.style.display = 'inline-block'; 
            wrongQuestionsList.innerHTML = '';
            wrongQuestions.forEach(item => {
                const li = document.createElement('li');
                let additionalInfoHTML = '';
                if (item.additionalInfo) {
                  additionalInfoHTML = `<div class="wrong-question-additional-info">${String(item.additionalInfo).replace(/\n/g, ' ')}</div>`;
                }
                li.innerHTML = ` <div class="question-text">${item.question}</div> <div class="correct-answer-text">正解: ${item.correctAnswer}</div> ${additionalInfoHTML} `;
                wrongQuestionsList.appendChild(li);
            });
        } else {
            resultDetailsSection.style.display = 'none';
            trainingModeBtn.style.display = 'none';
        }
    }
        // ★★★ ここからキーボード操作の処理関数を追加 ★★★

        /**
         * 数字キー（1-4）が押された時の処理
         * @param {number} number - 押された数字
         */
        function handleNumericKeyPress(number) {
            const isChoujuuQuiz = quizContainerChoujuu.style.display === 'block';
            let targetButtons;

            if (isChoujuuQuiz) {
                const isStep1 = choujuuStep1.style.display === 'block';
                targetButtons = isStep1 
                    ? choujuuStep1.querySelectorAll('.choujuu-choice-btn') 
                    : choujuuNameOptions.querySelectorAll('.answer-btn');
            } else {
                targetButtons = answerButtonsElement.querySelectorAll('.answer-btn');
            }

            if (targetButtons && targetButtons.length >= number) {
                const buttonToClick = targetButtons[number - 1];
                if (!buttonToClick.disabled) {
                    buttonToClick.click();
                }
            }
        }

        /**
         * Enterキーが押された時の処理
         */
        function handleEnterKeyPress() {
            const visibleSubmitButton = document.querySelector('#submit:not([style*="display: none"]), #choujuu-submit:not([style*="display: none"])');
            if (visibleSubmitButton) {
                visibleSubmitButton.click();
            }
        }

        // キーボード入力を監視するイベントリスナーを登録
        document.addEventListener('keydown', (event) => {
            const isQuizActive = quizContainer.style.display === 'block' || quizContainerChoujuu.style.display === 'block';
            if (!isQuizActive) return;

            switch (event.key) {
                case '1':
                case '2':
                case '3':
                case '4':
                    handleNumericKeyPress(parseInt(event.key, 10));
                    break;
                case ' ': // Spaceキーを追加
                case 'Enter':
                    handleEnterKeyPress();
                    break;
                case 'Escape':
                    const backButton = document.querySelector('.quiz-container:not([style*="display: none"]) .back-to-top-btn, .quiz-container-choujuu:not([style*="display: none"]) .back-to-top-btn');
                    if (backButton) {
                        backButton.click();
                    }
                    break;
            }
        });
        // ★★★ ここまでキーボード操作のロジック ★★★

    // --- キーボード操作 ---
    function handleNumericKeyPress(number) {
        const isChoujuuQuiz = quizContainerChoujuu.style.display === 'block';
        let targetButtons;
        if (isChoujuuQuiz) {
            const isStep1 = choujuuStep1.style.display === 'block';
            targetButtons = isStep1 ? choujuuStep1.querySelectorAll('.choujuu-choice-btn') : choujuuNameOptions.querySelectorAll('.answer-btn');
        } else {
            targetButtons = answerButtonsElement.querySelectorAll('.answer-btn');
        }
        if (targetButtons && targetButtons.length >= number) {
            const buttonToClick = targetButtons[number - 1];
            if (!buttonToClick.disabled) buttonToClick.click();
        }
    }

    function handleEnterKeyPress() {
        const visibleSubmitButton = document.querySelector('#submit:not([style*="display: none"]), #choujuu-submit:not([style*="display: none"])');
        if (visibleSubmitButton) visibleSubmitButton.click();
    }

    // --- 初期化処理の、実行 ---
    initializeEventListeners();
    goToTopPage();

    // ★★★ ここから追加 ★★★
    // ページの初期読み込みが完了したら、ローディング画面を非表示にする
    // 少し遅延させることで、表示のチラつきを防ぐ
    setTimeout(() => {
        if (loaderWrapper) {
            loaderWrapper.classList.add('loaded');
        }
    }, 100); 
    // ★★★ ここまで追加 ★★★
};