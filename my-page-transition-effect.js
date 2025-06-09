// my-page-transition-effect.js
document.addEventListener('DOMContentLoaded', () => {
    const pageTransitionLinks = document.querySelectorAll('.page-transition-link');
    const scanlineOverlay = document.getElementById('scanline-overlay');
    const crtOffLine = document.querySelector('.crt-off-line');

    // --- ページロード時に「電源が入る」アニメーションをトリガー ---
    // sessionStorageを使って、初回ロード時のみアニメーションを実行
    // ブラウザの「戻る」「進む」で戻ってきた場合はアニメーションしない
    // ただし、完全に新しいページロードではアニメーションを適用
    if (window.performance.navigation.type === 1) { // ページがリロードされた場合
        // F5リロードなどではアニメーションさせる
        document.body.classList.add('initial-load-animation');
        sessionStorage.setItem('hasLoadedBefore', 'true');
    } else if (!sessionStorage.getItem('hasLoadedBefore')) {
        // 初回ロード時 (直接アクセス、ブックマークなど)
        document.body.classList.add('initial-load-animation');
        sessionStorage.setItem('hasLoadedBefore', 'true'); // ロード済みマーク
    } else {
        // ブラウザの「戻る」「進む」で戻ってきた場合はアニメーションさせない
        document.body.classList.remove('initial-load-animation');
    }

    // `initial-load-animation` アニメーション完了後にクラスを削除して、
    // 他のアニメーションやスタイルに影響を与えないようにする
    // このイベントリスナーは、DOMContendedLoadedの直後に設定しておく
    document.body.addEventListener('animationend', (event) => {
        if (event.animationName === 'animate_in') {
            document.body.classList.remove('initial-load-animation');
        }
    }, { once: true }); // アニメーション終了イベントは一度だけ実行

    // --- ページ遷移時に「電源が切れる」アニメーションをトリガー ---
    pageTransitionLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault(); // デフォルトのページ遷移を阻止

            const targetUrl = link.href;

            // 1. オーバーレイを瞬時に表示（黒い画面）
            scanlineOverlay.style.opacity = '1';
            scanlineOverlay.style.backgroundColor = 'black';
            scanlineOverlay.classList.add('active'); // crt-off-lineのアニメーションを開始

            // 2. ブラウン管オフアニメーションの完了を待つ
            // CSSの`crt-shrink`アニメーションの時間（0.6秒）に合わせる
            setTimeout(() => {
                // ページ遷移
                window.location.href = targetUrl;

                // ページ遷移前にオーバーレイをリセットしておくと、次のページでエフェクトが残らない
                scanlineOverlay.classList.remove('active');
                scanlineOverlay.style.opacity = '0';
                scanlineOverlay.style.backgroundColor = 'transparent';
                if (crtOffLine) {
                    crtOffLine.style.transform = 'scaleX(0)'; // 幅0に戻す
                    crtOffLine.style.opacity = '0'; // 透明に戻す
                }

            }, 600); // ★ここをCSSの`crt-shrink`アニメーションのdurationと合わせる (例: 0.6s = 600ms) ★
        });
    });

    // --- ページ表示時にオーバーレイと線をリセット（ブラウザの戻る/進むボタン対策） ---
    // pageshowイベントは、bf-cacheから復元された場合でも発火します。
    window.addEventListener('pageshow', (event) => {
        // 古いエフェクトが残らないようにオーバーレイを確実にリセット
        scanlineOverlay.classList.remove('active');
        scanlineOverlay.style.opacity = '0';
        scanlineOverlay.style.backgroundColor = 'transparent';
        if (crtOffLine) {
            crtOffLine.style.transform = 'scaleX(0)'; // 幅0に戻す
            crtOffLine.style.opacity = '0'; // 透明に戻す
        }

        // ページの初期ロードアニメーション（`animate_in`）のクラスを確実に削除
        // これがないと、もし何らかの理由でクラスが残ると常にアニメーションしてしまう
        document.body.classList.remove('initial-load-animation');

        // bf-cacheから復元された場合、`sessionStorage`をリセットしない
        // (これにより、戻るボタンでアニメーションが再実行されない)
        if (event.persisted === false) {
             // 完全に新しくロードされた場合はsessionStorageをリセットして、
             // 次回以降のロードでアニメーションが実行されるようにする
             sessionStorage.removeItem('hasLoadedBefore');
        }
    });
});