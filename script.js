document.addEventListener('DOMContentLoaded', () => {
    // --- トップページ用の処理 ---
    const homeScreen = document.getElementById('home-screen');
    if (homeScreen) {
        const categoryButtons = document.querySelectorAll('.category-btn');
        categoryButtons.forEach(button => {
            button.addEventListener('click', () => {
                localStorage.setItem('selectedCategory', button.dataset.category);
                localStorage.setItem('selectedCategoryName', button.dataset.name);
                window.location.href = 'quiz.html';
            });
        });

        // ▼▼▼ ここからモーダル用の動作を実装 ▼▼▼
        const customQuizBtn = document.getElementById('custom-quiz-btn');
        const modal = document.getElementById('custom-quiz-modal');
        const closeModalBtn = document.getElementById('close-modal-btn');
        const selectAllCheckbox = document.getElementById('select-all-categories');
        const categoryCheckboxes = document.querySelectorAll('.checkbox-group input[name="category"]');
        const startCustomQuizBtn = document.getElementById('start-custom-quiz-btn');

        // 「カスタム模擬試験を作成する」ボタンをクリックしたらモーダルを表示
        customQuizBtn.addEventListener('click', () => {
            modal.style.display = 'flex';
        });

        // モーダルの「×」ボタンをクリックしたらモーダルを非表示
        closeModalBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        // モーダルの外側（黒い背景）をクリックしてもモーダルを非表示
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        // 「すべて選択 / 解除」チェックボックスの動作
        selectAllCheckbox.addEventListener('change', () => {
            categoryCheckboxes.forEach(checkbox => {
                checkbox.checked = selectAllCheckbox.checked;
            });
        });

        // 個別のチェックボックスが変更されたら「すべて選択」の状態を更新
        categoryCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const allChecked = Array.from(categoryCheckboxes).every(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
            });
        });
        
        // (注意)「この内容で試験を開始する」ボタンの機能は、次のステップで実装します。
        startCustomQuizBtn.addEventListener('click', () => {
            alert('この機能は現在開発中です！');
            // ここに、選択されたカテゴリと問題数を読み取って
            // クイズを開始するロジックを後で追加します。
        });
        // ▲▲▲ ここまでモーダル用の動作 ▲▲▲
    }
});
