const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 音效系統
const audioSystem = {
  bgmEnabled: false,
  sfxEnabled: false,
  bgMusic: null,
  attackSound: null,
  hitSound: null,
  victorySound: null,
  gameOverSound: null,
  buttonClickSound: null,
  
  init() {
    this.bgMusic = document.getElementById('bgMusic');
    this.attackSound = document.getElementById('attackSound');
    this.hitSound = document.getElementById('hitSound');
    this.victorySound = document.getElementById('victorySound');
    this.gameOverSound = document.getElementById('gameOverSound');
    this.buttonClickSound = document.getElementById('buttonClickSound');
    
    // 從 cookie 讀取音效設定
    this.loadAudioSettings();
    
    // 設置音效控制按鈕事件
    document.getElementById('bgmToggle').addEventListener('click', () => {
      this.toggleBGM();
    });
    
    document.getElementById('sfxToggle').addEventListener('click', () => {
      this.toggleSFX();
    });
    
    // 初始化音效狀態
    this.updateButtonStates();
  },
  
  loadAudioSettings() {
    // 從 cookie 讀取背景音樂設定
    const savedBGM = getCookie('bgmEnabled');
    if (savedBGM !== null) {
      this.bgmEnabled = savedBGM === 'true';
      console.log(`從 cookie 讀取背景音樂設定: ${this.bgmEnabled}`);
    }
    
    // 從 cookie 讀取音效設定
    const savedSFX = getCookie('sfxEnabled');
    if (savedSFX !== null) {
      this.sfxEnabled = savedSFX === 'true';
      console.log(`從 cookie 讀取音效設定: ${this.sfxEnabled}`);
    }
  },
  
  saveAudioSettings() {
    // 儲存背景音樂設定到 cookie
    setCookie('bgmEnabled', this.bgmEnabled.toString(), 365);
    console.log(`儲存背景音樂設定到 cookie: ${this.bgmEnabled}`);
    
    // 儲存音效設定到 cookie
    setCookie('sfxEnabled', this.sfxEnabled.toString(), 365);
    console.log(`儲存音效設定到 cookie: ${this.sfxEnabled}`);
  },
  
  toggleBGM() {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled) {
      this.bgMusic.play().catch(e => console.log('背景音樂播放失敗:', e));
    } else {
      this.bgMusic.pause();
    }
    this.updateButtonStates();
    this.saveAudioSettings();
  },
  
  toggleSFX() {
    this.sfxEnabled = !this.sfxEnabled;
    this.updateButtonStates();
    this.saveAudioSettings();
  },
  
  updateButtonStates() {
    const bgmBtn = document.getElementById('bgmToggle');
    const sfxBtn = document.getElementById('sfxToggle');
    
    bgmBtn.className = `sound-button ${this.bgmEnabled ? 'active' : 'muted'}`;
    sfxBtn.className = `sound-button ${this.sfxEnabled ? 'active' : 'muted'}`;
  },
  
  playBGM() {
    if (this.bgmEnabled && this.bgMusic) {
      this.bgMusic.play().catch(e => console.log('背景音樂播放失敗:', e));
    }
  },
  
  stopBGM() {
    if (this.bgMusic) {
      this.bgMusic.pause();
      this.bgMusic.currentTime = 0;
    }
  },
  
  playSFX(sound) {
    if (this.sfxEnabled && sound) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('音效播放失敗:', e));
    }
  },
  
  playAttack() {
    this.playSFX(this.attackSound);
  },
  
  playHit() {
    this.playSFX(this.hitSound);
  },
  
  playVictory() {
    this.playSFX(this.victorySound);
  },
  
  playGameOver() {
    this.playSFX(this.gameOverSound);
  },
  
  playButtonClick() {
    this.playSFX(this.buttonClickSound);
  }
};

// 粒子效果系統
const particleSystem = {
  particles: [],
  
  createParticle(x, y, vx, vy, color, size, life, type = 'normal') {
    return {
      x, y, vx, vy, color, size, life, maxLife: life, type
    };
  },
  
  addParticle(particle) {
    this.particles.push(particle);
  },
  
  createExplosion(x, y, color = '#FFD700', count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = 2 + Math.random() * 3;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;
      const particle = this.createParticle(
        x, y, vx, vy, color, 
        3 + Math.random() * 3, 
        30 + Math.random() * 30,
        'explosion'
      );
      this.addParticle(particle);
    }
  },
  
  createHitEffect(x, y, color = '#FF4444') {
    for (let i = 0; i < 5; i++) {
      const vx = (Math.random() - 0.5) * 4;
      const vy = (Math.random() - 0.5) * 4;
      const particle = this.createParticle(
        x, y, vx, vy, color,
        2 + Math.random() * 2,
        20 + Math.random() * 20,
        'hit'
      );
      this.addParticle(particle);
    }
  },
  
  createTrail(x, y, color = '#00FFFF') {
    const particle = this.createParticle(
      x, y, 0, 0, color,
      2, 15, 'trail'
    );
    this.addParticle(particle);
  },
  
  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // 更新位置
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // 更新生命週期
      particle.life--;
      
      // 根據類型更新行為
      switch (particle.type) {
        case 'explosion':
          particle.vx *= 0.95;
          particle.vy *= 0.95;
          particle.size *= 0.98;
          break;
        case 'hit':
          particle.vx *= 0.9;
          particle.vy *= 0.9;
          particle.size *= 0.95;
          break;
        case 'trail':
          particle.size *= 0.9;
          break;
      }
      
      // 移除死亡粒子
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  },
  
  draw(offsetX, offsetY) {
    ctx.save();
    
    for (const particle of this.particles) {
      const alpha = particle.life / particle.maxLife;
      ctx.globalAlpha = alpha;
      
      ctx.fillStyle = particle.color;
      ctx.beginPath();
      ctx.arc(
        particle.x - offsetX, 
        particle.y - offsetY, 
        particle.size, 
        0, 
        Math.PI * 2
      );
      ctx.fill();
    }
    
    ctx.restore();
  },
  
  clear() {
    this.particles = [];
  }
};



// 遊戲統計系統
const gameStats = {
  currentGame: {
    startTime: 0,
    killCount: 0,
    damageTaken: 0,
    completionTime: 0,
    noDamage: true
  },
  
  reset() {
    this.currentGame = {
      startTime: Date.now(),
      killCount: 0,
      damageTaken: 0,
      completionTime: 0,
      noDamage: true
    };
  },
  
  recordKill() {
    this.currentGame.killCount++;
  },
  
  recordDamage() {
    this.currentGame.damageTaken++;
    this.currentGame.noDamage = false;
  },
  
  recordCompletion() {
    this.currentGame.completionTime = Date.now() - this.currentGame.startTime;
  }
};

// 圖片載入
const playerImages = {
  // 移動動畫圖片
  up1: new Image(),
  up2: new Image(),
  down1: new Image(),
  down2: new Image(),
  left1: new Image(),
  left2: new Image(),
  right1: new Image(),
  right2: new Image(),
  // 攻擊動畫圖片
  attackUp1: new Image(),
  attackUp2: new Image(),
  attackDown1: new Image(),
  attackDown2: new Image(),
  attackLeft1: new Image(),
  attackLeft2: new Image(),
  attackRight1: new Image(),
  attackRight2: new Image(),
  // 動作動畫圖片
  actionUp1: new Image(),
  actionUp2: new Image(),
  actionDown1: new Image(),
  actionDown2: new Image(),
  actionLeft1: new Image(),
  actionLeft2: new Image(),
  actionRight1: new Image(),
  actionRight2: new Image()
};

// 怪物圖片載入
const monsterImages = {
  normalA: {
    left1: new Image(),
    left2: new Image(),
    right1: new Image(),
    right2: new Image()
  },
  normalB: {
    left1: new Image(),
    left2: new Image(),
    right1: new Image(),
    right2: new Image()
  },
  normalC: {
    left1: new Image(),
    left2: new Image(),
    right1: new Image(),
    right2: new Image()
  },

  trackerA: {
    left1: new Image(),
    left2: new Image(),
    right1: new Image(),
    right2: new Image()
  },
  trackerB: {
    left1: new Image(),
    left2: new Image(),
    right1: new Image(),
    right2: new Image()
  },
  turret: {
    left1: new Image(),
    left2: new Image(),
    right1: new Image(),
    right2: new Image()
  }
};

// 地圖圖片載入
const mapImages = {};
let currentMapTiles = {};
let currentMapWeights = []; // 地圖圖片權重陣列
let mapTileLayout = []; // 儲存固定的地圖瓦片佈局

// 載入玩家圖片
playerImages.up1.src = 'assets/player/player-up-1.png';
playerImages.up2.src = 'assets/player/player-up-2.png';
playerImages.down1.src = 'assets/player/player-down-1.png';
playerImages.down2.src = 'assets/player/player-down-2.png';
playerImages.left1.src = 'assets/player/player-left-1.png';
playerImages.left2.src = 'assets/player/player-left-2.png';
playerImages.right1.src = 'assets/player/player-right-1.png';
playerImages.right2.src = 'assets/player/player-right-2.png';
playerImages.attackUp1.src = 'assets/player/player-attack-up-1.png';
playerImages.attackUp2.src = 'assets/player/player-attack-up-2.png';
playerImages.attackDown1.src = 'assets/player/player-attack-down-1.png';
playerImages.attackDown2.src = 'assets/player/player-attack-down-2.png';
playerImages.attackLeft1.src = 'assets/player/player-attack-left-1.png';
playerImages.attackLeft2.src = 'assets/player/player-attack-left-2.png';
playerImages.attackRight1.src = 'assets/player/player-attack-right-1.png';
playerImages.attackRight2.src = 'assets/player/player-attack-right-2.png';
playerImages.actionUp1.src = 'assets/player/player-action-up-1.png';
playerImages.actionUp2.src = 'assets/player/player-action-up-2.png';
playerImages.actionDown1.src = 'assets/player/player-action-down-1.png';
playerImages.actionDown2.src = 'assets/player/player-action-down-2.png';
playerImages.actionLeft1.src = 'assets/player/player-action-left-1.png';
playerImages.actionLeft2.src = 'assets/player/player-action-left-2.png';
playerImages.actionRight1.src = 'assets/player/player-action-right-1.png';
playerImages.actionRight2.src = 'assets/player/player-action-right-2.png';

// 載入怪物圖片
monsterImages.normalA.left1.src = 'assets/monsters/normalA-left-1.png';
monsterImages.normalA.left2.src = 'assets/monsters/normalA-left-2.png';
monsterImages.normalA.right1.src = 'assets/monsters/normalA-right-1.png';
monsterImages.normalA.right2.src = 'assets/monsters/normalA-right-2.png';

