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

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★ ここからが追加する、クイズ初期化のための最重要コードです ★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    let currentQuestions = [];
    let currentQuestionIndex = 0;
    let score = 0;
    let quizCategory = '';
    let quizCategoryName = '';

    // sessionStorageからクイズ情報を取得して初期化
    function initializeQuiz() {
        quizCategory = sessionStorage.getItem('quizCategory');
        quizCategoryName = sessionStorage.getItem('quizCategoryName');

        if (!quizCategory || !quizCategoryName) {
            questionText.textContent = 'エラー: クイズの情報を取得できませんでした。ホームに戻ってやり直してください。';
            return;
        }

        // ヘッダーの表示を更新
        quizCategorySpan.textContent = `現在挑戦中の試験：${quizCategoryName}`;
        
        // 問題データをロードしてクイズを開始
        loadQuestions();
    }

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★ ここまでが追加するコードです ★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


    // 問題データをJSONファイルから読み込む
    async function loadQuestions() {
        try {
            // 本来はカテゴリごとにファイルを分けるべきだが、今は仮で一つのファイルから読み込む
            const response = await fetch('questions.json'); 
            if (!response.ok) {
                throw new Error('問題ファイルの読み込みに失敗しました。');
            }
            const allQuestions = await response.json();
            
            // 選択されたカテゴリの問題をフィルタリング
            // 現状は仮で 'choujuu_hnb' のみ対応
            if (allQuestions[quizCategory]) {
                currentQuestions = allQuestions[quizCategory];
                startQuiz();
            } else {
                throw new Error('選択されたカテゴリの問題が見つかりません。');
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

        // UIの表示切り替え
        const isChoujuuQuiz = quizCategory === 'choujuu_hnb';
        choujuuQuizArea.style.display = isChoujuuQuiz ? 'block' : 'none';
        questionContainer.style.display = isChoujuuQuiz ? 'none' : 'block';

        // プログレス表示を更新
        quizProgressSpan.textContent = `残り ${currentQuestions.length - currentQuestionIndex} / ${currentQuestions.length} 問`;
        const progressPercentage = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;


        if (isChoujuuQuiz) {
            // 鳥獣判別クイズの場合
            choujuuImage.src = question.image;
            choujuuImage.alt = question.name;
            choujuuInstruction.textContent = `この鳥獣は「${question.type}」です。狩猟対象ですか？`;
            
            // 既存のイベントリスナーを削除してから再設定
            const newHuntableOptions = huntableOptions.cloneNode(true);
            huntableOptions.parentNode.replaceChild(newHuntableOptions, huntableOptions);
            
            newHuntableOptions.querySelectorAll('.option-btn').forEach(button => {
                button.addEventListener('click', handleChoujuuAnswer);
            });

        } else {
            // 通常の択一クイズの場合 (未実装)
            questionText.textContent = question.question;
            // ここに選択肢を作成するロジック
        }
    }
    
    // 回答の選択状態をリセット
    function resetState() {
        feedbackContainer.textContent = '';
        feedbackContainer.className = 'feedback-container';
        nextBtn.style.display = 'none';
        
        // 鳥獣判別クイズのボタンの状態をリセット
        document.querySelectorAll('.huntable-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('correct', 'incorrect');
        });
    }

    // 鳥獣判別クイズの回答を処理
    function handleChoujuuAnswer(e) {
        const selectedBtn = e.target;
        const isCorrect = (selectedBtn.dataset.answer === String(currentQuestions[currentQuestionIndex].huntable));

        // 全てのボタンを無効化
        document.querySelectorAll('.huntable-btn').forEach(btn => {
            btn.disabled = true;
        });

        if (isCorrect) {
            selectedBtn.classList.add('correct');
            feedbackContainer.textContent = '正解！';
            feedbackContainer.classList.add('correct-feedback');
            score++;
        } else {
            selectedBtn.classList.add('incorrect');
            feedbackContainer.textContent = `不正解。正解は「${currentQuestions[currentQuestionIndex].huntable ? '獲れる' : '獲れない'}」です。`;
            feedbackContainer.classList.add('incorrect-feedback');
            
            // 正解のボタンをハイライト
            document.querySelector(`.huntable-btn[data-answer="${currentQuestions[currentQuestionIndex].huntable}"]`).classList.add('correct');
        }

        nextBtn.style.display = 'block';
    }


    // 次の問題へ進む
    function handleNextButton() {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuestions.length) {
            showQuestion();
        } else {
            showResults();
        }
    }

    // 結果を表示する
    function showResults() {
        // 全ての表示をクリア
        choujuuQuizArea.style.display = 'none';
        questionContainer.style.display = 'block'; // 結果表示に再利用
        optionsContainer.innerHTML = '';
        feedbackContainer.textContent = '';
        nextBtn.style.display = 'none';
        quizProgressSpan.textContent = '試験終了';

        questionText.textContent = `試験終了！あなたのスコアは ${currentQuestions.length} 問中 ${score} 問正解です。`;
        
        // ここにリザルト画面の詳細なロジックを追加していく
    }


    // イベントリスナーの設定
    nextBtn.addEventListener('click', handleNextButton);

    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // ★★★ ページの読み込み完了時に、クイズの初期化処理を呼び出す ★★★
    // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    initializeQuiz();
});
