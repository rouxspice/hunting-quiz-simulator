// ===================================================================
// ★★★ script.js (2025/09/06 最終修正版) ★★★
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
    
    function updateTopPageUI() {
        const scores = getScoresFromStorage();
        document.querySelectorAll('.quiz-card').forEach(card => {
            const category = card.dataset.quizCategory;

            if (category === 'sushi') {
                const footer = card.querySelector('.quiz-card-footer-sushi');
                if (!footer) return;
                footer.innerHTML = ''; 

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

            } else {
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
        let fileName;

        // ★★★ ここから修正 ★★★
        // カテゴリとモードに基づいてファイル名を決定する
        if (categoryKey === 'sushi') {
            // 'sushi'カテゴリの場合、モード名をファイル名に直接利用する
            // 例: modeが'basic1'なら、'sushi_basic1.json'となる
            fileName = `sushi_${mode}.json`;
        } else {
            // その他のカテゴリは、従来通りのファイル名
            fileName = `${categoryKey}.json`;
        }
        // ★★★ ここまで修正 ★★★

        try {
            const response = await fetch(`./quiz_data/${fileName}`);
            if (!response.ok) { throw new Error(`Failed to fetch quiz_data/${fileName}. Status: ${response.status}`); }
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
        // loadQuizDataが空配列を返した場合（読み込み失敗時）の処理
        if (originalQuizData.length === 0) {
            currentQuiz = [];
            return; // ここで処理を中断
        }
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
 
        if (soundToggleCheckbox) {
            const isSoundEnabled = localStorage.getItem('soundEnabled') !== 'false';
            soundToggleCheckbox.checked = isSoundEnabled;
            soundToggleCheckbox.addEventListener('change', () => {
                localStorage.setItem('soundEnabled', soundToggleCheckbox.checked);
            });
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
            if (backBtn) {
                backBtn.addEventListener('click', goToTopPage);
            }
        });

        if (retryQuizBtn) {
            retryQuizBtn.addEventListener('click', () => {
                if (currentQuizCategoryKey === 'choujuu') {
                    startChoujuuQuiz();
                } else {
                    startNormalQuiz(currentQuizCategoryKey, currentQuizMode);
                }
            });
        }

        if (backToTopFromResultBtn) {
            backToTopFromResultBtn.addEventListener('click', goToTopPage);
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
                    if (currentQuestionIndex < currentQuiz.length) {
                        showNormalQuestion();
                    } else {
                        showResult();
                    }
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
                    if (currentQuestionIndex < currentQuiz.length) {
                        showChoujuuQuestion();
                    } else {
                        showResult();
                    }
                }       
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

    function startTrainingMode() {
        currentQuizMode = 'training';
        currentQuiz = JSON.parse(JSON.stringify(wrongQuestions));
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

    function startNormalQuiz(categoryKey, mode = 'all') {
        startQuiz(categoryKey, mode, () => {
            quizContainer.style.display = 'block';
            showNormalQuestion();
        });
    }

    // --- 鳥獣判別クイズ表示 ---
    function showChoujuuQuestion() {
        const progressPercentage = (currentQuestionIndex / currentQuiz.length) * 100;
        const progressBarEl = document.getElementById('choujuu-quiz-progress-bar');
        const progressTextEl = document.getElementById('choujuu-quiz-progress-text');

        if(progressBarEl) progressBarEl.style.width = `${progressPercentage}%`;
        if(progressTextEl) progressTextEl.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;

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
        options.forEach((name, index) => {
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
                    if (btn.innerText.endsWith(question.name)) {
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
        if (currentQuizMode === 'training') {
            const progressTextEl = document.getElementById('normal-quiz-progress-text');
            if(progressTextEl) progressTextEl.textContent = '💪 特訓中！';
            const progressBarEl = document.getElementById('normal-quiz-progress-bar');
            if(progressBarEl) progressBarEl.style.width = '100%';
        } else {
            const progressPercentage = (currentQuestionIndex / currentQuiz.length) * 100;
            const progressBarEl = document.getElementById('normal-quiz-progress-bar');
            const progressTextEl = document.getElementById('normal-quiz-progress-text');
            if(progressBarEl) progressBarEl.style.width = `${progressPercentage}%`;
            if(progressTextEl) progressTextEl.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;
        }

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
        shuffledAnswers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.innerText = `${index + 1}. ${answer.text}`;
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
            if (currentQuizMode === 'training') {
                submitButton.innerText = "次の特訓へ";
            } else {
                submitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る";
            }
            submitButton.style.display = 'block';
        }, 500);
    }

    // --- 結果表示 ---
    function showResult() {
        quizContainers.forEach(container => container.style.display = 'none');
        resultContainer.style.display = 'block';
        const totalQuestions = currentQuiz.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

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

    document.addEventListener('keydown', (event) => {
        const isQuizActive = quizContainer.style.display === 'block' || quizContainerChoujuu.style.display === 'block';
        if (!isQuizActive) return;

        switch (event.key) {
            case '1': case '2': case '3': case '4':
                handleNumericKeyPress(parseInt(event.key, 10));
                break;
            case ' ': case 'Enter':
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

    // --- 初期化処理の、実行 ---
    initializeEventListeners();
    goToTopPage();

    setTimeout(() => {
        if (loaderWrapper) {
            loaderWrapper.classList.add('loaded');
        }
    }, 100); 
};