monsterImages.normalB.left1.src = 'assets/monsters/normalB-left-1.png';
monsterImages.normalB.left2.src = 'assets/monsters/normalB-left-2.png';
monsterImages.normalB.right1.src = 'assets/monsters/normalB-right-1.png';
monsterImages.normalB.right2.src = 'assets/monsters/normalB-right-2.png';

monsterImages.normalC.left1.src = 'assets/monsters/normalC-left-1.png';
monsterImages.normalC.left2.src = 'assets/monsters/normalC-left-2.png';
monsterImages.normalC.right1.src = 'assets/monsters/normalC-right-1.png';
monsterImages.normalC.right2.src = 'assets/monsters/normalC-right-2.png';



// 載入追蹤怪物AB圖片（使用專屬圖片）
monsterImages.trackerA.left1.src = 'assets/monsters/trackerA-left-1.png';
monsterImages.trackerA.left2.src = 'assets/monsters/trackerA-left-2.png';
monsterImages.trackerA.right1.src = 'assets/monsters/trackerA-right-1.png';
monsterImages.trackerA.right2.src = 'assets/monsters/trackerA-right-2.png';

monsterImages.trackerB.left1.src = 'assets/monsters/trackerB-left-1.png';
monsterImages.trackerB.left2.src = 'assets/monsters/trackerB-left-2.png';
monsterImages.trackerB.right1.src = 'assets/monsters/trackerB-right-1.png';
monsterImages.trackerB.right2.src = 'assets/monsters/trackerB-right-2.png';

monsterImages.turret.left1.src = 'assets/monsters/turret-left-1.png';
monsterImages.turret.left2.src = 'assets/monsters/turret-left-2.png';
monsterImages.turret.right1.src = 'assets/monsters/turret-right-1.png';
monsterImages.turret.right2.src = 'assets/monsters/turret-right-2.png';

// 載入地圖圖片
function loadMapImages(levelConfig) {
  console.log('開始載入地圖圖片...');
  console.log('關卡配置:', levelConfig);
  
  if (!levelConfig.mapTiles) {
    console.log('錯誤: 關卡配置中沒有 mapTiles');
    return;
  }
  
  if (!Array.isArray(levelConfig.mapTiles)) {
    console.log('錯誤: mapTiles 不是陣列格式');
    return;
  }
  
  currentMapTiles = [];
  currentMapWeights = []; // 新增權重陣列
  
  for (const tileConfig of levelConfig.mapTiles) {
    // 支援新的權重格式和舊的字串格式
    let tilePath, weight;
    if (typeof tileConfig === 'string') {
      tilePath = tileConfig;
      weight = 1; // 預設權重
    } else if (tileConfig.path && tileConfig.weight) {
      tilePath = tileConfig.path;
      weight = tileConfig.weight;
    } else {
      console.error('無效的地圖圖片配置:', tileConfig);
      continue;
    }
    
    console.log(`載入圖片: ${tilePath}, 權重: ${weight}`);
    if (!mapImages[tilePath]) {
      mapImages[tilePath] = new Image();
      mapImages[tilePath].src = tilePath;
      
      // 添加載入事件監聽器
      mapImages[tilePath].onload = () => {
        console.log(`圖片載入成功: ${tilePath}`);
      };
      
      mapImages[tilePath].onerror = () => {
        console.error(`圖片載入失敗: ${tilePath}`);
      };
    }
    currentMapTiles.push(mapImages[tilePath]);
    currentMapWeights.push(weight);
  }
  
  console.log(`載入關卡地圖圖片: ${levelConfig.mapTiles.length}張`);
  console.log('當前地圖圖片陣列:', currentMapTiles);
  console.log('當前地圖權重陣列:', currentMapWeights);
}

// 根據權重隨機選擇圖片索引
function selectWeightedTileIndex(seed) {
  if (!currentMapWeights || currentMapWeights.length === 0) {
    return 0;
  }
  
  // 計算總權重
  const totalWeight = currentMapWeights.reduce((sum, weight) => sum + weight, 0);
  
  // 使用更複雜的種子算法來增加隨機性
  let randomValue = seed;
  // 多次迭代來增加隨機性
  for (let i = 0; i < 5; i++) {
    randomValue = (randomValue * 9301 + 49297) % 233280;
  }
  const normalizedRandom = randomValue / 233280; // 正規化到 0-1
  
  // 根據權重選擇
  let cumulativeWeight = 0;
  for (let i = 0; i < currentMapWeights.length; i++) {
    cumulativeWeight += currentMapWeights[i];
    if (normalizedRandom <= cumulativeWeight / totalWeight) {
      return i;
    }
  }
  
  // 如果沒有選中任何項目，返回最後一個
  return currentMapWeights.length - 1;
}

// 生成固定的地圖佈局
function generateMapLayout() {
  const gridSize = 100;
  const config = levelConfigs[currentLevel];
  
  if (!config || !config.mapTiles || currentMapTiles.length === 0) {
    console.log('無法生成地圖佈局：缺少配置或圖片');
    return;
  }
  
  // 計算地圖的網格數量
  const gridCols = Math.ceil(config.mapWidth / gridSize);
  const gridRows = Math.ceil(config.mapHeight / gridSize);
  
  // 初始化地圖佈局陣列
  mapTileLayout = [];
  
  console.log(`生成地圖佈局: ${gridCols}x${gridRows} 網格`);
  console.log('使用權重選擇地圖圖片');
  
  // 為每個網格位置分配固定的圖片索引
  for (let row = 0; row < gridRows; row++) {
    mapTileLayout[row] = [];
    for (let col = 0; col < gridCols; col++) {
      // 使用更複雜的種子組合來增加隨機性
      const seed = (row * 73856093) ^ (col * 19349663) ^ (currentLevel * 83492791);
      const tileIndex = selectWeightedTileIndex(seed);
      mapTileLayout[row][col] = tileIndex;
    }
  }
  
  console.log('地圖佈局生成完成');
}

// 遊戲狀態管理
let gameState = 'lobby'; // 'lobby', 'playing', 'gameOver', 'victory'
let currentLevel = 1;
let MAX_LEVEL = 4; // 將從設定檔讀取
let highestUnlockedLevel = 1; // 最高解鎖關卡
let completedLevels = []; // 已完成的關卡
let gameLoopRunning = false; // 控制遊戲循環是否正在運行

// 關卡設定（將從外部檔案載入）
let levelConfigs = {};

// 地圖與視窗設定
let VIEW_WIDTH = canvas.width;
let VIEW_HEIGHT = canvas.height;
let MAP_WIDTH = VIEW_WIDTH * 3; // 預設值，會在loadLevel()中更新
let MAP_HEIGHT = VIEW_HEIGHT * 3; // 預設值，會在loadLevel()中更新

// 玩家設定
const player = {
  x: MAP_WIDTH / 2,
  y: MAP_HEIGHT / 2,
  width: 60,
  height: 90,
  speed: 4,
  moving: false,
  color: '#FFD700',
  direction: 'down', // 預設朝下
  isAttacking: false,
  isActioning: false,
  attackStartTime: 0,
  actionStartTime: 0,
  attackDuration: 300, // 攻擊動畫持續時間
  actionDuration: 100, // 動作動畫持續時間（較短，讓動畫可以持續播放）
  moveAnimationFrame: 1, // 移動動畫幀（1或2）
  moveAnimationTime: 0, // 移動動畫計時器
  moveAnimationSpeed: 200, // 移動動畫切換速度（毫秒）
  attackAnimationFrame: 1, // 攻擊動畫幀（1或2）
  attackAnimationSpeed: 150, // 攻擊動畫切換速度（毫秒）
  actionAnimationFrame: 1, // 動作動畫幀（1或2）
  actionAnimationSpeed: 250, // 動作動畫切換速度（毫秒）
  hp: 10, // 玩家血量
  maxHp: 10, // 最大血量
  isInvulnerable: false, // 無敵狀態
  invulnerableTime: 0, // 無敵時間
  invulnerableDuration: 1000, // 無敵持續時間（1秒）
};

// 鍵盤狀態
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
  Escape: false,
};

// 防抖函數
let resizeTimeout;
function debounceResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (gameState === 'playing') {
      resizeCanvas();
    }
  }, 150); // 150ms 延遲
}

// 視窗大小改變事件
window.addEventListener('resize', debounceResize);

// 鍵盤事件
window.addEventListener('keydown', (e) => {
  if (e.code in keys) {
    keys[e.code] = true;
    if (e.code === 'Space') {
      // 只有在正常遊戲狀態下才執行動作
      if (!gameOver && !gameWon) {
        // 執行動作：打招呼
        if (!player.isActioning) {
          console.log('哈囉！');
          player.isActioning = true;
          player.actionStartTime = Date.now();
          player.actionAnimationTime = Date.now();
          player.actionAnimationFrame = 1;
        }
      }
    }
    
    if (e.code === 'Escape' && gameState === 'playing') {
      // ESC鍵返回大廳
      returnToLobby();
    }
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code in keys) {
    keys[e.code] = false;
    if (e.code === 'Space') {
      // 空白鍵放開時停止動作
      player.isActioning = false;
      
      // 檢查是否需要重新開始或通關
      if (gameOver) {
        // 遊戲結束時放開空白鍵回到大廳
        returnToLobby();
      } else if (gameWon) {
        // 第四關通關時放開空白鍵回到大廳
        returnToLobby();
      } else if (checkExit()) {
        // 在出口位置放開空白鍵通關
        const completedLevel = currentLevel;
        completeLevel(completedLevel);
        
        if (completedLevel < MAX_LEVEL) {
          // 還有下一關，直接進入下一關
          console.log(`恭喜通過第${completedLevel}關！進入第${completedLevel + 1}關`);
          currentLevel = completedLevel + 1;
          loadLevel();
          restartGame();
        } else {
          // 最後一關通關，回到大廳
          gameWon = true;
          console.log('恭喜通關所有關卡！');
        }
      }
    }
  }
});

// Cookie 操作函數
function setCookie(name, value, days) {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = name + "=" + value + ";expires=" + expires.toUTCString();
    console.log(`設定Cookie: ${name}=${value}, 過期時間: ${expires.toUTCString()}`);
    
    // 同時保存到localStorage作為備用
    localStorage.setItem(name, value);
    console.log(`同時保存到localStorage: ${name}=${value}`);
  } catch (error) {
    console.error('Cookie設定失敗:', error);
  }
}

