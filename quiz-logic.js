'use strict';

// ページが読み込まれたら、すぐにアラートを表示するだけのコード
alert("テスト用のJavaScriptが正しく読み込まれました！");

// ページ上の全てのボタン要素を取得
const buttons = document.querySelectorAll('button');

// 各ボタンに、クリックしたらアラートを出す機能を追加
buttons.forEach(button => {
    button.addEventListener('click', () => {
        alert('ボタンがクリックされました！');
    });
});

console.log("テスト用スクリプトの読み込みとイベントリスナーの設定が完了しました。");
