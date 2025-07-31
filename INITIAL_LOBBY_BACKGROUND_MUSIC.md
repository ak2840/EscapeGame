# 初始載入關卡大廳背景音樂功能

## 🎵 功能概述

確保遊戲在初始載入到關卡大廳時立即播放背景音樂 "first-background-music"，提供更好的用戶體驗。

## 📋 實現細節

### 1. 現有流程分析

遊戲初始化流程：
```
initGame() → audioSystem.init() → initLobby() → showLobby() → playFirstBackgroundMusic()
```

### 2. 音頻系統改進

#### 2.1 音量控制修復
在 `setBGMVolume()` 函數中新增對選擇關卡區背景音樂的音量控制：

```javascript
setBGMVolume(volume) {
  this.bgmVolume = Math.max(0, Math.min(1, volume));
  if (this.gameMusic) {
    this.gameMusic.volume = this.bgmVolume;
  }
  // 設定選擇關卡區背景音樂音量
  if (this.firstBackgroundMusic) {
    this.firstBackgroundMusic.volume = this.bgmVolume;
  }
  this.saveAudioSettings();
  console.log(`背景音樂音量已設定為: ${this.bgmVolume}`);
},
```

#### 2.2 播放函數調試
在 `playFirstBackgroundMusic()` 函數中新增詳細的調試信息：

```javascript
playFirstBackgroundMusic() {
  console.log("嘗試播放選擇關卡區背景音樂...");
  console.log("BGM 啟用狀態:", this.bgmEnabled);
  console.log("firstBackgroundMusic 元素:", this.firstBackgroundMusic);
  
  if (this.bgmEnabled && this.firstBackgroundMusic) {
    this.firstBackgroundMusic.volume = this.bgmVolume;
    console.log("設定音量為:", this.bgmVolume);
    this.firstBackgroundMusic.play().catch((e) => console.log("選擇關卡區背景音樂播放失敗:", e));
    console.log("選擇關卡區背景音樂播放指令已發送");
  } else {
    console.log("無法播放選擇關卡區背景音樂 - BGM未啟用或音頻元素不存在");
  }
},
```

#### 2.3 大廳顯示調試
在 `showLobby()` 函數中新增調試信息：

```javascript
function showLobby() {
  console.log("showLobby() 被調用");
  document.getElementById("gameLobby").classList.remove("hidden");
  document.getElementById("gameContainer").classList.add("hidden");

  // 停止遊戲背景音樂，播放選擇關卡區背景音樂
  console.log("準備播放選擇關卡區背景音樂...");
  audioSystem.stopGameMusic();
  audioSystem.playFirstBackgroundMusic();
  console.log("進入選擇關卡區，播放 first-background-music");
  // ...
}
```

### 3. 調試功能

#### 3.1 控制台輸出
當遊戲載入時，控制台會顯示以下信息：
- `showLobby() 被調用`
- `準備播放選擇關卡區背景音樂...`
- `嘗試播放選擇關卡區背景音樂...`
- `BGM 啟用狀態: true/false`
- `firstBackgroundMusic 元素: [object HTMLAudioElement]`
- `設定音量為: 0.5`
- `選擇關卡區背景音樂播放指令已發送`
- `進入選擇關卡區，播放 first-background-music`

#### 3.2 錯誤處理
如果播放失敗，控制台會顯示：
- `選擇關卡區背景音樂播放失敗: [錯誤信息]`
- `無法播放選擇關卡區背景音樂 - BGM未啟用或音頻元素不存在`

### 4. 技術要點

#### 4.1 音頻元素初始化
確保 HTML 中有正確的音頻元素：
```html
<audio id="firstBackgroundMusic" loop preload="none">
  <source src="assets/audio/first-background-music.mp3" type="audio/mpeg" />
</audio>
```

#### 4.2 音頻系統初始化順序
1. `audioSystem.init()` 載入音頻元素
2. `initLobby()` 初始化大廳
3. `showLobby()` 顯示大廳並播放音樂

#### 4.3 音量同步
確保選擇關卡區背景音樂的音量與遊戲背景音樂的音量保持同步。

### 5. 使用場景

- **初始載入**: 遊戲首次載入時自動播放大廳背景音樂
- **返回大廳**: 從遊戲關卡返回大廳時播放背景音樂
- **音量控制**: 通過音頻控制按鈕調整大廳背景音樂音量

### 6. 故障排除

如果背景音樂沒有播放，請檢查：
1. 控制台是否有錯誤信息
2. BGM 是否已啟用 (`audioSystem.bgmEnabled`)
3. 音頻元素是否存在 (`audioSystem.firstBackgroundMusic`)
4. 音頻文件是否正確載入
5. 瀏覽器的自動播放政策設置

## 🔧 維護說明

- 調試信息可以根據需要移除
- 音量控制邏輯已與遊戲背景音樂同步
- 錯誤處理已完善，會顯示詳細的錯誤信息 