# 音效系統優化說明

## 問題分析

原本的音效系統存在以下可能導致遊戲LAG的問題：

1. **無限制的音效播放**：每次攻擊都會播放音效，沒有頻率限制
2. **音效重設時間**：每次播放都重設 `currentTime = 0`，可能造成性能問題
3. **沒有音效池管理**：沒有管理同時播放的音效數量
4. **音效重疊播放**：多個相同音效同時播放可能造成音頻處理負擔

## 優化方案

### 1. 平台特定音效播放頻率控制

- **PC平台**：維持初始射擊/被擊中音效頻率（100ms間隔）
- **手機平台**：降低音效頻率以提高性能（50ms間隔）
- **自動平台檢測**：根據用戶代理和螢幕尺寸自動識別平台
- **動態調整**：視窗大小改變時自動重新檢測平台並調整設定

### 2. 音效播放頻率控制

- **攻擊音效**：根據平台調整間隔（PC: 100ms, 手機: 50ms）
- **擊中音效**：根據平台調整間隔（PC: 100ms, 手機: 50ms）
- **按鈕音效**：最小間隔 50ms
- **其他音效**：無限制（勝利、遊戲結束等）

### 3. 音效池管理

- **最大同時播放音效數量**：5個（增加以容納更多音效）
- **音效佇列**：當超過最大數量時，將音效加入佇列等待播放
- **自動佇列處理**：當有音效播放完畢時，自動播放佇列中的下一個音效

### 4. 智能音效播放

- **避免中斷正在播放的音效**：只有當音效不在播放狀態時才重設時間
- **音效結束事件監聽**：正確追蹤音效播放狀態
- **錯誤處理**：音效播放失敗時正確減少計數器

### 5. 系統重置機制

- **遊戲重置時**：重置所有音效計時器和佇列
- **關卡切換時**：重置音效系統狀態
- **手動清理**：提供清理音效佇列的功能

## 技術實現

### 平台檢測

```javascript
function detectPlatform() {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || 
                   (window.innerWidth <= 768 && window.innerHeight <= 1024);
  return isMobile ? 'mobile' : 'pc';
}
```

### 平台特定音效頻率調整

```javascript
adjustCooldownForPlatform() {
  const platform = detectPlatform();
  if (platform === 'mobile') {
    this.soundCooldown = 50; // 手機版降低音效頻率
    console.log("檢測到手機平台，音效間隔設為 50ms");
  } else {
    this.soundCooldown = 100; // PC版維持初始射擊/被擊中音效頻率
    console.log("檢測到PC平台，音效間隔設為 100ms");
  }
}
```

### 音效播放函數優化

```javascript
playSFX(sound, type = "normal") {
  if (!this.sfxEnabled || !sound) return;
  
  const currentTime = Date.now();
  
  // 檢查音效播放頻率限制
  if (type === "attack" && currentTime - this.lastAttackSoundTime < this.soundCooldown) {
    return; // 攻擊音效太頻繁，跳過
  }
  // ... 其他頻率檢查
  
  // 檢查同時播放的音效數量
  if (this.activeSounds >= this.maxConcurrentSounds) {
    this.soundQueue.push({ sound, type, currentTime });
    return;
  }
  
  this._playSound(sound, type);
}
```

### 音效池管理

```javascript
_playSound(sound, type) {
  this.activeSounds++;
  
  // 只有當音效不在播放狀態時才重設時間
  if (sound.paused || sound.ended) {
    sound.currentTime = 0;
  }
  
  // 監聽音效結束事件
  const onEnded = () => {
    this.activeSounds--;
    // 播放佇列中的下一個音效
    if (this.soundQueue.length > 0 && this.activeSounds < this.maxConcurrentSounds) {
      const nextSound = this.soundQueue.shift();
      this._playSound(nextSound.sound, nextSound.type);
    }
  };
  
  sound.addEventListener('ended', onEnded);
}
```

## 性能提升

1. **平台特定優化**：根據不同平台特性調整音效頻率
2. **減少音效重複播放**：通過頻率限制避免過於頻繁的音效播放
3. **控制同時播放數量**：避免過多音效同時播放造成的性能負擔
4. **智能佇列管理**：確保重要音效不會被丟失，同時避免音效堆積
5. **正確的資源管理**：避免音效播放失敗時的資源洩漏

## 調試功能

提供 `audioSystem.getStatus()` 方法來監控音效系統狀態：

```javascript
const status = audioSystem.getStatus();
console.log('音效系統狀態:', status);
// 輸出：{ activeSounds: 2, queueLength: 1, lastAttackTime: 1234567890, ... }
```

### 平台和音效設定資訊

在Debug模式下會顯示詳細的平台和音效設定資訊：

```javascript
console.log("=== 平台和音效設定資訊 ===");
console.log(`當前平台: ${platform}`);
console.log(`音效間隔: ${audioSystem.soundCooldown}ms`);
console.log(`音效啟用: ${audioSystem.sfxEnabled}`);
console.log(`背景音樂啟用: ${audioSystem.bgmEnabled}`);
console.log(`最大同時音效: ${audioSystem.maxConcurrentSounds}`);
console.log(`當前活躍音效: ${audioSystem.activeSounds}`);
console.log(`音效佇列長度: ${audioSystem.soundQueue.length}`);
```

## 注意事項

1. **音效檔案大小**：建議保持音效檔案較小（< 1MB）
2. **音效格式**：使用 MP3 或 OGG 格式以獲得更好的壓縮率
3. **音效長度**：攻擊和擊中音效建議在 0.1-0.5 秒之間
4. **瀏覽器兼容性**：不同瀏覽器對音頻處理的性能可能不同
5. **平台檢測**：平台檢測會在遊戲初始化時和視窗大小改變時執行
6. **動態調整**：用戶旋轉設備或改變視窗大小時會自動重新檢測平台

## 未來優化方向

1. **音效預載入**：預先載入常用音效到記憶體
2. **音效壓縮**：使用更高效的音頻編碼
3. **動態音量調整**：根據遊戲狀態動態調整音效音量
4. **音效空間化**：根據遊戲物件位置調整音效音量
5. **更精確的平台檢測**：考慮更多平台特徵進行更準確的檢測 