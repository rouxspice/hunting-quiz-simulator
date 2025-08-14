document.addEventListener('DOMContentLoaded', () => {
    const papaParseScript = document.createElement('script');
    papaParseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    document.head.appendChild(papaParseScript );

    papaParseScript.onload = async () => {
        const questionElement = document.getElementById('question');
        const optionsElement = document.getElementById('options');
        const feedbackElement = document.getElementById('feedback');
        const nextButton = document.getElementById('next-btn');
        
        // 新しいUI要素
        const quizCategoryElement = document.getElementById('quiz-category');
        const quizProgressElement = document.getElementById('quiz-progress');

        let questions = [];
        let currentQuestionIndex = 0;

        const categoryFile = localStorage.getItem('selectedCategory');
        const categoryName = localStorage.getItem('selectedCategoryName');

        if (!categoryFile || !categoryName) {
            if(questionElement) questionElement.textContent = 'エラー: カテゴリが選択されていません。トップページからやり直してください。';
            return;
        }

        if(quizCategoryElement) quizCategoryElement.textContent = `現在挑戦中の試験：${categoryName}`;

        try {
            const response = await fetch(`data/${categoryFile}.csv`);
            if (!response.ok) throw new Error(`CSVファイルが見つかりません: data/${categoryFile}.csv`);
            const csvText = await response.text();
            
            const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            questions = parsedData.data.filter(q => q.question_text && q.question_text.trim() !== '');
            questions.sort(() => Math.random() - 0.5);
            
            if (questions.length === 0) {
                questionElement.textContent = 'このカテゴリには、まだ問題がありません。';
                return;
            }

            displayQuestion();
        } catch (error) {
            console.error('CSV読み込みまたは解析エラー:', error);
            questionElement.textContent = '問題の読み込みに失敗しました。';
        }

        function updateProgress() {
            if(quizProgressElement) quizProgressElement.textContent = `残り ${questions.length - currentQuestionIndex} / ${questions.length} 問`;
        }

        function displayQuestion() {
            updateProgress();
            feedbackElement.textContent = '';
            feedbackElement.className = '';
            nextButton.style.display = 'none';
            optionsElement.innerHTML = '';

            const q = questions[currentQuestionIndex];
            questionElement.textContent = `第${currentQuestionIndex + 1}問：${q.question_text}`;

            [q.option_1, q.option_2, q.option_3, q.option_4].filter(opt => opt && opt.trim() !== '').forEach((opt, i) => {
                const button = document.createElement('button');
                button.textContent = opt;
                button.classList.add('option-btn');
                button.addEventListener('click', () => checkAnswer(i + 1));
                optionsElement.appendChild(button);
            });
        }

        function checkAnswer(selected) {
            Array.from(optionsElement.children).forEach(btn => {
                btn.disabled = true;
                // 正解・不正解でスタイルを変える場合はここに追加
            });
            const q = questions[currentQuestionIndex];
            const correct = parseInt(q.correct_answer, 10);

            if (selected === correct) {
                feedbackElement.textContent = `正解！ 解説：${q.explanation}`;
                feedbackElement.className = 'feedback-correct';
            } else {
                feedbackElement.textContent = `不正解。正解は「${q[`option_${correct}`]}」です。解説：${q.explanation}`;
                feedbackElement.className = 'feedback-incorrect';
            }
            nextButton.style.display = 'block';
        }

        nextButton.addEventListener('click', () => {
            currentQuestionIndex++;
            if (currentQuestionIndex < questions.length) {
                displayQuestion();
            } else {
                questionElement.textContent = '全問終了です！お疲れ様でした。';
                optionsElement.innerHTML = '';
                feedbackElement.textContent = '';
                nextButton.style.display = 'none';
                if(quizProgressElement) quizProgressElement.textContent = '完了';
            }
        });
    };
});