function getCookie(name) {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    console.log(`所有Cookie: ${document.cookie}`);
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        const value = c.substring(nameEQ.length, c.length);
        console.log(`找到Cookie ${name}: ${value}`);
        return value;
      }
    }
    console.log(`未找到Cookie: ${name}`);
    
    // 如果Cookie沒有找到，嘗試從localStorage讀取
    const localStorageValue = localStorage.getItem(name);
    if (localStorageValue) {
      console.log(`從localStorage找到 ${name}: ${localStorageValue}`);
      return localStorageValue;
    }
    
    return null;
  } catch (error) {
    console.error('Cookie讀取失敗:', error);
    return null;
  }
}

// 關卡管理函數
function loadLevel() {
  // 讀取最高解鎖關卡
  const savedHighestLevel = getCookie('highestUnlockedLevel');
  if (savedHighestLevel && savedHighestLevel >= 1 && savedHighestLevel <= MAX_LEVEL) {
    highestUnlockedLevel = parseInt(savedHighestLevel);
  } else {
    highestUnlockedLevel = 1;
  }
  
  // 讀取已完成關卡
  const savedCompletedLevels = getCookie('completedLevels');
  if (savedCompletedLevels) {
    try {
      completedLevels = JSON.parse(savedCompletedLevels);
    } catch (e) {
      completedLevels = [];
    }
  } else {
    completedLevels = [];
  }
  
  console.log(`最高解鎖關卡: ${highestUnlockedLevel}`);
  console.log(`已完成關卡: ${completedLevels.join(', ')}`);
  
  updateLevelConfig();
}

function saveProgress() {
  setCookie('highestUnlockedLevel', highestUnlockedLevel, 365);
  setCookie('completedLevels', JSON.stringify(completedLevels), 365);
  console.log(`保存進度 - 最高解鎖關卡: ${highestUnlockedLevel}, 已完成關卡: ${completedLevels.join(', ')}`);
}

function completeLevel(level) {
  // 標記關卡為已完成
  if (!completedLevels.includes(level)) {
    completedLevels.push(level);
  }
  
  // 解鎖下一關
  if (level >= highestUnlockedLevel && level < MAX_LEVEL) {
    highestUnlockedLevel = level + 1;
  }
  
  // 記錄完成統計
  gameStats.recordCompletion();
  gameStats.currentGame.level = level;
  gameStats.currentGame.completedLevels = completedLevels.length;
  
  // 播放勝利音效
  audioSystem.playVictory();
  
  // 停止背景音樂
  audioSystem.stopBGM();
  
  // 保存進度
  saveProgress();
  
  console.log(`完成第${level}關！`);
  console.log(`已解鎖到第${highestUnlockedLevel}關`);
  console.log(`擊殺數: ${gameStats.currentGame.killCount}`);
  console.log(`完成時間: ${gameStats.currentGame.completionTime}ms`);
  
  return true;
}

function updateLevelConfig() {
  const config = levelConfigs[currentLevel];

  // 載入地圖圖片
  loadMapImages(config);

  // 生成固定的地圖佈局
  generateMapLayout();

  // 保存當前地圖比例（用於調整玩家位置）
  const oldMapWidth = MAP_WIDTH;
  const oldMapHeight = MAP_HEIGHT;
  const oldPlayerX = player.x;
  const oldPlayerY = player.y;
  const oldExitX = exit.x;
  const oldExitY = exit.y;

  // 更新地圖大小（直接使用 levelConfig 中的 mapWidth 和 mapHeight）
  MAP_WIDTH = config.mapWidth;
  MAP_HEIGHT = config.mapHeight;

  // 更新怪物數量
  NORMAL_A_MONSTER_COUNT = config.normalAMonsters;
  NORMAL_B_MONSTER_COUNT = config.normalBMonsters;
  NORMAL_C_MONSTER_COUNT = config.normalCMonsters;

  TRACKER_A_MONSTER_COUNT = config.trackerAMonsters;
  TRACKER_B_MONSTER_COUNT = config.trackerBMonsters;
  TURRET_MONSTER_COUNT = config.turretMonsters;
  MONSTER_COUNT = NORMAL_A_MONSTER_COUNT + NORMAL_B_MONSTER_COUNT + NORMAL_C_MONSTER_COUNT + TRACKER_A_MONSTER_COUNT + TRACKER_B_MONSTER_COUNT + TURRET_MONSTER_COUNT;

  // 更新遊戲時間
  GAME_TIME = config.gameTime;

  // 更新安全區域位置（確保在地圖中心）
  SAFE_ZONE_CENTER_X = MAP_WIDTH / 2;
  SAFE_ZONE_CENTER_Y = MAP_HEIGHT / 2;
  SAFE_ZONE_LEFT = SAFE_ZONE_CENTER_X - SAFE_ZONE_SIZE / 2;
  SAFE_ZONE_RIGHT = SAFE_ZONE_CENTER_X + SAFE_ZONE_SIZE / 2;
  SAFE_ZONE_TOP = SAFE_ZONE_CENTER_Y - SAFE_ZONE_SIZE / 2;
  SAFE_ZONE_BOTTOM = SAFE_ZONE_CENTER_Y + SAFE_ZONE_SIZE / 2;

  // 如果地圖大小改變了，調整玩家位置保持相對位置
  if (oldMapWidth > 0 && oldMapHeight > 0) {
    const scaleX = MAP_WIDTH / oldMapWidth;
    const scaleY = MAP_HEIGHT / oldMapHeight;
    
    // 調整玩家位置
    player.x = oldPlayerX * scaleX;
    player.y = oldPlayerY * scaleY;
    
    // 確保玩家不超出新地圖邊界
    player.x = Math.max(0, Math.min(MAP_WIDTH - player.width, player.x));
    player.y = Math.max(0, Math.min(MAP_HEIGHT - player.height, player.y));
    
    // 調整出口位置保持相對位置
    exit.x = oldExitX * scaleX;
    exit.y = oldExitY * scaleY;
    
    // 確保出口不超出新地圖邊界
    exit.x = Math.max(0, Math.min(MAP_WIDTH - exit.width, exit.x));
    exit.y = Math.max(0, Math.min(MAP_HEIGHT - exit.height, exit.y));
    
    // 調整怪物位置
    monsters.forEach(monster => {
      monster.x = monster.x * scaleX;
      monster.y = monster.y * scaleY;
      
      // 確保怪物不超出新地圖邊界
      monster.x = Math.max(0, Math.min(MAP_WIDTH - monster.width, monster.x));
      monster.y = Math.max(0, Math.min(MAP_HEIGHT - monster.height, monster.y));
    });
    
    // 調整彈幕位置
    projectiles.forEach(projectile => {
      projectile.x = projectile.x * scaleX;
      projectile.y = projectile.y * scaleY;
    });
    
    monsterProjectiles.forEach(projectile => {
      projectile.x = projectile.x * scaleX;
      projectile.y = projectile.y * scaleY;
    });
    
    // 調整攻擊特效位置
    attackEffects.forEach(effect => {
      effect.x = effect.x * scaleX;
      effect.y = effect.y * scaleY;
    });
  }

  console.log(`關卡${currentLevel} - 安全區域中心: (${SAFE_ZONE_CENTER_X}, ${SAFE_ZONE_CENTER_Y})`);
  console.log(`載入關卡 ${currentLevel}: ${config.name}`);
  console.log(`地圖大小: ${MAP_WIDTH}x${MAP_HEIGHT}`);
  console.log(`怪物數量: ${MONSTER_COUNT}隻`);
  console.log(`遊戲時間: ${GAME_TIME/1000}秒`);
  console.log(`出口位置: (${exit.x}, ${exit.y})`);
}

// 怪物設定（動態根據關卡調整）
let NORMAL_A_MONSTER_COUNT = 5; // 預設值，會在loadLevel()中更新
let NORMAL_B_MONSTER_COUNT = 3; // 預設值，會在loadLevel()中更新
let NORMAL_C_MONSTER_COUNT = 2; // 預設值，會在loadLevel()中更新

let TRACKER_A_MONSTER_COUNT = 3; // 預設值，會在loadLevel()中更新
let TRACKER_B_MONSTER_COUNT = 2; // 預設值，會在loadLevel()中更新
let TURRET_MONSTER_COUNT = 2; // 預設值，會在loadLevel()中更新
let MONSTER_COUNT = NORMAL_A_MONSTER_COUNT + NORMAL_B_MONSTER_COUNT + NORMAL_C_MONSTER_COUNT + TRACKER_A_MONSTER_COUNT + TRACKER_B_MONSTER_COUNT + TURRET_MONSTER_COUNT;
const monsters = [];

// 遊戲狀態
let gameOver = false;
let gameWon = false;
let lastAttackTime = 0;
const ATTACK_COOLDOWN = 300; // 0.3秒冷卻時間

// 倒數計時
let GAME_TIME = 90000; // 預設值，會在loadLevel()中更新
let gameStartTime = 0;
let remainingTime = GAME_TIME;

// 擊殺計數器
let killCount = 0;

// 安全區域設定
const SAFE_ZONE_SIZE = 200; // 4格 x 50像素 = 200像素
let SAFE_ZONE_CENTER_X = MAP_WIDTH / 2;
let SAFE_ZONE_CENTER_Y = MAP_HEIGHT / 2;
let SAFE_ZONE_LEFT = SAFE_ZONE_CENTER_X - SAFE_ZONE_SIZE / 2;
let SAFE_ZONE_RIGHT = SAFE_ZONE_CENTER_X + SAFE_ZONE_SIZE / 2;
let SAFE_ZONE_TOP = SAFE_ZONE_CENTER_Y - SAFE_ZONE_SIZE / 2;
let SAFE_ZONE_BOTTOM = SAFE_ZONE_CENTER_Y + SAFE_ZONE_SIZE / 2;

// 攻擊特效
const attackEffects = [];

// 攻擊彈幕
const projectiles = [];
const PROJECTILE_SPEED = 8;
const PROJECTILE_SIZE = 4;

// 怪物攻擊彈幕
const monsterProjectiles = [];
const MONSTER_PROJECTILE_SPEED = 6;
const MONSTER_PROJECTILE_SIZE = 6;

// 通關出口
const exit = {
  x: 0,
  y: 0,
  width: 60,
  height: 60,
  color: '#00FF00',
};

function isInSafeZone(x, y, width, height) {
  return (
    x < SAFE_ZONE_RIGHT &&
    x + width > SAFE_ZONE_LEFT &&
    y < SAFE_ZONE_BOTTOM &&
    y + height > SAFE_ZONE_TOP
  );
}

