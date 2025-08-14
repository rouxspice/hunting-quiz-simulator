document.addEventListener('DOMContentLoaded', async () => {
    // --- DOM要素の取得 ---
    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const feedbackElement = document.getElementById('feedback');
    const nextButton = document.getElementById('next-btn');
    const quizCategoryElement = document.getElementById('quiz-category');
    const quizProgressElement = document.getElementById('quiz-progress');
    const choujuuQuizArea = document.getElementById('choujuu-quiz-area');
    const choujuuImage = document.getElementById('choujuu-image');
    const choujuuInstruction = document.getElementById('choujuu-instruction');
    const huntableOptions = document.getElementById('huntable-options');
    const questionContainer = document.getElementById('question-container');

    // --- クイズ情報の取得と初期設定 ---
    const quizInfoString = localStorage.getItem('quizInfo');
    if (!quizInfoString) {
        questionElement.textContent = 'エラー: クイズ情報が見つかりません。トップページからやり直してください。';
        return;
    }
    const quizInfo = JSON.parse(quizInfoString);
    quizCategoryElement.textContent = `現在挑戦中の試験：${quizInfo.categoryName}`;
    let allQuestions = [];
    let currentQuestions = [];
    let currentQuestionIndex = 0;

    // --- PapaParseの動的ロード ---
    const papaParseScript = document.createElement('script');
    papaParseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    document.head.appendChild(papaParseScript );

    papaParseScript.onload = async () => {
        try {
            // --- 複数のCSVファイルを並行して読み込む ---
            const fetchPromises = quizInfo.categories.map(category =>
                fetch(`/data/${category}.csv`)
                    .then(response => {
                        if (!response.ok) throw new Error(`CSVが見つかりません: ${category}.csv`);
                        return response.text();
                    })
                    .then(csvText => Papa.parse(csvText, { header: true, skipEmptyLines: true }).data)
            );

            const results = await Promise.all(fetchPromises);
            allQuestions = results.flat(); // すべての問題を一つの配列に統合

            // --- 問題のフィルタリングとシャッフル ---
            allQuestions = allQuestions.filter(q => q.question_text || q.image_file);
            allQuestions.sort(() => Math.random() - 0.5);

            // --- 出題数の決定 ---
            if (quizInfo.numQuestions === 'all' || allQuestions.length < quizInfo.numQuestions) {
                currentQuestions = allQuestions;
            } else {
                currentQuestions = allQuestions.slice(0, parseInt(quizInfo.numQuestions, 10));
            }

            if (currentQuestions.length === 0) {
                questionElement.textContent = '選択されたカテゴリに、まだ問題がありません。';
                return;
            }
            displayQuestion();

        } catch (error) {
            console.error('CSV読み込みまたは処理エラー:', error);
            questionElement.textContent = `問題の読み込みに失敗しました。(${error.message})`;
        }
    };

    // --- 以下、既存の関数群（変更なし） ---
    function updateProgress() {
        quizProgressElement.textContent = `残り ${currentQuestions.length - currentQuestionIndex} / ${currentQuestions.length} 問`;
    }

    function displayQuestion() {
        updateProgress();
        feedbackElement.textContent = '';
        feedbackElement.className = '';
        nextButton.style.display = 'none';
        optionsElement.innerHTML = '';
        questionContainer.style.display = 'block';
        choujuuQuizArea.style.display = 'none';

        const q = currentQuestions[currentQuestionIndex];
        if (quizInfo.categories.includes('choujuu_hnb') && q.image_file) {
             displayChoujuuQuestion();
        } else {
             displayNormalQuestion();
        }
    }

    function displayNormalQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        questionElement.textContent = `第${currentQuestionIndex + 1}問：${q.question_text}`;
        [q.option_1, q.option_2, q.option_3, q.option_4].filter(opt => opt && opt.trim() !== '').forEach((opt, i) => {
            const button = document.createElement('button');
            button.textContent = opt;
            button.classList.add('option-btn');
            button.addEventListener('click', () => checkNormalAnswer(i + 1));
            optionsElement.appendChild(button);
        });
    }

    function displayChoujuuQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        questionContainer.style.display = 'none';
        choujuuQuizArea.style.display = 'block';
        huntableOptions.style.display = 'grid';
        
        choujuuImage.src = `/images/${q.image_file}`;
        choujuuImage.alt = `鳥獣の写真: ${q.correct_name}`;
        choujuuInstruction.textContent = 'この鳥獣は、狩猟鳥獣ですか？（獲れますか？）';

        document.querySelectorAll('.huntable-btn').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            newBtn.addEventListener('click', () => checkHuntableAnswer(newBtn.dataset.answer === 'true'));
        });
    }

    function checkNormalAnswer(selected) {
        const q = currentQuestions[currentQuestionIndex];
        const correct = parseInt(q.correct_answer, 10);
        showFeedback(selected === correct, q.explanation, q[`option_${correct}`]);
    }

    function checkHuntableAnswer(userAnswer) {
        const q = currentQuestions[currentQuestionIndex];
        const isCorrect = (q.is_huntable.toLowerCase() === 'true') === userAnswer;

        if (isCorrect && userAnswer) {
            feedbackElement.textContent = '正解です！では、この鳥獣の名前は？';
            feedbackElement.className = 'feedback-correct';
            displayChoujuuNameQuestion();
        } else {
            showFeedback(isCorrect, q.explanation);
        }
    }

    function displayChoujuuNameQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        huntableOptions.style.display = 'none';
        choujuuInstruction.textContent = 'この鳥獣の名前を答えてください。';

        const nameOptions = [q.correct_name, q.option_2, q.option_3, q.option_4].filter(opt => opt && opt.trim() !== '');
        nameOptions.sort(() => Math.random() - 0.5);

        nameOptions.forEach(opt => {
            const button = document.createElement('button');
            button.textContent = opt;
            button.classList.add('option-btn');
            button.addEventListener('click', () => checkChoujuuNameAnswer(opt));
            optionsElement.appendChild(button);
        });
    }

    function checkChoujuuNameAnswer(selectedName) {
        const q = currentQuestions[currentQuestionIndex];
        const isCorrect = selectedName === q.correct_name;
        showFeedback(isCorrect, q.explanation, q.correct_name);
    }

    function showFeedback(isCorrect, explanation, correctAnswerText = '') {
        Array.from(optionsElement.children).forEach(btn => btn.disabled = true);
        Array.from(huntableOptions.children).forEach(btn => btn.disabled = true);

        if (isCorrect) {
            feedbackElement.textContent = `正解！ 解説：${explanation}`;
            feedbackElement.className = 'feedback-correct';
        } else {
            const answerPart = correctAnswerText ? `正解は「${correctAnswerText}」です。` : '';
            feedbackElement.textContent = `不正解。${answerPart}解説：${explanation}`;
            feedbackElement.className = 'feedback-incorrect';
        }
        nextButton.style.display = 'block';
    }

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            displayQuestion();
        } else {
            questionElement.textContent = '全問終了です！お疲れ様でした。';
            optionsElement.innerHTML = '';
            feedbackElement.textContent = '';
            nextButton.style.display = 'none';
            quizProgressElement.textContent = '完了';
            if(choujuuQuizArea) choujuuQuizArea.style.display = 'none';
        }
    });
});
