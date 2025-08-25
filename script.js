// ===================================================================
// ★★★ script.js パート１／２ 開始 ★★★
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
    const noWrongQuestionsMessage = document.getElementById('no-wrong-questions-message');
    const retryQuizBtn = document.getElementById('retry-quiz-btn');
    const backToTopFromResultBtn = document.getElementById('back-to-top-from-result-btn');
    const resetScoresBtn = document.getElementById('reset-scores-btn');
    const normalQuizImageContainer = document.getElementById('normal-quiz-image-container');
    const normalQuizImage = document.getElementById('normal-quiz-image');
    const additionalInfoContainer = document.getElementById('additional-info-container');
    const additionalInfoText = document.getElementById('additional-info-text');
    const resultDetailsSection = document.getElementById('result-details-section');
    const normalQuizProgress = document.getElementById('normal-quiz-progress');
    const choujuuQuizProgress = document.getElementById('choujuu-quiz-progress'); 

    // --- 音声ファイルの読み込み ---
    const correctSound = new Audio('sounds/correct.mp3');
    const wrongSound = new Audio('sounds/incorrect.mp3');
    correctSound.volume = 0.5;
    wrongSound.volume = 0.5;

    // --- クイズデータ (jyu1は削除し、他はフォールバック用に残す) ---
    const quizData = {};

    // --- 状態管理変数 ---
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
    
    // ===================================================================
    // ★★★ ここから、アーキテクチャ革命の、中核部分 ★★★
    // ===================================================================

    /**
     * 適応的ロード機能：指定されたカテゴリのクイズデータを、外部JSONファイルから非同期で読み込む。
     * 失敗した場合は、quizDataオブジェクト内の、従来のデータに、フォールバックする。
     * @param {string} categoryKey - 読み込むクイズのカテゴリキー (例: 'jyu1')
     * @returns {Promise<Array>} クイズデータの配列を解決するPromise
     */
    async function loadQuizData(categoryKey) {
        try {
            const response = await fetch(`quiz_data/${categoryKey}.json`);
            if (!response.ok) {
                // レスポンスがOKでない場合 (404 Not Foundなど) は、エラーを投げてcatchブロックに移行
                throw new Error(`Failed to fetch quiz_data/${categoryKey}.json. Status: ${response.status}`);
            }
            const data = await response.json();
            console.log(`Successfully loaded quiz data for '${categoryKey}' from external JSON.`);
            return data;
        } catch (error) {
            console.warn(`Could not load from quiz_data/${categoryKey}.json. Reason: ${error.message}. Falling back to internal data.`);
            // 外部ファイルの読み込みに失敗した場合、quizDataオブジェクトからデータを返す
            return quizData[categoryKey] || [];
        }
    }

    async function resetQuizState(categoryKey) {
        currentQuizCategoryKey = categoryKey;
        // ★★★ 適応的ロード機能を、ここで、呼び出す ★★★
        const originalQuizData = await loadQuizData(categoryKey);
        const validQuizData = originalQuizData.filter(q => q.question); 
        currentQuiz = [...validQuizData].sort(() => Math.random() - 0.5);
        currentQuestionIndex = 0;
        score = 0;
        wrongQuestions = [];
    }
    
    // ===================================================================
    // ★★★ ここまで、アーキテクチャ革命の、中核部分 ★★★
    // ===================================================================


    // --- イベントリスナーの初期化 ---
    if (quizOptionsContainer) {
        quizOptionsContainer.addEventListener('click', (event) => {
            const button = event.target.closest('.challenge-btn');
            if (!button) return;
            const quizCard = button.closest('.quiz-card');
            if (!quizCard) return;
            const quizCategoryKey = quizCard.dataset.quizCategory;
            if (quizCategoryKey === 'choujuu') {
                startChoujuuQuiz();
            } else {
                startNormalQuiz(quizCategoryKey);
            }
        });

        quizContainers.forEach(container => {
            container.addEventListener('click', (event) => {
                const button = event.target.closest('.back-to-top-btn');
                if (!button) return;
                event.stopPropagation();
                goToTopPage();
            });
        });

        if (retryQuizBtn) {
            retryQuizBtn.addEventListener('click', () => {
                if (currentQuizCategoryKey === 'choujuu') {
                    startChoujuuQuiz();
                } else {
                    startNormalQuiz(currentQuizCategoryKey);
                }
            });
        }
        if (backToTopFromResultBtn) {
            backToTopFromResultBtn.addEventListener('click', goToTopPage);
        }
    }
    quizContainers.forEach(container => { container.addEventListener('click', (event) => { const button = event.target.closest('.back-to-top-btn'); if (!button) return; goToTopPage(); }); });
    if (resetScoresBtn) {
        resetScoresBtn.addEventListener('click', () => {
            const isConfirmed = confirm('本当に、すべてのハイスコアをリセットしますか？この操作は、取り消せません。');
            if (isConfirmed) {
                localStorage.removeItem(storageKey);
                updateTopPageUI();
                alert('すべてのハイスコアがリセットされました。');
            }
        });
    }
    backToTopFromResultBtn.addEventListener('click', goToTopPage);
    resetScoresBtn.addEventListener('click', () => { const isConfirmed = confirm('本当に、すべてのハイスコアをリセットしますか？この操作は、取り消せません。'); if (isConfirmed) { localStorage.removeItem(storageKey); updateTopPageUI(); alert('すべてのハイスコアがリセットされました。'); } });

    // --- 鳥獣判別クイズ ロジック ---
    async function startChoujuuQuiz() { 
        await resetQuizState('choujuu'); // resetQuizStateが非同期になったため、awaitを使用
        loaderWrapper.classList.remove('loaded'); 
        try { 
            const imageUrls = currentQuiz.map(q => q.image); 
            await preloadImages(imageUrls); 
            topPageContainer.style.display = 'none'; 
            quizContainers.forEach(container => container.style.display = 'none'); 
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
// ===================================================================
// ★★★ script.js パート１／２ 終了 ★★★
// ===================================================================
// ===================================================================
// ★★★ script.js パート２／２ 開始 ★★★
// ===================================================================
    function showChoujuuQuestion() { 
        choujuuQuizProgress.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;
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
    choujuuStep1.addEventListener('click', (e) => {
        if (!e.target.matches('.choujuu-choice-btn')) return;
        const selectedBtn = e.target;
        const choice = selectedBtn.dataset.choice;
        const question = currentQuiz[currentQuestionIndex];
        const isCorrect = (choice === 'no') ? !question.isHuntable : question.isHuntable;
        if (isCorrect) { correctSound.play(); if (choice === 'no') { score++; } } else { wrongSound.play(); }
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
                if (isCorrect) { correctSound.play(); score++; } else { wrongSound.play(); }
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
    function showChoujuuFeedback(isCorrect, message) { 
        choujuuFeedback.textContent = message; 
        choujuuFeedback.className = 'feedback-container'; 
        choujuuFeedback.classList.add(isCorrect ? 'correct' : 'wrong'); 
        choujuuSubmitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る"; 
        choujuuSubmitButton.style.display = 'block'; 
    }
    choujuuSubmitButton.addEventListener('click', () => { 
        currentQuestionIndex++; 
        if (currentQuestionIndex < currentQuiz.length) { 
            showChoujuuQuestion(); 
        } else { 
            showResult(); 
        } 
    });
    
    // --- 通常クイズのロジック (startNormalQuizの変更) ---
    async function startNormalQuiz(categoryKey) {
        await resetQuizState(categoryKey); // resetQuizStateが非同期になったため、awaitを使用
        if (currentQuiz.length === 0) {
            alert('このクイズは現在準備中です。');
            return;
        }
        
        loaderWrapper.classList.remove('loaded');
        try {
            const imageUrls = currentQuiz.filter(q => q.image).map(q => q.image);
            if (imageUrls.length > 0) {
                await preloadImages(imageUrls);
            }
            topPageContainer.style.display = 'none';
            quizContainers.forEach(container => container.style.display = 'none');
            resultContainer.style.display = 'none';
            quizContainer.style.display = 'block';
            showNormalQuestion();
        } catch (error) {
            console.error("画像の読み込みに失敗しました:", error);
            alert("クイズ画像の読み込みに失敗しました。トップページに戻ります。");
            goToTopPage();
        } finally {
            loaderWrapper.classList.add('loaded');
        }
    }

    function showNormalQuestion() {
        normalQuizProgress.textContent = `${currentQuestionIndex + 1} / ${currentQuiz.length} 問`;
        resetNormalState();
        const question = currentQuiz[currentQuestionIndex];
        
        if (question.image) {
            normalQuizImage.src = question.image;
            normalQuizImageContainer.style.display = 'block';
        } else {
            normalQuizImageContainer.style.display = 'none';
        }

        questionElement.innerText = question.question;
        
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
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
            correctSound.play();
            score++;
        } else {
            wrongSound.play();
            const correctAnswer = question.answers.find(ans => ans.correct).text;
            wrongQuestions.push({
                question: question.question,
                correctAnswer: correctAnswer,
                additionalInfo: question.additionalInfo // 間違えた問題にも補足情報を記録
            });
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

        // 補足情報の表示制御
        if (question.additionalInfo) {
            additionalInfoText.innerText = question.additionalInfo;
            additionalInfoContainer.style.display = 'block';
        }

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
            showResult();
        }
    });

    // --- リザルト画面表示用の関数 (変更なし) ---
    function showResult() { 
        quizContainers.forEach(container => container.style.display = 'none');
        resultContainer.style.display = 'block';

        const totalQuestions = currentQuiz.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        const scores = getScoresFromStorage();
        const currentCategoryScores = scores[currentQuizCategoryKey] || { highScore: 0, cleared: false };
        if (percentage > currentCategoryScores.highScore) {
            currentCategoryScores.highScore = percentage;
        }
        if (percentage === 100) {
            currentCategoryScores.cleared = true;
        }
        scores[currentQuizCategoryKey] = currentCategoryScores;
        saveScoresToStorage(scores);

        resultScore.textContent = `正答率: ${percentage}% (${score}/${totalQuestions}問)`;

        if (percentage === 100) {resultMessage.textContent = '素晴らしい！全問正解です！';
    } else if (percentage >= 80) {resultMessage.textContent = 'お見事！あと一歩です！';
    } else if (percentage >= 50) {resultMessage.textContent = 'お疲れ様でした！';
    } else {resultMessage.textContent = 'もう少し頑張りましょう！';
    }
    if (wrongQuestions.length > 0) {
        resultDetailsSection.style.display = 'block'; // 「おさらい」セクションを表示
        wrongQuestionsList.innerHTML = '';
        wrongQuestions.forEach(item => {
            const li = document.createElement('li');
let additionalInfoHTML = '';
if (item.additionalInfo) {
    additionalInfoHTML = `<div class="wrong-question-additional-info">${String(item.additionalInfo).replace(/\n/g, '<br>')}</div>`;
}

            li.innerHTML = ` <div class="question-text">${item.question}</div> <div class="correct-answer-text">正解: ${item.correctAnswer}</div> ${additionalInfoHTML} `;

            wrongQuestionsList.appendChild(li);
        });
    } else {
        resultDetailsSection.style.display = 'none'; // 「おさらい」セクションを非表示
    }
    }

    // --- 最後にロード画面を消して、メインコンテンツを表示 ---
    loaderWrapper.classList.add('loaded');
    goToTopPage();
        // ===================================================================
    // ★★★ ここから、キーボード操作機能の、実装 ★★★
    // ===================================================================
    document.addEventListener('keydown', (event) => {
        // クイズ画面が表示されていない場合は、何もしない
        const isQuizActive = quizContainer.style.display === 'block' || quizContainerChoujuu.style.display === 'block';
        if (!isQuizActive) {
            return;
        }

        // 押されたキーによって、処理を、分岐
        switch (event.key) {
            case '1':
            case '2':
            case '3':
            case '4':
                handleNumericKeyPress(parseInt(event.key, 10));
                break;
            case 'Enter':
                handleEnterKeyPress();
                break;
            case 'Escape':
                // トップに戻るボタンが、存在すれば、クリックする
                const backButton = document.querySelector('.quiz-container:not([style*="display: none"]) .back-to-top-btn, .quiz-container-choujuu:not([style*="display: none"]) .back-to-top-btn');
                if (backButton) {
                    backButton.click();
                }
                break;
        }
    });

    function handleNumericKeyPress(number) {
        // 現在、表示されている、クイズの、種類を、判別
        const isChoujuuQuiz = quizContainerChoujuu.style.display === 'block';
        let targetButtons;

        if (isChoujuuQuiz) {
            // 鳥獣判別クイズの場合
            const isStep1 = choujuuStep1.style.display === 'block';
            if (isStep1) {
                // ステップ1：「獲れますか？」の、選択肢
                targetButtons = choujuuStep1.querySelectorAll('.choujuu-choice-btn');
            } else {
                // ステップ2：名前の、選択肢
                targetButtons = choujuuNameOptions.querySelectorAll('.answer-btn');
            }
        } else {
            // 通常クイズの場合
            targetButtons = answerButtonsElement.querySelectorAll('.answer-btn');
        }

        // 対応する、番号の、ボタンが、存在し、かつ、無効化されていなければ、クリック
        if (targetButtons && targetButtons.length >= number) {
            const buttonToClick = targetButtons[number - 1];
            if (!buttonToClick.disabled) {
                buttonToClick.click();
            }
        }
    }

    function handleEnterKeyPress() {
        // 現在、表示されている、「次へ」または、「結果を見る」ボタンを、探して、クリック
        const visibleSubmitButton = document.querySelector('#submit:not([style*="display: none"]), #choujuu-submit:not([style*="display: none"])');
        if (visibleSubmitButton) {
            visibleSubmitButton.click();
        }
    }
    // ===================================================================
    // ★★★ ここまで、キーボード操作機能の、実装 ★★★
    // ===================================================================

};
// ===================================================================
// ★★★ script.js パート２／２ 終了 ★★★
// ===================================================================