function getRandomPositionOutsideSafeZone(width, height) {
  let x, y;
  do {
    x = Math.random() * (MAP_WIDTH - width);
    y = Math.random() * (MAP_HEIGHT - height);
  } while (isInSafeZone(x, y, width, height));
  
  return { x, y };
}

function spawnExit() {
  // 終點固定在地圖正中間
  exit.x = MAP_WIDTH / 2 - exit.width / 2;
  exit.y = MAP_HEIGHT / 2 - exit.height / 2;
  
  console.log(`終點生成在地圖正中間: (${exit.x}, ${exit.y})`);
  console.log(`地圖中心: (${MAP_WIDTH / 2}, ${MAP_HEIGHT / 2})`);
  console.log(`安全區域中心: (${SAFE_ZONE_CENTER_X}, ${SAFE_ZONE_CENTER_Y})`);
  console.log(`玩家位置: (${player.x}, ${player.y})`);
}

function spawnMonsters() {
  // 生成普通怪物A
  for (let i = 0; i < NORMAL_A_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(60, 60);
    monsters.push({
      x: position.x,
      y: position.y,
      width: 60,
      height: 60,
      color: '#FF8800',
      hp: 5,
      dx: 0,
      dy: 0,
      type: 'normalA',
      speed: 0.8,
      // 動畫相關屬性
      direction: 'right', // 預設朝右
      animationFrame: 1, // 動畫幀（1或2）
      animationTime: 0, // 動畫計時器
      animationSpeed: 280, // 動畫切換速度（毫秒，比普通怪物快一點）
    });
  }
  
  // 生成普通怪物B
  for (let i = 0; i < NORMAL_B_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(60, 60);
    monsters.push({
      x: position.x,
      y: position.y,
      width: 60,
      height: 60,
      color: '#8844FF',
      hp: 5,
      dx: 0,
      dy: 0,
      type: 'normalB',
      speed: 0.8,
      // 動畫相關屬性
      direction: 'right', // 預設朝右
      animationFrame: 1, // 動畫幀（1或2）
      animationTime: 0, // 動畫計時器
      animationSpeed: 320, // 動畫切換速度（毫秒，比普通怪物慢一點）
    });
  }
  
  // 生成普通怪物C
  for (let i = 0; i < NORMAL_C_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(60, 60);
    monsters.push({
      x: position.x,
      y: position.y,
      width: 60,
      height: 60,
      color: '#44FF44',
      hp: 5,
      dx: 0,
      dy: 0,
      type: 'normalC',
      speed: 0.8,
      // 動畫相關屬性
      direction: 'right', // 預設朝右
      animationFrame: 1, // 動畫幀（1或2）
      animationTime: 0, // 動畫計時器
      animationSpeed: 350, // 動畫切換速度（毫秒，最慢）
    });
  }
  

  
  // 生成追蹤怪物A
  for (let i = 0; i < TRACKER_A_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(120, 120);
    monsters.push({
      x: position.x,
      y: position.y,
      width: 120,
      height: 120,
      color: '#FF0088',
      hp: 2,
      dx: 0,
      dy: 0,
      type: 'trackerA',
      speed: 1.5,
      // 動畫相關屬性
      direction: 'right', // 預設朝右
      animationFrame: 1, // 動畫幀（1或2）
      animationTime: 0, // 動畫計時器
      animationSpeed: 250, // 動畫切換速度（毫秒，比普通怪物快一點）
    });
  }
  
  // 生成追蹤怪物B
  for (let i = 0; i < TRACKER_B_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(120, 120);
    monsters.push({
      x: position.x,
      y: position.y,
      width: 120,
      height: 120,
      color: '#FF0088',
      hp: 2,
      dx: 0,
      dy: 0,
      type: 'trackerB',
      speed: 1.5,
      // 動畫相關屬性
      direction: 'right', // 預設朝右
      animationFrame: 1, // 動畫幀（1或2）
      animationTime: 0, // 動畫計時器
      animationSpeed: 250, // 動畫切換速度（毫秒，比普通怪物快一點）
    });
  }
  
  // 生成砲塔怪物（體積五倍大，不會移動，會發射遠距離攻擊）
  for (let i = 0; i < TURRET_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(300, 300); // 五倍大小
    monsters.push({
      x: position.x,
      y: position.y,
      width: 300, // 60 * 5 = 300
      height: 300, // 60 * 5 = 300
      color: '#8B0000', // 深紅色
      hp: 5, // 更多血量
      dx: 0,
      dy: 0,
      type: 'turret',
      speed: 0, // 不會移動
      lastAttackTime: 0, // 攻擊計時器
      attackCooldown: 2000, // 2秒攻擊間隔
      attackRange: 400, // 攻擊範圍
      // 動畫相關屬性（砲塔也會有動畫，雖然不移動）
      direction: 'right', // 預設朝右
      animationFrame: 1, // 動畫幀（1或2）
      animationTime: 0, // 動畫計時器
      animationSpeed: 500, // 動畫切換速度（毫秒，較慢）
    });
  }
}

function drawMonsters(offsetX, offsetY) {
  const currentTime = Date.now();
  
  for (const m of monsters) {
    // 只繪製在可視範圍內的怪物
    if (
      m.x + m.width > offsetX &&
      m.x < offsetX + VIEW_WIDTH &&
      m.y + m.height > offsetY &&
      m.y < offsetY + VIEW_HEIGHT
    ) {
      // 更新怪物動畫
      if (currentTime - m.animationTime > m.animationSpeed) {
        m.animationFrame = m.animationFrame === 1 ? 2 : 1;
        m.animationTime = currentTime;
      }
      
      // 繪製怪物動畫圖片
      const monsterImageSet = monsterImages[m.type];
      const imageKey = `${m.direction}${m.animationFrame}`;
      const monsterImage = monsterImageSet[imageKey];
      
      if (monsterImage && monsterImage.complete) {
        ctx.drawImage(monsterImage, m.x - offsetX, m.y - offsetY, m.width, m.height);
      } else {
        // 如果圖片未載入完成，使用顏色方塊作為備用
        ctx.fillStyle = m.color;
        ctx.fillRect(m.x - offsetX, m.y - offsetY, m.width, m.height);
      }
      
      // 繪製怪物血條
      drawMonsterHealthBar(m, offsetX, offsetY);
    }
  }
}

function drawMonsterHealthBar(monster, offsetX, offsetY) {
  const barWidth = monster.width;
  const barHeight = 6;
  const barX = monster.x - offsetX;
  const barY = monster.y - offsetY - barHeight - 2; // 在怪物上方2像素
  
  // 血條背景（灰色）
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  // 計算血量百分比
  const healthPercent = monster.hp / getMonsterMaxHp(monster.type);
  
  // 血量顏色
  let healthColor;
  if (healthPercent >= 0.7) {
    healthColor = '#00FF00'; // 綠色
  } else if (healthPercent >= 0.4) {
    healthColor = '#FFFF00'; // 黃色
  } else {
    healthColor = '#FF0000'; // 紅色
  }
  
  // 血量條
  ctx.fillStyle = healthColor;
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  
  // 血條邊框
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  // 血量數字（只在血量不滿時顯示）
  if (monster.hp < getMonsterMaxHp(monster.type)) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${monster.hp}/${getMonsterMaxHp(monster.type)}`, barX + barWidth / 2, barY + barHeight - 1);
  }
}

function getMonsterMaxHp(type) {
  switch (type) {
    case 'trackerA':
    case 'trackerB':
      return 2;
    case 'normalA':
      return 5;
    case 'normalB':
      return 5;
    case 'normalC':
      return 5;
    case 'turret':
      return 5;
    default:
      return 2;
  }
}

function updatePlayer() {
  player.moving = false;
  
  // 如果正在執行動作，禁止移動
  if (player.isActioning) {
    return;
  }
  
  if (keys.ArrowUp) {
    player.y -= player.speed;
    player.moving = true;
    player.direction = 'up';
  }
  if (keys.ArrowDown) {
    player.y += player.speed;
    player.moving = true;
    player.direction = 'down';
  }
  if (keys.ArrowLeft) {
    player.x -= player.speed;
    player.moving = true;
    player.direction = 'left';
  }
  if (keys.ArrowRight) {
    player.x += player.speed;
    player.moving = true;
    player.direction = 'right';
  }
  // 邊界限制
  player.x = Math.max(0, Math.min(MAP_WIDTH - player.width, player.x));
  player.y = Math.max(0, Math.min(MAP_HEIGHT - player.height, player.y));
}

function drawPlayer(offsetX, offsetY) {
  const currentTime = Date.now();
  let imageToDraw;
  
  // 檢查動作動畫（最高優先級）
  if (player.isActioning) {
    // 更新動作動畫
    if (currentTime - player.actionAnimationTime > player.actionAnimationSpeed) {
      player.actionAnimationFrame = player.actionAnimationFrame === 1 ? 2 : 1;
      player.actionAnimationTime = currentTime;
    }
    imageToDraw = playerImages[`action${player.direction.charAt(0).toUpperCase() + player.direction.slice(1)}${player.actionAnimationFrame}`];
  }
  
  // 檢查攻擊動畫（第二優先級）
  if (!imageToDraw && player.isAttacking) {
    const attackElapsed = currentTime - player.attackStartTime;
    if (attackElapsed < player.attackDuration) {
      // 更新攻擊動畫
      if (currentTime - player.attackAnimationTime > player.attackAnimationSpeed) {
        player.attackAnimationFrame = player.attackAnimationFrame === 1 ? 2 : 1;
        player.attackAnimationTime = currentTime;
      }
      imageToDraw = playerImages[`attack${player.direction.charAt(0).toUpperCase() + player.direction.slice(1)}${player.attackAnimationFrame}`];
    } else {
      player.isAttacking = false;
    }
  }
  
  // 如果沒有特殊動畫，使用移動動畫（最低優先級）
  if (!imageToDraw) {
    if (player.moving) {
      // 更新移動動畫
      if (currentTime - player.moveAnimationTime > player.moveAnimationSpeed) {
        player.moveAnimationFrame = player.moveAnimationFrame === 1 ? 2 : 1;
        player.moveAnimationTime = currentTime;
      }
      imageToDraw = playerImages[`${player.direction}${player.moveAnimationFrame}`];
    } else {
      // 停止時顯示第1幀
      imageToDraw = playerImages[`${player.direction}1`];
    }
  }
  
  // 繪製角色圖片
  ctx.drawImage(imageToDraw, player.x - offsetX, player.y - offsetY, player.width, player.height);
  
  // 繪製玩家血條
  drawPlayerHealthBar(offsetX, offsetY);
}

function drawPlayerHealthBar(offsetX, offsetY) {
  const barWidth = player.width;
  const barHeight = 8;
  const barX = player.x - offsetX;
  const barY = player.y - offsetY - barHeight - 4; // 在玩家上方4像素
  
  // 血條背景（深灰色）
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(barX, barY, barWidth, barHeight);
  
  // 計算血量百分比
  const healthPercent = player.hp / player.maxHp;
  
  // 血量顏色
  let healthColor;
  if (healthPercent >= 0.7) {
    healthColor = '#00FF00'; // 綠色
  } else if (healthPercent >= 0.4) {
    healthColor = '#FFFF00'; // 黃色
  } else {
    healthColor = '#FF0000'; // 紅色
  }
  
  // 血量條
  ctx.fillStyle = healthColor;
  ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
  
  // 血條邊框
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(barX, barY, barWidth, barHeight);
  
  // 血量數字（只在血量不滿時顯示）
  if (player.hp < player.maxHp) {
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${player.hp}/${player.maxHp}`, barX + barWidth / 2, barY + barHeight - 1);
  }
  
  // 如果處於無敵狀態，添加閃爍效果
  if (player.isInvulnerable) {
    const currentTime = Date.now();
    const flashRate = 100; // 閃爍頻率（毫秒）
    if (Math.floor(currentTime / flashRate) % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(barX, barY, barWidth, barHeight);
    }
  }
}

