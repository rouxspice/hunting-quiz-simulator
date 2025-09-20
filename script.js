// ===================================================================
// ★★★ script.js (画像表示バグ修正・決定版) ★★★
// ===================================================================
window.onload = () => {

    // --- DOM要素の取得など（変更なし） ---
    // ... (これまでのコードと同じ) ...

    // ★★★ ここから startQuiz 関数を修正 ★★★
    async function startQuiz(categoryKey, mode, startFunction) {
        loaderWrapper.style.display = 'flex'; // ローダーを表示
        progressText.textContent = 'クイズデータを、読み込み中...';
        progressBar.style.width = '0%';
        try {
            await resetQuizState(categoryKey, mode);
            if (currentQuiz.length === 0) {
                goToTopPage();
                return; // ローダーは finally で非表示になる
            }
            const imageUrls = currentQuiz.filter(q => q.image).map(q => q.image);
            await preloadImages(imageUrls, (loaded, total, filename) => {
                const percentage = total > 0 ? (loaded / total) * 100 : 0;
                progressBar.style.width = `${percentage}%`;
                progressText.textContent = `画像を、読み込み中... (${loaded}/${total}) ${filename || ''}`;
            });
            progressText.textContent = 'クイズを、開始します...';
            
            // 画面遷移の直前に少し待つ
            await new Promise(resolve => setTimeout(resolve, 200));

            topPageContainer.style.display = 'none';
            quizContainers.forEach(container => container.style.display = 'none');
            startFunction();

        } catch (error) {
            console.error("クイズの開始に失敗しました:", error);
            alert("クイズの開始に失敗しました。トップページに戻ります。");
            goToTopPage();
        } finally {
            // ★★★ ローダーを非表示にする処理を display: none に統一 ★★★
            loaderWrapper.style.display = 'none';
        }
    }
    // ★★★ ここまでが修正箇所 ★★★


    // --- 初期化処理の、実行（一部修正） ---
    function initializeApp() {
        initializeEventListeners();
        updateTopPageUI();
        goToTopPage();

        // ★★★ 起動時のローダー非表示処理も display: none に統一 ★★★
        loaderWrapper.style.display = 'none';
    }

    // --- その他の関数は変更なし ---
    // ... (updateTopPageUI, preloadImages, loadQuizData, etc. はすべて変更なし) ...
    // ... (initializeEventListeners も内部のロジックは変更なし) ...

    // --- 初期化処理の実行 ---
    initializeApp();
};
