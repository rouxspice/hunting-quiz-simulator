document.addEventListener('DOMContentLoaded', () => {
    // --- DOM要素の取得 (変更なし) ---
    const topPageContainer = document.getElementById('top-page-container');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const feedbackIcon = document.getElementById('feedback-icon');
    const quizContainer = document.getElementById('quiz');
    const questionElement = document.getElementById('question');
    const answerButtonsElement = document.getElementById('answer-buttons');
    const submitButton = document.getElementById('submit');
    const quizContainerChoujuu = document.getElementById('quiz-choujuu');
    const choujuuImage = document.getElementById('choujuu-image');
    const choujuuStep1 = document.getElementById('choujuu-step1');
    const choujuuStep2 = document.getElementById('choujuu-step2');
    const choujuuNameOptions = document.getElementById('choujuu-name-options');
    const choujuuFeedback = document.getElementById('choujuu-feedback');
    const choujuuSubmitButton = document.getElementById('choujuu-submit');
    const challengeButtons = document.querySelectorAll('.challenge-btn');

    // --- クイズデータ (変更なし) ---
    const quizData = {
        choujuu: [
            { image: "images/nihonjika.jpg", isHuntable: true, name: "ニホンジカ", distractors: ["カモシカ", "ツキノワグマ", "イノシシ"] },
            { image: "images/kamoshika.jpg", isHuntable: false, name: "カモシカ" },
            { image: "images/kiji.jpg", isHuntable: true, name: "キジ", distractors: ["ヤマドリ", "ライチョウ", "ウズラ"] },
            { image: "images/raichou.jpg", isHuntable: false, name: "ライチョウ" }
        ],
        ami: [
            { question: "網猟免許で捕獲が許可されている鳥獣は？", answers: [{ text: "鳥類のみ", correct: true }, { text: "獣類のみ", correct: false }, { text: "鳥類と獣類の両方", correct: false }] },
            { question: "禁止されている網猟具は次のうちどれか？", answers: [{ text: "むそう網", correct: false }, { text: "はり網", correct: false }, { text: "かすみ網", correct: true }] },
            { question: "公道上で網を使用して鳥獣を捕獲することは、全面的に許可されている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }
        ],
        wana: [
            { question: "「くくりわな」を使用してクマ類（ヒグマ・ツキノワグマ）を捕獲することは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "使用が禁止されている「とらばさみ」は、内径の最大長が何cmを超えるものか？", answers: [{ text: "8cm", correct: false }, { text: "12cm", correct: true }, { text: "16cm", correct: false }] },
            { question: "法定猟具である「わな」を一人で31個以上使用して猟を行うことは禁止されている。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }
        ],
        jyu1: [
            { question: "第一種銃猟免許で扱える銃器は、装薬銃（散弾銃・ライフル銃）と空気銃である。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "住居が集合している地域では、流れ弾に注意すれば銃器による捕獲が認められている。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] },
            { question: "銃の安全装置をかけておけば、脱包しなくても、銃を持ったまま跳びはねても暴発の危険はない。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] }
        ],
        jyu2: [
            { question: "第二種銃猟免許で扱える銃器は、空気銃のみである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "狩猟鳥獣であるカモ類の捕獲数の制限は、1日あたり合計5羽までである。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "獲物を手に入れるために発砲した場合、半矢で逃してしまっても「捕獲行為」をしたことになる。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }
        ],
        beginner: [
            { question: "銃砲所持許可は、都道府県公安委員会が発行する。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] },
            { question: "銃砲刀剣類所持等取締法（銃刀法）は、原則として銃砲を所持することを許可している。", answers: [{ text: "正しい", correct: false }, { text: "誤り", correct: true }] },
            { question: "所持許可を受けた猟銃を他人に盗まれたときは、直ちにその旨を警察署に届け出なければならない。", answers: [{ text: "正しい", correct: true }, { text: "誤り", correct: false }] }
        ]
    };

    let currentQuiz = [];
    let currentQuestionIndex = 0;

    // --- 演出関数 (変更なし) ---
    function showFeedbackAnimation(isCorrect, callback) {
        feedbackIcon.className = isCorrect ? 'correct' : 'wrong';
        feedbackOverlay.classList.add('show');
        setTimeout(() => {
            feedbackOverlay.classList.remove('show');
            if (callback) {
                setTimeout(callback, 300);
            }
        }, 1000);
    }

    // --- イベントリスナーの初期化 (変更なし) ---
    challengeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const buttonId = event.target.id;
            const quizCategoryKey = buttonId.replace('start-', '').replace('-btn', '');
            if (quizCategoryKey === 'choujuu') {
                startChoujuuQuiz();
            } else {
                startNormalQuiz(quizCategoryKey);
            }
        });
    });

    // --- ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // --- ★★★ ここからが、バグ修正の、中心部分です ★★★
    // --- ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

    // --- 鳥獣判別クイズ専用ロジック ---
    
    // ステップ1のボタンにイベントリスナーを一度だけ設定
    document.querySelectorAll('.choujuu-choice-btn').forEach(button => {
        button.addEventListener('click', handleChoujuuStep1Choice);
    });

    function handleChoujuuStep1Choice(e) {
        const choice = e.target.dataset.choice;
        const question = currentQuiz[currentQuestionIndex];
        let isCorrect;

        if (choice === 'no') {
            isCorrect = !question.isHuntable;
        } else { // choice === 'yes'
            isCorrect = question.isHuntable;
        }
        
        // 一時的にイベントリスナーを無効化して二重クリックを防ぐ
        document.querySelectorAll('.choujuu-choice-btn').forEach(btn => btn.removeEventListener('click', handleChoujuuStep1Choice));

        showFeedbackAnimation(isCorrect, () => {
            if (choice === 'no') {
                if (!question.isHuntable) {
                    showFeedback(true, "正解！これは非狩猟鳥獣のため、捕獲できません。");
                } else {
                    showFeedback(false, `不正解。これは狩猟鳥獣（${question.name}）です。`);
                }
            } else { // choice === 'yes'
                if (!question.isHuntable) {
                    showFeedback(false, "不正解。これは非狩猟鳥獣のため、捕獲できません。");
                } else {
                    choujuuStep1.style.display = 'none';
                    choujuuStep2.style.display = 'block';
                    setupNameSelection(question);
                }
            }
            // 次の問題に備えてイベントリスナーを再設定
            if (choice === 'no' || !question.isHuntable) {
                 document.querySelectorAll('.choujuu-choice-btn').forEach(btn => btn.addEventListener('click', handleChoujuuStep1Choice));
            }
        });
    }

    function startChoujuuQuiz() {
        currentQuiz = quizData.choujuu;
        currentQuestionIndex = 0;
        topPageContainer.style.display = 'none';
        quizContainerChoujuu.style.display = 'block';
        showChoujuuQuestion();
    }

    function showChoujuuQuestion() {
        resetChoujuuState();
        const question = currentQuiz[currentQuestionIndex];
        choujuuImage.src = question.image;
    }

    function resetChoujuuState() {
        choujuuStep1.style.display = 'block';
        choujuuStep2.style.display = 'none';
        choujuuFeedback.style.display = 'none';
        choujuuSubmitButton.style.display = 'none';
        while (choujuuNameOptions.firstChild) {
            choujuuNameOptions.removeChild(choujuuNameOptions.firstChild);
        }
        // イベントリスナーが外れている可能性があるので、再設定を確実に行う
        document.querySelectorAll('.choujuu-choice-btn').forEach(button => {
            button.removeEventListener('click', handleChoujuuStep1Choice); // 念のため古いリスナーを削除
            button.addEventListener('click', handleChoujuuStep1Choice); // 新しく設定
        });
    }

    function setupNameSelection(question) {
        const options = [...question.distractors, question.name];
        options.sort(() => Math.random() - 0.5);
        options.forEach(name => {
            const button = document.createElement('button');
            button.innerText = name;
            button.classList.add('answer-btn');
            button.addEventListener('click', () => {
                const isCorrect = (name === question.name);
                showFeedbackAnimation(isCorrect, () => {
                    if (isCorrect) {
                        showFeedback(true, `正解！これは${question.name}です。`);
                    } else {
                        showFeedback(false, `不正解。正しくは${question.name}です。`);
                    }
                    Array.from(choujuuNameOptions.children).forEach(btn => btn.disabled = true);
                });
            });
            choujuuNameOptions.appendChild(button);
        });
    }

    function showFeedback(isCorrect, message) {
        choujuuFeedback.textContent = message;
        choujuuFeedback.className = 'feedback-container';
        choujuuFeedback.classList.add(isCorrect ? 'correct' : 'wrong');
        choujuuSubmitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "トップに戻る";
        choujuuSubmitButton.style.display = 'block';
    }

    choujuuSubmitButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.length) {
            showChoujuuQuestion();
        } else {
            alert('鳥獣判別クイズ終了です！');
            quizContainerChoujuu.style.display = 'none';
            topPageContainer.style.display = 'block';
        }
    });

    // --- ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
    // --- ★★★ バグ修正部分は、ここまでです ★★★
    // --- ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★


    // --- 通常クイズ用ロジック (変更なし) ---
    function startNormalQuiz(categoryKey) {
        currentQuiz = quizData[categoryKey] || [];
        if (currentQuiz.length === 0) {
            alert('このクイズは現在準備中です。');
            return;
        }
        currentQuestionIndex = 0;
        topPageContainer.style.display = 'none';
        quizContainer.style.display = 'block';
        showNormalQuestion();
    }

    function showNormalQuestion() {
        resetNormalState();
        const question = currentQuiz[currentQuestionIndex];
        questionElement.innerText = question.question;
        question.answers.forEach(answer => {
            const button = document.createElement('button');
            button.innerText = answer.text;
            button.classList.add('answer-btn');
            if (answer.correct) {
                button.dataset.correct = answer.correct;
            }
            button.addEventListener('click', selectNormalAnswer);
            answerButtonsElement.appendChild(button);
        });
    }

    function resetNormalState() {
        submitButton.style.display = 'none';
        while (answerButtonsElement.firstChild) {
            answerButtonsElement.removeChild(answerButtonsElement.firstChild);
        }
    }

    function selectNormalAnswer(e) {
        const selectedButton = e.target;
        const isCorrect = selectedButton.dataset.correct === "true";
        showFeedbackAnimation(isCorrect, () => {
            Array.from(answerButtonsElement.children).forEach(button => {
                setStatusClass(button, button.dataset.correct === "true");
                button.disabled = true;
            });
            submitButton.innerText = (currentQuestionIndex < currentQuiz.length - 1) ? "次の問題へ" : "結果を見る";
            submitButton.style.display = 'block';
        });
    }
    
    submitButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < currentQuiz.length) {
            showNormalQuestion();
        } else {
            alert('クイズ終了です！お疲れ様でした。');
            quizContainer.style.display = 'none';
            topPageContainer.style.display = 'block';
        }
    });

    function setStatusClass(element, correct) {
        clearStatusClass(element);
        if (correct) {
            element.classList.add('correct');
        } else {
            element.classList.add('wrong');
        }
    }

    function clearStatusClass(element) {
        element.classList.remove('correct');
        element.classList.remove('wrong');
    }
});