function clearScreen() {
  // 創建與大廳一致的背景漸變
  const gradient = ctx.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  gradient.addColorStop(0, '#2a2a2a');
  gradient.addColorStop(1, '#444');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
}

function getCameraOffset() {
  // 讓玩家始終在畫面中央（除非到地圖邊緣）
  let offsetX = player.x + player.width / 2 - VIEW_WIDTH / 2;
  let offsetY = player.y + player.height / 2 - VIEW_HEIGHT / 2;
  offsetX = Math.max(0, Math.min(MAP_WIDTH - VIEW_WIDTH, offsetX));
  offsetY = Math.max(0, Math.min(MAP_HEIGHT - VIEW_HEIGHT, offsetY));
  return { offsetX, offsetY };
}

function distance(ax, ay, bx, by) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function autoAttack() {
  if (!player.moving && !player.isActioning) {
    const currentTime = Date.now();
    if (currentTime - lastAttackTime < ATTACK_COOLDOWN) {
      return; // 還在冷卻中
    }
    
    // 檢查所有怪物
    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      // 以玩家中心與怪物中心計算距離
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const mx = m.x + m.width / 2;
      const my = m.y + m.height / 2;
      if (distance(px, py, mx, my) < 300) {
        // 發射彈幕
        const dx = mx - px;
        const dy = my - py;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        projectiles.push({
          x: px,
          y: py,
          vx: (dx / dist) * PROJECTILE_SPEED,
          vy: (dy / dist) * PROJECTILE_SPEED,
          targetMonster: i,
        });
        
        // 設定攻擊動畫
        player.isAttacking = true;
        player.attackStartTime = currentTime;
        player.attackAnimationTime = currentTime;
        player.attackAnimationFrame = 1;
        
        lastAttackTime = currentTime;
        
        // 播放攻擊音效
        audioSystem.playAttack();
        
        // 創建攻擊粒子效果
        particleSystem.createTrail(px, py, '#FFFF00');
        
        // 一次只攻擊一隻
        break;
      }
    }
  }
}

function updateMonsters() {
  const currentTime = Date.now();
  
  // 檢查玩家是否在安全區域內
  const isPlayerInSafeZone = isInSafeZone(player.x, player.y, player.width, player.height);
  
  for (const m of monsters) {
    if (m.type === 'trackerA' || m.type === 'trackerB') {
      // 追蹤怪物：檢查與玩家的距離
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const mx = m.x + m.width / 2;
      const my = m.y + m.height / 2;
      
      const dx = px - mx;
      const dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // 只有當玩家不在安全區域內時才追蹤
      if (!isPlayerInSafeZone) {
        if (dist <= 500) {
          // 500像素內：追蹤玩家
          if (dist > 0) {
            m.dx = (dx / dist) * m.speed;
            m.dy = (dy / dist) * m.speed;
          }
        } else {
          // 500像素外：隨機移動
          if (Math.random() < 0.02) { // 2% 機率改變方向
            m.dx = (Math.random() - 0.5) * 2 * m.speed;
            m.dy = (Math.random() - 0.5) * 2 * m.speed;
          }
        }
      } else {
        // 玩家在安全區域內：停止追蹤，改為隨機移動
        if (Math.random() < 0.02) { // 2% 機率改變方向
          m.dx = (Math.random() - 0.5) * 2 * m.speed;
          m.dy = (Math.random() - 0.5) * 2 * m.speed;
        }
      }
    } else if (m.type === 'turret') {
      // 砲塔怪物：不會移動，但會發射攻擊
      // 只有當玩家不在安全區域內時才攻擊
      if (!isPlayerInSafeZone) {
        const px = player.x + player.width / 2;
        const py = player.y + player.height / 2;
        const mx = m.x + m.width / 2;
        const my = m.y + m.height / 2;
        
        const dx = px - mx;
        const dy = py - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // 根據攻擊方向更新砲塔動畫方向
        if (dx > 0) {
          m.direction = 'right';
        } else if (dx < 0) {
          m.direction = 'left';
        }
        // 如果 dx = 0，保持當前方向
        
        // 檢查攻擊冷卻和範圍
        if (dist <= m.attackRange && currentTime - m.lastAttackTime >= m.attackCooldown) {
          // 發射攻擊彈幕
          if (dist > 0) {
            monsterProjectiles.push({
              x: mx,
              y: my,
              vx: (dx / dist) * MONSTER_PROJECTILE_SPEED,
              vy: (dy / dist) * MONSTER_PROJECTILE_SPEED,
              targetPlayer: true,
            });
            m.lastAttackTime = currentTime;
          }
        }
      }
    } else if (m.type === 'normalA' || m.type === 'normalB' || m.type === 'normalC') {
      // 普通怪物ABC：隨機移動（不受玩家位置影響）
      if (Math.random() < 0.02) { // 2% 機率改變方向
        m.dx = (Math.random() - 0.5) * 2 * m.speed;
        m.dy = (Math.random() - 0.5) * 2 * m.speed;
      }
    }
    
    // 移動怪物（砲塔怪物不會移動）
    if (m.type !== 'turret') {
      const newX = m.x + (m.dx || 0);
      const newY = m.y + (m.dy || 0);
      
      // 檢查是否會進入安全區域
      if (!isInSafeZone(newX, newY, m.width, m.height)) {
        m.x = newX;
        m.y = newY;
      }
      
      // 邊界限制
      m.x = Math.max(0, Math.min(MAP_WIDTH - m.width, m.x));
      m.y = Math.max(0, Math.min(MAP_HEIGHT - m.height, m.y));
      
      // 更新怪物動畫方向
      if (m.dx > 0) {
        m.direction = 'right';
      } else if (m.dx < 0) {
        m.direction = 'left';
      }
      // 如果 dx = 0，保持當前方向
    }
  }
}

function checkCollision() {
  // 如果玩家處於無敵狀態，不檢查碰撞
  if (player.isInvulnerable) {
    const currentTime = Date.now();
    if (currentTime - player.invulnerableTime >= player.invulnerableDuration) {
      player.isInvulnerable = false;
    } else {
      return; // 還在無敵狀態中
    }
  }
  
  for (const m of monsters) {
    if (
      player.x < m.x + m.width &&
      player.x + player.width > m.x &&
      player.y < m.y + m.height &&
      player.y + player.height > m.y
    ) {
      // 玩家受到傷害
      player.hp--;
      player.isInvulnerable = true;
      player.invulnerableTime = Date.now();
      
      // 記錄傷害統計
      gameStats.recordDamage();
      
      // 播放受傷音效
      audioSystem.playHit();
      
      // 創建受傷粒子效果
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      particleSystem.createHitEffect(playerCenterX, playerCenterY, '#FF4444');
      
      console.log(`玩家受到傷害！剩餘血量：${player.hp}`);
      
              if (player.hp <= 0) {
          gameOver = true;
          audioSystem.playGameOver();
          audioSystem.stopBGM();
          console.log('遊戲結束！你的血量耗盡了！');
        }
      return;
    }
  }
}

function checkExit() {
  // 檢查玩家是否在出口位置
  if (
    player.x < exit.x + exit.width &&
    player.x + player.width > exit.x &&
    player.y < exit.y + exit.height &&
    player.y + player.height > exit.y
  ) {
    return true;
  }
  return false;
}

function drawExit(offsetX, offsetY) {
  ctx.fillStyle = exit.color;
  ctx.fillRect(exit.x - offsetX, exit.y - offsetY, exit.width, exit.height);
  
  // 畫一個 "EXIT" 文字
  ctx.fillStyle = '#000000';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', exit.x - offsetX + exit.width / 2, exit.y - offsetY + exit.height / 2 + 4);
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    const p = projectiles[i];
    
    // 移動彈幕
    p.x += p.vx;
    p.y += p.vy;
    
    // 檢查是否擊中目標怪物
    if (p.targetMonster < monsters.length) {
      const m = monsters[p.targetMonster];
      const mx = m.x + m.width / 2;
      const my = m.y + m.height / 2;
      
      if (distance(p.x, p.y, mx, my) < m.width / 2) {
        // 擊中怪物
        m.hp--;
        console.log(`攻擊怪物！剩餘血量：${m.hp}`);
        
        // 播放擊中音效
        audioSystem.playHit();
        
        // 創建擊中粒子效果
        particleSystem.createHitEffect(mx, my, '#FF4444');
        
        if (m.hp <= 0) {
          // 怪物死亡
          monsters.splice(p.targetMonster, 1);
          killCount++;
          
          // 記錄擊殺統計
          gameStats.recordKill();
          
          // 創建爆炸粒子效果
          particleSystem.createExplosion(mx, my, '#FFD700', 12);
          
          console.log(`怪物被消滅了！擊殺數：${killCount}`);
        }
        projectiles.splice(i, 1);
        continue;
      }
    }
    
    // 檢查是否超出地圖範圍
    if (p.x < 0 || p.x > MAP_WIDTH || p.y < 0 || p.y > MAP_HEIGHT) {
      projectiles.splice(i, 1);
    }
  }
}

