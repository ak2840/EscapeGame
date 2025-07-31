# 選擇關卡區背景音樂功能

## 🎵 功能概述

在選擇關卡區（大廳）播放特定的背景音樂 "first-background-music"，與遊戲關卡中的背景音樂分開管理，提供更好的音頻體驗。

## 📋 實現細節

### 1. 音頻系統擴展

在 `audioSystem` 中新增了對 `first-background-music` 的支持：

```javascript
// 新增音頻元素
firstBackgroundMusic: null, // 選擇關卡區背景音樂

// 新增播放和停止函數
playFirstBackgroundMusic() {
  if (this.bgmEnabled && this.firstBackgroundMusic) {
    this.firstBackgroundMusic.volume = this.bgmVolume;
    this.firstBackgroundMusic.play().catch((e) => console.log("選擇關卡區背景音樂播放失敗:", e));
  }
},

stopFirstBackgroundMusic() {
  if (this.firstBackgroundMusic) {
    this.firstBackgroundMusic.pause();
    this.firstBackgroundMusic.currentTime = 0;
  }
}
```

### 2. HTML 音頻元素

在 `index.html` 中新增了音頻元素：

```html
<audio id="firstBackgroundMusic" loop preload="none">
  <source src="assets/audio/first-background-music.mp3" type="audio/mpeg" />
</audio>
```

### 3. 大廳音樂管理

#### 3.1 進入大廳時播放音樂
在 `showLobby()` 函數中：

```javascript
// 停止遊戲背景音樂，播放選擇關卡區背景音樂
audioSystem.stopGameMusic();
audioSystem.playFirstBackgroundMusic();
console.log("進入選擇關卡區，播放 first-background-music");
```

#### 3.2 開始關卡時停止音樂
在 `startLevel()` 函數中：

```javascript
// 停止選擇關卡區背景音樂，開始播放遊戲背景音樂
audioSystem.stopFirstBackgroundMusic();
audioSystem.playGameMusic();
```

### 4. 音頻控制整合

#### 4.1 音量控制
在 `setVolume()` 函數中新增對選擇關卡區背景音樂的音量控制：

```javascript
// 設定選擇關卡區背景音樂音量
if (this.firstBackgroundMusic) {
  this.firstBackgroundMusic.volume = this.bgmVolume;
}
```

#### 4.2 開關控制
在 `toggleBGM()` 函數中新增對選擇關卡區背景音樂的開關控制：

```javascript
// 如果開啟且在大廳狀態中，播放選擇關卡區背景音樂
if (this.bgmEnabled && gameState === "lobby") {
  this.playFirstBackgroundMusic();
}
```

## 🎮 使用場景

### 選擇關卡區
1. 玩家進入遊戲大廳
2. 系統自動停止遊戲背景音樂
3. 開始播放 "first-background-music"
4. 玩家選擇關卡時，音樂繼續播放

### 開始關卡
1. 玩家選擇關卡後
2. 系統停止 "first-background-music"
3. 開始播放遊戲背景音樂
4. 進入關卡劇情或直接開始遊戲

### 返回大廳
1. 玩家完成關卡或按 ESC 返回
2. 系統停止遊戲背景音樂
3. 重新播放 "first-background-music"
4. 回到選擇關卡區

## 🔧 技術特點

- **獨立管理**：選擇關卡區和遊戲關卡的背景音樂分別管理
- **自動切換**：根據遊戲狀態自動切換不同的背景音樂
- **音量同步**：兩首音樂使用相同的音量設定
- **開關同步**：背景音樂開關同時控制兩首音樂
- **循環播放**：兩首音樂都設定為循環播放

## 📁 相關文件

- `assets/audio/first-background-music.mp3` - 選擇關卡區背景音樂文件
- `assets/audio/background-music.mp3` - 遊戲關卡背景音樂文件
- `STORY_SYSTEM_AUDIO_CONTROL.md` - 劇情系統音頻控制功能 