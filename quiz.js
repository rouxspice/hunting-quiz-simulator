document.addEventListener('DOMContentLoaded', async () => {
    // (DOM取得、効果音再生関数などは変更なし)
    // ...

    // --- クイズ情報の取得と初期設定 ---
    const quizInfoString = localStorage.getItem('quizInfo');
    // ...
    const quizInfo = JSON.parse(quizInfoString);
    
    // ★★★ 特訓モードの場合はタイトルを書き換え ★★★
    quizCategoryElement.textContent = `現在挑戦中の試験：${quizInfo.type === 'training' ? quizInfo.title : quizInfo.categoryName}`;
    
    // (変数定義は変更なし)
    // ...

    papaParseScript.onload = async () => {
        try {
            // ★★★ 特訓モードの問題取得ロジックを追加 ★★★
            if (quizInfo.type === 'training') {
                const response = await fetch(`/data/${quizInfo.csvFile}.csv`);
                if (!response.ok) throw new Error(`CSVが見つかりません: ${quizInfo.csvFile}.csv`);
                const csvText = await response.text();
                const allData = Papa.parse(csvText, { header: true, skipEmptyLines: true }).data;
                // 答えの列が存在するデータのみを対象にする
                currentQuestions = allData.filter(q => q[quizInfo.answerColumn] && q[quizInfo.answerColumn].trim() !== '');

            } else if (quizInfo.type === 'real') {
                // (本番モードのロジックは変更なし)
                // ...
            } else { // 'custom' と 'single'
                // (カスタム/シングルモードのロジックは変更なし)
                // ...
            }

            currentQuestions.sort(() => Math.random() - 0.5);

            // (以降の初期化処理は変更なし)
            // ...

        } catch (error) {
            // ...
        }
    };

    // ...

    function displayQuestion() {
        // ...
        const q = currentQuestions[currentQuestionIndex];

        // ★★★ 特訓モードの表示処理を追加 ★★★
        if (quizInfo.type === 'training') {
            displayTrainingQuestion(q);
        } else {
            // (既存の通常/鳥獣判別クイズのロジック)
            const isChoujuuQuestion = (q.is_huntable !== undefined && q.is_huntable !== '');
            if (isChoujuuQuestion) {
                 displayChoujuuQuestion(q);
            } else {
                 displayNormalQuestion(q);
            }
        }
    }

    // ★★★ 特訓モード専用の表示関数を新設 ★★★
    function displayTrainingQuestion(q) {
        // 問題のタイプに応じて表示を切り替え
        if (quizInfo.questionType === 'image_and_text') {
            questionContainer.style.display = 'none';
            choujuuQuizArea.style.display = 'block';
            huntableOptions.style.display = 'none'; // 「獲れる/獲れない」は非表示
            choujuuImage.src = `/images/${q.image_file}`;
            choujuuImage.alt = `写真: ${q[quizInfo.questionColumn]}`;
            choujuuInstruction.textContent = `「${q[quizInfo.questionColumn]}」は、どれに分類されますか？`;
        } else { // text_only
            questionElement.textContent = `「${q[quizInfo.questionColumn]}」は、どれに分類されますか？`;
        }

        // data-options属性から選択肢ボタンを生成
        quizInfo.options.forEach(opt => {
            const button = document.createElement('button');
            button.textContent = opt;
            button.classList.add('option-btn');
            button.addEventListener('click', () => checkTrainingAnswer(opt, q));
            optionsElement.appendChild(button);
        });
    }

    // ★★★ 特訓モード専用の正誤判定関数を新設 ★★★
    function checkTrainingAnswer(selectedOption, q) {
        const correctAnswer = q[quizInfo.answerColumn];
        const isCorrect = selectedOption === correctAnswer;

        Array.from(optionsElement.children).forEach(btn => {
            if (btn.textContent === correctAnswer) {
                btn.classList.add('correct');
            } else if (btn.textContent === selectedOption) {
                btn.classList.add('incorrect');
            }
        });

        showFeedback(isCorrect, q.explanation || `${q[quizInfo.questionColumn]}は「${correctAnswer}」です。`);
    }

    // (既存の表示・判定関数は変更なし)
    // ...
});