function updateMonsterProjectiles() {
  for (let i = monsterProjectiles.length - 1; i >= 0; i--) {
    const p = monsterProjectiles[i];
    
    // 移動怪物攻擊彈幕
    p.x += p.vx;
    p.y += p.vy;
    
    // 檢查是否擊中玩家
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    
    if (distance(p.x, p.y, px, py) < player.width / 2) {
      // 擊中玩家
      if (!player.isInvulnerable) {
        player.hp--;
        player.isInvulnerable = true;
        player.invulnerableTime = Date.now();
        
        console.log(`玩家被怪物攻擊擊中！剩餘血量：${player.hp}`);
        
        if (player.hp <= 0) {
          gameOver = true;
          audioSystem.stopBGM();
          console.log('遊戲結束！你的血量耗盡了！');
        }
      }
      monsterProjectiles.splice(i, 1);
      continue;
    }
    
    // 檢查是否超出地圖範圍
    if (p.x < 0 || p.x > MAP_WIDTH || p.y < 0 || p.y > MAP_HEIGHT) {
      monsterProjectiles.splice(i, 1);
    }
  }
}

function updateAttackEffects() {
  const currentTime = Date.now();
  for (let i = attackEffects.length - 1; i >= 0; i--) {
    const effect = attackEffects[i];
    const elapsed = currentTime - effect.startTime;
    const progress = elapsed / effect.duration;
    
    if (progress >= 1) {
      attackEffects.splice(i, 1);
    } else {
      effect.radius = effect.maxRadius * progress;
    }
  }
}

function drawProjectiles(offsetX, offsetY) {
  ctx.fillStyle = '#FFFF00';
  for (const p of projectiles) {
    ctx.beginPath();
    ctx.arc(p.x - offsetX, p.y - offsetY, PROJECTILE_SIZE, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawMonsterProjectiles(offsetX, offsetY) {
  ctx.fillStyle = '#FF0000'; // 紅色怪物攻擊彈幕
  for (const p of monsterProjectiles) {
    ctx.beginPath();
    ctx.arc(p.x - offsetX, p.y - offsetY, MONSTER_PROJECTILE_SIZE, 0, 2 * Math.PI);
    ctx.fill();
  }
}

function drawAttackEffects(offsetX, offsetY) {
  for (const effect of attackEffects) {
    const alpha = 1 - ((Date.now() - effect.startTime) / effect.duration);
    ctx.strokeStyle = `rgba(255, 255, 0, ${alpha})`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(
      effect.x - offsetX,
      effect.y - offsetY,
      effect.radius,
      0,
      2 * Math.PI
    );
    ctx.stroke();
  }
}

function restartGame() {
  // 重置遊戲狀態
  gameOver = false;
  gameWon = false;
  lastAttackTime = 0;
  
  // 重置計時器
  gameStartTime = Date.now();
  remainingTime = GAME_TIME;
  
  // 重置擊殺計數器
  killCount = 0;
  
  // 重置遊戲統計
  gameStats.reset();
  
  // 重置玩家位置和狀態（確保在地圖中心）
  player.x = MAP_WIDTH / 2;
  player.y = MAP_HEIGHT / 2;
  
  console.log(`重新開始遊戲 - 玩家位置重置到地圖中心: (${player.x}, ${player.y})`);
  player.moving = false;
  player.direction = 'down';
  player.isAttacking = false;
  player.isActioning = false;
  player.moveAnimationFrame = 1;
  player.moveAnimationTime = 0;
  player.attackAnimationFrame = 1;
  player.attackAnimationTime = 0;
  player.actionAnimationFrame = 1;
  player.actionAnimationTime = 0;
  
  // 重置玩家血量
  player.hp = player.maxHp;
  player.isInvulnerable = false;
  player.invulnerableTime = 0;
  
  // 清空所有怪物和彈幕
  monsters.length = 0;
  projectiles.length = 0;
  monsterProjectiles.length = 0;
  attackEffects.length = 0;
  
  // 清空粒子效果
  particleSystem.clear();
  
  // 重新生成怪物和出口
  spawnMonsters();
  spawnExit();
  
  // 播放背景音樂
  audioSystem.playBGM();
  
  console.log('遊戲重新開始！');
}

function drawGameOver() {
  // 半透明背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  
  // 主面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(VIEW_WIDTH / 2 - 250, VIEW_HEIGHT / 2 - 120, 500, 240);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 3;
  ctx.strokeRect(VIEW_WIDTH / 2 - 250, VIEW_HEIGHT / 2 - 120, 500, 240);
  
  ctx.fillStyle = '#FF0000';
  ctx.font = 'bold 56px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('遊戲結束！', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 60);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('按空白鍵返回大廳', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 30);
  
  // 遊戲結束時停止背景音樂
  audioSystem.stopBGM();
}

function updateTimer() {
  if (!gameOver && !gameWon) {
    const currentTime = Date.now();
    remainingTime = Math.max(0, GAME_TIME - (currentTime - gameStartTime));
    
    if (remainingTime <= 0) {
      gameOver = true;
      audioSystem.stopBGM();
      console.log('時間到！遊戲結束！');
    }
  }
}

function drawTimer() {
  const seconds = Math.ceil(remainingTime / 1000);
  const color = seconds <= 3 ? '#FF0000' : seconds <= 5 ? '#FFFF00' : '#FFFFFF';
  
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, 10, 110, 40);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_WIDTH - 120, 10, 110, 40);
  
  ctx.fillStyle = color;
  ctx.font = 'bold 28px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`時間: ${seconds}秒`, VIEW_WIDTH - 65, 40);
}

function drawKillCount() {
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, 60, 110, 40);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_WIDTH - 120, 60, 110, 40);
  
  ctx.fillStyle = '#00FF00';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`擊殺: ${killCount}`, VIEW_WIDTH - 65, 90);
}

function drawLevelInfo() {
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, 160, 110, 40);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_WIDTH - 120, 160, 110, 40);
  
  const config = levelConfigs[currentLevel];
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`關卡: ${currentLevel}`, VIEW_WIDTH - 65, 185);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '14px Arial';
  ctx.fillText(config.name, VIEW_WIDTH - 65, 200);
}

// 新增：顯示地圖尺寸和角色座標
function drawMapAndPlayerInfo() {
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, 210, 110, 80);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_WIDTH - 120, 210, 110, 80);
  
  // 地圖尺寸
  ctx.fillStyle = '#00FFFF';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('地圖尺寸', VIEW_WIDTH - 65, 230);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px Arial';
  ctx.fillText(`${MAP_WIDTH} × ${MAP_HEIGHT}`, VIEW_WIDTH - 65, 245);
  
  // 角色座標
  ctx.fillStyle = '#00FFFF';
  ctx.font = 'bold 14px Arial';
  ctx.fillText('角色座標', VIEW_WIDTH - 65, 265);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '12px Arial';
  ctx.fillText(`X: ${Math.round(player.x)}`, VIEW_WIDTH - 65, 280);
  ctx.fillText(`Y: ${Math.round(player.y)}`, VIEW_WIDTH - 65, 295);
}

// 計算Canvas最佳尺寸
function calculateCanvasSize() {
  const container = document.getElementById('gameContainer');
  const containerRect = container.getBoundingClientRect();
  
  // 最大尺寸
  const MAX_WIDTH = 1200;
  const MAX_HEIGHT = 900;
  
  // 容器可用空間（減去內邊距）
  const availableWidth = containerRect.width - 40; // 20px padding on each side
  const availableHeight = containerRect.height - 40;
  
  // 計算縮放比例
  const scaleX = availableWidth / MAX_WIDTH;
  const scaleY = availableHeight / MAX_HEIGHT;
  const scale = Math.min(scaleX, scaleY, 1); // 不放大，只縮小
  
  // 計算實際尺寸
  const actualWidth = Math.floor(MAX_WIDTH * scale);
  const actualHeight = Math.floor(MAX_HEIGHT * scale);
  
  return { width: actualWidth, height: actualHeight, scale: scale };
}

// 設置Canvas尺寸
function resizeCanvas() {
  try {
    const { width, height, scale } = calculateCanvasSize();
    
    // 確保尺寸有效
    if (width <= 0 || height <= 0) {
      console.warn('計算的Canvas尺寸無效，使用預設尺寸');
      return;
    }
    
    // 設置Canvas尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 更新視窗大小（只更新可視範圍，不改變地圖大小）
    VIEW_WIDTH = width;
    VIEW_HEIGHT = height;
    
    // 注意：不再調用updateLevelConfig()，因為地圖大小應該保持固定
    // 只有可視範圍（Canvas）會根據視窗大小調整
    
    console.log(`Canvas尺寸調整為: ${width}x${height}, 縮放比例: ${scale.toFixed(2)}`);
    console.log('地圖大小保持固定，只調整可視範圍');
    
  } catch (error) {
    console.error('調整Canvas尺寸時發生錯誤:', error);
  }
}

// 新增：繪製遊戲標題
function drawGameTitle() {
  // 標題面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, VIEW_HEIGHT - 50, 400, 40);
  
  // 標題面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, VIEW_HEIGHT - 50, 400, 40);
  
  // 遊戲標題
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'left';
  ctx.fillText('末日ESG小尖兵', 20, VIEW_HEIGHT - 25);
  
  // 返回大廳按鈕
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, VIEW_HEIGHT - 50, 110, 40);
  
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_WIDTH - 120, VIEW_HEIGHT - 50, 110, 40);
  
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('返回大廳 (ESC)', VIEW_WIDTH - 65, VIEW_HEIGHT - 25);
}

function drawPlayerHealth() {
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, 110, 110, 40);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_WIDTH - 120, 110, 110, 40);
  
  // 血量顏色根據血量變化
  let healthColor;
  if (player.hp >= 7) {
    healthColor = '#00FF00'; // 綠色
  } else if (player.hp >= 4) {
    healthColor = '#FFFF00'; // 黃色
  } else {
    healthColor = '#FF0000'; // 紅色
  }
  
  ctx.fillStyle = healthColor;
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`血量: ${player.hp}/${player.maxHp}`, VIEW_WIDTH - 65, 140);
  
  // 如果處於無敵狀態，顯示閃爍效果
  if (player.isInvulnerable) {
    const currentTime = Date.now();
    const flashRate = 100; // 閃爍頻率（毫秒）
    if (Math.floor(currentTime / flashRate) % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(VIEW_WIDTH - 120, 110, 110, 40);
    }
  }
}

