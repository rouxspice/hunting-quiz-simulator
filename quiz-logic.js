'use strict';

// --- クイズデータ（再構築のため、まずは1問に絞る） ---
const quizData = [
    {
        question: "銃猟における水平射撃の危険性について、最も適切なものはどれか？",
        options: ["矢先の安全が確認できれば問題ない", "人家、人、家畜等の方向に撃つことは絶対に避けるべきである", "30度以下の角度であれば安全である", "弾丸の到達距離を把握していれば問題ない"],
        correct: "人家、人、家畜等の方向に撃つことは絶対に避けるべきである",
        explanation: "水平射撃は弾丸が予期せぬ長距離まで達する可能性があり、極めて危険です。特に、矢先に人家、人、家畜などが存在する可能性がある場所では、絶対に避けるべきです。"
    },
    // まずは1問だけで確実に動作させるため、残りはコメントアウト
    // {
    //     question: "鳥獣保護管理法において、捕獲が原則として禁止されている鳥獣はどれか？",
    //     options: ["ニホンジカ", "イノシシ", "ツキノワグマ（メス）", "カワウ"],
    //     correct: "ツキノワグマ（メス）",
    //     explanation: "種の保存のため、多くの地域でメスのツキノワグマの捕獲は禁止または厳しく制限されています。"
    // },
    // {
    //     question: "散弾銃の保管に関する記述として、正しいものはどれか？",
    //     options: ["弾を込めたまま保管できる", "家族がすぐに使えるように、分かりやすい場所に置く", "ガンロッカー等、施錠できる設備に保管する", "分解して、各部品を別々の部屋に保管する"],
    //     correct: "ガンロッカー等、施錠できる設備に保管する",
    //     explanation: "銃砲刀剣類所持等取締法（銃刀法）により、銃は盗難や不正使用を防ぐため、施錠できる堅牢なガンロッカーなどに保管することが義務付けられています。"
    // }
];

// --- DOM要素の取得（必要最小限） ---
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const feedbackElement = document.getElementById('feedback');
const nextButton = document.getElementById('next-button');

// --- メインの処理 ---

// 1. 最初のクイズデータを取得
const firstQuiz = quizData[0];

// 2. 質問文を表示
questionElement.textContent = `第1問: ${firstQuiz.question}`;

// 3. 選択肢ボタンを生成
firstQuiz.options.forEach(optionText => {
    const button = document.createElement('button');
    button.textContent = optionText;
    button.classList.add('option');
    
    // 4. ボタンがクリックされた時の処理を定義
    button.addEventListener('click', () => {
        // とにかくアラートを出すだけの、最も単純な処理
        alert(`「${optionText}」がクリックされました！`);
    });
    
    optionsContainer.appendChild(button);
});

// 5. 不要な要素は隠しておく
feedbackElement.style.display = 'none';
nextButton.style.display = 'none';

console.log("【再構築版】スクリプトの読み込みが完了しました。");
