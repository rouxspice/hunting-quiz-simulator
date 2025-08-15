// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ すべての元凶、ブラウザ拡張機能の干渉から、私たちのコードを守る ★★★
// ★★★ DOMContentLoaded から、window.onload へ、変更する ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
window.onload = async () => {
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
    let mistakenQuestions = [];

    // --- PapaParseの動的ロード ---
    const papaParseScript = document.createElement('script');
    papaParseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    document.head.appendChild(papaParseScript  );

    papaParseScript.onload = async () => {
        try {
            const papaParseConfig = {
                header: true,
                skipEmptyLines: true,
                bom: true
            };

            if (quizInfo.type === 'retry') {
                currentQuestions = quizInfo.questions;
            } else {
                if (quizInfo.type === 'real') {
                    const commonPromise = fetch('/data/common.csv').then(res => res.text());
                    const methodPromise = fetch(`/data/${quizInfo.categories[1]}.csv`).then(res => res.text());
                    const [commonCsv, methodCsv] = await Promise.all([commonPromise, methodPromise]);
                    const commonQuestions = Papa.parse(commonCsv, papaParseConfig).data.filter(q => q.question_text || q.image_file);
                    const methodQuestions = Papa.parse(methodCsv, papaParseConfig).data.filter(q => q.question_text || q.image_file);
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
                    let allQuestions = [];
                    results.forEach(csvText => {
                        const parsed = Papa.parse(csvText, papaParseConfig).data;
                        allQuestions.push(...parsed);
                    });
                    allQuestions = allQuestions.filter(q => q.question_text || q.image_file);
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

    function updateProgress() { /* ... */ }
    function displayQuestion() { /* ... */ }
    function displayNormalQuestion() { /* ... */ }
    function displayChoujuuQuestion() { /* ... */ }
    function checkNormalAnswer(selected, clickedButton) { /* ... */ }
    function checkHuntableAnswer(userAnswer) { /* ... */ }
    function displayChoujuuNameQuestion() { /* ... */ }
    function checkChoujuuNameAnswer(selectedName) { /* ... */ }
    function showFeedback(isCorrect, explanation) { /* ... */ }
    nextButton.addEventListener('click', () => { /* ... */ });
};
