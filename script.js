document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 ---
    const topPageContainer = document.getElementById('top-page-container');
    const quizContainer = document.getElementById('quiz');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons'); // HTML側でulをdivに変更することを想定
    const submitButton = document.getElementById('submit');
    const challengeButtons = document.querySelectorAll('.challenge-btn');

    // --- クイズデータ ---
    // 将来的に、このデータを外部ファイル(quiz-data.js)に分離することも可能
    const quizData = {
        choujuu: [
            {
                question: "この動物は狩猟鳥獣ですか？ (画像: ニホンジカ)",
                answers: [
                    { text: "はい、狩猟鳥獣です", correct: true },
                    { text: "いいえ、狩猟鳥獣ではありません", correct: false }
                ]
            },
            {
                question: "この鳥は狩猟鳥獣ですか？ (画像: スズメ)",
                answers: [
                    { text: "はい、狩猟鳥獣です", correct: true },
                    { text: "いいえ、狩猟鳥獣ではありません", correct: false }
                ]
            }
        ],
        wana: [
            {
                question: "わな猟免許で、ヒグマを捕獲することは可能か？",
                answers: [
                    { text: "可能である", correct: true },
                    { text: "不可能である", correct: false },
                    { text: "都道府県知事の許可があれば可能", correct: false },
                    { text: "環境大臣の許可があれば可能", correct: false }
                ]
            },
            {
                question: "「くくりわな」で、使用が禁止されているワイヤーの直径は？",
                answers: [
                    { text: "直径4mm", correct: false },
                    { text: "直径8mm", correct: false },
                    { text: "直径12mm", correct: true },
                    { text: "直径に規制はない", correct: false }
                ]
            }
        ]
        // ... 他のカテゴリのクイズデータもここに追加 ...
    };

    let currentQuiz = [];
    let currentQuestionIndex = 0;

    // --- イベントリスナー ---
    challengeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonId = event.target.id;
            // 例: "start-choujuu-btn" -> "choujuu"
            const quizCategoryKey = buttonId.replace('start-', '').replace('-btn', ''); 
            
            startQuiz(quizCategoryKey);
        });
    });

    submitButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.length) {
            showQuestion();
        } else {
            // クイズ終了処理
            alert('クイズ終了です！お疲れ様でした。');
            // トップページに戻る
            quizContainer.style.display = 'none';
            topPageContainer.style.display = 'block';
        }
    });


    // --- 関数定義 ---

    /**
     * クイズを開始する関数
     * @param {string} categoryKey - クイズのカテゴリキー (e.g., 'choujuu', 'wana')
     */
    function startQuiz(categoryKey) {
        currentQuiz = quizData[categoryKey] || [];
        if (currentQuiz.length === 0) {
            alert('このクイズは現在準備中です。');
            return;
        }
        currentQuestionIndex = 0;

        topPageContainer.style.display = 'none';
        quizContainer.style.display = 'block';
        
        showQuestion();
    }

    /**
     * 現在の問題と選択肢を表示する関数
     */
    function showQuestion() {
        resetState();
        const question = currentQuiz[currentQuestionIndex];
        questionElement.innerText = question.question;
        
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('answer-btn'); // CSSでスタイルを当てるためのクラス
            if (answer.correct) {
                button.dataset.correct = answer.correct;
            }
            button.addEventListener('click', selectAnswer);
            answerButtonsElement.appendChild(button);
        });
    }

    /**
     * 表示をリセットする関数
     */
    function resetState() {
        submitButton.style.display = 'none'; // 次の問題へ進むボタンを一旦隠す
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
    }

    /**
     * 選択肢がクリックされたときの処理
     * @param {Event} e - クリックイベント
     */
    function selectAnswer(e) {
        const selectedButton = e.target;
        const correct = selectedButton.dataset.correct === "true";

        // 全てのボタンの正解・不正解を表示
        Array.from(answerButtonsElement.children).forEach(button => {
            setStatusClass(button, button.dataset.correct === "true");
        });

        if (correct) {
            console.log("正解！");
        } else {
            console.log("不正解...");
        }

        // 次の問題へ進むボタンを表示
        submitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る";
        submitButton.style.display = 'block';
    }

    /**
     * ボタンに正解・不正解のスタイルを適用する関数
     * @param {HTMLElement} element - 対象のボタン
     * @param {boolean} correct - 正解かどうか
     */
    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    /**
     * ボタンのスタイルをクリアする関数
     * @param {HTMLElement} element - 対象のボタン
     */
    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }
});
