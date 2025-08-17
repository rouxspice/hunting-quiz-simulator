document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得 (変更なし)
    const quizCategorySpan = document.getElementById('quiz-category');
    const quizProgressSpan = document.getElementById('quiz-progress');
    const progressBar = document.getElementById('progress-bar');
    const questionContainer = document.getElementById('question-container');
    const questionText = document.getElementById('question');
    const optionsContainer = document.getElementById('options');
    const feedbackContainer = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const choujuuQuizArea = document.getElementById('choujuu-quiz-area');
    const choujuuImage = document.getElementById('choujuu-image');
    const choujuuInstruction = document.getElementById('choujuu-instruction');
    const huntableOptions = document.getElementById('huntable-options');

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★ すべての画像パスを、先頭に「/」を付けた、絶対パスに、完全統一 ★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    const allQuestions = {
        "choujuu_hnb": [
            {
                "name": "カルガモ",
                "type": "鳥類",
                "image": "/images/choujuu/karugamo.jpg",
                "huntable": true
            },
            {
                "name": "ニホンジカ",
                "type": "獣類",
                "image": "/images/choujuu/nihonjika.jpg",
                "huntable": true
            },
            {
                "name": "キジ",
                "type": "鳥類",
                "image": "/images/choujuu/kiji.jpg",
                "huntable": true
            },
            {
                "name": "タヌキ",
                "type": "獣類",
                "image": "/images/choujuu/tanuki.jpg",
                "huntable": true
            },
            {
                "name": "ドバト",
                "type": "鳥類",
                "image": "/images/choujuu/dobato.png",
                "huntable": false
            },
            {
                "name": "ニホンザル",
                "type": "獣類",
                "image": "/images/choujuu/nihonzaru.jpg",
                "huntable": false
            },
            {
                "name": "ハクビシン",
                "type": "獣類",
                "image": "/images/choujuu/hakubishin.jpg",
                "huntable": false
            },
             {
                "name": "メジロ",
                "type": "鳥類",
                "image": "/images/choujuu/mejiro.jpg",
                "huntable": false
            }
        ],
        "wanaryou": [], "amiryouchou": [], "juuryou_1": [], "juuryou_2": [], "shoshinsha": []
    };

    // --- これ以降のロジックは変更ありません ---

    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizCategory = '';
    let quizCategoryName = '';

    function initializeQuiz() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        const nameFromUrl = urlParams.get('name');
        if (categoryFromUrl && nameFromUrl) {
            quizCategory = categoryFromUrl;
            quizCategoryName = decodeURIComponent(nameFromUrl);
        } else {
            questionText.textContent = 'エラー: クイズの情報を取得できませんでした。ホームに戻ってやり直してください。';
            return;
        }
        quizCategorySpan.textContent = `現在挑戦中の試験：${quizCategoryName}`;
        loadQuestions();
    }

    function loadQuestions() {
        if (allQuestions[quizCategory]) {
            currentQuestions = shuffleArray(allQuestions[quizCategory]);
            if (currentQuestions.length === 0) {
                questionText.textContent = `カテゴリ「${quizCategoryName}」の問題は、現在準備中です。`;
                return;
            }
            startQuiz();
        } else {
            questionText.textContent = `カテゴリ「${quizCategoryName}」は存在しません。`;
        }
    }
    
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        nextBtn.style.display = 'none';
        showQuestion();
    }

    function showQuestion() {
        resetState();
        const question = currentQuestions[currentQuestionIndex];
        const isChoujuuQuiz = quizCategory === 'choujuu_hnb';
        choujuuQuizArea.style.display = isChoujuuQuiz ? 'block' : 'none';
        questionContainer.style.display = isChoujuuQuiz ? 'none' : 'block';
        quizProgressSpan.textContent = `残り ${currentQuestions.length - currentQuestionIndex} / ${currentQuestions.length} 問`;
        const progressPercentage = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;
        if (isChoujuuQuiz) {
            choujuuImage.src = question.image;
            choujuuImage.alt = question.name;
            choujuuInstruction.textContent = `この鳥獣は「${question.type}」です。狩猟対象ですか？`;
            const newHuntableOptions = huntableOptions.cloneNode(true);
            huntableOptions.parentNode.replaceChild(newHuntableOptions, huntableOptions);
            newHuntableOptions.querySelectorAll('.option-btn').forEach(button => {
                button.addEventListener('click', handleChoujuuAnswer);
            });
        } else {
            questionText.textContent = question.question;
        }
    }

    function resetState() {
        feedbackContainer.textContent = '';
        feedbackContainer.className = 'feedback-container';
        nextBtn.style.display = 'none';
        document.querySelectorAll('.huntable-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }

    function handleChoujuuAnswer(e) {
        const selectedBtn = e.target;
        const isCorrect = (selectedBtn.dataset.answer === String(currentQuestions[currentQuestionIndex].huntable));
        document.querySelectorAll('.huntable-btn').forEach(btn => btn.disabled = true);
        if (isCorrect) {
            selectedBtn.classList.add('correct');
            feedbackContainer.textContent = '正解！';
            feedbackContainer.classList.add('correct-feedback');
            score++;
        } else {
            selectedBtn.classList.add('incorrect');
            feedbackContainer.textContent = `不正解。正解は「${currentQuestions[currentQuestionIndex].huntable ? '獲れる' : '獲れない'}」です。`;
            feedbackContainer.classList.add('incorrect-feedback');
            document.querySelector(`.huntable-btn[data-answer="${currentQuestions[currentQuestionIndex].huntable}"]`).classList.add('correct');
        }
        nextBtn.style.display = 'block';
    }

    function handleNextButton() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }

    function showResults() {
        choujuuQuizArea.style.display = 'none';
        questionContainer.style.display = 'block';
        optionsContainer.innerHTML = '';
        feedbackContainer.textContent = '';
        nextBtn.style.display = 'none';
        quizProgressSpan.textContent = '試験終了';
        questionText.textContent = `試験終了！あなたのスコアは ${currentQuestions.length} 問中 ${score} 問正解です。`;
    }

    nextBtn.addEventListener('click', handleNextButton);
    initializeQuiz();
});

