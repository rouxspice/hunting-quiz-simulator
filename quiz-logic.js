document.addEventListener('DOMContentLoaded', () => {
    // =================================================================================
    // デバッグ機能
    // =================================================================================
    const debugToggle = document.getElementById('debug-mode-toggle');
    const debugLogElement = document.getElementById('debug-log');
    let isDebugMode = false;

    const log = (message) => {
        if (isDebugMode) {
            const timestamp = new Date().toLocaleTimeString();
            if (debugLogElement) {
                const currentHTML = debugLogElement.innerHTML;
                debugLogElement.innerHTML = `[${timestamp}] ${message}\n` + currentHTML;
            }
        }
        console.log(`[Sim-Log] ${message}`);
    };

    if (debugToggle && debugLogElement) {
        debugToggle.addEventListener('change', (e) => {
            isDebugMode = e.target.checked;
            debugLogElement.style.display = isDebugMode ? 'block' : 'none';
            log(`デバッグモードが${isDebugMode ? '有効' : '無効'}になりました。`);
        });
    }

    log('DOM読み込み完了、スクリプト初期化開始');

    // =================================================================================
    // 最小データセット
    // =================================================================================
    const quizDataSources = {
        "judgement": [
            {"image": "イノシシ.jpg", "answer": "イノシシ", "explanation": "【狩猟鳥獣】イノシシ。雑食性で、牙が特徴。", "isHuntable": true},
            {"image": "カモシカ.jpg", "answer": "カモシカ", "explanation": "【非狩猟鳥獣】カモシカ。国の特別天然記念物。", "isHuntable": false},
            {"image": "キジ.jpg", "answer": "キジ", "explanation": "【狩猟鳥獣】キジ。日本の国鳥。オスのみ狩猟対象。", "isHuntable": true}
        ],
        "knowledge-wana": [
            {"question": "「くくりわな」の輪の直径の制限は？", "options": ["12cm以下", "20cm以下", "30cm以下"], "answer": "12cm以下", "explanation": "輪の直径は12cmを超えてはなりません。"},
            {"question": "わなを設置した後の見回りの頻度は？", "options": ["毎日", "週に一度", "月に一度"], "answer": "毎日", "explanation": "鳥獣に不必要な苦痛を与えないため、毎日見回る義務があります。"},
            {"question": "わな猟免許で捕獲できない鳥獣は？", "options": ["キジバト", "イノシシ", "タヌキ"], "answer": "キジバト", "explanation": "わな猟免許は獣類が対象で、鳥類の捕獲はできません。"}
        ],
        "knowledge-ami": [
            {"question": "法律で全面的に使用が禁止されている網は？", "options": ["かすみ網", "むそう網", "つき網"], "answer": "かすみ網", "explanation": "かすみ網は無差別に鳥獣を捕獲するため、使用が禁止されています。"},
            {"question": "網猟免許で捕獲できる鳥獣は？", "options": ["マガモ", "イノシシ", "ニホンジカ"], "answer": "マガモ", "explanation": "網猟免許は鳥類を捕獲するための免許です。"},
            {"question": "網猟で禁止されている行為は？", "options": ["音響機器で鳥を集める", "おとり鳥を使う", "餌をまく"], "answer": "音響機器で鳥を集める", "explanation": "テープレコーダー等で鳥の鳴き声を発し、誘引して捕獲することは禁止されています。"}
        ],
        "knowledge-ju": [
            {"question": "銃猟の際、着用が義務付けられている服装は？", "options": ["オレンジ色の帽子やベスト", "迷彩服", "黒い服"], "answer": "オレンジ色の帽子やベスト", "explanation": "他のハンターからの誤射を防ぐため、視認性の高い服装が義務付けられています。"},
            {"question": "散弾銃で一度に装填できる実包の上限は？", "options": ["3発", "5発", "制限なし"], "answer": "3発", "explanation": "弾倉に2発、薬室に1発の合計3発までです。"},
            {"question": "銃猟が原則として禁止されている時間帯は？", "options": ["日没後から日の出前", "正午から午後3時", "午前中"], "answer": "日没後から日の出前", "explanation": "視界不良による危険を避けるため、夜間の銃猟は原則禁止です。"}
        ],
        "knowledge-shoshinsha": [
            {"question": "銃の所持許可の申請はどこで行うか？", "options": ["住所地を管轄する警察署", "市役所", "猟友会"], "answer": "住所地を管轄する警察署", "explanation": "銃の所持許可に関する手続きは、すべて住所地の公安委員会（窓口は警察署）で行います。"},
            {"question": "銃の安全な取り扱いで最も重要なことは？", "options": ["銃口を常に安全な方向に向ける", "常に実包を装填しておく", "分解しない"], "answer": "銃口を常に安全な方向に向ける", "explanation": "「銃口は常に安全な方向へ」は、銃を扱う上での絶対的なルールです。"},
            {"question": "初心者講習の修了証明書の有効期間は？", "options": ["3年間", "1年間", "5年間"], "answer": "3年間", "explanation": "初心者講習の修了証明書の有効期間は、交付日から3年間です。この期間内に所持許可申請を行う必要があります。"}
        ]
    };
    log('最小データセットの定義完了 (初心者講習追加)');

    // =================================================================================
    // DOM要素の取得
    // =================================================================================
    const screens = {
        title: document.getElementById('title-screen'),
        quiz: document.getElementById('quiz-screen'),
        result: document.getElementById('result-screen'),
    };
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingMessage = document.getElementById('loading-message');
    const loadingProgressContainer = document.getElementById('loading-progress-container');
    const loadingProgressBar = document.getElementById('loading-progress-bar');
    const loadingProgressText = document.getElementById('loading-progress-text');

    const buttons = {
        startJudgement: document.getElementById('start-judgement-quiz'),
        startKnowledgeWana: document.getElementById('start-knowledge-wana-quiz'),
        startKnowledgeAmi: document.getElementById('start-knowledge-ami-quiz'),
        startKnowledgeJu: document.getElementById('start-knowledge-ju-quiz'),
        startKnowledgeShoshinsha: document.getElementById('start-knowledge-shoshinsha-quiz'), // 新しいボタン
        nextQuestion: document.getElementById('next-question-button'),
        restart: document.getElementById('restart-quiz-button'),
        backToTitle: document.getElementById('back-to-title-button'),
        quitQuiz: document.getElementById('quit-quiz-button'),
    };

    const quizElements = {
        counter: document.getElementById('question-counter'),
        progressBar: document.getElementById('progress-bar'),
        image: document.getElementById('question-image'),
        questionArea: document.getElementById('question-area'),
        text: document.getElementById('question-text'),
        options: document.getElementById('answer-options'),
    };

    const feedbackElements = {
        area: document.getElementById('feedback-area'),
        result: document.getElementById('feedback-result'),
        correctAnswer: document.getElementById('correct-answer-text'),
        explanation: document.getElementById('feedback-explanation'),
    };

    const resultElements = {
        score: document.getElementById('score-text'),
        details: document.getElementById('result-details'),
    };
    log('DOM要素の取得完了');

    // =================================================================================
    // 状態管理変数
    // =================================================================================
    let currentQuizData = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];
    let originalQuizType = '';
    let judgementQuizStep = 1;
    let missingImages = new Set();
    let totalQuestions = 0;
    log('状態管理変数の初期化完了');

    // =================================================================================
    // 関数定義
    // =================================================================================

    const showScreen = (screenName) => {
        log(`画面を「${screenName}」に切り替え`);
        Object.values(screens).forEach(screen => {
            if(screen) screen.style.display = 'none';
        });
        if (screens[screenName]) {
            screens[screenName].style.display = 'block';
        } else {
            log(`エラー: 画面「${screenName}」が見つかりません`);
        }
    };

    const startQuiz = async (type) => {
        log(`クイズ開始処理: タイプ「${type}」`);
        originalQuizType = type;
        currentQuestionIndex = 0;
        score = 0;
        userAnswers = [];
        judgementQuizStep = 1;
        missingImages.clear();

        const sourceData = quizDataSources[type];
        if (!sourceData) {
            log(`エラー: クイズタイプ「${type}」のデータソースが見つかりません。`);
            alert(`エラー: クイズタイプ「${type}」のデータが見つかりません。`);
            return;
        }
        
        currentQuizData = [...sourceData];
        totalQuestions = currentQuizData.length;
        log(`${totalQuestions}問の問題を準備しました`);
        
        if (loadingOverlay) loadingOverlay.style.display = 'flex';

        if (type === 'judgement') {
            if(loadingMessage) loadingMessage.textContent = '画像データを読み込んでいます...';
            if(loadingProgressContainer) loadingProgressContainer.style.display = 'block';
            log('画像プリロード処理を開始');
            await preloadImagesWithProgress(currentQuizData);
            log('画像プリロード処理が完了');
        } else {
            if(loadingMessage) loadingMessage.textContent = 'クイズを準備しています...';
            if(loadingProgressContainer) loadingProgressContainer.style.display = 'none';
        }

        if (loadingOverlay) loadingOverlay.style.display = 'none';
        showScreen('quiz');
        displayQuestion();
    };

    const displayQuestion = () => {
        log(`問題 ${currentQuestionIndex + 1} の表示処理を開始`);
        if(feedbackElements.area) feedbackElements.area.style.display = 'none';
        if(quizElements.options) quizElements.options.innerHTML = '';
        if(quizElements.text) quizElements.text.style.display = 'block';
        
        const existingPlaceholder = quizElements.questionArea ? quizElements.questionArea.querySelector('.no-image-placeholder') : null;
        if (existingPlaceholder) existingPlaceholder.remove();

        const question = currentQuizData[currentQuestionIndex];
        
        if(quizElements.counter) quizElements.counter.textContent = `問題 ${currentQuestionIndex + 1} / ${totalQuestions}`;
        if(quizElements.progressBar) quizElements.progressBar.style.width = `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`;

        if (originalQuizType === 'judgement') {
            displayJudgementQuestion(question);
        } else {
            displayKnowledgeQuestion(question);
        }
        log(`問題 ${currentQuestionIndex + 1} の表示完了`);
    };

    const displayKnowledgeQuestion = (question) => {
        if(quizElements.image) quizElements.image.style.display = 'none';
        if(quizElements.text) quizElements.text.textContent = question.question;
        const shuffledOptions = [...question.options].sort(() => 0.5 - Math.random());
        shuffledOptions.forEach(option => createOptionButton(option, () => handleAnswer(option, 'knowledge')));
    };

    const displayJudgementQuestion = (question) => {
        const imagePath = `images/${question.image}`;
        if (missingImages.has(question.image)) {
            log(`画像なし: ${question.image}`);
            if(quizElements.image) quizElements.image.style.display = 'none';
            const placeholder = document.createElement('div');
            placeholder.className = 'no-image-placeholder';
            placeholder.textContent = '画像データがありません';
            if(quizElements.questionArea) quizElements.questionArea.insertBefore(placeholder, quizElements.text);
        } else {
            log(`画像表示: ${imagePath}`);
            if(quizElements.image) {
                quizElements.image.style.display = 'block';
                quizElements.image.src = imagePath;
            }
        }

        if (judgementQuizStep === 1) {
            if(quizElements.text) quizElements.text.textContent = 'この鳥獣は狩猟対象？';
            createOptionButton('狩猟対象である', () => handleAnswer(true, 'judgement_step1'));
            createOptionButton('狩猟対象ではない', () => handleAnswer(false, 'judgement_step1'));
        } else {
            if(quizElements.text) quizElements.text.textContent = 'この鳥獣の名前は？';
            const correctAnswer = question.answer;
            const allNames = quizDataSources.judgement.map(item => item.answer);
            const wrongOptions = allNames.filter(name => name !== correctAnswer);
            const finalOptions = [correctAnswer, ...[...wrongOptions].sort(() => 0.5 - Math.random()).slice(0, 2)].sort(() => 0.5 - Math.random());
            finalOptions.forEach(option => createOptionButton(option, () => handleAnswer(option, 'judgement_step2')));
        }
    };

    const createOptionButton = (text, onClick) => {
        const button = document.createElement('button');
        button.textContent = text;
        button.classList.add('answer-btn');
        button.addEventListener('click', onClick);
        if(quizElements.options) quizElements.options.appendChild(button);
    };

    const handleAnswer = (selectedValue, answerType) => {
        log(`回答処理: タイプ「${answerType}」, 回答「${selectedValue}」`);
        const question = currentQuizData[currentQuestionIndex];
        let isCorrect = false;
        let feedbackText = '';
        let userAnswerText = selectedValue;

        if (answerType === 'knowledge') {
            isCorrect = selectedValue === question.answer;
            feedbackText = `正解は: ${question.answer}`;
        } else if (answerType === 'judgement_step1') {
            isCorrect = selectedValue === question.isHuntable;
            userAnswerText = selectedValue ? '狩猟対象' : '非狩猟対象';
            if (isCorrect) {
                if (question.isHuntable) {
                    log('Step1正解、Step2へ');
                    judgementQuizStep = 2;
                    displayQuestion();
                    return;
                } else {
                    feedbackText = `正解: ${question.answer} (非狩猟対象)`;
                }
            } else {
                feedbackText = `正解は「${question.isHuntable ? '狩猟対象' : '非狩猟対象'}」でした。`;
            }
        } else if (answerType === 'judgement_step2') {
            isCorrect = selectedValue === question.answer;
            userAnswerText = `狩猟対象 > ${selectedValue}`;
            feedbackText = `正解は: ${question.answer}`;
        }

        if (isCorrect) score++;
        userAnswers.push({ question, selected: userAnswerText, isCorrect });
        showFeedback(isCorrect, feedbackText, question.explanation);
    };

    const showFeedback = (isCorrect, correctAnswerText, explanation) => {
        log(`フィードバック表示: ${isCorrect ? '正解' : '不正解'}`);
        if(quizElements.options) {
            Array.from(quizElements.options.children).forEach(btn => btn.disabled = true);
        }
        
        if(feedbackElements.area) {
            feedbackElements.area.className = isCorrect ? 'correct' : 'incorrect';
            feedbackElements.area.style.display = 'block';
        }
        if(feedbackElements.result) {
            feedbackElements.result.className = isCorrect ? 'correct' : 'incorrect';
            feedbackElements.result.textContent = isCorrect ? '正解！' : '不正解...';
        }
        if(feedbackElements.correctAnswer) feedbackElements.correctAnswer.textContent = isCorrect ? '' : correctAnswerText;
        if(feedbackElements.explanation) feedbackElements.explanation.textContent = explanation;
    };

    const nextQuestion = () => {
        log('「次の問題へ」ボタンクリック');
        judgementQuizStep = 1;
        currentQuestionIndex++;
        if (currentQuestionIndex < totalQuestions) {
            displayQuestion();
        } else {
            log('全問題終了、結果表示へ');
            showResult();
        }
    };

    const showResult = () => {
        showScreen('result');
        if(resultElements.score) resultElements.score.textContent = `正解率: ${score} / ${totalQuestions} (${(score / totalQuestions) * 100}%)`;
        if(resultElements.details) resultElements.details.innerHTML = '';
        
        userAnswers.forEach((answer, index) => {
            const item = document.createElement('div');
            item.classList.add('result-item', answer.isCorrect ? 'correct' : 'incorrect');
            const questionText = answer.question.image ? `問題 ${index + 1}: この鳥獣は？` : `問題 ${index + 1}: ${answer.question.question}`;
            item.innerHTML = `
                <p class="result-question">${questionText}</p>
                <p class="result-user-answer">あなたの回答: ${answer.selected} (${answer.isCorrect ? '正解' : '不正解'})</p>
                ${!answer.isCorrect ? `<p class="result-correct-answer">正解: ${answer.question.answer}</p>` : ''}
                <p class="result-explanation">${answer.question.explanation}</p>
            `;
            if(resultElements.details) resultElements.details.appendChild(item);
        });
        log('結果画面の生成完了');
    };

    const preloadImagesWithProgress = (data) => {
        const imageItems = data.filter(item => item.image);
        let loadedCount = 0;
        const totalCount = imageItems.length;
        if(loadingProgressText) loadingProgressText.textContent = `${loadedCount} / ${totalCount}`;
        if(loadingProgressBar) loadingProgressBar.style.width = '0%';

        if (totalCount === 0) {
            log('プリロード対象画像なし');
            return Promise.resolve();
        }

        const imagePromises = imageItems.map(item => {
            return new Promise((resolve) => {
                const img = new Image();
                const onFinish = () => {
                    loadedCount++;
                    if(loadingProgressText) loadingProgressText.textContent = `${loadedCount} / ${totalCount}`;
                    if(loadingProgressBar) loadingProgressBar.style.width = `${(loadedCount / totalCount) * 100}%`;
                    log(`画像ロード進捗: ${loadedCount}/${totalCount}`);
                    resolve();
                };
                img.onload = onFinish;
                img.onerror = () => {
                    log(`画像ロードエラー: ${item.image}`);
                    missingImages.add(item.image);
                    onFinish();
                };
                img.src = `images/${item.image}`;
            });
        });
        return Promise.all(imagePromises);
    };

    // =================================================================================
    // イベントリスナーの設定
    // =================================================================================
    log('イベントリスナー設定開始');
    
    if (buttons.startJudgement) {
        buttons.startJudgement.addEventListener('click', () => startQuiz('judgement'));
        log('鳥獣判別クイズボタンにリスナー設定完了');
    } else {
        log('警告: 鳥獣判別クイズボタンが見つかりません');
    }

    if (buttons.startKnowledgeWana) {
        buttons.startKnowledgeWana.addEventListener('click', () => startQuiz('knowledge-wana'));
        log('わな猟クイズボタンにリスナー設定完了');
    } else {
        log('警告: わな猟クイズボタンが見つかりません');
    }

    if (buttons.startKnowledgeAmi) {
        buttons.startKnowledgeAmi.addEventListener('click', () => startQuiz('knowledge-ami'));
        log('網猟クイズボタンにリスナー設定完了');
    } else {
        log('警告: 網猟クイズボタンが見つかりません');
    }

    if (buttons.startKnowledgeJu) {
        buttons.startKnowledgeJu.addEventListener('click', () => startQuiz('knowledge-ju'));
        log('銃猟クイズボタンにリスナー設定完了');
    } else {
        log('警告: 銃猟クイズボタンが見つかりません');
    }

    if (buttons.startKnowledgeShoshinsha) {
        buttons.startKnowledgeShoshinsha.addEventListener('click', () => startQuiz('knowledge-shoshinsha'));
        log('初心者講習クイズボタンにリスナー設定完了');
    } else {
        log('警告: 初心者講習クイズボタンが見つかりません');
    }
    
    if (buttons.nextQuestion) {
        buttons.nextQuestion.addEventListener('click', nextQuestion);
        log('「次の問題へ」ボタンにリスナー設定完了');
    } else {
        log('警告: 「次の問題へ」ボタンが見つかりません');
    }

    if (buttons.restart) {
        buttons.restart.addEventListener('click', () => startQuiz(originalQuizType));
        log('「もう一度挑戦」ボタンにリスナー設定完了');
    } else {
        log('警告: 「もう一度挑戦」ボタンが見つかりません');
    }

    if (buttons.backToTitle) {
        buttons.backToTitle.addEventListener('click', () => showScreen('title'));
        log('「タイトルに戻る」（結果画面）ボタンにリスナー設定完了');
    } else {
        log('警告: 「タイトルに戻る」（結果画面）ボタンが見つかりません');
    }
    
    if (buttons.quitQuiz) {
        buttons.quitQuiz.addEventListener('click', () => {
            log('「タイトルに戻る」（クイズ中）ボタンクリック');
            if (confirm('クイズを中断してタイトルに戻りますか？')) {
                showScreen('title');
            }
        });
        log('「タイトルに戻る」（クイズ中）ボタンにリスナー設定完了');
    } else {
        log('警告: 「タイトルに戻る」（クイズ中）ボタンが見つかりません');
    }
    
    log('すべてのイベントリスナー設定処理完了');
    
    // =================================================================================
    // 初期化
    // =================================================================================
    showScreen('title');
    log('初期化完了。タイトル画面を表示しました。');
});
