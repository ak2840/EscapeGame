# 遊戲設定檔說明

## 檔案結構

遊戲設定檔 `levelConfig.json` 包含以下主要部分：

### 1. 遊戲資訊 (gameInfo)
```json
{
  "name": "Safe Zone Escape",
  "version": "1.0.0", 
  "description": "安全區域逃脫遊戲"
}
```

### 2. 預設設定 (defaultSettings)
包含遊戲的基本參數：
- `playerSpeed`: 玩家移動速度
- `playerHp`: 玩家初始血量
- `safeZoneSize`: 安全區域大小
- `projectileSpeed`: 玩家攻擊彈幕速度
- `projectileSize`: 玩家攻擊彈幕大小
- `monsterProjectileSpeed`: 怪物攻擊彈幕速度
- `monsterProjectileSize`: 怪物攻擊彈幕大小
- `attackCooldown`: 攻擊冷卻時間
- `invulnerableDuration`: 無敵時間持續時間

### 3. 怪物設定 (monsterSettings)
定義各種怪物的基本屬性：
- `normal`: 普通怪物
- `tracker`: 追蹤怪物
- `turret`: 砲塔怪物

### 4. 關卡設定 (levels)
每個關卡的詳細配置：
- `name`: 關卡名稱
- `mapMultiplier`: 地圖大小倍數
- `normalMonsters`: 普通怪物數量
- `trackerMonsters`: 追蹤怪物數量
- `turretMonsters`: 砲塔怪物數量
- `gameTime`: 遊戲時間（毫秒）
- `description`: 關卡描述
- `unlockRequirement`: 解鎖條件

## 如何修改設定

### 添加新關卡
1. 在 `levels` 物件中添加新的關卡編號
2. 設定該關卡的所有必要參數
3. 更新 `maxLevel` 值

### 修改怪物屬性
1. 在 `monsterSettings` 中修改對應怪物的屬性
2. 修改會影響所有關卡中的該類型怪物

### 調整遊戲平衡
1. 修改 `defaultSettings` 中的參數
2. 調整各關卡的怪物數量和遊戲時間

## 範例：添加第5關

```json
{
  "maxLevel": 5,
  "levels": {
    "5": {
      "name": "地獄關卡",
      "mapMultiplier": 7,
      "normalMonsters": 80,
      "trackerMonsters": 30,
      "turretMonsters": 8,
      "gameTime": 240000,
      "description": "終極挑戰",
      "unlockRequirement": "完成第4關"
    }
  }
}
```

## 注意事項

1. **JSON 格式**：確保 JSON 格式正確，可以使用線上 JSON 驗證工具檢查
2. **檔案編碼**：使用 UTF-8 編碼保存檔案
3. **備份**：修改前建議備份原始設定檔
4. **測試**：修改後請測試遊戲是否正常運行

## 錯誤處理

如果設定檔載入失敗，遊戲會使用內建的預設設定，並在控制台顯示錯誤訊息。 