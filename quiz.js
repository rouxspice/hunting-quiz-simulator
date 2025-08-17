document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const quizCategorySpan = document.getElementById('quiz-category');
    const questionText = document.getElementById('question');
    // ... (他のDOM要素取得は変更なし) ...
    const quizProgressSpan = document.getElementById('quiz-progress');
    const progressBar = document.getElementById('progress-bar');
    const optionsContainer = document.getElementById('options');
    const feedbackContainer = document.getElementById('feedback');
    const nextBtn = document.getElementById('next-btn');
    const choujuuQuizArea = document.getElementById('choujuu-quiz-area');
    const choujuuImage = document.getElementById('choujuu-image');
    const choujuuInstruction = document.getElementById('choujuu-instruction');
    const huntableOptions = document.getElementById('huntable-options');


    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizCategory = '';
    let quizCategoryName = '';

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★ クイズ初期化処理を、URLクエリパラメータ方式に、完全準拠させる ★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    function initializeQuiz() {
        const urlParams = new URLSearchParams(window.location.search);
        const categoryFromUrl = urlParams.get('category');
        const nameFromUrl = urlParams.get('name');
        const categoryFromSession = sessionStorage.getItem('quizCategory');

        if (categoryFromUrl && nameFromUrl) {
            // 【通常クイズ】URLパラメータから情報を取得
            quizCategory = categoryFromUrl;
            quizCategoryName = decodeURIComponent(nameFromUrl);
        } else if (categoryFromSession === 'custom') {
            // 【カスタムクイズ】sessionStorageから情報を取得
            quizCategory = 'custom';
            quizCategoryName = sessionStorage.getItem('quizCategoryName');
            // カスタムクイズの設定も読み込む（今はまだ使わない）
            const customConfig = JSON.parse(sessionStorage.getItem('customQuizConfig'));
            if (!customConfig) {
                 questionText.textContent = 'エラー: カスタム試験の設定が見つかりません。';
                 return;
            }
        } else {
            questionText.textContent = 'エラー: クイズの情報を取得できませんでした。ホームに戻ってやり直してください。';
            return;
        }

        // ヘッダーの表示を更新
        quizCategorySpan.textContent = `現在挑戦中の試験：${quizCategoryName}`;
        loadQuestions();
    }

    // 問題データを読み込む
    async function loadQuestions() {
        try {
            const response = await fetch('questions.json');
            if (!response.ok) throw new Error('問題ファイル(questions.json)の読み込みに失敗しました。');
            const allQuestions = await response.json();

            // ★★★ カテゴリに応じて問題を選択 ★★★
            if (allQuestions[quizCategory]) {
                currentQuestions = allQuestions[quizCategory];
                if(currentQuestions.length === 0){
                    throw new Error(`カテゴリ「${quizCategoryName}」の問題がありません。`);
                }
                startQuiz();
            } else {
                throw new Error(`カテゴリ「${quizCategoryName}」の問題データが見つかりません。`);
            }
        } catch (error) {
            questionText.textContent = error.message;
            console.error(error);
        }
    }
    
    // クイズを開始する
    function startQuiz() {
        currentQuestionIndex = 0;
        score = 0;
        nextBtn.style.display = 'none';
        showQuestion();
    }

    // 問題を表示する
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
            // 通常クイズの選択肢表示ロジックは今後実装
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

    // ページの読み込み完了時に、クイズの初期化処理を呼び出す
    initializeQuiz();
});
