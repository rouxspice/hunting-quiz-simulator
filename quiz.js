document.addEventListener('DOMContentLoaded', () => {
    const papaParseScript = document.createElement('script');
    papaParseScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js';
    document.head.appendChild(papaParseScript );

    papaParseScript.onload = async () => {
        const questionElement = document.getElementById('question');
        const optionsElement = document.getElementById('options');
        const feedbackElement = document.getElementById('feedback');
        const nextButton = document.getElementById('next-btn');
        const categoryTitleElement = document.getElementById('category-title');

        let questions = [];
        let currentQuestionIndex = 0;

        const categoryFile = localStorage.getItem('selectedCategory');
        const categoryName = localStorage.getItem('selectedCategoryName');

        if (!categoryFile) {
            questionElement.textContent = 'エラー: カテゴリが選択されていません。';
            return;
        }

        if (categoryTitleElement && categoryName) {
            categoryTitleElement.textContent = `【${categoryName}】`;
        }

        try {
            const response = await fetch(`data/${categoryFile}.csv`);
            if (!response.ok) throw new Error(`CSVファイルが見つかりません`);
            const csvText = await response.text();
            
            const parsedData = Papa.parse(csvText, { header: true, skipEmptyLines: true });
            questions = parsedData.data.sort(() => Math.random() - 0.5);
            
            displayQuestion();
        } catch (error) {
            console.error('CSV読み込みエラー:', error);
            questionElement.textContent = '問題の読み込みに失敗しました。';
        }

        function displayQuestion() {
            feedbackElement.textContent = '';
            nextButton.style.display = 'none';
            optionsElement.innerHTML = '';

            const q = questions[currentQuestionIndex];
            questionElement.textContent = `Q${currentQuestionIndex + 1}: ${q.question_text}`;

            [q.option_1, q.option_2, q.option_3, q.option_4].filter(opt => opt && opt.trim() !== '').forEach((opt, i) => {
                const button = document.createElement('button');
                button.textContent = opt;
                button.classList.add('option-btn');
                button.addEventListener('click', () => checkAnswer(i + 1));
                optionsElement.appendChild(button);
            });
        }

        function checkAnswer(selected) {
            Array.from(optionsElement.children).forEach(btn => btn.disabled = true);
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
            }
        });
    };
});
