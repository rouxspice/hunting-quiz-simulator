document.addEventListener('DOMContentLoaded', () => {
    const papaParseScript = document.createElement('script');
    papaParseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    document.head.appendChild(papaParseScript );

    papaParseScript.onload = async () => {
        // --- DOM要素の取得 ---
        const questionElement = document.getElementById('question');
        const optionsElement = document.getElementById('options');
        const feedbackElement = document.getElementById('feedback');
        const nextButton = document.getElementById('next-btn');
        const quizCategoryElement = document.getElementById('quiz-category');
        const quizProgressElement = document.getElementById('quiz-progress');
        
        // 鳥獣判別クイズ専用DOM
        const choujuuQuizArea = document.getElementById('choujuu-quiz-area');
        const choujuuImage = document.getElementById('choujuu-image');
        const choujuuInstruction = document.getElementById('choujuu-instruction');
        const huntableOptions = document.getElementById('huntable-options');
        const questionContainer = document.getElementById('question-container');

        // --- 変数定義 ---
        let questions = [];
        let currentQuestionIndex = 0;
        const categoryFile = localStorage.getItem('selectedCategory');
        const categoryName = localStorage.getItem('selectedCategoryName');
        const IS_CHOUJUU_QUIZ = categoryFile === 'choujuu_hnb';

        // --- 初期化処理 ---
        if (!categoryFile || !categoryName) {
            questionElement.textContent = 'エラー: カテゴリが選択されていません。';
            return;
        }
        quizCategoryElement.textContent = `現在挑戦中の試験：${categoryName}`;

        try {
            const response = await fetch(`data/${categoryFile}.csv`);
            if (!response.ok) throw new Error(`CSVファイルが見つかりません`);
            const csvText = await response.text();
            
            const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            questions = parsedData.data.filter(q => (IS_CHOUJUU_QUIZ ? q.image_file : q.question_text));
            questions.sort(() => Math.random() - 0.5);

            if (questions.length === 0) {
                questionElement.textContent = 'このカテゴリには、まだ問題がありません。';
                return;
            }
            displayQuestion();
        } catch (error) {
            console.error('CSV読み込みエラー:', error);
            questionElement.textContent = '問題の読み込みに失敗しました。';
        }

        // --- 関数定義 ---
        function updateProgress() {
            quizProgressElement.textContent = `残り ${questions.length - currentQuestionIndex} / ${questions.length} 問`;
        }

        function displayQuestion() {
            updateProgress();
            feedbackElement.textContent = '';
            feedbackElement.className = '';
            nextButton.style.display = 'none';
            optionsElement.innerHTML = '';
            questionContainer.style.display = 'block';

            if (IS_CHOUJUU_QUIZ) {
                displayChoujuuQuestion();
            } else {
                displayNormalQuestion();
            }
        }

        // 通常の4択問題を表示
        function displayNormalQuestion() {
            const q = questions[currentQuestionIndex];
            questionElement.textContent = `第${currentQuestionIndex + 1}問：${q.question_text}`;
            [q.option_1, q.option_2, q.option_3, q.option_4].filter(opt => opt && opt.trim() !== '').forEach((opt, i) => {
                const button = document.createElement('button');
                button.textContent = opt;
                button.classList.add('option-btn');
                button.addEventListener('click', () => checkNormalAnswer(i + 1));
                optionsElement.appendChild(button);
            });
        }

        // 鳥獣判別問題を表示 (第1段階)
        function displayChoujuuQuestion() {
            const q = questions[currentQuestionIndex];
            questionContainer.style.display = 'none'; // 問題文エリアを隠す
            choujuuQuizArea.style.display = 'block';
            huntableOptions.style.display = 'grid';
            
            // 日本語ファイル名をエンコードしてパスを設定
            choujuuImage.src = `images/${encodeURIComponent(q.image_file)}`;
            choujuuImage.alt = `鳥獣の写真: ${q.correct_name}`;
            choujuuInstruction.textContent = 'この鳥獣は、狩猟鳥獣ですか？（獲れますか？）';

            // ボタンのイベントリスナーを再設定
            document.querySelectorAll('.huntable-btn').forEach(btn => {
                // 古いリスナーを削除して新しいのを設定
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
                newBtn.addEventListener('click', () => checkHuntableAnswer(newBtn.dataset.answer === 'true'));
            });
        }

        // 通常問題の正誤判定
        function checkNormalAnswer(selected) {
            const q = questions[currentQuestionIndex];
            const correct = parseInt(q.correct_answer, 10);
            showFeedback(selected === correct, q.explanation, q[`option_${correct}`]);
        }

        // 鳥獣判別問題の正誤判定 (第1段階)
        function checkHuntableAnswer(userAnswer) {
            const q = questions[currentQuestionIndex];
            const isCorrect = (q.is_huntable.toLowerCase() === 'true') === userAnswer;

            if (isCorrect && userAnswer) {
                // 正解、かつ「獲れる」と答えた場合 -> 第2段階へ
                feedbackElement.textContent = '正解です！では、この鳥獣の名前は？';
                feedbackElement.className = 'feedback-correct';
                displayChoujuuNameQuestion();
            } else {
                // 上記以外の場合 (不正解、または「獲れない」と答えて正解) -> 問題終了
                showFeedback(isCorrect, q.explanation);
            }
        }

        // 鳥獣判別問題を表示 (第2段階 - 名称選択)
        function displayChoujuuNameQuestion() {
            const q = questions[currentQuestionIndex];
            huntableOptions.style.display = 'none'; // 「獲れる/獲れない」ボタンを隠す
            choujuuInstruction.textContent = 'この鳥獣の名前を答えてください。';

            const nameOptions = [q.correct_name, q.option_2, q.option_3, q.option_4].filter(opt => opt && opt.trim() !== '');
            nameOptions.sort(() => Math.random() - 0.5); // 選択肢をシャッフル

            nameOptions.forEach(opt => {
                const button = document.createElement('button');
                button.textContent = opt;
                button.classList.add('option-btn');
                button.addEventListener('click', () => checkChoujuuNameAnswer(opt));
                optionsElement.appendChild(button);
            });
        }

        // 鳥獣判別問題の正誤判定 (第2段階)
        function checkChoujuuNameAnswer(selectedName) {
            const q = questions[currentQuestionIndex];
            const isCorrect = selectedName === q.correct_name;
            showFeedback(isCorrect, q.explanation, q.correct_name);
        }

        // 正誤判定と解説の表示 (共通)
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

        // 「次の問題へ」ボタンの処理
        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                choujuuQuizArea.style.display = 'none'; // 次の問題のために一旦隠す
                displayQuestion();
            } else {
                questionElement.textContent = '全問終了です！お疲れ様でした。';
                optionsElement.innerHTML = '';
                feedbackElement.textContent = '';
                nextButton.style.display = 'none';
                quizProgressElement.textContent = '完了';
                if(IS_CHOUJUU_QUIZ) choujuuQuizArea.style.display = 'none';
            }
        });
    };
});
