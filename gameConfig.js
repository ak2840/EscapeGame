// 遊戲配置數據
const GAME_CONFIG = {
  gameInfo: {
    name: "焦土中的信號 Signal",
    version: "1.0.0",
    description: "為什麼只有一格",
    instructions: [
      "使用方向鍵移動角色",
      "按空白鍵跳過劇情、完成通關條件",
      "停止時會自動攻擊怪物",
      "收集足夠道具後可通關"
    ],
    uiText: {
      continue: "按空白鍵繼續",
      returnToLobby: "返回大廳 (ESC)",
      returnToLobbySpace: "按[空白鍵]返回大廳",
      congratulations: "恭喜通關所有關卡！",
      gameOver: "Mission Failed",
      timeUp: "時間到！遊戲結束！",
      killCount: "擊殺數",
      exitRequirement: "需要收集道具",
      noItemRequirement: "無道具要求",
      passItem: "通關道具",
      exitConditionNotMet: "通關條件未滿足！",
      prepareAdventure: "準備開始冒險...",
      prepareNewChallenge: "準備開始新的挑戰..."
    },
    statusText: {
      gameOver: "遊戲結束！",
      timeUp: "時間到！遊戲結束！",
      exitRequirement: "需要收集道具",
      noItemRequirement: "無道具要求",
      passItem: "通關道具",
      exitConditionNotMet: "通關條件未滿足！"
    },
    storyText: {
      prepareAdventure: "準備開始冒險...",
      prepareNewChallenge: "準備開始新的挑戰..."
    },
    controls: [
      "方向鍵：移動",
      "空白鍵：執行動作",
      "• 停止時自動攻擊",
      "• 找到綠色出口通關",
      "• 安全區域內無敵",
      "• 普通怪物會冰凍玩家（減緩80%移動速度，持續5秒）",
      "• 血量耗盡遊戲結束"
    ],
    monsterDescriptions: [
      "• 橙色/紫色/綠色：普通怪物（冰凍效果）",
      "• 粉色：追蹤怪物（造成傷害）", 
      "• 深紅：砲塔怪物（造成傷害）",
      "• 玩家在安全區時不攻擊"
    ]
  },
  maxLevel: 4,
  defaultSettings: {
    playerSpeed: 4,
    playerHp: 10,
    safeZoneSize: 200,
    projectileSpeed: 8,
    projectileSize: 4,
    monsterProjectileSpeed: 6,
    monsterProjectileSize: 6,
    attackCooldown: 300,
    invulnerableDuration: 1000
  },
  exitImages: {
    level1: "assets/exit/exit_level1.png",
    level2: "assets/exit/exit_level2.png",
    level3: "assets/exit/exit_level3.png",
    level4: "assets/exit/exit_level4.png"
  },
  itemSettings: {
    mapItemA: {
      name: "OPEE",
      description: "一個機器人",
      color: "#FF4444",
      size: 80,
      image: "assets/items/item-map-a.png"
    },
    mapItemB: {
      name: "共感頻率器",
      description: "大喇叭",
      color: "#44FF44",
      size: 75,
      image: "assets/items/item-map-b.png"
    },
    monsterItemA: {
      name: "綠能聚合晶體",
      description: "綠色的石頭",
      color: "#FFAA00",
      size: 50,
      image: "assets/items/item-monster-a.png"
    },
    monsterItemB: {
      name: "動能核心",
      description: "有電的東西",
      color: "#4444FF",
      size: 70,
      image: "assets/items/item-monster-b.png"
    }
  },
  monsterSettings: {
    normalA: {
      hp: 5,
      speed: 0.8,
      color: "#FF8800",
      dropItemA: 0.0,
      dropItemB: 0.0
    },
    normalB: {
      hp: 10,
      speed: 0.8,
      color: "#8844FF",
      dropItemA: 0.0,
      dropItemB: 0.0
    },
    normalC: {
      hp: 10,
      speed: 0.8,
      color: "#44FF44",
      dropItemA: 0.0,
      dropItemB: 0.0
    },
    trackerA: {
      hp: 5,
      speed: 1.5,
      color: "#FF0088",
      size: 120,
      dropItemA: 1.0,
      dropItemB: 0.0
    },
    trackerB: {
      hp: 5,
      speed: 1.5,
      color: "#FF0088",
      size: 120,
      dropItemA: 1.0,
      dropItemB: 0.0
    },
    turret: {
      hp: 30,
      speed: 0,
      color: "#8B0000",
      attackCooldown: 500,
      attackRange: 250,
      size: 300,
      dropItemA: 0.0,
      dropItemB: 1.0
    }
  },
  levels: {
    1: {
      name: "新手關卡",
      mapWidth: 1200,
      mapHeight: 1000,
      normalAMonsters: 0,
      normalBMonsters: 0,
      normalCMonsters: 0,
      trackerAMonsters: 0,
      trackerBMonsters: 0,
      turretMonsters: 0,
      gameTime: 10000,
      description: "熟悉基本操作",
      unlockRequirement: null,
      mapItemA: 1,
      mapItemB: 0,
      exitCondition: {
        mapItemA: 1
      },
      mapTiles: [
        { path: "assets/maps/map-level1-1.png", weight: 1 },
        { path: "assets/maps/map-level1-2.png", weight: 0 },
        { path: "assets/maps/map-level1-3.png", weight: 0 },
        { path: "assets/maps/map-level1-4.png", weight: 0 },
        { path: "assets/maps/map-level1-5.png", weight: 0 },
        { path: "assets/maps/map-level1-6.png", weight: 0 }
      ]
    },
    2: {
      name: "追蹤者挑戰",
      mapWidth: 3200,
      mapHeight: 2400,
      normalAMonsters: 0,
      normalBMonsters: 0,
      normalCMonsters: 0,
      trackerAMonsters: 30,
      trackerBMonsters: 30,
      turretMonsters: 0,
      gameTime: 100000,
      description: "面對快速追蹤的敵人",
      unlockRequirement: 1,
      mapItemA: 0,
      mapItemB: 0,
      exitCondition: {
        monsterItemA: 10
      },
      mapTiles: [
        { path: "assets/maps/map-level2-1.png", weight: 10 },
        { path: "assets/maps/map-level2-2.png", weight: 1 },
        { path: "assets/maps/map-level2-3.png", weight: 1 },
        { path: "assets/maps/map-level2-4.png", weight: 2 },
        { path: "assets/maps/map-level2-5.png", weight: 2 },
        { path: "assets/maps/map-level2-6.png", weight: 2 }
      ]
    },
    3: {
      name: "混戰關卡",
      mapWidth: 4000,
      mapHeight: 3000,
      normalAMonsters: 15,
      normalBMonsters: 15,
      normalCMonsters: 15,
      trackerAMonsters: 10,
      trackerBMonsters: 10,
      turretMonsters: 0,
      gameTime: 100000,
      description: "各種敵人的混戰",
      unlockRequirement: 2,
      mapItemA: 0,
      mapItemB: 20,
      exitCondition: {
        mapItemB: 10,
        monsterItemA: 5
      },
      mapTiles: [
        { path: "assets/maps/map-level3-1.png", weight: 3 },
        { path: "assets/maps/map-level3-2.png", weight: 1 },
        { path: "assets/maps/map-level3-3.png", weight: 1 },
        { path: "assets/maps/map-level3-4.png", weight: 1 },
        { path: "assets/maps/map-level3-5.png", weight: 1 },
        { path: "assets/maps/map-level3-6.png", weight: 1 }
      ]
    },
    4: {
      name: "最終挑戰",
      mapWidth: 2400,
      mapHeight: 1800,
      normalAMonsters: 2,
      normalBMonsters: 2,
      normalCMonsters: 2,
      trackerAMonsters: 3,
      trackerBMonsters: 3,
      turretMonsters: 1,
      gameTime: 100000,
      description: "面對強大的砲塔",
      unlockRequirement: 3,
      mapItemA: 0,
      mapItemB: 0,
      exitCondition: {
          monsterItemB: 1
      },
      mapTiles: [
        { path: "assets/maps/map-level4-1.png", weight: 1 },
        { path: "assets/maps/map-level4-2.png", weight: 1 },
        { path: "assets/maps/map-level4-3.png", weight: 1 },
        { path: "assets/maps/map-level4-4.png", weight: 1 },
        { path: "assets/maps/map-level4-5.png", weight: 1 },
        { path: "assets/maps/map-level4-6.png", weight: 1 }
      ]
    }
  }
};

// 導出配置（如果使用模組系統）
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GAME_CONFIG;
} 
