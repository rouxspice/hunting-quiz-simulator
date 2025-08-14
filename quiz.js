// DOM要素の取得
const quizSelection = document.getElementById('quiz-selection');
const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const quizStatus = document.getElementById('quiz-status');
const backToHomeBtn = document.getElementById('back-to-home'); // id="back-to-home" を持つ要素を取得

// クイズデータ
const quizData = {
    'chouju-hantei': {
        title: '狩猟鳥獣判別クイズ',
        filePath: './data/chouju_hantei.csv'
    },
    'wana-hantei': {
        title: 'わな猟具判別クイズ',
        filePath: './data/wana.csv' // 存在しないCSV
    },
    'dai-nishu': {
        title: '第二種銃猟免許',
        filePath: './data/dai_nishu.csv' // 存在しないCSV
    }
};

let currentQuiz = [];
let currentQuestionIndex = 0;

// CSVデータを読み込む関数
async function loadCSV(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        // BOMを削除し、空行を除外
        const cleanedText = text.trim().replace(/^\uFEFF/, '');
        if (!cleanedText) return [];
        return cleanedText.split('\n').map(row => row.split(','));
    } catch (error) {
        console.error(`CSVファイルの読み込みに失敗しました: ${filePath}`, error);
        return null; // エラーの場合はnullを返す
    }
}

// クイズを表示する関数
function displayQuestion() {
    const questionData = currentQuiz[currentQuestionIndex];
    const [image, question, choice1, choice2, answer] = questionData;

    quizStatus.textContent = `現在挑戦中の試験：${quizData[sessionStorage.getItem('selectedQuiz')].title} 残り ${currentQuiz.length - currentQuestionIndex} / ${currentQuiz.length} 問`;

    questionContainer.innerHTML = `
        <img src="./images/${image}" alt="問題画像" class="question-image">
        <p class="question-text">${question}</p>
        <div class="choices">
            <button class="choice-btn" data-answer="${choice1}">${choice1}</button>
            <button class="choice-btn" data-answer="${choice2}">${choice2}</button>
        </div>
    `;
}

// 問題がない場合のメッセージを表示する関数
function displayNoQuestionMessage(title) {
    quizStatus.textContent = `現在挑戦中の試験：${title}`;
    questionContainer.innerHTML = `
        <div class="no-question-message">
            <p>申し訳ありません。</p>
            <p>選択されたカテゴリに、まだ問題がありません。</p>
        </div>
    `;
}

// クイズを開始する関数
async function startQuiz(quizId) {
    const selectedQuiz = quizData[quizId];
    if (!selectedQuiz) {
        console.error('選択されたクイズIDが見つかりません:', quizId);
        displayNoQuestionMessage('不明なクイズ');
        return;
    }

    sessionStorage.setItem('selectedQuiz', quizId);
    quizSelection.classList.add('hidden');
    quizContainer.classList.remove('hidden');

    const csvData = await loadCSV(selectedQuiz.filePath);

    if (csvData === null || csvData.length === 0 || (csvData.length === 1 && csvData[0].join('').trim() === '')) {
        displayNoQuestionMessage(selectedQuiz.title);
        return;
    }

    currentQuiz = csvData.slice(1).filter(row => row.length >= 5 && row.join('').trim() !== '');
    
    if (currentQuiz.length === 0) {
        displayNoQuestionMessage(selectedQuiz.title);
        return;
    }

    currentQuestionIndex = 0;
    displayQuestion();
}

// ホーム画面に戻る関数
function goHome() {
    quizSelection.classList.remove('hidden');
    quizContainer.classList.add('hidden');
    sessionStorage.removeItem('selectedQuiz');
    questionContainer.innerHTML = '';
    quizStatus.textContent = '';
}

// イベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    // クイズ選択ボタン
    const quizButtons = document.querySelectorAll('.quiz-btn');
    quizButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const quizId = e.target.dataset.quizId;
            if (quizId) {
                startQuiz(quizId);
            }
        });
    });

    // 選択肢ボタン（イベント委任）
    questionContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('choice-btn')) {
            alert(`「${e.target.dataset.answer}」が選択されました。`);
            currentQuestionIndex++;
            if (currentQuestionIndex < currentQuiz.length) {
                displayQuestion();
            } else {
                alert('クイズ終了です！');
                goHome();
            }
        }
    });

    // ★★★★★ 修正箇所 ★★★★★
    // ホームに戻るボタンの存在を確認してからイベントリスナーを設定
    if (backToHomeBtn) {
        backToHomeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            goHome();
        });
    }
    // ★★★★★ ここまで ★★★★★

    // ページ読み込み時に状態を復元
    const selectedQuizId = sessionStorage.getItem('selectedQuiz');
    if (selectedQuizId && quizData[selectedQuizId]) {
        startQuiz(selectedQuizId);
    }
});
