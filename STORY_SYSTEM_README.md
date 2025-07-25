# 劇情系統說明

## 功能概述

我已經成功為您的遊戲實現了劇情圖片顯示功能。現在遊戲會在以下時機顯示劇情圖片：

1. **關卡開始前**：顯示關卡開始劇情圖片，按空白鍵繼續才開始遊戲
2. **關卡結束後**：顯示關卡結束劇情圖片，按空白鍵繼續才進入下一關

## 實現的功能

### 1. 劇情系統架構
- 新增了 `storySystem` 物件來管理所有劇情相關功能
- 支援載入真實劇情圖片和生成預設劇情圖片
- 自動處理圖片載入失敗的情況

### 2. 遊戲狀態管理
- 新增了 `storyIntro` 和 `storyOutro` 兩個遊戲狀態
- 修改了遊戲循環來處理劇情狀態的繪製
- 更新了鍵盤事件處理來支援劇情狀態下的空白鍵操作

### 3. 劇情圖片載入
- 自動載入 `assets/story/` 目錄下的劇情圖片
- 支援的檔案格式：`story_1_before.jpg`, `story_1_after.jpg` 等
- 如果圖片載入失敗，會自動生成美觀的預設圖片

### 4. 預設圖片生成
- 關卡開始預設圖片：深色背景，金色邊框，顯示關卡資訊
- 關卡結束預設圖片：深色背景，綠色邊框，顯示通關統計
- 包含關卡描述、擊殺數、完成時間等資訊

## 檔案結構

```
assets/story/
├── story_1_before.jpg  # 第1關開始劇情
├── story_1_after.jpg   # 第1關結束劇情
├── story_2_before.jpg  # 第2關開始劇情
├── story_2_after.jpg   # 第2關結束劇情
├── story_3_before.jpg  # 第3關開始劇情
├── story_3_after.jpg   # 第3關結束劇情
├── story_4_before.jpg  # 第4關開始劇情
└── story_4_after.jpg   # 第4關結束劇情
```

## 使用方式

### 1. 添加劇情圖片
將您的劇情圖片放入 `assets/story/` 目錄，並按照以下命名規則：
- 關卡開始：`story_{關卡編號}_before.jpg`
- 關卡結束：`story_{關卡編號}_after.jpg`

### 2. 遊戲流程
1. 玩家在大廳選擇關卡
2. 顯示關卡開始劇情圖片
3. 按空白鍵開始遊戲
4. 完成關卡後顯示關卡結束劇情圖片
5. 按空白鍵進入下一關或返回大廳

### 3. 自定義劇情圖片
如果您想要使用自己的劇情圖片，只需要：
1. 將圖片放入 `assets/story/` 目錄
2. 按照命名規則命名檔案
3. 重新載入遊戲即可

## 技術細節

### 劇情系統物件
```javascript
const storySystem = {
  introImages: {},      // 關卡開始圖片
  outroImages: {},      // 關卡結束圖片
  currentImage: null,   // 當前顯示的圖片
  imageLoaded: false,   // 圖片載入狀態
  
  async loadStoryImages(),           // 載入劇情圖片
  createDefaultIntroImage(level),    // 創建預設開始圖片
  createDefaultOutroImage(level),    // 創建預設結束圖片
  showIntro(level),                  // 顯示開始劇情
  showOutro(level),                  // 顯示結束劇情
  draw(ctx)                          // 繪製劇情圖片
};
```

### 遊戲狀態
- `storyIntro`: 顯示關卡開始劇情
- `storyOutro`: 顯示關卡結束劇情
- `playing`: 正常遊戲狀態

### 鍵盤事件處理
- 在 `storyIntro` 狀態下按空白鍵：開始遊戲
- 在 `storyOutro` 狀態下按空白鍵：進入下一關或返回大廳

## 測試

我創建了一個測試頁面 `test_story.html` 來驗證劇情系統的功能：
- 測試劇情圖片載入
- 測試劇情系統功能
- 測試預設圖片生成

## 注意事項

1. **圖片格式**：目前支援 JPG 格式，如需其他格式請修改程式碼
2. **圖片尺寸**：建議使用 800x600 或相近比例的圖片
3. **檔案大小**：建議圖片檔案大小不超過 1MB
4. **備用機制**：如果圖片載入失敗，會自動使用預設圖片

## 未來擴展

您可以進一步擴展劇情系統：
1. 添加劇情文字顯示
2. 支援多張劇情圖片輪播
3. 添加劇情音效
4. 支援動畫效果
5. 添加跳過劇情選項

## 總結

劇情系統已經完全整合到您的遊戲中，提供了：
- ✅ 關卡開始前顯示劇情圖片
- ✅ 按空白鍵繼續開始遊戲
- ✅ 關卡結束後顯示劇情圖片
- ✅ 按空白鍵繼續進入下一關
- ✅ 自動處理圖片載入失敗
- ✅ 美觀的預設圖片
- ✅ 完整的錯誤處理機制

現在您的遊戲具有完整的劇情展示功能，可以為玩家提供更好的遊戲體驗！ 