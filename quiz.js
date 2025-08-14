// DOM要素の取得
const quizSelection = document.getElementById('quiz-selection');
const quizContainer = document.getElementById('quiz-container');
const questionContainer = document.getElementById('question-container');
const quizStatus = document.getElementById('quiz-status');
const backToHomeBtn = document.getElementById('back-to-home');

// クイズデータ
const quizData = {
    'chouju-hantei': {
        title: '狩猟鳥獣判別クイズ',
        filePath: './data/chouju_hantei.csv'
    },
    'wana-hantei': {
        title: 'わな猟具判別クイズ',
        filePath: './data/wana.csv' // このファイルはまだ存在しない
    },
    // 他のクイズカテゴリもここに追加
};

let currentQuiz = [];
let currentQuestionIndex = 0;

// CSVデータを読み込む関数
async function loadCSV(filePath) {
    // ★★★★★ エラーハンドリング修正箇所 ★★★★★
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            // 404 Not FoundなどのHTTPエラーを捕捉
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        return text.split('\n').map(row => row.split(','));
    } catch (error) {
        console.error(`CSVファイルの読み込みに失敗しました: ${filePath}`, error);
        return null; // ★エラーが発生した場合はnullを返す
    }
    // ★★★★★ ここまで ★★★★★
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

// クイズを開始する関数
async function startQuiz(quizId) {
    const selectedQuiz = quizData[quizId];
    if (!selectedQuiz) {
        console.error('選択されたクイズIDが見つかりません:', quizId);
        return;
    }

    sessionStorage.setItem('selectedQuiz', quizId);
    quizSelection.classList.add('hidden');
    quizContainer.classList.remove('hidden');

    const csvData = await loadCSV(selectedQuiz.filePath);

    // ★★★★★ エラーハンドリング修正箇所 ★★★★★
    if (!csvData || csvData.length <= 1) { // CSVがない、またはヘッダー行のみの場合
        quizStatus.textContent = `現在挑戦中の試験：${selectedQuiz.title}`;
        questionContainer.innerHTML = `
            <div class="no-question-message">
                <p>申し訳ありません。</p>
                <p>選択されたカテゴリに、まだ問題がありません。</p>
            </div>
        `;
        return; // 問題がないので処理を中断
    }
    // ★★★★★ ここまで ★★★★★

    currentQuiz = csvData.slice(1).filter(row => row.length >= 5); // ヘッダーを除き、空行をフィルタリング
    currentQuestionIndex = 0;
    displayQuestion();
}

// ホーム画面に戻る関数
function goHome() {
    quizSelection.classList.remove('hidden');
    quizContainer.classList.add('hidden');
    sessionStorage.removeItem('selectedQuiz');
    questionContainer.innerHTML = ''; // コンテナをクリア
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
            startQuiz(quizId);
        });
    });

    // 選択肢ボタン（イベント委任）
    questionContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('choice-btn')) {
            // ここに回答処理のロジックを追加
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

    // ホームに戻るボタン
    backToHomeBtn.addEventListener('click', goHome);

    // ページ読み込み時に状態を復元
    const selectedQuizId = sessionStorage.getItem('selectedQuiz');
    if (selectedQuizId) {
        startQuiz(selectedQuizId);
    }
});