function drawGameInstructions() {
  // 主面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 220, 380);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 220, 380);
  
  const config = levelConfigs[currentLevel];
  const instructions = [
    '【操作】',
    '方向鍵：移動',
    '空白鍵：執行動作',
    '',
    '【規則】',
    '• 停止時自動攻擊',
    '• 找到綠色出口通關',
    '• 安全區域內無敵',
    '• 血量耗盡遊戲結束',
    '',
    '【關卡】',
    `• 當前：${config.name}`,
    `• 時間：${config.gameTime/1000}秒`,
    `• 怪物：${config.normalAMonsters + config.normalBMonsters + config.normalCMonsters + config.trackerAMonsters + config.trackerBMonsters + config.turretMonsters}隻`,
    '',
    '【怪物】',
    '• 紅色：普通怪物',
    '• 粉色：追蹤怪物',
    '• 深紅：砲塔怪物',
    '• 玩家在安全區時不攻擊'
  ];
  
  instructions.forEach((text, index) => {
    if (text.startsWith('【')) {
      ctx.fillStyle = '#FFFF00';
      ctx.font = 'bold 18px Arial';
    } else if (text.startsWith('•')) {
      ctx.fillStyle = '#00FFFF';
      ctx.font = '16px Arial';
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '16px Arial';
    }
    ctx.textAlign = 'left';
    ctx.fillText(text, 20, 35 + index * 18);
  });
}

function drawVictory() {
  // 半透明背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  
  // 主面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.fillRect(VIEW_WIDTH / 2 - 300, VIEW_HEIGHT / 2 - 120, 600, 240);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 3;
  ctx.strokeRect(VIEW_WIDTH / 2 - 300, VIEW_HEIGHT / 2 - 120, 600, 240);
  
  ctx.fillStyle = '#00FF00';
  ctx.font = 'bold 56px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('恭喜通關所有關卡！', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 60);
  
  // 顯示遊戲統計
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`擊殺數: ${killCount}`, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 20);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Arial';
  ctx.fillText('按空白鍵返回大廳', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 30);
}

function drawMap(offsetX, offsetY) {
  const gridSize = 100;
  const config = levelConfigs[currentLevel];
  
  // 調試信息
  if (!config) {
    console.log('錯誤: 沒有找到關卡配置');
    return;
  }
  
  if (!config.mapTiles) {
    console.log('錯誤: 關卡配置中沒有 mapTiles');
    return;
  }
  
  if (!Array.isArray(config.mapTiles)) {
    console.log('錯誤: mapTiles 不是陣列格式');
    return;
  }
  
  if (currentMapTiles.length === 0) {
    console.log('錯誤: 當前地圖圖片陣列為空');
    return;
  }
  
  if (mapTileLayout.length === 0) {
    console.log('錯誤: 地圖佈局未生成');
    return;
  }
  
  // 計算需要繪製的網格範圍
  const startX = Math.floor(offsetX / gridSize) * gridSize;
  const startY = Math.floor(offsetY / gridSize) * gridSize;
  const endX = startX + VIEW_WIDTH + gridSize;
  const endY = startY + VIEW_HEIGHT + gridSize;
  
  let tilesDrawn = 0;
  let tilesFailed = 0;
  
  // 繪製地圖瓦片
  for (let x = startX; x < endX; x += gridSize) {
    for (let y = startY; y < endY; y += gridSize) {
      const drawX = x - offsetX;
      const drawY = y - offsetY;
      
      // 計算網格位置
      const gridCol = Math.floor(x / gridSize);
      const gridRow = Math.floor(y / gridSize);
      
      // 檢查佈局陣列邊界
      if (gridRow >= 0 && gridRow < mapTileLayout.length && 
          gridCol >= 0 && gridCol < mapTileLayout[gridRow].length) {
        
        // 使用固定的地圖佈局
        const tileIndex = mapTileLayout[gridRow][gridCol];
        const tileImage = currentMapTiles[tileIndex];
        
        if (tileImage && tileImage.complete) {
          ctx.drawImage(tileImage, drawX, drawY, gridSize, gridSize);
          tilesDrawn++;
        } else {
          // 如果圖片未載入，使用顏色方塊作為備用
          ctx.fillStyle = '#8B4513'; // 棕色
          ctx.fillRect(drawX, drawY, gridSize, gridSize);
          tilesFailed++;
        }
      } else {
        // 超出地圖範圍，使用預設顏色
        ctx.fillStyle = '#8B4513'; // 棕色
        ctx.fillRect(drawX, drawY, gridSize, gridSize);
      }
    }
  }
  
  // 每100幀輸出一次調試信息
  if (Math.random() < 0.01) { // 1% 機率輸出
    console.log(`地圖繪製: 成功${tilesDrawn}格, 失敗${tilesFailed}格, 總共${currentMapTiles.length}張圖片`);
  }
}

function drawGrid(offsetX, offsetY) {
  const gridSize = 100;
  ctx.strokeStyle = '#666666';
  ctx.lineWidth = 1;
  
  // 計算網格線的起始和結束位置
  const startX = Math.floor(offsetX / gridSize) * gridSize;
  const startY = Math.floor(offsetY / gridSize) * gridSize;
  const endX = startX + VIEW_WIDTH + gridSize;
  const endY = startY + VIEW_HEIGHT + gridSize;
  
  // 繪製垂直線
  for (let x = startX; x <= endX; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x - offsetX, 0);
    ctx.lineTo(x - offsetX, VIEW_HEIGHT);
    ctx.stroke();
  }
  
  // 繪製水平線
  for (let y = startY; y <= endY; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y - offsetY);
    ctx.lineTo(VIEW_WIDTH, y - offsetY);
    ctx.stroke();
  }
  
  // 繪製安全區域邊界（淡藍色）
  ctx.strokeStyle = 'rgba(0, 150, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    SAFE_ZONE_LEFT - offsetX,
    SAFE_ZONE_TOP - offsetY,
    SAFE_ZONE_SIZE,
    SAFE_ZONE_SIZE
  );
}

function drawSafeZoneOverlay(offsetX, offsetY) {
  // 檢查安全區域是否在可視範圍內
  const safeZoneScreenX = SAFE_ZONE_LEFT - offsetX;
  const safeZoneScreenY = SAFE_ZONE_TOP - offsetY;
  
  if (safeZoneScreenX + SAFE_ZONE_SIZE < 0 || safeZoneScreenX > VIEW_WIDTH ||
      safeZoneScreenY + SAFE_ZONE_SIZE < 0 || safeZoneScreenY > VIEW_HEIGHT) {
    return; // 安全區域不在可視範圍內，不繪製
  }
  
  // 計算安全區域在螢幕上的實際位置和大小
  const drawX = Math.max(0, safeZoneScreenX);
  const drawY = Math.max(0, safeZoneScreenY);
  const drawWidth = Math.min(SAFE_ZONE_SIZE, VIEW_WIDTH - drawX);
  const drawHeight = Math.min(SAFE_ZONE_SIZE, VIEW_HEIGHT - drawY);
  
  // 繪製半透明的安全區域圖層
  ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'; // 淡綠色，透明度0.1
  ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
  
  // 添加發光效果
  ctx.shadowColor = 'rgba(0, 255, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
  ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
  
  // 重置陰影效果
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

function gameLoop() {
  if (!gameLoopRunning) return;
  
  if (gameState === 'playing' && !gameOver && !gameWon) {
    updatePlayer();
    updateMonsters();
    updateProjectiles();
    updateMonsterProjectiles();
    updateAttackEffects();
    updateTimer();
    autoAttack();
    checkCollision();
    
    // 更新粒子效果
    particleSystem.update();
  }
  
  if (gameState === 'playing') {
    const { offsetX, offsetY } = getCameraOffset();
    clearScreen();
    drawMap(offsetX, offsetY);
    drawGrid(offsetX, offsetY);
    drawSafeZoneOverlay(offsetX, offsetY);
    drawExit(offsetX, offsetY);
    drawMonsters(offsetX, offsetY);
    drawPlayer(offsetX, offsetY);
    drawProjectiles(offsetX, offsetY);
    drawMonsterProjectiles(offsetX, offsetY);
    drawAttackEffects(offsetX, offsetY);
    
    // 繪製粒子效果
    particleSystem.draw(offsetX, offsetY);
    
    // 顯示遊戲說明和計時器
    drawGameInstructions();
    drawTimer();
    drawKillCount();
    drawPlayerHealth();
    drawLevelInfo();
    drawMapAndPlayerInfo();
    drawGameTitle();
    
    if (gameOver) {
      drawGameOver();
    } else if (gameWon) {
      drawVictory();
    }
  }
  
  if (gameLoopRunning) {
    requestAnimationFrame(gameLoop);
  }
}

// 載入關卡設定檔
async function loadLevelConfig() {
  try {
    console.log('開始載入 levelConfig.json...');
    const response = await fetch('levelConfig.json');
    console.log('Fetch 回應狀態:', response.status, response.statusText);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
    }
    
    const config = await response.json();
    console.log('成功解析 JSON:', config);
    
    // 設定最大關卡數
    MAX_LEVEL = config.maxLevel;
    
    // 設定關卡配置
    levelConfigs = config.levels;
    
    console.log('關卡設定載入成功:', config);
    console.log('最大關卡數:', MAX_LEVEL);
    console.log('關卡配置:', levelConfigs);
    return true;
  } catch (error) {
    console.error('載入關卡設定失敗:', error);
    console.error('錯誤詳情:', error.message);
    console.error('錯誤堆疊:', error.stack);
    
    // 如果載入失敗，使用預設設定
    MAX_LEVEL = 4;
    levelConfigs = {
      1: {
        name: "新手關卡.1",
        mapWidth: 1200,
        mapHeight: 600,
        normalAMonsters: 8,
        normalBMonsters: 5,
        normalCMonsters: 3,
        trackerAMonsters: 3,
        trackerBMonsters: 2,
        turretMonsters: 2,
        gameTime: 90000,
        description: "熟悉基本操作",
        mapTiles: [
          {
            "path": "assets/maps/map-level1-1.png",
            "weight": 10
          },
          {
            "path": "assets/maps/map-level1-2.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level1-3.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level1-4.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level1-5.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level1-6.png",
            "weight": 1
          }
        ]
      },
      2: {
        name: "進階關卡.2",
        mapWidth: 3200,
        mapHeight: 2400,
        normalAMonsters: 12,
        normalBMonsters: 8,
        normalCMonsters: 5,
        trackerAMonsters: 5,
        trackerBMonsters: 2,
        turretMonsters: 3,
        gameTime: 120000,
        description: "增加怪物數量",
        mapTiles: [
          {
            "path": "assets/maps/map-level2-1.png",
            "weight": 3
          },
          {
            "path": "assets/maps/map-level2-2.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level2-3.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level2-4.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level2-5.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level2-6.png",
            "weight": 1
          }
        ]
      },
      3: {
        name: "挑戰關卡.3",
        mapWidth: 4000,
        mapHeight: 3000,
        normalAMonsters: 18,
        normalBMonsters: 12,
        normalCMonsters: 8,
        trackerAMonsters: 7,
        trackerBMonsters: 3,
        turretMonsters: 4,
        gameTime: 150000,
        description: "更大的地圖",
        mapTiles: [
          {
            "path": "assets/maps/map-level3-1.png",
            "weight": 30
          },
          {
            "path": "assets/maps/map-level3-2.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level3-3.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level3-4.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level3-5.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level3-6.png",
            "weight": 1
          }
        ]
      },
      4: {
        name: "終極關卡.4",
        mapWidth: 4800,
        mapHeight: 3600,
        normalAMonsters: 20,
        normalBMonsters: 15,
        normalCMonsters: 12,
        trackerAMonsters: 8,
        trackerBMonsters: 5,
        turretMonsters: 5,
        gameTime: 180000,
        description: "最終挑戰",
        mapTiles: [
          {
            "path": "assets/maps/map-level4-1.png",
            "weight": 3
          },
          {
            "path": "assets/maps/map-level4-2.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level4-3.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level4-4.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level4-5.png",
            "weight": 1
          },
          {
            "path": "assets/maps/map-level4-6.png",
            "weight": 1
          }
        ]
      }
    };
    return false;
  }
}

