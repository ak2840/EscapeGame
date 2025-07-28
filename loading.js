// 載入進度管理
class LoadingManager {
    constructor() {
        this.totalAssets = 0;
        this.loadedAssets = 0;
        this.loadingScreen = null;
        this.progressBar = null;
        this.progressText = null;
        this.animationMonster = null;
        this.isInitialized = false;
        this.animationFrame = 0;
        this.animationInterval = null;
        this.loadingPromises = [];
        this.timeoutDuration = 30000; // 30秒超時
        this.isMobile = this.detectMobile();
        this.init();
    }

    // 檢測是否為手機設備
    detectMobile() {
        return window.innerWidth <= 768 || 
               /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               "ontouchstart" in window || 
               navigator.maxTouchPoints > 0;
    }

    createLoadingScreen() {
        const screen = document.createElement('div');
        screen.id = 'loadingScreen';
        screen.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            color: white;
            font-family: "JasonHW-Round", "Orbitron", "Microsoft JhengHei", "Noto Sans TC", sans-serif;
        `;

        const title = document.createElement('h1');
        title.textContent = '焦土中的信號 Signal';
        title.style.cssText = `
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        `;

        const subtitle = document.createElement('div');
        subtitle.textContent = '正在載入遊戲資源...';
        subtitle.style.cssText = `
            font-size: 1.2em;
            margin-bottom: 30px;
            opacity: 0.8;
        `;

        const progressContainer = document.createElement('div');
        progressContainer.style.cssText = `
            width: 400px;
            background: rgba(255,255,255,0.2);
            border-radius: 10px;
            padding: 15px;
            margin: 20px 0;
            overflow: visible;
        `;

        this.progressBar = document.createElement('div');
        this.progressBar.style.cssText = `
            width: 0%;
            height: 25px;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            border-radius: 10px;
            transition: width 0.3s ease;
            box-shadow: 0 2px 10px rgba(76, 175, 80, 0.3);
            max-width: 100%;
            box-sizing: border-box;
            position: relative;
        `;

        // 創建動畫小怪物
        this.animationMonster = document.createElement('img');
        this.animationMonster.id = 'animationMonster';
        this.animationMonster.style.cssText = `
            position: absolute;
            right: -37px;
            top: -37px;
            width: 100px;
            height: 100px;
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
            z-index: 10;
        `;
        this.animationMonster.src = 'assets/monsters/trackerA-right-1.png';
        this.progressBar.appendChild(this.animationMonster);

        // 開始動畫
        this.startAnimation();

        this.progressText = document.createElement('div');
        this.progressText.textContent = '準備載入... 0%';
        this.progressText.style.cssText = `
            text-align: center;
            margin-top: 15px;
            font-size: 16px;
            font-weight: bold;
        `;

        const loadingTips = document.createElement('div');
        loadingTips.id = 'loadingTips';
        loadingTips.textContent = this.isMobile ? 
            '載入提示：手機載入可能需要較長時間，請保持網路連接...' : 
            '載入提示：遊戲包含大量圖片和音訊資源，請耐心等待...';
        loadingTips.style.cssText = `
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            opacity: 0.7;
            max-width: 400px;
            line-height: 1.4;
        `;

        // 添加跳過載入按鈕（僅在手機上顯示）
        if (this.isMobile) {
            const skipButton = document.createElement('button');
            skipButton.textContent = '跳過載入（可能影響遊戲體驗）';
            skipButton.style.cssText = `
                margin-top: 20px;
                padding: 10px 20px;
                background: rgba(255,255,255,0.2);
                border: 1px solid rgba(255,255,255,0.3);
                border-radius: 5px;
                color: white;
                cursor: pointer;
                font-size: 14px;
            `;
            skipButton.onclick = () => this.forceComplete();
            screen.appendChild(skipButton);
        }

        progressContainer.appendChild(this.progressBar);
        screen.appendChild(title);
        screen.appendChild(subtitle);
        screen.appendChild(progressContainer);
        screen.appendChild(this.progressText);
        screen.appendChild(loadingTips);

        document.body.appendChild(screen);
        return screen;
    }

    // 簡化的資源計算
    calculateTotalAssets() {
        // 動態計算實際需要載入的資源數量
        let total = 0;
        
        // 基礎資源
        total += 3; // main.js, gameConfig.js, loading.js
        
        // UI 資源
        total += 8; // lobby-background, reset, volume-on/off, sound-on/off, about
        
        // 玩家圖片 (8個方向 x 3種狀態 x 2幀)
        total += 48; // 8 * 3 * 2 = 48
        
        // 出口圖片
        total += 4; // 4個關卡的出口
        
        // 怪物圖片 (6種怪物 x 4個方向 x 2幀)
        total += 48; // 6 * 4 * 2 = 48
        
        // 地圖圖片 (每個關卡6張)
        total += 24; // 4 * 6 = 24
        
        // 音訊檔案（手機上減少音訊載入）
        if (this.isMobile) {
            total += 3; // 只載入必要的音訊：attack, hit, button-click
        } else {
            total += 7; // 所有音訊檔案
        }
        
        // 道具圖片
        total += 4; // 4種道具
        
        // 劇情圖片
        total += 8; // 4關卡 x 2張 (intro + outro)
        
        // 額外緩衝，確保進度條能夠平滑運行
        total += 10;
        
        console.log(`計算總資源數量: ${total} (手機: ${this.isMobile})`);
        return total;
    }

    setTotalAssets(count) {
        this.totalAssets = count;
        console.log(`設定總資源數量: ${count}`);
    }

    updateProgress(loaded, message = '') {
        this.loadedAssets = loaded;
        let percentage = Math.round((loaded / this.totalAssets) * 100);
        
        // 確保百分比不會超過 100%
        percentage = Math.min(percentage, 100);
        
        console.log(`更新進度: ${loaded}/${this.totalAssets} (${percentage}%)`);
        
        if (this.progressBar) {
            this.progressBar.style.width = percentage + '%';
        }
        
        if (this.progressText) {
            const progressMessage = message || `載入中... ${percentage}%`;
            this.progressText.textContent = progressMessage;
        }

        // 更新載入提示
        const loadingTips = document.getElementById('loadingTips');
        if (loadingTips) {
            if (percentage < 30) {
                loadingTips.textContent = this.isMobile ? 
                    '載入提示：正在載入遊戲核心資源...' :
                    '載入提示：正在載入遊戲核心資源...';
            } else if (percentage < 60) {
                loadingTips.textContent = this.isMobile ? 
                    '載入提示：正在載入圖片資源，手機載入較慢請耐心等待...' :
                    '載入提示：正在載入圖片資源，這可能需要一些時間...';
            } else if (percentage < 90) {
                loadingTips.textContent = this.isMobile ? 
                    '載入提示：正在載入音訊資源...' :
                    '載入提示：正在載入音訊資源...';
            } else {
                loadingTips.textContent = '載入提示：即將完成載入，準備進入遊戲...';
            }
        }

        // 當所有資源載入完成時，確保進度條跑到 100%
        if (loaded >= this.totalAssets) {
            // 強制設定為 100%
            if (this.progressBar) {
                this.progressBar.style.width = '100%';
            }
            if (this.progressText) {
                this.progressText.textContent = '載入完成！100%';
            }
            if (loadingTips) {
                loadingTips.textContent = '載入提示：載入完成！正在進入遊戲...';
            }
            
            // 延遲 0.5 秒再隱藏，讓用戶看到 100% 的完成狀態
            setTimeout(() => this.hide(), 500);
        }
    }

    // 帶超時的圖片載入追蹤
    trackImageLoad(imagePath) {
        return new Promise((resolve, reject) => {
            console.log(`開始載入圖片: ${imagePath}`);
            
            const img = new Image();
            const timeout = setTimeout(() => {
                console.warn(`圖片載入超時: ${imagePath}`);
                this.loadedAssets++;
                this.updateProgress(this.loadedAssets, `載入超時: ${imagePath.split('/').pop()}`);
                resolve(null); // 不拒絕，而是返回 null
            }, this.timeoutDuration);
            
            img.onload = () => {
                clearTimeout(timeout);
                this.loadedAssets++;
                this.updateProgress(this.loadedAssets, `載入圖片: ${imagePath.split('/').pop()}`);
                console.log(`圖片載入完成: ${imagePath}`);
                resolve(img);
            };
            
            img.onerror = () => {
                clearTimeout(timeout);
                console.error(`圖片載入失敗: ${imagePath}`);
                this.loadedAssets++;
                this.updateProgress(this.loadedAssets, `載入失敗: ${imagePath.split('/').pop()}`);
                resolve(null); // 不拒絕，而是返回 null
            };
            
            img.src = imagePath;
        });
    }

    // 帶超時的音訊載入追蹤
    trackAudioLoad(audioPath) {
        return new Promise((resolve, reject) => {
            console.log(`開始載入音訊: ${audioPath}`);
            
            const audio = new Audio();
            const timeout = setTimeout(() => {
                console.warn(`音訊載入超時: ${audioPath}`);
                this.loadedAssets++;
                this.updateProgress(this.loadedAssets, `載入超時: ${audioPath.split('/').pop()}`);
                resolve(null); // 不拒絕，而是返回 null
            }, this.timeoutDuration);
            
            audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeout);
                this.loadedAssets++;
                this.updateProgress(this.loadedAssets, `載入音訊: ${audioPath.split('/').pop()}`);
                console.log(`音訊載入完成: ${audioPath}`);
                resolve(audio);
            });
            
            audio.addEventListener('error', () => {
                clearTimeout(timeout);
                console.error(`音訊載入失敗: ${audioPath}`);
                this.loadedAssets++;
                this.updateProgress(this.loadedAssets, `載入失敗: ${audioPath.split('/').pop()}`);
                resolve(null); // 不拒絕，而是返回 null
            });
            
            audio.src = audioPath;
            audio.load();
        });
    }

    // 開始動畫
    startAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
        }
        
        this.animationInterval = setInterval(() => {
            this.animationFrame = (this.animationFrame + 1) % 2;
            if (this.animationMonster) {
                this.animationMonster.src = `assets/monsters/trackerA-right-${this.animationFrame + 1}.png`;
            }
        }, 300); // 每300毫秒切換一次圖片
    }

    // 停止動畫
    stopAnimation() {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
    }

    hide() {
        // 停止動畫
        this.stopAnimation();
        
        if (this.loadingScreen) {
            this.loadingScreen.style.opacity = '0';
            this.loadingScreen.style.transition = 'opacity 0.8s ease';
            setTimeout(() => {
                if (this.loadingScreen.parentNode) {
                    this.loadingScreen.parentNode.removeChild(this.loadingScreen);
                }
                console.log('載入畫面已隱藏');
            }, 800);
        }
    }

    // 初始化載入管理器
    init() {
        if (this.isInitialized) return;
        
        console.log('初始化載入管理器...');
        
        // 創建載入畫面
        this.loadingScreen = this.createLoadingScreen();
        
        // 設定總資源數量
        const totalAssets = this.calculateTotalAssets();
        this.setTotalAssets(totalAssets);
        
        this.isInitialized = true;
        
        // 立即開始顯示進度
        this.updateProgress(0, '初始化載入管理器...');
        
        console.log('載入管理器已初始化');
    }

    // 手動更新進度的方法
    manualUpdate(progress, message) {
        if (!this.isInitialized) {
            this.init();
        }
        
        console.log(`手動更新進度: ${progress}% - ${message}`);
        if (this.progressBar) {
            this.progressBar.style.width = progress + '%';
        }
        if (this.progressText) {
            this.progressText.textContent = message || `載入中... ${progress}%`;
        }
        
        // 更新載入提示
        const loadingTips = document.getElementById('loadingTips');
        if (loadingTips) {
            if (progress < 30) {
                loadingTips.textContent = '載入提示：正在載入遊戲核心資源...';
            } else if (progress < 60) {
                loadingTips.textContent = '載入提示：正在載入圖片資源，這可能需要一些時間...';
            } else if (progress < 90) {
                loadingTips.textContent = '載入提示：正在載入音訊資源...';
            } else {
                loadingTips.textContent = '載入提示：即將完成載入，準備進入遊戲...';
            }
        }
        
        // 如果達到 100%，延遲隱藏
        if (progress >= 100) {
            setTimeout(() => this.hide(), 500);
        }
    }
    
    // 強制完成載入
    forceComplete() {
        console.log('強制完成載入');
        this.manualUpdate(100, '載入完成！100%');
        
        const loadingTips = document.getElementById('loadingTips');
        if (loadingTips) {
            loadingTips.textContent = '載入提示：載入完成！正在進入遊戲...';
        }
        
        setTimeout(() => this.hide(), 500);
    }
}

// 全域載入管理器
window.loadingManager = new LoadingManager();

// 頁面載入完成後確保初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM 載入完成，確保載入管理器已初始化');
    if (!window.loadingManager.isInitialized) {
        window.loadingManager.init();
    }
});

// 添加全域函數供測試使用
window.testLoadingProgress = function() {
    if (window.loadingManager) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            window.loadingManager.manualUpdate(progress, `測試載入中... ${progress}%`);
            
            if (progress >= 100) {
                clearInterval(interval);
                console.log('測試載入完成');
            }
        }, 200);
    }
}; 