document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM要素の取得 ---
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const feedbackElement = document.getElementById('feedback');
    const nextButton = document.getElementById('next-btn');
    const quizCategoryElement = document.getElementById('quiz-category');
    const quizProgressElement = document.getElementById('quiz-progress');
    const progressBar = document.getElementById('progress-bar');
    const choujuuQuizArea = document.getElementById('choujuu-quiz-area');
    const choujuuImage = document.getElementById('choujuu-image');
    const choujuuInstruction = document.getElementById('choujuu-instruction');
    const huntableOptions = document.getElementById('huntable-options');
    const huntableButtons = document.querySelectorAll('.huntable-btn');
    const questionContainer = document.getElementById('question-container');

    // --- 効果音再生関数 ---
    function playSound(type) {
        try {
            const audio = new Audio(`/sounds/${type}.mp3`);
            audio.play();
        } catch (error) {
            console.error('サウンドの再生に失敗しました:', error);
        }
    }

    // --- クイズ情報の取得と初期設定 ---
    const quizInfoString = localStorage.getItem('quizInfo');
    if (!quizInfoString) {
        questionElement.textContent = 'エラー: クイズ情報が見つかりません。トップページからやり直してください。';
        return;
    }
    const quizInfo = JSON.parse(quizInfoString);
    quizCategoryElement.textContent = `現在挑戦中の試験：${quizInfo.categoryName}`;
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let mistakenQuestions = []; // ★ 間違えた問題を記録

    // --- PapaParseの動的ロード ---
    const papaParseScript = document.createElement('script');
    papaParseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    document.head.appendChild(papaParseScript  );

    papaParseScript.onload = async () => {
        try {
            // ★★★ もし「間違えた問題の再挑戦」モードなら、localStorageから問題を取得 ★★★
            if (quizInfo.type === 'retry') {
                currentQuestions = quizInfo.questions;
            } else {
                // --- 通常のクイズモード ---
                if (quizInfo.type === 'real') {
                    const commonPromise = fetch('/data/common.csv').then(res => res.text());
                    const methodPromise = fetch(`/data/${quizInfo.categories[1]}.csv`).then(res => res.text());
                    const [commonCsv, methodCsv] = await Promise.all([commonPromise, methodPromise]);
                    const commonQuestions = Papa.parse(commonCsv, { header: true, skipEmptyLines: true }).data.filter(q => q.question_text || q.image_file);
                    const methodQuestions = Papa.parse(methodCsv, { header: true, skipEmptyLines: true }).data.filter(q => q.question_text || q.image_file);
                    commonQuestions.sort(() => Math.random() - 0.5);
                    methodQuestions.sort(() => Math.random() - 0.5);
                    const selectedCommon = commonQuestions.slice(0, 24);
                    const selectedMethod = methodQuestions.slice(0, 6);
                    currentQuestions = [...selectedCommon, ...selectedMethod];
                } else { // 'custom' と 'single'
                    const fetchPromises = quizInfo.categories.map(category =>
                        fetch(`/data/${category}.csv`).then(res => res.text())
                    );
                    const results = await Promise.all(fetchPromises);
                    let allQuestions = results.flat().filter(q => q.question_text || q.image_file);
                    allQuestions.sort(() => Math.random() - 0.5);
                    if (quizInfo.numQuestions === 'all' || allQuestions.length < quizInfo.numQuestions) {
                        currentQuestions = allQuestions;
                    } else {
                        currentQuestions = allQuestions.slice(0, parseInt(quizInfo.numQuestions, 10));
                    }
                }
            }

            currentQuestions.sort(() => Math.random() - 0.5);

            if (currentQuestions.length === 0) {
                questionElement.textContent = '対象の問題がありません。';
                return;
            }
            huntableButtons.forEach(btn => {
                btn.addEventListener('click', () => checkHuntableAnswer(btn.dataset.answer === 'true'));
            });
            displayQuestion();

        } catch (error) {
            console.error('CSV読み込みまたは処理エラー:', error);
            questionElement.textContent = `問題の読み込みに失敗しました。(${error.message})`;
        }
    };

    function updateProgress() { /* ... 変更なし ... */ }
    function displayQuestion() { /* ... 変更なし ... */ }
    function displayNormalQuestion() { /* ... 変更なし ... */ }
    function displayChoujuuQuestion() { /* ... 変更なし ... */ }

    function checkNormalAnswer(selected, clickedButton) {
        const q = currentQuestions[currentQuestionIndex];
        const correctIndex = parseInt(q.correct_answer, 10);
        const isCorrect = selected === correctIndex;
        if (isCorrect) { score++; } else { mistakenQuestions.push(q); }
        Array.from(optionsElement.children).forEach((btn, i) => {
            if ((i + 1) === correctIndex) { btn.classList.add('correct'); } 
            else if ((i + 1) === selected) { btn.classList.add('incorrect'); }
        });
        showFeedback(isCorrect, q.explanation);
    }

    function checkHuntableAnswer(userAnswer) {
        const q = currentQuestions[currentQuestionIndex];
        const isCorrect = (q.is_huntable.toLowerCase() === 'true') === userAnswer;
        huntableButtons.forEach(btn => {
            const btnAnswer = btn.dataset.answer === 'true';
            if (btnAnswer === (q.is_huntable.toLowerCase() === 'true')) { btn.classList.add('correct'); } 
            else if (btnAnswer === userAnswer) { btn.classList.add('incorrect'); }
        });
        if (isCorrect && userAnswer) {
            feedbackElement.textContent = '正解です！では、この鳥獣の名前は？';
            feedbackElement.className = 'feedback-container feedback-correct';
            displayChoujuuNameQuestion();
        } else {
            if (isCorrect) { score++; } else { mistakenQuestions.push(q); }
            showFeedback(isCorrect, q.explanation);
        }
    }

    function displayChoujuuNameQuestion() { /* ... 変更なし ... */ }

    function checkChoujuuNameAnswer(selectedName) {
        const q = currentQuestions[currentQuestionIndex];
        const isCorrect = selectedName === q.correct_name;
        if (isCorrect) { score++; } else { mistakenQuestions.push(q); }
        Array.from(optionsElement.children).forEach(btn => {
            if (btn.textContent === q.correct_name) { btn.classList.add('correct'); } 
            else if (btn.textContent === selectedName) { btn.classList.add('incorrect'); }
        });
        showFeedback(isCorrect, q.explanation);
    }

    function showFeedback(isCorrect, explanation) { /* ... 変更なし ... */ }

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            displayQuestion();
        } else {
            const resultInfo = {
                score: score,
                total: currentQuestions.length,
                quizInfo: quizInfo,
                mistakes: mistakenQuestions // ★ 間違えた問題リストを保存
            };
            localStorage.setItem('resultInfo', JSON.stringify(resultInfo));
            window.location.href = 'result.html';
        }
    });
});