// 遊戲大廳管理函數
async function initLobby() {
  await loadLevelConfig();
  loadLevel();
  updateLobbyDisplay();
  showLobby();
}

function showLobby() {
  document.getElementById('gameLobby').classList.remove('hidden');
  document.getElementById('gameContainer').classList.add('hidden');
  gameState = 'lobby';
}

function hideLobby() {
  document.getElementById('gameLobby').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  
  // 調整Canvas尺寸
  setTimeout(() => {
    resizeCanvas();
  }, 100); // 稍微延遲，確保容器已經顯示
  
  gameState = 'playing';
}

function updateLobbyDisplay() {
  const progressInfo = document.getElementById('progressInfo');
  const levelGrid = document.getElementById('levelGrid');
  
  // 更新進度信息
  if (completedLevels.length === MAX_LEVEL) {
    progressInfo.textContent = '進度：完全通關';
  } else {
    progressInfo.textContent = `進度：第 ${highestUnlockedLevel} 關`;
  }
  
  // 清空關卡網格
  levelGrid.innerHTML = '';
  
  // 生成關卡按鈕
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const button = document.createElement('button');
    button.className = 'level-button';
    button.textContent = `第 ${level} 關`;
    
    // 設置按鈕狀態
    if (completedLevels.includes(level)) {
      button.classList.add('completed');
      button.innerHTML = `第 ${level} 關<br><span class="level-info">已完成</span>`;
    } else if (level <= highestUnlockedLevel) {
      button.classList.add('unlocked');
      button.innerHTML = `第 ${level} 關<br><span class="level-info">${levelConfigs[level].name}</span>`;
    } else {
      button.classList.add('locked');
      button.innerHTML = `第 ${level} 關<br><span class="level-info">未解鎖</span>`;
    }
    
    // 添加點擊事件
    button.onclick = () => {
      if (level <= highestUnlockedLevel) {
        audioSystem.playButtonClick();
        startLevel(level);
      }
    };
    
    levelGrid.appendChild(button);
  }
}

function startLevel(level) {
  currentLevel = level;
  loadLevel();
  restartGame();
  hideLobby();
  
  // 確保只有一個遊戲循環在運行
  if (!gameLoopRunning) {
    gameLoopRunning = true;
    gameLoop();
  }
}

function resetProgress() {
  // 確認對話框
  if (confirm('確定要重置所有通關進度嗎？此操作無法復原。')) {
    // 重置進度變數
    highestUnlockedLevel = 1;
    completedLevels = [];
    
    // 清除Cookie
    setCookie('highestUnlockedLevel', 1, 365);
    setCookie('completedLevels', JSON.stringify([]), 365);
    
    // 播放按鈕音效
    audioSystem.playButtonClick();
    
    // 更新大廳顯示
    updateLobbyDisplay();
    
    console.log('進度已重置');
  }
}

function returnToLobby() {
  showLobby();
  updateLobbyDisplay();
  
  // 停止背景音樂
  audioSystem.stopBGM();
  
  // 停止遊戲循環
  gameLoopRunning = false;
}

// 初始化遊戲
async function initGame() {
  // 初始化音效系統
  audioSystem.init();
  
  await initLobby();
  
  // 添加重置進度按鈕事件監聽器
  const resetButton = document.getElementById('resetProgressBtn');
  if (resetButton) {
    resetButton.addEventListener('click', resetProgress);
  }
  
  // 啟動遊戲循環（但只在需要時執行遊戲邏輯）
  gameLoopRunning = true;
  gameLoop();
}

// 開始初始化
initGame();

// 頁面離開時停止背景音樂
window.addEventListener('beforeunload', () => {
  audioSystem.stopBGM();
});

// 頁面隱藏時停止背景音樂
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audioSystem.stopBGM();
  }
});

// 添加測試函數到全域範圍
window.testCookie = function() {
  console.log('=== Cookie 測試 ===');
  console.log('當前所有Cookie:', document.cookie);
  console.log('測試設定Cookie...');
  setCookie('testCookie', 'testValue', 1);
  console.log('測試讀取Cookie...');
  const testValue = getCookie('testCookie');
  console.log('讀取結果:', testValue);
  console.log('測試完成');
};

window.forceSaveLevel = function(level) {
  console.log(`強制保存關卡: ${level}`);
  setCookie('gameLevel', level, 365);
  console.log('保存完成，請重新載入頁面測試');
};

window.checkCurrentLevel = function() {
  console.log(`當前關卡: ${currentLevel}`);
  console.log(`保存的關卡: ${getCookie('gameLevel')}`);
};

// 添加Canvas尺寸調試函數
window.debugCanvasSize = function() {
  console.log('=== Canvas 尺寸調試 ===');
  console.log(`當前Canvas尺寸: ${canvas.width}x${canvas.height}`);
  console.log(`當前視窗大小: ${VIEW_WIDTH}x${VIEW_HEIGHT}`);
  console.log(`當前地圖大小: ${MAP_WIDTH}x${MAP_HEIGHT}`);
  
  const container = document.getElementById('gameContainer');
  const containerRect = container.getBoundingClientRect();
  console.log(`容器尺寸: ${containerRect.width}x${containerRect.height}`);
  
  const { width, height, scale } = calculateCanvasSize();
  console.log(`建議尺寸: ${width}x${height}, 縮放比例: ${scale.toFixed(2)}`);
  
  console.log(`遊戲狀態: ${gameState}`);
  console.log(`遊戲循環運行: ${gameLoopRunning}`);
  
  // 顯示玩家和怪物位置信息
  if (gameState === 'playing') {
    console.log(`玩家位置: (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
    console.log(`出口位置: (${exit.x.toFixed(1)}, ${exit.y.toFixed(1)})`);
    console.log(`玩家血量: ${player.hp}/${player.maxHp}`);
    console.log(`擊殺數: ${killCount}`);
    console.log(`剩餘時間: ${Math.ceil(remainingTime / 1000)}秒`);
    console.log(`怪物數量: ${monsters.length}`);
    console.log(`彈幕數量: ${projectiles.length}`);
  }
};

// 添加地圖圖片調試函數
window.debugMapImages = function() {
  console.log('=== 地圖圖片調試 ===');
  console.log(`當前關卡: ${currentLevel}`);
  
  const config = levelConfigs[currentLevel];
  if (config) {
    console.log('關卡配置:', config);
    console.log(`地圖圖片數量: ${config.mapTiles ? config.mapTiles.length : 0}`);
  } else {
    console.log('錯誤: 沒有找到關卡配置');
  }
  
  console.log(`當前地圖圖片陣列長度: ${currentMapTiles.length}`);
  console.log('地圖圖片狀態:');
  currentMapTiles.forEach((img, index) => {
    console.log(`圖片${index}: complete=${img.complete}, src=${img.src}`);
  });
  
  console.log('所有已載入的圖片:');
  Object.keys(mapImages).forEach(path => {
    const img = mapImages[path];
    console.log(`${path}: complete=${img.complete}`);
  });
};

// 強制調整Canvas尺寸
window.forceResizeCanvas = function() {
  console.log('強制調整Canvas尺寸...');
  resizeCanvas();
};

// 顯示出口位置信息
window.showExitInfo = function() {
  console.log('=== 出口位置信息 ===');
  console.log(`出口位置: (${exit.x.toFixed(1)}, ${exit.y.toFixed(1)})`);
  console.log(`出口尺寸: ${exit.width}x${exit.height}`);
  console.log(`地圖大小: ${MAP_WIDTH}x${MAP_HEIGHT}`);
  console.log(`地圖中心: (${MAP_WIDTH/2}, ${MAP_HEIGHT/2})`);
  console.log(`玩家位置: (${player.x.toFixed(1)}, ${player.y.toFixed(1)})`);
  
  const distanceToExit = distance(player.x + player.width/2, player.y + player.height/2, 
                                 exit.x + exit.width/2, exit.y + exit.height/2);
  console.log(`玩家到出口距離: ${distanceToExit.toFixed(1)}像素`);
};

// 顯示地圖權重統計信息
window.showMapWeightStats = function() {
  console.log('=== 地圖權重統計 ===');
  console.log(`當前關卡: ${currentLevel}`);
  console.log('地圖圖片權重配置:');
  currentMapWeights.forEach((weight, index) => {
    console.log(`圖片${index + 1}: 權重 ${weight}`);
  });
  
  const totalWeight = currentMapWeights.reduce((sum, weight) => sum + weight, 0);
  console.log(`總權重: ${totalWeight}`);
  
  // 統計地圖佈局中各種圖片的出現次數
  const tileCounts = {};
  for (let row = 0; row < mapTileLayout.length; row++) {
    for (let col = 0; col < mapTileLayout[row].length; col++) {
      const tileIndex = mapTileLayout[row][col];
      tileCounts[tileIndex] = (tileCounts[tileIndex] || 0) + 1;
    }
  }
  
  console.log('地圖佈局統計:');
  Object.keys(tileCounts).forEach(index => {
    const count = tileCounts[index];
    const percentage = ((count / (mapTileLayout.length * mapTileLayout[0].length)) * 100).toFixed(1);
    console.log(`圖片${parseInt(index) + 1}: 出現 ${count} 次 (${percentage}%)`);
  });
}; 