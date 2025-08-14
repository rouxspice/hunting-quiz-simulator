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
            // ★★★ フォルダ名を `sounds` (複数形) に修正 ★★★
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
    let allQuestions = [];
    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;

    // --- PapaParseの動的ロード ---
    const papaParseScript = document.createElement('script');
    papaParseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    document.head.appendChild(papaParseScript  );

    papaParseScript.onload = async () => {
        try {
            const fetchPromises = quizInfo.categories.map(category =>
                fetch(`/data/${category}.csv`)
                    .then(response => {
                        if (!response.ok) throw new Error(`CSVが見つかりません: ${category}.csv`);
                        return response.text();
                    })
                    .then(csvText => Papa.parse(csvText, { header: true, skipEmptyLines: true }).data)
            );
            const results = await Promise.all(fetchPromises);
            allQuestions = results.flat().filter(q => q.question_text || q.image_file);
            allQuestions.sort(() => Math.random() - 0.5);

            if (quizInfo.numQuestions === 'all' || allQuestions.length < quizInfo.numQuestions) {
                currentQuestions = allQuestions;
            } else {
                currentQuestions = allQuestions.slice(0, parseInt(quizInfo.numQuestions, 10));
            }

            if (currentQuestions.length === 0) {
                questionElement.textContent = '選択されたカテゴリに、まだ問題がありません。';
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

    function updateProgress() {
        const total = currentQuestions.length;
        const current = currentQuestionIndex + 1;
        quizProgressElement.textContent = `残り ${total - currentQuestionIndex} / ${total} 問`;
        const progressPercentage = (current / total) * 100;
        progressBar.style.width = `${progressPercentage}%`;
    }

    function displayQuestion() {
        updateProgress();
        feedbackElement.textContent = '';
        feedbackElement.className = 'feedback-container';
        nextButton.style.display = 'none';
        optionsElement.innerHTML = '';
        questionContainer.style.display = 'block';
        choujuuQuizArea.style.display = 'none';

        const q = currentQuestions[currentQuestionIndex];
        const isChoujuuQuestion = (quizInfo.categories.includes('choujuu_hnb') || quizInfo.categories.includes('common')) && q.image_file;

        if (isChoujuuQuestion) {
             displayChoujuuQuestion();
        } else {
             displayNormalQuestion();
        }
    }

    function displayNormalQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        questionElement.textContent = `第${currentQuestionIndex + 1}問：${q.question_text}`;
        const options = [q.option_1, q.option_2, q.option_3, q.option_4].filter(opt => opt && opt.trim() !== '');
        options.forEach((opt, i) => {
            const button = document.createElement('button');
            button.textContent = opt;
            button.classList.add('option-btn');
            button.addEventListener('click', (event) => checkNormalAnswer(i + 1, event.target));
            optionsElement.appendChild(button);
        });
    }

    function displayChoujuuQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        questionContainer.style.display = 'none';
        choujuuQuizArea.style.display = 'block';
        huntableOptions.style.display = 'grid';
        
        huntableButtons.forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });

        choujuuImage.src = `/images/${q.image_file}`;
        choujuuImage.alt = `鳥獣の写真: ${q.correct_name}`;
        choujuuInstruction.textContent = 'この鳥獣は、狩猟鳥獣ですか？（獲れますか？）';
    }

    function checkNormalAnswer(selected, clickedButton) {
        const q = currentQuestions[currentQuestionIndex];
        const correctIndex = parseInt(q.correct_answer, 10);
        const isCorrect = selected === correctIndex;
        if(isCorrect) score++;
        
        Array.from(optionsElement.children).forEach((btn, i) => {
            if ((i + 1) === correctIndex) {
                btn.classList.add('correct');
            } else if ((i + 1) === selected) {
                btn.classList.add('incorrect');
            }
        });

        showFeedback(isCorrect, q.explanation);
    }

    function checkHuntableAnswer(userAnswer) {
        const q = currentQuestions[currentQuestionIndex];
        const isCorrect = (q.is_huntable.toLowerCase() === 'true') === userAnswer;

        huntableButtons.forEach(btn => {
            const btnAnswer = btn.dataset.answer === 'true';
            if (btnAnswer === (q.is_huntable.toLowerCase() === 'true')) {
                btn.classList.add('correct');
            } else if (btnAnswer === userAnswer) {
                btn.classList.add('incorrect');
            }
        });

        if (isCorrect && userAnswer) {
            feedbackElement.textContent = '正解です！では、この鳥獣の名前は？';
            feedbackElement.className = 'feedback-container feedback-correct';
            displayChoujuuNameQuestion();
        } else {
            if(isCorrect) score++;
            showFeedback(isCorrect, q.explanation);
        }
    }

    function displayChoujuuNameQuestion() {
        const q = currentQuestions[currentQuestionIndex];
        huntableOptions.style.display = 'none';
        choujuuInstruction.textContent = 'この鳥獣の名前を答えてください。';
        optionsElement.innerHTML = '';

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
        if(isCorrect) score++;

        Array.from(optionsElement.children).forEach(btn => {
            if (btn.textContent === q.correct_name) {
                btn.classList.add('correct');
            } else if (btn.textContent === selectedName) {
                btn.classList.add('incorrect');
            }
        });
        showFeedback(isCorrect, q.explanation);
    }

    function showFeedback(isCorrect, explanation) {
        Array.from(optionsElement.children).forEach(btn => btn.disabled = true);
        huntableButtons.forEach(btn => btn.disabled = true);

        if (isCorrect) {
            playSound('correct');
            feedbackElement.textContent = `正解！ 解説：${explanation}`;
            feedbackElement.className = 'feedback-container feedback-correct';
        } else {
            playSound('incorrect');
            feedbackElement.textContent = `不正解。解説：${explanation}`;
            feedbackElement.className = 'feedback-container feedback-incorrect';
        }
        nextButton.style.display = 'block';
    }

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            displayQuestion();
        } else {
            const resultInfo = {
                score: score,
                total: currentQuestions.length,
                quizInfo: quizInfo,
                mistakes: [] // ここに間違えた問題を入れるロジックを後で追加
            };
            localStorage.setItem('resultInfo', JSON.stringify(resultInfo));
            window.location.href = 'result.html';
        }
    });
});
