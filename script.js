document.addEventListener('DOMContentLoaded', () => {
    const topPageContainer = document.getElementById('top-page-container');
    const quizContainer = document.getElementById('quiz');
    
    // 全ての「挑戦する」ボタンを取得
    const challengeButtons = document.querySelectorAll('.challenge-btn');

    // 各ボタンにイベントリスナーを設定
    challengeButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // クリックされたボタンのIDを取得
            const buttonId = event.target.id;
            
            // ここで、どのクイズを開始するかを判定
            // 例: 'start-choujuu-btn' なら鳥獣判別クイズを開始
            console.log(buttonId + ' がクリックされました。クイズを開始します。');

            // トップページを非表示にする
            topPageContainer.style.display = 'none';
            
            // クイズコンテナを表示する
            quizContainer.style.display = 'block';

            // TODO: ここに、選択されたクイズの種類に応じて、
            // 問題を読み込み、表示する処理を追加する必要があります。
            // (例: loadQuizData(buttonId); のような関数を呼び出す)
        });
    });
});
