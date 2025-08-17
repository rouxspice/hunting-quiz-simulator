document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
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

    // =====================================================================
    // == 【合意事項】問題データは、安定性確保のため、JSファイル内に直接記述 ==
    // =====================================================================
    const allQuestions = {
        "choujuu_hnb": [
            // --- 狩猟対象 (huntable: true) ---
            {
                "name": "カルガモ",
                "type": "鳥類",
                "image": "images/choujuu/karugamo.jpg",
                "huntable": true
            },
            {
                "name": "ニホンジカ",
                "type": "獣類",
                "image": "images/choujuu/nihonjika.jpg",
                "huntable": true
            },
            {
                "name": "キジ",
                "type": "鳥類",
                "image": "images/choujuu/kiji.jpg",
                "huntable": true
            },
            {
                "name": "タヌキ",
                "type": "獣類",
                "image": "images/choujuu/tanuki.jpg",
                "huntable": true
            },
            // --- 非狩猟対象 (huntable: false) ---
            {
                "name": "ドバト",
                "type": "鳥類",
                "image": "images/choujuu/dobato.png",
                "huntable": false
            },
            {
                "name": "ニホンザル",
                "type": "獣類",
                "image": "images/choujuu/nihonzaru.jpg",
                "huntable": false
            },
            {
                "name": "ハクビシン",
                "type": "獣類",
                "image": "images/choujuu/hakubishin.jpg",
                "huntable": false
            },
             {
                "name": "メジロ",
                "type": "鳥類",
                "image": "images/choujuu/mejiro.jpg",
                "huntable": false
            }
        ],
        // 他のカテゴリの問題は、将来の拡張のために、空の配列として定義
        "wanaryou": [],
        "amiryouchou": [],
        "juuryou_1": [],
        "juuryou_2": [],
        "shoshinsha": []
    };


    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizCategory = '';
    let quizCategoryName = '';

    // URLからパラメータを読み取り、クイズを初期化する
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

    // JSオブジェクトから問題データを読み込む
    function loadQuestions() {
        if (allQuestions[quizCategory]) {
            // 問題をシャッフルして、毎回違う順番で出題する
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
    
    // 配列をシャッフルするヘルパー関数 (Fisher-Yatesアルゴリズム)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    // クイズを開始する
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        nextBtn.style.display = 'none';
        showQuestion();
    }

    // 現在の問題を表示する
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
            
            // イベントリスナーの多重登録を防ぐため、一度クローンして置き換える
            const newHuntableOptions = huntableOptions.cloneNode(true);
            huntableOptions.parentNode.replaceChild(newHuntableOptions, huntableOptions);
            
            newHuntableOptions.querySelectorAll('.option-btn').forEach(button => {
                button.addEventListener('click', handleChoujuuAnswer);
            });
        } else {
            // 通常の択一問題（未実装）
            questionText.textContent = question.question;
        }
    }

    // ボタンやフィードバックの表示をリセットする
    function resetState() {
        feedbackContainer.textContent = '';
        feedbackContainer.className = 'feedback-container';
        nextBtn.style.display = 'none';
        
        document.querySelectorAll('.huntable-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }

    // 鳥獣判別クイズの回答を処理する
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
            // 不正解の場合、正解のボタンもハイライトする
            document.querySelector(`.huntable-btn[data-answer="${currentQuestions[currentQuestionIndex].huntable}"]`).classList.add('correct');
        }
        nextBtn.style.display = 'block';
    }

    // 「次の問題へ」ボタンの処理
    function handleNextButton() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }

    // 最終結果を表示する
    function showResults() {
        choujuuQuizArea.style.display = 'none';
        questionContainer.style.display = 'block';
        optionsContainer.innerHTML = '';
        feedbackContainer.textContent = '';
        nextBtn.style.display = 'none';
        quizProgressSpan.textContent = '試験終了';
        questionText.textContent = `試験終了！あなたのスコアは ${currentQuestions.length} 問中 ${score} 問正解です。`;
    }

    // イベントリスナーを登録
    nextBtn.addEventListener('click', handleNextButton);

    // 最初にクイズを初期化
    initializeQuiz();
});
