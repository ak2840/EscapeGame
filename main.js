const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 音效系統
const audioSystem = {
  bgmEnabled: true, // 預設開啟背景音樂
  sfxEnabled: true, // 預設開啟音效
  bgmVolume: 0.5, // 背景音樂音量 50%
  sfxVolume: 0.5, // 音效音量 50%
  gameMusic: null, // 遊戲背景音樂
  attackSound: null,
  hitSound: null,
  victorySound: null,
  gameOverSound: null,
  buttonClickSound: null,
  
  init() {
    this.gameMusic = document.getElementById('gameMusic');
    this.attackSound = document.getElementById('attackSound');
    this.hitSound = document.getElementById('hitSound');
    this.victorySound = document.getElementById('victorySound');
    this.gameOverSound = document.getElementById('gameOverSound');
    this.buttonClickSound = document.getElementById('buttonClickSound');
    
    // 從 cookie 讀取音效設定
    this.loadAudioSettings();
    
    // 設定音量
    this.setVolume();
    
    // 初始化音效狀態（不再需要HTML按鈕，因為使用遊戲內按鈕）
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
    
    // 從 cookie 讀取音量設定
    const savedBGMVolume = getCookie('bgmVolume');
    if (savedBGMVolume !== null) {
      this.bgmVolume = parseFloat(savedBGMVolume);
      console.log(`從 cookie 讀取背景音樂音量: ${this.bgmVolume}`);
    }
    
    const savedSFXVolume = getCookie('sfxVolume');
    if (savedSFXVolume !== null) {
      this.sfxVolume = parseFloat(savedSFXVolume);
      console.log(`從 cookie 讀取音效音量: ${this.sfxVolume}`);
    }
  },
  
  saveAudioSettings() {
    // 儲存背景音樂設定到 cookie
    setCookie('bgmEnabled', this.bgmEnabled.toString(), 365);
    console.log(`儲存背景音樂設定到 cookie: ${this.bgmEnabled}`);
    
    // 儲存音效設定到 cookie
    setCookie('sfxEnabled', this.sfxEnabled.toString(), 365);
    console.log(`儲存音效設定到 cookie: ${this.sfxEnabled}`);
    
    // 儲存音量設定到 cookie
    setCookie('bgmVolume', this.bgmVolume.toString(), 365);
    setCookie('sfxVolume', this.sfxVolume.toString(), 365);
    console.log(`儲存音量設定到 cookie: BGM=${this.bgmVolume}, SFX=${this.sfxVolume}`);
  },
  
  toggleBGM() {
    this.bgmEnabled = !this.bgmEnabled;
    // 先暫停遊戲音樂
    this.stopGameMusic();
    // 如果開啟且目前在遊戲中，播放遊戲音樂
    if (this.bgmEnabled && gameState === 'playing') {
      this.playGameMusic();
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
    // 不再需要更新HTML按鈕狀態，因為使用遊戲內按鈕
    // 遊戲內按鈕會根據 audioSystem.bgmEnabled 和 audioSystem.sfxEnabled 自動更新
  },
  
  setVolume() {
    // 設定背景音樂音量
    if (this.gameMusic) {
      this.gameMusic.volume = this.bgmVolume;
    }
    
    // 設定所有音效音量
    const soundEffects = [this.attackSound, this.hitSound, this.victorySound, this.gameOverSound, this.buttonClickSound];
    soundEffects.forEach(sound => {
      if (sound) {
        sound.volume = this.sfxVolume;
      }
    });
    
    console.log(`音量已設定: BGM=${this.bgmVolume}, SFX=${this.sfxVolume}`);
  },
  

  
  playGameMusic() {
    if (this.bgmEnabled && this.gameMusic) {
      this.gameMusic.volume = this.bgmVolume;
      this.gameMusic.play().catch(e => console.log('遊戲背景音樂播放失敗:', e));
    }
  },
  

  
  stopGameMusic() {
    if (this.gameMusic) {
      this.gameMusic.pause();
      this.gameMusic.currentTime = 0;
    }
  },
  
  stopAllMusic() {
    this.stopGameMusic();
  },
  
  playSFX(sound) {
    if (this.sfxEnabled && sound) {
      sound.volume = this.sfxVolume;
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
  },
  
  setBGMVolume(volume) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.gameMusic) {
      this.gameMusic.volume = this.bgmVolume;
    }
    this.saveAudioSettings();
    console.log(`背景音樂音量已設定為: ${this.bgmVolume}`);
  },
  
  setSFXVolume(volume) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.setVolume();
    this.saveAudioSettings();
    console.log(`音效音量已設定為: ${this.sfxVolume}`);
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

// 載入UI圖標
const uiImages = {
  volumeOn: new Image(),
  volumeOff: new Image(),
  soundOn: new Image(),
  soundOff: new Image()
};

uiImages.volumeOn.src = 'assets/ui/volume-on.svg';
uiImages.volumeOff.src = 'assets/ui/volume-off.svg';
uiImages.soundOn.src = 'assets/ui/sound-on.svg';
uiImages.soundOff.src = 'assets/ui/sound-off.svg';

// 載入出口圖片
const exitImages = {
  level1: new Image(),
  level2: new Image(),
  level3: new Image(),
  level4: new Image()
};

// 從配置文件中載入出口圖片路徑
exitImages.level1.src = GAME_CONFIG.exitImages.level1;
exitImages.level2.src = GAME_CONFIG.exitImages.level2;
exitImages.level3.src = GAME_CONFIG.exitImages.level3;
exitImages.level4.src = GAME_CONFIG.exitImages.level4;

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
  const config = GAME_CONFIG.levels[currentLevel];
  
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
  
  // 為每個網格位置分配隨機的圖片索引
  for (let row = 0; row < gridRows; row++) {
    mapTileLayout[row] = [];
    for (let col = 0; col < gridCols; col++) {
      // 使用時間戳和位置來生成隨機種子，確保每次都有不同的地圖佈局
      const timeSeed = Date.now() % 1000000; // 使用時間戳的後6位
      const seed = (row * 73856093) ^ (col * 19349663) ^ (currentLevel * 83492791) ^ timeSeed;
      const tileIndex = selectWeightedTileIndex(seed);
      mapTileLayout[row][col] = tileIndex;
    }
  }
  
  console.log('地圖佈局生成完成');
}

// 遊戲狀態管理
let gameState = 'lobby'; // 'lobby', 'playing', 'gameOver', 'victory', 'storyIntro', 'storyOutro'
let currentLevel = 1;
let MAX_LEVEL = GAME_CONFIG.maxLevel; // 將從設定檔讀取
let highestCompletedLevel = 0; // 已通關的最高關卡 (0-4)
let gameLoopRunning = false; // 控制遊戲循環是否正在運行

// 劇情系統
const storySystem = {
  introImages: {}, // 關卡開始前的劇情圖片
  outroImages: {}, // 關卡結束後的劇情圖片
  currentImage: null, // 當前顯示的劇情圖片
  imageLoaded: false, // 圖片是否已載入
  
  // 載入劇情圖片
  async loadStoryImages() {
    console.log('開始載入劇情圖片...');
    console.log('MAX_LEVEL:', MAX_LEVEL);
    
    if (!MAX_LEVEL || MAX_LEVEL <= 0) {
      console.error('MAX_LEVEL 未正確設定，使用預設值 4');
      MAX_LEVEL = 4;
    }
    
    // 載入關卡開始劇情圖片
    for (let level = 1; level <= MAX_LEVEL; level++) {
      try {
        const introImg = new Image();
        introImg.src = `assets/story/story_${level}_before.jpg`;
        await new Promise((resolve, reject) => {
          introImg.onload = resolve;
          introImg.onerror = () => {
            console.warn(`關卡${level}開始劇情圖片載入失敗，使用預設圖片`);
            reject();
          };
        });
        this.introImages[level] = introImg;
        console.log(`關卡${level}開始劇情圖片載入成功`);
      } catch (error) {
        // 如果載入失敗，創建一個預設的劇情圖片
        this.introImages[level] = this.createDefaultIntroImage(level);
        console.log(`關卡${level}使用預設開始劇情圖片`);
      }
    }
    
    // 載入關卡結束劇情圖片
    for (let level = 1; level <= MAX_LEVEL; level++) {
      try {
        const outroImg = new Image();
        outroImg.src = `assets/story/story_${level}_after.jpg`;
        await new Promise((resolve, reject) => {
          outroImg.onload = resolve;
          outroImg.onerror = () => {
            console.warn(`關卡${level}結束劇情圖片載入失敗，使用預設圖片`);
            reject();
          };
        });
        this.outroImages[level] = outroImg;
        console.log(`關卡${level}結束劇情圖片載入成功`);
      } catch (error) {
        // 如果載入失敗，創建一個預設的劇情圖片
        this.outroImages[level] = this.createDefaultOutroImage(level);
        console.log(`關卡${level}使用預設結束劇情圖片`);
      }
    }
    
    console.log('劇情圖片載入完成');
  },
  
  // 創建預設的關卡開始劇情圖片
  createDefaultIntroImage(level) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // 背景漸層
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // 裝飾性邊框
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 700, 500);
    
    // 標題
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${level}關`, 400, 180);
    
    // 副標題
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '28px Arial';
    ctx.fillText(GAME_CONFIG.gameInfo.storyText.prepareAdventure, 400, 240);
    
    // 關卡描述
    const levelConfig = GAME_CONFIG.levels[level];
    if (levelConfig && levelConfig.description) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '20px Arial';
      ctx.fillText(levelConfig.description, 400, 280);
    } else {
      // 預設描述
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '20px Arial';
      ctx.fillText(GAME_CONFIG.gameInfo.storyText.prepareNewChallenge, 400, 280);
    }
    
    // 提示文字背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 520, 800, 80);
    
    // 提示文字
    ctx.fillStyle = '#FFD700';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('按任意鍵繼續', 400, 560);
    
    // 轉換為圖片
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  },
  
  // 創建預設的關卡結束劇情圖片
  createDefaultOutroImage(level) {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext('2d');
    
    // 背景漸層
    const gradient = ctx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#0f3460');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // 裝飾性邊框
    ctx.strokeStyle = '#00FF00';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 50, 700, 500);
    
    // 標題
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 56px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${level}關完成！`, 400, 180);
    
    // 副標題
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '28px Arial';
    ctx.fillText('恭喜通過關卡！', 400, 240);
    
    // 統計信息
    ctx.fillStyle = '#CCCCCC';
    ctx.font = '20px Arial';
    ctx.fillText(`${GAME_CONFIG.gameInfo.uiText.killCount}: ${gameStats.currentGame.killCount}`, 400, 280);
    ctx.fillText(`完成時間: ${Math.ceil(gameStats.currentGame.completionTime / 1000)}秒`, 400, 310);
    
    // 提示文字背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 520, 800, 80);
    
    // 提示文字
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('按任意鍵繼續', 400, 560);
    
    // 轉換為圖片
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  },
  
  // 顯示關卡開始劇情
  showIntro(level) {
    this.currentImage = this.introImages[level];
    this.imageLoaded = true;
    gameState = 'storyIntro';
    // 立即重新調整Canvas大小以適應視窗
    resizeCanvas();
    // 延遲再次調整以確保完全適應
    setTimeout(() => {
      resizeCanvas();
    }, 100);
    console.log(`顯示第${level}關開始劇情`);
  },
  
  // 顯示關卡結束劇情
  showOutro(level) {
    this.currentImage = this.outroImages[level];
    this.imageLoaded = true;
    gameState = 'storyOutro';
    // 立即重新調整Canvas大小以適應視窗
    resizeCanvas();
    // 延遲再次調整以確保完全適應
    setTimeout(() => {
      resizeCanvas();
    }, 100);
    console.log(`顯示第${level}關結束劇情`);
  },
  
  // 繪製劇情圖片
  draw(ctx) {
    if (!this.currentImage || !this.imageLoaded) return;
    
    // 清空畫布
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // 計算圖片縮放和位置
    const imgAspect = this.currentImage.width / this.currentImage.height;
    const canvasAspect = ctx.canvas.width / ctx.canvas.height;
    
    let drawWidth, drawHeight, drawX, drawY;
    
    if (imgAspect > canvasAspect) {
      // 圖片較寬，以寬度為準
      drawWidth = ctx.canvas.width;
      drawHeight = ctx.canvas.width / imgAspect;
      drawX = 0;
      drawY = (ctx.canvas.height - drawHeight) / 2;
    } else {
      // 圖片較高，以高度為準
      drawHeight = ctx.canvas.height;
      drawWidth = ctx.canvas.height * imgAspect;
      drawX = (ctx.canvas.width - drawWidth) / 2;
      drawY = 0;
    }
    
    // 繪製圖片
    ctx.drawImage(this.currentImage, drawX, drawY, drawWidth, drawHeight);
  }
};

// 關於系統
const aboutSystem = {
  storyImages: {}, // 劇情圖片
  imageLoaded: false, // 圖片是否已載入
  
  // 載入劇情圖片
  async loadStoryImages() {
    console.log('開始載入關於頁面的劇情圖片...');
    
    if (!MAX_LEVEL || MAX_LEVEL <= 0) {
      console.error('MAX_LEVEL 未正確設定，使用預設值 4');
      MAX_LEVEL = 4;
    }
    
    // 載入關卡劇情圖片（每個關卡有開始和結束兩張圖片）
    for (let level = 1; level <= MAX_LEVEL; level++) {
      // 載入關卡開始圖片
      try {
        const introImg = new Image();
        introImg.src = `assets/story/story_${level}_before.jpg`;
        await new Promise((resolve, reject) => {
          introImg.onload = resolve;
          introImg.onerror = () => {
            console.warn(`關卡${level}開始劇情圖片載入失敗，使用預設圖片`);
            reject();
          };
        });
        this.storyImages[`${level}_before`] = introImg;
        console.log(`關卡${level}開始劇情圖片載入成功`);
      } catch (error) {
        // 如果載入失敗，創建一個預設的劇情圖片
        this.storyImages[`${level}_before`] = this.createDefaultStoryImage(level, 'before');
        console.log(`關卡${level}使用預設開始劇情圖片`);
      }
      
      // 載入關卡結束圖片
      try {
        const outroImg = new Image();
        outroImg.src = `assets/story/story_${level}_after.jpg`;
        await new Promise((resolve, reject) => {
          outroImg.onload = resolve;
          outroImg.onerror = () => {
            console.warn(`關卡${level}結束劇情圖片載入失敗，使用預設圖片`);
            reject();
          };
        });
        this.storyImages[`${level}_after`] = outroImg;
        console.log(`關卡${level}結束劇情圖片載入成功`);
      } catch (error) {
        // 如果載入失敗，創建一個預設的劇情圖片
        this.storyImages[`${level}_after`] = this.createDefaultStoryImage(level, 'after');
        console.log(`關卡${level}使用預設結束劇情圖片`);
      }
    }
    
    console.log('關於頁面劇情圖片載入完成');
  },
  
  // 創建預設的劇情圖片
  createDefaultStoryImage(level, type = 'before') {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // 背景漸層
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    if (type === 'before') {
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
    } else {
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#0f3460');
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 300, 200);
    
    // 裝飾性邊框
    ctx.strokeStyle = type === 'before' ? '#FFD700' : '#00FF00';
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, 280, 180);
    
    // 標題
    ctx.fillStyle = type === 'before' ? '#FFD700' : '#00FF00';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`第${level}關${type === 'before' ? '' : '完成'}`, 150, 80);
    
    // 副標題
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText(type === 'before' ? '開始劇情' : '結束劇情', 150, 110);
    
    // 關卡描述
    const levelConfig = GAME_CONFIG.levels[level];
    if (levelConfig && levelConfig.description) {
      ctx.fillStyle = '#CCCCCC';
      ctx.font = '14px Arial';
      ctx.fillText(levelConfig.description, 150, 140);
    }
    
    // 轉換為圖片
    const img = new Image();
    img.src = canvas.toDataURL();
    return img;
  },
  
  // 顯示關於頁面
  showAboutPage() {
    const aboutPage = document.getElementById('aboutPage');
    if (aboutPage) {
      aboutPage.classList.remove('hidden');
      this.updateGallery();
    }
  },
  
  // 隱藏關於頁面
  hideAboutPage() {
    const aboutPage = document.getElementById('aboutPage');
    if (aboutPage) {
      aboutPage.classList.add('hidden');
    }
  },
  
  // 更新美術圖列表
  updateGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    if (!galleryGrid) return;
    
    galleryGrid.innerHTML = '';
    
    // 顯示八張美術圖（每個關卡的開始和結束圖片）
    for (let level = 1; level <= MAX_LEVEL; level++) {
      const isUnlocked = level <= highestCompletedLevel;
      const levelConfig = GAME_CONFIG.levels[level];
      const levelName = levelConfig && levelConfig.name ? levelConfig.name : `第${level}關`;
      
      // 開始劇情圖片
      const beforeItem = this.createGalleryItem(level, 'before', isUnlocked, levelName, levelConfig);
      galleryGrid.appendChild(beforeItem);
      
      // 結束劇情圖片
      const afterItem = this.createGalleryItem(level, 'after', isUnlocked, levelName, levelConfig);
      galleryGrid.appendChild(afterItem);
    }
  },
  
  // 創建美術圖項目
  createGalleryItem(level, type, isUnlocked, levelName, levelConfig) {
    const galleryItem = document.createElement('div');
    galleryItem.className = `gallery-item ${isUnlocked ? '' : 'locked'}`;
    
    const image = document.createElement('img');
    image.className = 'gallery-image';
    image.alt = `${levelName} ${type === 'before' ? '開始' : '結束'}劇情`;
    
    if (isUnlocked && this.storyImages[`${level}_${type}`]) {
      image.src = this.storyImages[`${level}_${type}`].src;
    } else {
      // 未解鎖或圖片未載入時顯示問號
      image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzMzMyIvPjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iNDgiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj7vv6M8L3RleHQ+PC9zdmc+';
    }
    
    if (!isUnlocked) {
      const lockIcon = document.createElement('div');
      lockIcon.className = 'lock-icon';
      lockIcon.innerHTML = '🔒';
      galleryItem.appendChild(lockIcon);
    }
    
    galleryItem.appendChild(image);
    
    // 添加點擊事件來顯示滿版大圖
    if (isUnlocked) {
      galleryItem.addEventListener('click', () => {
        this.showFullscreenImage(image.src, `${levelName} ${type === 'before' ? '開始' : '結束'}劇情`);
      });
    }
    
    return galleryItem;
  },
  
  // 顯示滿版大圖
  showFullscreenImage(imageSrc, title) {
    const fullscreenImage = document.getElementById('fullscreenImage');
    const fullscreenImageSrc = document.getElementById('fullscreenImageSrc');
    
    if (fullscreenImage && fullscreenImageSrc) {
      fullscreenImageSrc.src = imageSrc;
      fullscreenImageSrc.alt = title;
      fullscreenImage.classList.remove('hidden');
    }
  },
  
  // 隱藏滿版大圖
  hideFullscreenImage() {
    const fullscreenImage = document.getElementById('fullscreenImage');
    if (fullscreenImage) {
      fullscreenImage.classList.add('hidden');
    }
  }
};

// 關卡設定（使用內建配置）
const levelConfigs = GAME_CONFIG.levels;
const monsterSettings = GAME_CONFIG.monsterSettings;
const defaultSettings = GAME_CONFIG.defaultSettings;
const itemSettings = GAME_CONFIG.itemSettings;

// 道具系統變數
let items = [];
let itemImages = {};
let itemCounts = {
  mapItemA: 0,
  mapItemB: 0,
  monsterItemA: 0,
  monsterItemB: 0
};
let totalItemsCollected = 0;


// 地圖與視窗設定
let VIEW_WIDTH = canvas.width;
let VIEW_HEIGHT = canvas.height;
let MAP_WIDTH = VIEW_WIDTH * 3; // 預設值，會在loadLevel()中更新
let MAP_HEIGHT = VIEW_HEIGHT * 3; // 預設值，會在loadLevel()中更新

// 玩家設定
const player = {
  x: MAP_WIDTH / 2,
  y: MAP_HEIGHT / 2,
  width: 90,
  height: 90,
  speed: 4, // 基礎速度，會在loadLevel()中更新
  baseSpeed: 4, // 新增：基礎速度，不受縮放影響
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
  hp: 10, // 玩家血量，會在loadLevel()中更新
  maxHp: 10, // 最大血量，會在loadLevel()中更新
  isInvulnerable: false, // 無敵狀態
  invulnerableTime: 0, // 無敵時間
  invulnerableDuration: 1000, // 無敵持續時間（1秒），會在loadLevel()中更新
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
    // 在遊戲狀態、劇情模式或大廳狀態下都重新調整Canvas大小
    if (gameState === 'playing' || gameState === 'storyIntro' || gameState === 'storyOutro' || gameState === 'lobby') {
      resizeCanvas();
    }
  }, 150); // 150ms 延遲
}

// 視窗大小改變事件
window.addEventListener('resize', debounceResize);

// 視窗大小改變時更新手機操作按鈕顯示狀態
window.addEventListener('resize', () => {
  const mobileControls = document.getElementById('mobileControls');
  const actionButtons = document.querySelector('.action-buttons');
  if (mobileControls && actionButtons) {
    // 多重檢查是否為手機設備
    const isMobile = (
      window.innerWidth <= 768 || 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0)
    );
    
    if (isMobile) {
      mobileControls.style.display = 'flex';
      actionButtons.style.display = 'flex';
      console.log('手機操作按鈕已顯示 - 視窗大小改變');
    } else {
      mobileControls.style.display = 'none';
      actionButtons.style.display = 'none';
      console.log('手機操作按鈕已隱藏 - 視窗大小改變');
    }
  }
});

// 鍵盤事件
window.addEventListener('keydown', (e) => {
  // 檢查是否有元素被focus，如果有且不是canvas，則不處理遊戲按鍵
  const activeElement = document.activeElement;
  if (activeElement && activeElement.tagName !== 'CANVAS' && activeElement.id !== 'gameCanvas') {
    // 如果有其他元素被focus，不處理遊戲按鍵
    return;
  }
  
  if (e.code in keys) {
    keys[e.code] = true;
    if (e.code === 'Escape') {
      // ESC鍵處理
      if (gameState === 'playing') {
        // 遊戲中按ESC返回大廳
        returnToLobby();
      } else {
        // 檢查是否在滿版大圖模式
        const fullscreenImage = document.getElementById('fullscreenImage');
        if (fullscreenImage && !fullscreenImage.classList.contains('hidden')) {
          aboutSystem.hideFullscreenImage();
          audioSystem.playButtonClick();
        } else {
          // 其他狀態下關閉關於頁面
          const aboutPage = document.getElementById('aboutPage');
          if (aboutPage && !aboutPage.classList.contains('hidden')) {
            aboutSystem.hideAboutPage();
            audioSystem.playButtonClick();
          }
        }
      }
    } else if (e.code === 'Space') {
      // 正常遊戲狀態下的空白鍵動作
      if (gameState === 'playing' && !gameOver && !gameWon) {
        if (!player.isActioning) {
          console.log('哈囉！');
          player.isActioning = true;
          player.actionStartTime = Date.now();
          player.actionAnimationTime = Date.now();
          player.actionAnimationFrame = 1;
        }
      }
    }
    
    // 處理劇情狀態下的任意鍵
    if (gameState === 'storyIntro') {
      // 關卡開始劇情結束，開始遊戲
      gameState = 'playing';
      restartGame();
      console.log('關卡開始劇情結束，開始遊戲');
    } else if (gameState === 'storyOutro') {
      // 關卡結束劇情結束，進入下一關或返回大廳
      const completedLevel = currentLevel;
      if (completedLevel < MAX_LEVEL) {
        // 還有下一關，進入下一關
        console.log(`進入第${completedLevel + 1}關`);
        currentLevel = completedLevel + 1;
        
        // 更新關卡配置並顯示下一關劇情
        updateLevelConfig().then(() => {
          storySystem.showIntro(currentLevel);
        }).catch(error => {
          console.error('更新關卡配置失敗:', error);
          // 即使失敗也要顯示劇情
          storySystem.showIntro(currentLevel);
        });
      } else {
        // 最後一關通關，回到大廳
        gameWon = true;
        returnToLobby();
      }
    }
    

  }
});

// 滑鼠點擊事件處理遊戲內按鈕
canvas.addEventListener('click', (e) => {
  if (gameState !== 'playing') return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // 計算按鈕位置
  const buttonSize = 35;
  const buttonSpacing = 10;
  const startX = VIEW_WIDTH - buttonSize - 15;
  const startY = 15;
  
  // 背景音樂按鈕
  const bgmX = startX - buttonSize - buttonSpacing;
  const bgmY = startY;
  
  // 音效按鈕
  const sfxX = startX;
  const sfxY = startY;
  
  // 檢查點擊背景音樂按鈕
  if (x >= bgmX && x <= bgmX + buttonSize && y >= bgmY && y <= bgmY + buttonSize) {
    audioSystem.toggleBGM();
    audioSystem.playButtonClick();
    return;
  }
  
  // 檢查點擊音效按鈕
  if (x >= sfxX && x <= sfxX + buttonSize && y >= sfxY && y <= sfxY + buttonSize) {
    audioSystem.toggleSFX();
    audioSystem.playButtonClick();
    return;
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
        
        // 顯示關卡結束劇情
        storySystem.showOutro(completedLevel);
        
        console.log(`恭喜通過第${completedLevel}關！`);
      } else if (isPlayerNearExit()) {
        // 玩家在出口附近但條件未滿足，顯示提示
        showExitConditionHint();
      }
    }
  }
});

// 手機操作按鈕事件處理
function initMobileControls() {
  // 方向鍵按鈕
  const directionButtons = document.querySelectorAll('.direction-btn');
  
  directionButtons.forEach(button => {
    const direction = button.getAttribute('data-direction');
    
    // 按下事件
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDirectionPress(direction);
      button.classList.add('active');
    });
    
    button.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDirectionPress(direction);
      button.classList.add('active');
    });
    
    // 放開事件
    button.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDirectionRelease(direction);
      button.classList.remove('active');
    });
    
    button.addEventListener('mouseup', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDirectionRelease(direction);
      button.classList.remove('active');
    });
    
    // 離開事件（防止按鈕卡住）
    button.addEventListener('touchcancel', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDirectionRelease(direction);
      button.classList.remove('active');
    });
    
    button.addEventListener('mouseleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleDirectionRelease(direction);
      button.classList.remove('active');
    });
  });
  
  // 動作按鈕
  const actionBtn = document.getElementById('actionBtn');
  const escapeBtn = document.getElementById('escapeBtn');
  const debugBtn = document.getElementById('debugBtn');
  
  // 動作按鈕事件
  actionBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleActionPress();
    actionBtn.classList.add('active');
  });
  
  actionBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleActionPress();
    actionBtn.classList.add('active');
  });
  
  actionBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleActionRelease();
    actionBtn.classList.remove('active');
  });
  
  actionBtn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleActionRelease();
    actionBtn.classList.remove('active');
  });
  
  // ESC按鈕事件
  escapeBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleEscapePress();
    escapeBtn.classList.add('active');
  });
  
  escapeBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleEscapePress();
    escapeBtn.classList.add('active');
  });
  
  escapeBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    escapeBtn.classList.remove('active');
  });
  
  escapeBtn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    e.stopPropagation();
    escapeBtn.classList.remove('active');
  });
  
  // Debug按鈕事件
  debugBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeDebugFunction();
    debugBtn.classList.add('active');
  });
  
  debugBtn.addEventListener('mousedown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    executeDebugFunction();
    debugBtn.classList.add('active');
  });
  
  debugBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    debugBtn.classList.remove('active');
  });
  
  debugBtn.addEventListener('mouseup', (e) => {
    e.preventDefault();
    e.stopPropagation();
    debugBtn.classList.remove('active');
  });
}

// 處理方向鍵按下
function handleDirectionPress(direction) {
  switch(direction) {
    case 'up':
      keys.ArrowUp = true;
      break;
    case 'down':
      keys.ArrowDown = true;
      break;
    case 'left':
      keys.ArrowLeft = true;
      break;
    case 'right':
      keys.ArrowRight = true;
      break;
  }
}

// 處理方向鍵放開
function handleDirectionRelease(direction) {
  switch(direction) {
    case 'up':
      keys.ArrowUp = false;
      break;
    case 'down':
      keys.ArrowDown = false;
      break;
    case 'left':
      keys.ArrowLeft = false;
      break;
    case 'right':
      keys.ArrowRight = false;
      break;
  }
}

// 處理動作按鈕按下
function handleActionPress() {
  keys.Space = true;
  
  // 處理劇情狀態下的空白鍵
  if (gameState === 'storyIntro') {
    // 關卡開始劇情結束，開始遊戲
    gameState = 'playing';
    restartGame();
    console.log('關卡開始劇情結束，開始遊戲');
  } else if (gameState === 'storyOutro') {
    // 關卡結束劇情結束，進入下一關或返回大廳
    const completedLevel = currentLevel;
    if (completedLevel < MAX_LEVEL) {
      // 還有下一關，進入下一關
      console.log(`進入第${completedLevel + 1}關`);
      currentLevel = completedLevel + 1;
      
      // 更新關卡配置並顯示下一關劇情
      updateLevelConfig().then(() => {
        storySystem.showIntro(currentLevel);
      }).catch(error => {
        console.error('更新關卡配置失敗:', error);
        // 即使失敗也要顯示劇情
        storySystem.showIntro(currentLevel);
      });
    } else {
      // 最後一關通關，回到大廳
      gameWon = true;
      returnToLobby();
    }
  } else if (gameState === 'playing' && !gameOver && !gameWon) {
    // 正常遊戲狀態下的動作
    if (!player.isActioning) {
      console.log('哈囉！');
      player.isActioning = true;
      player.actionStartTime = Date.now();
      player.actionAnimationTime = Date.now();
      player.actionAnimationFrame = 1;
    }
  }
}

// 處理動作按鈕放開
function handleActionRelease() {
  keys.Space = false;
  
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
    
    // 顯示關卡結束劇情
    storySystem.showOutro(completedLevel);
    
    console.log(`恭喜通過第${completedLevel}關！`);
  } else if (isPlayerNearExit()) {
    // 玩家在出口附近但條件未滿足，顯示提示
    showExitConditionHint();
  }
}

// 處理ESC按鈕按下
function handleEscapePress() {
  if (gameState === 'playing') {
    // ESC鍵返回大廳
    returnToLobby();
  }
}

// Cookie 操作函數
function setCookie(name, value, days) {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    // 設定Cookie時包含path，確保在HTTP伺服器環境下也能正常工作
    document.cookie = name + "=" + value + ";expires=" + expires.toUTCString() + ";path=/";
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
  // 讀取已通關的最高關卡
  const savedLevel = getCookie('highestCompletedLevel');
  if (savedLevel !== null && savedLevel !== undefined) {
    highestCompletedLevel = parseInt(savedLevel);
    // 確保數值在有效範圍內
    if (highestCompletedLevel < 0 || highestCompletedLevel > MAX_LEVEL) {
      highestCompletedLevel = 0;
    }
  } else {
    highestCompletedLevel = 0;
  }
  
  console.log(`已通關最高關卡: ${highestCompletedLevel}`);
  
  // 注意：updateLevelConfig() 會在需要時由外部呼叫
}

function saveProgress() {
  setCookie('highestCompletedLevel', highestCompletedLevel.toString(), 365);
  console.log(`保存進度 - 已通關最高關卡: ${highestCompletedLevel}`);
}

function completeLevel(level) {
  // 更新已通關的最高關卡
  if (level > highestCompletedLevel) {
    highestCompletedLevel = level;
  }
  
  // 記錄完成統計
  gameStats.recordCompletion();
  gameStats.currentGame.level = level;
  
  // 播放勝利音效
  audioSystem.playVictory();
  
  // 停止遊戲背景音樂
  audioSystem.stopGameMusic();
  
  // 保存進度
  saveProgress();
  
  console.log(`完成第${level}關！`);
  console.log(`已通關最高關卡: ${highestCompletedLevel}`);
  console.log(`擊殺數: ${gameStats.currentGame.killCount}`);
  console.log(`完成時間: ${gameStats.currentGame.completionTime}ms`);
  
  return true;
}

async function updateLevelConfig() {
  const config = GAME_CONFIG.levels[currentLevel];

  // 載入地圖圖片
  loadMapImages(config);

  // 載入道具圖片
  await loadItemImages();

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
  
  // 更新預設遊戲參數
  ATTACK_COOLDOWN = defaultSettings.attackCooldown;
  SAFE_ZONE_SIZE = defaultSettings.safeZoneSize;
  PROJECTILE_SPEED = defaultSettings.projectileSpeed; // 保持固定速度
  PROJECTILE_SIZE = defaultSettings.projectileSize;
  MONSTER_PROJECTILE_SPEED = defaultSettings.monsterProjectileSpeed; // 保持固定速度
  MONSTER_PROJECTILE_SIZE = defaultSettings.monsterProjectileSize;
  
  // 更新玩家設定
  player.baseSpeed = defaultSettings.playerSpeed;
  player.speed = player.baseSpeed;
  player.hp = defaultSettings.playerHp;
  player.maxHp = defaultSettings.playerHp;
  player.invulnerableDuration = defaultSettings.invulnerableDuration;

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
  
  // 生成地圖道具
  spawnMapItems();
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
let ATTACK_COOLDOWN = 300; // 0.3秒冷卻時間，會在loadLevel()中更新

// 倒數計時
let GAME_TIME = 90000; // 預設值，會在loadLevel()中更新
let gameStartTime = 0;
let remainingTime = GAME_TIME;

// 擊殺計數器
let killCount = 0;

// 安全區域設定
let SAFE_ZONE_SIZE = 200; // 4格 x 50像素 = 200像素，會在loadLevel()中更新
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
let PROJECTILE_SPEED = 8; // 會在loadLevel()中更新
let PROJECTILE_SIZE = 4; // 會在loadLevel()中更新

// 怪物攻擊彈幕
const monsterProjectiles = [];
let MONSTER_PROJECTILE_SPEED = 6; // 會在loadLevel()中更新
let MONSTER_PROJECTILE_SIZE = 6; // 會在loadLevel()中更新

// 通關出口
const exit = {
  x: 0,
  y: 0,
  width: 200,
  height: 200,
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
  const margin = 50; // 離邊緣50像素的距離
  
  do {
    // 計算有效範圍（離邊緣50像素）
    const minX = margin;
    const maxX = MAP_WIDTH - margin - width;
    const minY = margin;
    const maxY = MAP_HEIGHT - margin - height;
    
    // 確保有效範圍不為負數
    if (minX >= maxX || minY >= maxY) {
      console.warn(`無法生成位置：地圖太小或物件太大`);
      // 如果無法滿足邊緣距離要求，使用原來的邏輯
      x = Math.random() * (MAP_WIDTH - width);
      y = Math.random() * (MAP_HEIGHT - height);
    } else {
      x = Math.random() * (maxX - minX) + minX;
      y = Math.random() * (maxY - minY) + minY;
    }
  } while (isInSafeZone(x, y, width, height));
  
  return { x, y };
}

function spawnExit() {
  // 終點固定在地圖正中間，但往上移動100像素
  exit.x = MAP_WIDTH / 2 - exit.width / 2;
  exit.y = MAP_HEIGHT / 2 - exit.height / 2 - 100;
  
  console.log(`終點生成在地圖正中間偏上: (${exit.x}, ${exit.y})`);
  console.log(`地圖中心: (${MAP_WIDTH / 2}, ${MAP_HEIGHT / 2})`);
  console.log(`安全區域中心: (${SAFE_ZONE_CENTER_X}, ${SAFE_ZONE_CENTER_Y})`);
  console.log(`玩家位置: (${player.x}, ${player.y})`);
}

function spawnMonsters() {
  // 生成普通怪物A
  for (let i = 0; i < NORMAL_A_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(60, 60);
    const settings = monsterSettings.normalA || {};
    monsters.push({
      x: position.x,
      y: position.y,
      width: 60,
      height: 60,
      color: settings.color || '#FF8800',
      hp: settings.hp || 5,
      dx: 0,
      dy: 0,
      type: 'normalA',
      baseSpeed: settings.speed || 0.8, // 基礎速度
      speed: (settings.speed || 0.8), // 保持固定速度
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
    const settings = monsterSettings.normalB || {};
    monsters.push({
      x: position.x,
      y: position.y,
      width: 60,
      height: 60,
      color: settings.color || '#8844FF',
      hp: settings.hp || 5,
      dx: 0,
      dy: 0,
      type: 'normalB',
      baseSpeed: settings.speed || 0.8, // 基礎速度
      speed: (settings.speed || 0.8), // 保持固定速度
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
    const settings = monsterSettings.normalC || {};
    monsters.push({
      x: position.x,
      y: position.y,
      width: 60,
      height: 60,
      color: settings.color || '#44FF44',
      hp: settings.hp || 5,
      dx: 0,
      dy: 0,
      type: 'normalC',
      baseSpeed: settings.speed || 0.8, // 基礎速度
      speed: (settings.speed || 0.8), // 保持固定速度
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
    const settings = monsterSettings.trackerA || {};
    monsters.push({
      x: position.x,
      y: position.y,
      width: settings.size || 120,
      height: settings.size || 120,
      color: settings.color || '#FF0088',
      hp: settings.hp || 2,
      dx: 0,
      dy: 0,
      type: 'trackerA',
      baseSpeed: settings.speed || 1.5, // 基礎速度
      speed: (settings.speed || 1.5), // 保持固定速度
      // 起始座標（用於返回行為）
      startX: position.x,
      startY: position.y,
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
    const settings = monsterSettings.trackerB || {};
    monsters.push({
      x: position.x,
      y: position.y,
      width: settings.size || 120,
      height: settings.size || 120,
      color: settings.color || '#FF0088',
      hp: settings.hp || 2,
      dx: 0,
      dy: 0,
      type: 'trackerB',
      baseSpeed: settings.speed || 1.5, // 基礎速度
      speed: (settings.speed || 1.5), // 保持固定速度
      // 起始座標（用於返回行為）
      startX: position.x,
      startY: position.y,
      // 動畫相關屬性
      direction: 'right', // 預設朝右
      animationFrame: 1, // 動畫幀（1或2）
      animationTime: 0, // 動畫計時器
      animationSpeed: 250, // 動畫切換速度（毫秒，比普通怪物快一點）
    });
  }
  
  // 生成砲塔怪物（體積五倍大，不會移動，會發射遠距離攻擊）
  for (let i = 0; i < TURRET_MONSTER_COUNT; i++) {
    const settings = monsterSettings.turret || {};
    const size = settings.size || 120;
    const position = getRandomPositionOutsideSafeZone(size, size);
    monsters.push({
      x: position.x,
      y: position.y,
      width: size,
      height: size,
      color: settings.color || '#8B0000',
      hp: settings.hp || 30,
      dx: 0,
      dy: 0,
      type: 'turret',
      baseSpeed: settings.speed || 0, // 基礎速度（砲塔不會移動）
      speed: settings.speed || 0, // 不會移動，不需要縮放調整
      lastAttackTime: 0, // 攻擊計時器
      attackCooldown: settings.attackCooldown || 500, // 攻擊間隔
      attackRange: settings.attackRange || 250, // 攻擊範圍
      attackCount: 0, // 攻擊計數器
      // 循環射擊模式相關屬性
      currentAttackMode: 0, // 當前攻擊模式 (0-3)
      attackModeCount: 0, // 當前模式攻擊次數
      maxAttacksPerMode: 5, // 每種模式攻擊5次後切換
      // 動畫相關屬性（砲塔也會有動畫，雖然不移動）
      direction: 'right', // 預設朝右
      animationFrame: 1, // 動畫幀（1或2）
      animationTime: 0, // 動畫計時器
      animationSpeed: 500, // 動畫切換速度（毫秒，較慢）
    });
  }
}

function drawMonsters(offsetX, offsetY) {
  for (const monster of monsters) {
    drawSingleMonster(monster, offsetX, offsetY);
  }
}

// 繪製單個怪物
function drawSingleMonster(monster, offsetX, offsetY) {
  const currentTime = Date.now();
  
  // 只繪製在可視範圍內的怪物
  if (
    monster.x + monster.width > offsetX &&
    monster.x < offsetX + VIEW_WIDTH &&
    monster.y + monster.height > offsetY &&
    monster.y < offsetY + VIEW_HEIGHT
  ) {
    // 更新怪物動畫
    if (currentTime - monster.animationTime > monster.animationSpeed) {
      monster.animationFrame = monster.animationFrame === 1 ? 2 : 1;
      monster.animationTime = currentTime;
    }
    
    // 繪製怪物動畫圖片
    const monsterImageSet = monsterImages[monster.type];
    const imageKey = `${monster.direction}${monster.animationFrame}`;
    const monsterImage = monsterImageSet[imageKey];
    
    if (monsterImage && monsterImage.complete) {
      ctx.drawImage(monsterImage, monster.x - offsetX, monster.y - offsetY, monster.width, monster.height);
    } else {
      // 如果圖片未載入完成，使用顏色方塊作為備用
      ctx.fillStyle = monster.color;
      ctx.fillRect(monster.x - offsetX, monster.y - offsetY, monster.width, monster.height);
    }
    
    // 繪製怪物血條
    drawMonsterHealthBar(monster, offsetX, offsetY);
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
  // 從 monsterSettings 中獲取最大血量
  if (monsterSettings[type] && monsterSettings[type].hp) {
    return monsterSettings[type].hp;
  }
  
  // 如果沒有設定，使用預設值
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
      return 30;
    default:
      return 2;
  }
}



function updatePlayer() {
  player.moving = false;
  
  // 檢查方向鍵輸入（無論是否在蹲下狀態）
  if (keys.ArrowUp) {
    if (!player.isActioning) {
      // 只有在非蹲下狀態才移動位置
      player.y -= player.speed;
      player.moving = true;
    }
    player.direction = 'up';
  }
  if (keys.ArrowDown) {
    if (!player.isActioning) {
      // 只有在非蹲下狀態才移動位置
      player.y += player.speed;
      player.moving = true;
    }
    player.direction = 'down';
  }
  if (keys.ArrowLeft) {
    if (!player.isActioning) {
      // 只有在非蹲下狀態才移動位置
      player.x -= player.speed;
      player.moving = true;
    }
    player.direction = 'left';
  }
  if (keys.ArrowRight) {
    if (!player.isActioning) {
      // 只有在非蹲下狀態才移動位置
      player.x += player.speed;
      player.moving = true;
    }
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
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${player.hp}/${player.maxHp}`, 47.5, 77.5);
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
  const currentTime = Date.now();
  
  // 移動中：重置CD為25%
  if (player.moving) {
    lastAttackTime = currentTime - ATTACK_COOLDOWN * 0.75;
    return;
  }
  
  // 蹲下：重置CD為25%
  if (player.isActioning) {
    lastAttackTime = currentTime - ATTACK_COOLDOWN * 0.75;
    return;
  }
  
  // 靜止狀態：檢查CD並攻擊
  if (currentTime - lastAttackTime < ATTACK_COOLDOWN) {
    return; // 還在冷卻中
  }
  
  // 檢查玩家是否在安全區域內，如果在安全區域內則不能攻擊
  const isPlayerInSafeZone = isInSafeZone(player.x, player.y, player.width, player.height);
  if (isPlayerInSafeZone) {
    return; // 在安全區域內不能攻擊
  }
  
  // 檢查所有怪物
  for (let i = monsters.length - 1; i >= 0; i--) {
    const m = monsters[i];
    // 以玩家中心與怪物中心計算距離
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    const mx = m.x + m.width / 2;
    const my = m.y + m.height / 2;
    
    // 計算射擊距離，加上角色和怪物的寬度
    const baseRange = 300; // 基礎射擊距離
    const playerWidth = player.width;
    const monsterWidth = m.width;
    const totalRange = baseRange + playerWidth / 2 + monsterWidth / 2;
    
    if (distance(px, py, mx, my) < totalRange) {
      // 發射彈幕
      const dx = mx - px;
      const dy = my - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      // 根據攻擊方向更新角色朝向
      if (Math.abs(dx) > Math.abs(dy)) {
        // 水平方向為主
        if (dx > 0) {
          player.direction = 'right';
        } else {
          player.direction = 'left';
        }
      } else {
        // 垂直方向為主
        if (dy > 0) {
          player.direction = 'down';
        } else {
          player.direction = 'up';
        }
      }
      
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
      
      // 只有當玩家不在安全區域內且沒有執行動作時才追蹤
      if (!isPlayerInSafeZone && !player.isActioning) {
        if (dist <= 500) {
          // 500像素內：追蹤玩家
          if (dist > 0) {
            m.dx = (dx / dist) * m.speed;
            m.dy = (dy / dist) * m.speed;
          }
        } else {
          // 500像素外：回到起始座標附近
          const startDx = m.startX - m.x;
          const startDy = m.startY - m.y;
          const startDist = Math.sqrt(startDx * startDx + startDy * startDy);
          
          if (startDist > 100) { // 如果距離起始點超過100像素
            // 朝起始點移動
            if (startDist > 0) {
              m.dx = (startDx / startDist) * m.speed * 0.5; // 返回速度較慢
              m.dy = (startDy / startDist) * m.speed * 0.5;
            }
          } else {
            // 在起始點附近隨機移動
            if (Math.random() < 0.02) { // 2% 機率改變方向
              m.dx = (Math.random() - 0.5) * 2 * m.speed * 0.3; // 在起始點附近移動較慢
              m.dy = (Math.random() - 0.5) * 2 * m.speed * 0.3;
            }
          }
        }
      } else {
        // 玩家在安全區域內或正在執行動作：回到起始座標附近
        const startDx = m.startX - m.x;
        const startDy = m.startY - m.y;
        const startDist = Math.sqrt(startDx * startDx + startDy * startDy);
        
        if (startDist > 100) { // 如果距離起始點超過100像素
          // 朝起始點移動
          if (startDist > 0) {
            m.dx = (startDx / startDist) * m.speed * 0.5; // 返回速度較慢
            m.dy = (startDy / startDist) * m.speed * 0.5;
          }
        } else {
          // 在起始點附近隨機移動
          if (Math.random() < 0.02) { // 2% 機率改變方向
            m.dx = (Math.random() - 0.5) * 2 * m.speed * 0.3; // 在起始點附近移動較慢
            m.dy = (Math.random() - 0.5) * 2 * m.speed * 0.3;
          }
        }
      }
    } else if (m.type === 'turret') {
      // 砲塔怪物：循環射擊模式
      // 持續攻擊，不受玩家位置或安全區域影響
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
      
      // 只檢查攻擊冷卻時間，不檢查範圍和玩家位置
      if (currentTime - m.lastAttackTime >= m.attackCooldown) {
        // 發射攻擊彈幕
        if (dist > 0) {
          m.attackCount++; // 增加攻擊計數
          m.attackModeCount++; // 增加當前模式攻擊次數
          
          // 檢查是否需要切換攻擊模式
          if (m.attackModeCount >= m.maxAttacksPerMode) {
            m.currentAttackMode = (m.currentAttackMode + 1) % 3; // 循環切換 0-2
            m.attackModeCount = 0;
            console.log(`砲塔切換到攻擊模式: ${m.currentAttackMode}`);
          }
          
          // 根據當前攻擊模式執行不同的射擊方式
          switch (m.currentAttackMode) {
            case 0: // 模式1：精準狙擊（單發高速子彈，瞄準玩家）
              // 瞄準角色位置中心加上小幅隨機偏移（-50到+50像素）
              const offsetX1 = (Math.random() - 0.5) * 100; // -50到+50
              const offsetY1 = (Math.random() - 0.5) * 100; // -50到+50
              
              const targetX1 = px + offsetX1;
              const targetY1 = py + offsetY1;
              
              const targetDx1 = targetX1 - mx;
              const targetDy1 = targetY1 - my;
              const targetDist1 = Math.sqrt(targetDx1 * targetDx1 + targetDy1 * targetDy1);
              
              // 高速子彈（1.5倍速度）
              const targetVx1 = (targetDx1 / targetDist1) * (MONSTER_PROJECTILE_SPEED * 1.5);
              const targetVy1 = (targetDy1 / targetDist1) * (MONSTER_PROJECTILE_SPEED * 1.5);
              
              monsterProjectiles.push({
                x: mx,
                y: my,
                vx: targetVx1,
                vy: targetVy1,
                targetPlayer: true,
                color: '#FF0000', // 紅色表示高速子彈
                size: MONSTER_PROJECTILE_SIZE * 1.2 // 稍大一點
              });
              break;
              
            case 1: // 模式2：三連發（連續發射3發子彈，間隔短）
              for (let i = 0; i < 3; i++) {
                // 每發子彈有不同的小偏移
                const offsetX2 = (Math.random() - 0.5) * 150; // -75到+75
                const offsetY2 = (Math.random() - 0.5) * 150; // -75到+75
                
                const targetX2 = px + offsetX2;
                const targetY2 = py + offsetY2;
                
                const targetDx2 = targetX2 - mx;
                const targetDy2 = targetY2 - my;
                const targetDist2 = Math.sqrt(targetDx2 * targetDx2 + targetDy2 * targetDy2);
                
                const targetVx2 = (targetDx2 / targetDist2) * MONSTER_PROJECTILE_SPEED;
                const targetVy2 = (targetDy2 / targetDist2) * MONSTER_PROJECTILE_SPEED;
                
                monsterProjectiles.push({
                  x: mx,
                  y: my,
                  vx: targetVx2,
                  vy: targetVy2,
                  targetPlayer: true,
                  color: '#FF8800', // 橙色表示三連發
                  size: MONSTER_PROJECTILE_SIZE
                });
              }
              break;
              
            case 2: // 模式3：全方位（18發子彈360度發射）
              for (let i = 0; i < 18; i++) {
                // 計算360度全方位角度，每20度一發
                const angle = (i * 20) * (Math.PI / 180); // 轉換為弧度
                
                // 計算攻擊速度向量（全方位，速度為一般的一半）
                const targetVx4 = Math.cos(angle) * (MONSTER_PROJECTILE_SPEED * 0.5);
                const targetVy4 = Math.sin(angle) * (MONSTER_PROJECTILE_SPEED * 0.5);
                
                monsterProjectiles.push({
                  x: mx,
                  y: my,
                  vx: targetVx4,
                  vy: targetVy4,
                  targetPlayer: true,
                  color: '#FF00FF', // 紫色表示全方位
                  size: MONSTER_PROJECTILE_SIZE * 0.6 // 更小一點
                });
              }
              break;
          }
          
          m.lastAttackTime = currentTime;
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
  
  // 計算玩家中心點
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const playerRadius = 30; // 固定玩家碰撞半徑為30像素
  
  for (const m of monsters) {
    // 計算怪物中心點
    const monsterCenterX = m.x + m.width / 2;
    const monsterCenterY = m.y + m.height / 2;
    const monsterRadius = Math.min(m.width, m.height) / 2; // 使用較小的邊作為半徑
    
    // 計算兩個中心點之間的距離
    const distance = Math.sqrt(
      Math.pow(playerCenterX - monsterCenterX, 2) + 
      Math.pow(playerCenterY - monsterCenterY, 2)
    );
    
    // 如果距離小於兩個半徑之和，則發生碰撞
    if (distance < (playerRadius + monsterRadius)) {
      // 玩家受到傷害
      player.hp--;
      player.isInvulnerable = true;
      player.invulnerableTime = Date.now();
      
      // 記錄傷害統計
      gameStats.recordDamage();
      
      // 播放受傷音效
      audioSystem.playHit();
      
      // 創建受傷粒子效果
      particleSystem.createHitEffect(playerCenterX, playerCenterY, '#FF4444');
      
      console.log(`玩家受到傷害！剩餘血量：${player.hp}`);
      
      if (player.hp <= 0) {
        gameOver = true;
        audioSystem.playGameOver();
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
    // 檢查道具通關條件
    return checkExitConditions();
  }
  return false;
}

function checkExitConditions() {
  const config = GAME_CONFIG.levels[currentLevel];
  if (!config || !config.exitCondition) {
    // 如果沒有設定通關條件，直接允許通關
    return true;
  }
  
  // 檢查每個道具的數量是否達到要求
  for (const [itemType, requiredCount] of Object.entries(config.exitCondition)) {
    if (itemCounts[itemType] < requiredCount) {
      return false;
    }
  }
  
  return true;
}

function isPlayerNearExit() {
  // 檢查玩家是否在出口附近（但不在出口上）
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  const exitCenterX = exit.x + exit.width / 2;
  const exitCenterY = exit.y + exit.height / 2;
  
  const distance = Math.sqrt(
    Math.pow(playerCenterX - exitCenterX, 2) + 
    Math.pow(playerCenterY - exitCenterY, 2)
  );
  
  // 在出口附近100像素內，但不在出口上
  return distance < 100 && distance > 30;
}

function showExitConditionHint() {
  const config = GAME_CONFIG.levels[currentLevel];
  if (!config || !config.exitCondition) {
    return;
  }
  
  // 顯示提示訊息
      console.log(GAME_CONFIG.gameInfo.uiText.exitConditionNotMet);
  
  // 創建提示粒子效果
  const exitCenterX = exit.x + exit.width / 2;
  const exitCenterY = exit.y + exit.height / 2;
  particleSystem.createExplosion(exitCenterX, exitCenterY, '#FF0000', 8);
  
  // 播放提示音效
  audioSystem.playSFX(audioSystem.hitSound);
}

function drawExit(offsetX, offsetY) {
  // 根據通關條件狀態決定是否顯示
  const canExit = checkExitConditions();
  
  // 獲取當前關卡的出口圖片
  const exitImageKey = `level${currentLevel}`;
  const exitImage = exitImages[exitImageKey];
  
  if (exitImage && exitImage.complete) {
    // 使用圖片繪製出口
    ctx.drawImage(exitImage, exit.x - offsetX, exit.y - offsetY, exit.width, exit.height);
    
    // 如果條件未滿足，只顯示提示文字（不添加遮罩）
    if (!canExit) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(GAME_CONFIG.gameInfo.uiText.exitRequirement, exit.x - offsetX + exit.width / 2, exit.y - offsetY + exit.height + 15);
    }
  } else {
    // 如果圖片未載入完成，使用原來的顏色方塊作為備用
    const exitColor = canExit ? '#00FF00' : '#FF0000';
    ctx.fillStyle = exitColor;
    ctx.fillRect(exit.x - offsetX, exit.y - offsetY, exit.width, exit.height);
    
    // 畫一個 "EXIT" 文字
    ctx.fillStyle = '#000000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('EXIT', exit.x - offsetX + exit.width / 2, exit.y - offsetY + exit.height / 2 + 4);
    
    // 如果條件未滿足，顯示提示文字
    if (!canExit) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(GAME_CONFIG.gameInfo.uiText.exitRequirement, exit.x - offsetX + exit.width / 2, exit.y - offsetY + exit.height + 15);
    }
  }
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
          const deadMonster = monsters[p.targetMonster];
          monsters.splice(p.targetMonster, 1);
          killCount++;
          
          // 記錄擊殺統計
          gameStats.recordKill();
          
          // 創建爆炸粒子效果
          particleSystem.createExplosion(mx, my, '#FFD700', 12);
          
          // 掉落道具
          dropMonsterItem(deadMonster);
          
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
        
        // 記錄傷害統計
        gameStats.recordDamage();
        
        // 播放受傷音效
        audioSystem.playHit();
        
        // 創建受傷粒子效果
        particleSystem.createHitEffect(px, py, '#FF4444');
        
        console.log(`玩家被怪物攻擊擊中！剩餘血量：${player.hp}`);
        
        if (player.hp <= 0) {
          gameOver = true;
          audioSystem.playGameOver();
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

// 繪製單個彈幕
function drawSingleProjectile(projectile, offsetX, offsetY) {
  ctx.fillStyle = '#FFFF00';
  ctx.beginPath();
  ctx.arc(projectile.x - offsetX, projectile.y - offsetY, PROJECTILE_SIZE, 0, 2 * Math.PI);
  ctx.fill();
}

function drawProjectiles(offsetX, offsetY) {
  for (const projectile of projectiles) {
    drawSingleProjectile(projectile, offsetX, offsetY);
  }
}

// 繪製單個怪物彈幕
function drawSingleMonsterProjectile(projectile, offsetX, offsetY) {
  // 使用子彈的自定義顏色，如果沒有則使用預設紅色
  const color = projectile.color || '#FF0000';
  const size = projectile.size || MONSTER_PROJECTILE_SIZE;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(projectile.x - offsetX, projectile.y - offsetY, size, 0, 2 * Math.PI);
  ctx.fill();
  
  // 為不同類型的子彈添加發光效果
  if (color === '#FF0000') { // 精準狙擊 - 紅色光暈
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (color === '#FF8800') { // 三連發 - 橙色光暈
    ctx.shadowColor = '#FF8800';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (color === '#FF00FF') { // 全方位 - 紫色光暈
    ctx.shadowColor = '#FF00FF';
    ctx.shadowBlur = 3;
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

function drawMonsterProjectiles(offsetX, offsetY) {
  for (const projectile of monsterProjectiles) {
    drawSingleMonsterProjectile(projectile, offsetX, offsetY);
  }
}

// 繪製單個攻擊特效
function drawSingleAttackEffect(effect, offsetX, offsetY) {
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

function drawAttackEffects(offsetX, offsetY) {
  for (const effect of attackEffects) {
    drawSingleAttackEffect(effect, offsetX, offsetY);
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
  
  // 重置道具系統
  resetItems();
  
  // 重新生成怪物和出口
  spawnMonsters();
  spawnExit();
  
  // 重新生成地圖道具
  spawnMapItems();
  
  // 播放遊戲背景音樂
  audioSystem.playGameMusic();
  
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
  ctx.fillText(GAME_CONFIG.gameInfo.uiText.gameOver, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 60);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(GAME_CONFIG.gameInfo.uiText.returnToLobbySpace, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 30);
  
  // 遊戲結束時停止背景音樂
  audioSystem.stopGameMusic();
}

function updateTimer() {
  if (!gameOver && !gameWon) {
    const currentTime = Date.now();
    remainingTime = Math.max(0, GAME_TIME - (currentTime - gameStartTime));
    
    if (remainingTime <= 0) {
      gameOver = true;
      console.log(GAME_CONFIG.gameInfo.uiText.timeUp);
    }
  }
}

function drawTimer() {
  const seconds = Math.ceil(remainingTime / 1000);
  const color = seconds <= 3 ? '#FF4444' : seconds <= 5 ? '#FFAA00' : '#FFFFFF';
  
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(15, 15, 65, 35);
  
  // 面板邊框
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(15, 15, 65, 36);
  
  ctx.fillStyle = color;
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${seconds}`, 47.5, 34);
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
  ctx.fillText(`${GAME_CONFIG.gameInfo.uiText.killCount}: ${killCount}`, VIEW_WIDTH - 65, 90);
}

function drawLevelInfo() {
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, 160, 110, 40);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_WIDTH - 120, 160, 110, 40);
  
  const config = GAME_CONFIG.levels[currentLevel];
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
  ctx.fillText(GAME_CONFIG.gameInfo.name, 20, VIEW_HEIGHT - 25);
  
  // 返回大廳按鈕
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, VIEW_HEIGHT - 50, 110, 40);
  
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(VIEW_WIDTH - 120, VIEW_HEIGHT - 50, 110, 40);
  
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(GAME_CONFIG.gameInfo.uiText.returnToLobby, VIEW_WIDTH - 65, VIEW_HEIGHT - 25);
}

function drawPlayerHealth() {
  // 血量顏色根據血量變化
  let healthColor;
  if (player.hp >= 7) {
    healthColor = '#44FF44'; // 綠色
  } else if (player.hp >= 4) {
    healthColor = '#FFAA00'; // 橙色
  } else {
    healthColor = '#FF4444'; // 紅色
  }
  
  // 面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(15, 60, 65, 35);
  
  // 面板邊框
  ctx.strokeStyle = healthColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(15, 60, 65, 35);
  
  ctx.fillStyle = healthColor;
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${player.hp}/${player.maxHp}`, 47.5, 77.5);
  
  // 如果處於無敵狀態，顯示閃爍效果
  if (player.isInvulnerable) {
    const currentTime = Date.now();
    const flashRate = 100; // 閃爍頻率（毫秒）
    if (Math.floor(currentTime / flashRate) % 2 === 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(15, 60, 65, 35);
    }
  }
}

// 新增：繪製遊戲內音效控制按鈕
function drawSoundControls() {
  const buttonSize = 35;
  const buttonSpacing = 10;
  const startX = VIEW_WIDTH - buttonSize - 15;
  const startY = 15;
  
  // 背景音樂按鈕
  const bgmX = startX - buttonSize - buttonSpacing;
  const bgmY = startY;
  
  // 按鈕背景
  ctx.fillStyle = audioSystem.bgmEnabled ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
  ctx.fillRect(bgmX, bgmY, buttonSize, buttonSize);
  
  // 按鈕邊框
  ctx.strokeStyle = audioSystem.bgmEnabled ? '#4CAF50' : '#F44336';
  ctx.lineWidth = 2;
  ctx.strokeRect(bgmX, bgmY, buttonSize, buttonSize);
  
  // 音量圖標（使用SVG）
  const volumeIcon = audioSystem.bgmEnabled ? uiImages.volumeOn : uiImages.volumeOff;
  if (volumeIcon && volumeIcon.complete) {
    const iconSize = 20;
    const iconX = bgmX + (buttonSize - iconSize) / 2;
    const iconY = bgmY + (buttonSize - iconSize) / 2;
    ctx.drawImage(volumeIcon, iconX, iconY, iconSize, iconSize);
  } else {
    // 如果SVG未載入，使用文字備用
    ctx.fillStyle = audioSystem.bgmEnabled ? '#4CAF50' : '#F44336';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', bgmX + buttonSize/2, bgmY + buttonSize/2);
  }
  
  // 音效按鈕
  const sfxX = startX;
  const sfxY = startY;
  
  // 按鈕背景
  ctx.fillStyle = audioSystem.sfxEnabled ? 'rgba(76, 175, 80, 0.3)' : 'rgba(244, 67, 54, 0.3)';
  ctx.fillRect(sfxX, sfxY, buttonSize, buttonSize);
  
  // 按鈕邊框
  ctx.strokeStyle = audioSystem.sfxEnabled ? '#4CAF50' : '#F44336';
  ctx.lineWidth = 2;
  ctx.strokeRect(sfxX, sfxY, buttonSize, buttonSize);
  
  // 音效圖標（使用SVG）
  const soundIcon = audioSystem.sfxEnabled ? uiImages.soundOn : uiImages.soundOff;
  if (soundIcon && soundIcon.complete) {
    const iconSize = 20;
    const iconX = sfxX + (buttonSize - iconSize) / 2;
    const iconY = sfxY + (buttonSize - iconSize) / 2;
    ctx.drawImage(soundIcon, iconX, iconY, iconSize, iconSize);
  } else {
    // 如果SVG未載入，使用文字備用
    ctx.fillStyle = audioSystem.sfxEnabled ? '#4CAF50' : '#F44336';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🔊', sfxX + buttonSize/2, sfxY + buttonSize/2);
  }
}



// Debug功能函數
function executeDebugFunction() {
  if (gameState === 'playing') {
    // 遊戲中：收集足夠道具
    const config = GAME_CONFIG.levels[currentLevel];
    if (config && config.exitCondition) {
      // 將所有道具數量設定為通關要求
      for (const [itemType, requiredCount] of Object.entries(config.exitCondition)) {
        itemCounts[itemType] = requiredCount;
        console.log(`Debug: 設定道具 ${itemType} 數量為 ${requiredCount}`);
      }
      
      // 播放按鈕音效
      audioSystem.playButtonClick();
      
      // 創建收集特效
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      particleSystem.createExplosion(playerCenterX, playerCenterY, '#00FF00', 12);
      
      console.log('Debug: 已收集足夠道具，可以通關！');
    } else {
      // 如果沒有通關條件，設定全通關
      highestCompletedLevel = MAX_LEVEL;
      
      // 更新Cookie
      setCookie('highestCompletedLevel', MAX_LEVEL.toString(), 365);
      
      // 播放按鈕音效
      audioSystem.playButtonClick();
      
      console.log('Debug: 已全通關！');
    }
  } else if (gameState === 'lobby') {
    // 大廳中：全通關功能
    highestCompletedLevel = MAX_LEVEL;
    
    // 更新Cookie
    setCookie('highestCompletedLevel', MAX_LEVEL.toString(), 365);
    
    // 播放按鈕音效
    audioSystem.playButtonClick();
    
    // 更新大廳顯示
    updateLobbyDisplay();
    
    console.log('Debug: 已全通關！');
  }
}

// 新增：繪製左上角ESC離開按鈕
function drawEscButton() {
  // 按鈕背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(15, 15, 65, 35);
  
  // 按鈕邊框
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(15, 15, 65, 35);
  
  // 按鈕文字
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('ESC 離開', 47.5, 33);
}

function drawGameInstructions() {
  // 主面板背景
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 220, 380);
  
  // 面板邊框
  ctx.strokeStyle = '#666';
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, 220, 380);
  
  const config = GAME_CONFIG.levels[currentLevel];
  const instructions = [
    '【操作】',
    ...GAME_CONFIG.gameInfo.controls.slice(0, 2),
    '',
    '【規則】',
    ...GAME_CONFIG.gameInfo.controls.slice(2),
    '',
    '【關卡】',
    `• 當前：${config.name}`,
    `• 時間：${config.gameTime/1000}秒`,
    `• 怪物：${config.normalAMonsters + config.normalBMonsters + config.normalCMonsters + config.trackerAMonsters + config.trackerBMonsters + config.turretMonsters}隻`,
    '',
    '【怪物】',
    ...GAME_CONFIG.gameInfo.monsterDescriptions
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
  ctx.fillText(GAME_CONFIG.gameInfo.uiText.congratulations, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 60);
  
  // 顯示遊戲統計
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`${GAME_CONFIG.gameInfo.uiText.killCount}: ${killCount}`, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 20);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 28px Arial';
  ctx.fillText(GAME_CONFIG.gameInfo.uiText.returnToLobbySpace, VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 30);
}

function drawMap(offsetX, offsetY) {
  const gridSize = 100;
  const config = GAME_CONFIG.levels[currentLevel];
  
  // 啟用像素完美對齊
  ctx.imageSmoothingEnabled = false;
  ctx.imageSmoothingQuality = 'high';
  
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
      // 使用 Math.round 來避免浮點數精度問題
      const drawX = Math.round(x - offsetX);
      const drawY = Math.round(y - offsetY);
      
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
          // 使用整數座標並稍微擴大繪製範圍以避免縫隙
          ctx.drawImage(tileImage, drawX, drawY, gridSize + 1, gridSize + 1);
          tilesDrawn++;
        } else {
          // 如果圖片未載入，使用顏色方塊作為備用
          ctx.fillStyle = '#8B4513'; // 棕色
          ctx.fillRect(drawX, drawY, gridSize + 1, gridSize + 1);
          tilesFailed++;
        }
      } else {
        // 超出地圖範圍，使用預設顏色
        ctx.fillStyle = '#8B4513'; // 棕色
        ctx.fillRect(drawX, drawY, gridSize + 1, gridSize + 1);
      }
    }
  }
  
  // 每100幀輸出一次調試信息
  if (Math.random() < 0.01) { // 1% 機率輸出
    console.log(`地圖繪製: 成功${tilesDrawn}格, 失敗${tilesFailed}格, 總共${currentMapTiles.length}張圖片`);
  }
  
  // 恢復預設的圖像平滑設定
  ctx.imageSmoothingEnabled = true;
}

function drawGrid(offsetX, offsetY) {
  const gridSize = 100;
  ctx.strokeStyle = 'transparent';
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
  
  // 繪製安全區域邊界（綠色）
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(
    SAFE_ZONE_LEFT - offsetX,
    SAFE_ZONE_TOP - offsetY,
    SAFE_ZONE_SIZE,
    SAFE_ZONE_SIZE
  );
}

function drawSafeZoneOverlay(offsetX, offsetY) {
  // 計算安全區域在螢幕上的位置
  const safeZoneScreenX = SAFE_ZONE_LEFT - offsetX;
  const safeZoneScreenY = SAFE_ZONE_TOP - offsetY;
  
  // 計算安全區域與螢幕的交集
  const intersectX = Math.max(0, safeZoneScreenX);
  const intersectY = Math.max(0, safeZoneScreenY);
  const intersectWidth = Math.min(SAFE_ZONE_SIZE, VIEW_WIDTH - intersectX);
  const intersectHeight = Math.min(SAFE_ZONE_SIZE, VIEW_HEIGHT - intersectY);
  
  // 如果沒有交集，不繪製
  if (intersectWidth <= 0 || intersectHeight <= 0) {
    return;
  }
  
  // 繪製半透明的安全區域圖層
  ctx.fillStyle = 'rgba(0, 255, 0, 0.1)'; // 淡綠色，透明度0.1
  ctx.fillRect(intersectX, intersectY, intersectWidth, intersectHeight);
  
  // 添加發光效果
  ctx.shadowColor = 'rgba(0, 255, 0, 0.3)';
  ctx.shadowBlur = 10;
  ctx.fillStyle = 'rgba(0, 255, 0, 0.05)';
  ctx.fillRect(intersectX, intersectY, intersectWidth, intersectHeight);
  
  // 重置陰影效果
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

// 繪製安全區域邊框
function drawSafeZoneBorder(offsetX, offsetY) {
  // 計算安全區域在螢幕上的位置
  const safeZoneScreenX = SAFE_ZONE_LEFT - offsetX;
  const safeZoneScreenY = SAFE_ZONE_TOP - offsetY;
  
  // 計算安全區域與螢幕的交集
  const intersectX = Math.max(0, safeZoneScreenX);
  const intersectY = Math.max(0, safeZoneScreenY);
  const intersectWidth = Math.min(SAFE_ZONE_SIZE, VIEW_WIDTH - intersectX);
  const intersectHeight = Math.min(SAFE_ZONE_SIZE, VIEW_HEIGHT - intersectY);
  
  // 如果沒有交集，不繪製
  if (intersectWidth <= 0 || intersectHeight <= 0) {
    return;
  }
  
  // 繪製明顯的綠色邊框
  ctx.strokeStyle = '#00FF00'; // 亮綠色
  ctx.lineWidth = 3; // 3像素寬的線條
  ctx.strokeRect(intersectX, intersectY, intersectWidth, intersectHeight);
  
  // 添加發光效果
  ctx.shadowColor = '#00FF00';
  ctx.shadowBlur = 5;
  ctx.strokeStyle = '#00FF00';
  ctx.lineWidth = 2;
  ctx.strokeRect(intersectX, intersectY, intersectWidth, intersectHeight);
  
  // 重置陰影效果
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

// 根據z軸排序繪製遊戲物件
function drawGameObjectsWithZOrder(offsetX, offsetY) {
  const gameObjects = [];
  
  // 收集所有遊戲物件及其底部y座標
  // 出口
  gameObjects.push({
    type: 'exit',
    bottomY: exit.y + exit.height,
    draw: () => drawExit(offsetX, offsetY)
  });
  
  // 道具
  for (const item of items) {
    if (!item.collected) {
      gameObjects.push({
        type: 'item',
        bottomY: item.y + item.height,
        draw: () => drawSingleItem(item, offsetX, offsetY)
      });
    }
  }
  
  // 怪物
  for (const monster of monsters) {
    gameObjects.push({
      type: 'monster',
      bottomY: monster.y + monster.height,
      draw: () => drawSingleMonster(monster, offsetX, offsetY)
    });
  }
  
  // 玩家
  gameObjects.push({
    type: 'player',
    bottomY: player.y + player.height,
    draw: () => drawPlayer(offsetX, offsetY)
  });
  
  // 彈幕
  for (const projectile of projectiles) {
    gameObjects.push({
      type: 'projectile',
      bottomY: projectile.y + PROJECTILE_SIZE,
      draw: () => drawSingleProjectile(projectile, offsetX, offsetY)
    });
  }
  
  // 怪物彈幕
  for (const projectile of monsterProjectiles) {
    gameObjects.push({
      type: 'monsterProjectile',
      bottomY: projectile.y + MONSTER_PROJECTILE_SIZE,
      draw: () => drawSingleMonsterProjectile(projectile, offsetX, offsetY)
    });
  }
  
  // 攻擊特效
  for (const effect of attackEffects) {
    gameObjects.push({
      type: 'attackEffect',
      bottomY: effect.y + effect.radius,
      draw: () => drawSingleAttackEffect(effect, offsetX, offsetY)
    });
  }
  
  // 根據底部y座標排序（y值越大越靠前）
  gameObjects.sort((a, b) => a.bottomY - b.bottomY);
  
  // 按順序繪製
  for (const obj of gameObjects) {
    obj.draw();
  }
}

function gameLoop() {
  if (!gameLoopRunning) return;
  
  if (gameState === 'playing' && !gameOver && !gameWon) {
    updatePlayer();
    updateMonsters();
    updateProjectiles();
    updateMonsterProjectiles();
    updateAttackEffects();
    updateItems();
    updateTimer();
    autoAttack();
    checkCollision();
    checkItemCollection();
    
    // 更新粒子效果
    particleSystem.update();
  }
  
  // 繪製不同狀態的內容
  if (gameState === 'storyIntro' || gameState === 'storyOutro') {
    // 繪製劇情圖片
    storySystem.draw(ctx);
  } else if (gameState === 'playing') {
    const { offsetX, offsetY } = getCameraOffset();
    clearScreen();
    drawMap(offsetX, offsetY);
    drawGrid(offsetX, offsetY);
    
    // 使用z軸排序繪製遊戲物件
    drawGameObjectsWithZOrder(offsetX, offsetY);
    
    // 繪製粒子效果
    particleSystem.draw(offsetX, offsetY);
    
    // 顯示遊戲UI（移除指定的元素）
    drawTimer();
    drawPlayerHealth();
    drawItemStats();
    drawSoundControls();
    
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

// 載入關卡設定檔（已簡化為直接使用內建配置）
function loadLevelConfig() {
  console.log('使用內建遊戲配置...');
  
  // 設定最大關卡數
  MAX_LEVEL = GAME_CONFIG.maxLevel;
  
  // 更新頁面標題和遊戲標題
  updatePageTitles();
  
  console.log('遊戲配置載入成功');
  console.log('最大關卡數:', MAX_LEVEL);
  console.log('關卡配置:', GAME_CONFIG.levels);
  console.log('道具配置:', GAME_CONFIG.itemSettings);
  return true;
}

// 更新頁面標題和遊戲標題
function updatePageTitles() {
  const pageTitle = document.getElementById('pageTitle');
  const gameTitle = document.getElementById('gameTitle');
  const gameSubtitle = document.getElementById('gameSubtitle');
  const gameInstructions = document.getElementById('gameInstructions');
  
  if (pageTitle) {
    pageTitle.textContent = `${GAME_CONFIG.gameInfo.name} - 遊戲大廳`;
  }
  
  if (gameTitle) {
    gameTitle.textContent = GAME_CONFIG.gameInfo.name;
  }
  
  if (gameSubtitle) {
    gameSubtitle.textContent = GAME_CONFIG.gameInfo.description;
  }
  
  if (gameInstructions) {
    gameInstructions.innerHTML = '';
    GAME_CONFIG.gameInfo.instructions.forEach(instruction => {
      const li = document.createElement('li');
      li.textContent = instruction;
      gameInstructions.appendChild(li);
    });
  }
}

// 遊戲大廳管理函數
function initLobby() {
  try {
    console.log('開始初始化大廳...');
    loadLevelConfig();
    console.log('關卡配置載入完成');
    
    loadLevel();
    console.log('關卡進度載入完成');
    
    updateLobbyDisplay();
    console.log('大廳顯示更新完成');
    
    showLobby();
    console.log('大廳顯示完成');
  } catch (error) {
    console.error('初始化大廳失敗:', error);
    // 即使失敗也要顯示大廳
    showLobby();
  }
}

function showLobby() {
  document.getElementById('gameLobby').classList.remove('hidden');
  document.getElementById('gameContainer').classList.add('hidden');
  
  // 顯示手機操作按鈕（只在手機上）
  const mobileControls = document.getElementById('mobileControls');
  const actionButtons = document.querySelector('.action-buttons');
  if (mobileControls && actionButtons) {
    // 多重檢查是否為手機設備
    const isMobile = (
      window.innerWidth <= 768 || 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0)
    );
    
    if (isMobile) {
      mobileControls.style.display = 'flex';
      actionButtons.style.display = 'flex';
      console.log('手機操作按鈕已顯示 - 大廳中檢測到手機設備');
    } else {
      mobileControls.style.display = 'none';
      actionButtons.style.display = 'none';
      console.log('手機操作按鈕已隱藏 - 大廳中桌面設備');
    }
  }
  
  gameState = 'lobby';
}

function hideLobby() {
  document.getElementById('gameLobby').classList.add('hidden');
  document.getElementById('gameContainer').classList.remove('hidden');
  
  // 調整Canvas尺寸
  setTimeout(() => {
    resizeCanvas();
  }, 100); // 稍微延遲，確保容器已經顯示
  
  // 顯示手機操作按鈕（只在手機上）
  const mobileControls = document.getElementById('mobileControls');
  const actionButtons = document.querySelector('.action-buttons');
  if (mobileControls && actionButtons) {
    // 多重檢查是否為手機設備
    const isMobile = (
      window.innerWidth <= 768 || 
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      ('ontouchstart' in window) ||
      (navigator.maxTouchPoints > 0)
    );
    
    if (isMobile) {
      mobileControls.style.display = 'flex';
      actionButtons.style.display = 'flex';
      console.log('手機操作按鈕已顯示 - 檢測到手機設備');
    } else {
      mobileControls.style.display = 'none';
      actionButtons.style.display = 'none';
      console.log('手機操作按鈕已隱藏 - 桌面設備');
    }
  }
  
  gameState = 'playing';
}

function updateLobbyDisplay() {
  const progressInfo = document.getElementById('progressInfo');
  const levelGrid = document.getElementById('levelGrid');
  
  console.log('更新大廳顯示 - 已通關最高關卡:', highestCompletedLevel);
  console.log('更新大廳顯示 - MAX_LEVEL:', MAX_LEVEL);
  
  // 更新進度信息
  if (highestCompletedLevel === MAX_LEVEL) {
    progressInfo.textContent = '進度：完全通關';
  } else if (highestCompletedLevel === 0) {
    progressInfo.textContent = '進度：尚未通關';
  } else {
    progressInfo.textContent = `進度：第 ${highestCompletedLevel} 關`;
  }
  
  // 清空關卡網格
  levelGrid.innerHTML = '';
  
  // 生成關卡按鈕
  for (let level = 1; level <= MAX_LEVEL; level++) {
    const button = document.createElement('button');
    button.className = 'level-button';
    button.textContent = `第 ${level} 關`;
    
    // 設置按鈕狀態
    if (level <= highestCompletedLevel) {
      button.classList.add('completed');
      button.innerHTML = `第 ${level} 關<br><span class="level-info">已完成</span>`;
    } else if (level <= highestCompletedLevel + 1) {
      button.classList.add('unlocked');
      const levelConfig = GAME_CONFIG.levels[level];
      const levelName = levelConfig && levelConfig.name ? levelConfig.name : `第${level}關`;
      button.innerHTML = `第 ${level} 關<br><span class="level-info">${levelName}</span>`;
    } else {
      button.classList.add('locked');
      button.innerHTML = `第 ${level} 關<br><span class="level-info">未解鎖</span>`;
    }
    
    // 添加點擊事件
    button.onclick = () => {
      if (level <= highestCompletedLevel + 1) {
        audioSystem.playButtonClick();
        startLevel(level);
      }
    };
    
    levelGrid.appendChild(button);
  }
}

async function startLevel(level) {
  currentLevel = level;
  loadLevel(); // 只載入進度，不更新配置
  await updateLevelConfig(); // 更新關卡配置
  hideLobby();
  
  // 顯示關卡開始劇情
  storySystem.showIntro(level);
  
  // 確保只有一個遊戲循環在運行
  if (!gameLoopRunning) {
    gameLoopRunning = true;
    gameLoop();
  }
  
  // 確保canvas被focus，避免其他元素被focus
  setTimeout(() => {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
      canvas.focus();
    }
  }, 100);
}

function resetProgress() {
  // 確認對話框
  if (confirm('確定要重置所有通關進度嗎？此操作無法復原。')) {
    // 重置進度變數
    highestCompletedLevel = 0;
    
    // 清除Cookie
    setCookie('highestCompletedLevel', '0', 365);
    
    // 播放按鈕音效
    audioSystem.playButtonClick();
    
    // 更新大廳顯示
    updateLobbyDisplay();
    
    console.log('進度已重置');
  }
}

function returnToLobby() {
  // 停止遊戲背景音樂
  audioSystem.stopGameMusic();
  
  showLobby();
  updateLobbyDisplay();
  
  // 更新大廳音效按鈕狀態
  updateLobbyAudioButtons();
  
  // 停止遊戲循環
  gameLoopRunning = false;
}

function updateLobbyAudioButtons() {
  const bgmToggleBtn = document.getElementById('bgmToggleBtn');
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  const bgmIcon = document.getElementById('bgmIcon');
  const sfxIcon = document.getElementById('sfxIcon');
  
  if (bgmToggleBtn && bgmIcon) {
    // 更新背景音樂按鈕狀態
    if (audioSystem.bgmEnabled) {
      bgmToggleBtn.classList.remove('muted');
      bgmToggleBtn.classList.add('active');
      bgmIcon.src = 'assets/ui/volume-on.svg';
    } else {
      bgmToggleBtn.classList.remove('active');
      bgmToggleBtn.classList.add('muted');
      bgmIcon.src = 'assets/ui/volume-off.svg';
    }
  }
  
  if (sfxToggleBtn && sfxIcon) {
    // 更新音效按鈕狀態
    if (audioSystem.sfxEnabled) {
      sfxToggleBtn.classList.remove('muted');
      sfxToggleBtn.classList.add('active');
      sfxIcon.src = 'assets/ui/sound-on.svg';
    } else {
      sfxToggleBtn.classList.remove('active');
      sfxToggleBtn.classList.add('muted');
      sfxIcon.src = 'assets/ui/sound-off.svg';
    }
  }
}

// 初始化遊戲
async function initGame() {
  // 初始化音效系統
  audioSystem.init();
  
  // 先載入關卡配置
  await initLobby();
  
  // 再載入劇情圖片（確保MAX_LEVEL已經設定）
  await storySystem.loadStoryImages();
  
  // 載入關於頁面的劇情圖片
  await aboutSystem.loadStoryImages();
  
  // 添加重置進度按鈕事件監聽器
  const resetButton = document.getElementById('resetProgressBtn');
  if (resetButton) {
    resetButton.addEventListener('click', resetProgress);
  }
  
  // 添加關於按鈕事件監聽器
  const aboutButton = document.getElementById('aboutBtn');
  const closeAboutButton = document.getElementById('closeAboutBtn');
  
  if (aboutButton) {
    aboutButton.addEventListener('click', () => {
      aboutSystem.showAboutPage();
      audioSystem.playButtonClick();
    });
  }
  
  if (closeAboutButton) {
    closeAboutButton.addEventListener('click', () => {
      aboutSystem.hideAboutPage();
      audioSystem.playButtonClick();
    });
  }
  
  // 點擊背景關閉關於頁面
  const aboutPage = document.getElementById('aboutPage');
  if (aboutPage) {
    aboutPage.addEventListener('click', (e) => {
      if (e.target === aboutPage) {
        aboutSystem.hideAboutPage();
        audioSystem.playButtonClick();
      }
    });
  }
  
  // 添加滿版大圖關閉功能
  const fullscreenImage = document.getElementById('fullscreenImage');
  
  if (fullscreenImage) {
    fullscreenImage.addEventListener('click', (e) => {
      // 點擊任何地方都關閉滿版大圖
      aboutSystem.hideFullscreenImage();
      audioSystem.playButtonClick();
    });
  }
  
  // 添加音效控制按鈕事件監聽器
  const bgmToggleBtn = document.getElementById('bgmToggleBtn');
  const sfxToggleBtn = document.getElementById('sfxToggleBtn');
  const bgmIcon = document.getElementById('bgmIcon');
  const sfxIcon = document.getElementById('sfxIcon');
  
  if (bgmToggleBtn) {
    bgmToggleBtn.addEventListener('click', () => {
      audioSystem.toggleBGM();
      updateLobbyAudioButtons();
      audioSystem.playButtonClick();
    });
  }
  
  if (sfxToggleBtn) {
    sfxToggleBtn.addEventListener('click', () => {
      audioSystem.toggleSFX();
      updateLobbyAudioButtons();
      audioSystem.playButtonClick();
    });
  }
  
  // 初始化大廳音效按鈕狀態
  updateLobbyAudioButtons();
  
  // 初始化手機操作按鈕
  initMobileControls();
  
  // 啟動遊戲循環（但只在需要時執行遊戲邏輯）
  gameLoopRunning = true;
  gameLoop();
  
  // 頁面載入後檢查手機設備
  setTimeout(() => {
    const mobileControls = document.getElementById('mobileControls');
    const actionButtons = document.querySelector('.action-buttons');
    if (mobileControls && actionButtons) {
      // 多重檢查是否為手機設備
      const isMobile = (
        window.innerWidth <= 768 || 
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0)
      );
      
      console.log('設備檢測結果:', {
        screenWidth: screen.width,
        windowWidth: window.innerWidth,
        userAgent: navigator.userAgent,
        touchSupport: 'ontouchstart' in window,
        maxTouchPoints: navigator.maxTouchPoints,
        isMobile: isMobile
      });
      
      if (isMobile) {
        mobileControls.style.display = 'flex';
        actionButtons.style.display = 'flex';
        console.log('手機操作按鈕已顯示 - 頁面載入檢測');
      } else {
        mobileControls.style.display = 'none';
        actionButtons.style.display = 'none';
        console.log('手機操作按鈕已隱藏 - 頁面載入檢測');
      }
    }
  }, 1000);
}

// 開始初始化
initGame();



// 頁面離開時停止所有音樂
window.addEventListener('beforeunload', () => {
  audioSystem.stopAllMusic();
});

// 頁面隱藏時停止所有音樂
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audioSystem.stopAllMusic();
  }
});



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
  
  const config = GAME_CONFIG.levels[currentLevel];
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

// ==================== 道具系統函數 ====================

// 載入道具圖片
async function loadItemImages() {
  console.log('開始載入道具圖片...');
  
  const itemTypes = ['mapItemA', 'mapItemB', 'monsterItemA', 'monsterItemB'];
  
  for (const itemType of itemTypes) {
    const itemConfig = itemSettings[itemType];
    if (itemConfig && itemConfig.image) {
      try {
        const img = new Image();
        img.src = itemConfig.image;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => {
            console.warn(`道具圖片載入失敗: ${itemConfig.image}，使用預設顏色`);
            reject();
          };
        });
        itemImages[itemType] = img;
        console.log(`道具圖片載入成功: ${itemType} -> ${itemConfig.image}`);
      } catch (error) {
        console.warn(`道具圖片載入失敗: ${itemType}，使用預設顏色`);
        itemImages[itemType] = null;
      }
    }
  }
  
  console.log('道具圖片載入完成');
}

// 生成地圖道具
function spawnMapItems() {
  console.log('開始生成地圖道具...');
  console.log('當前關卡:', currentLevel);
  console.log('關卡配置:', GAME_CONFIG.levels[currentLevel]);
  
  const levelConfig = GAME_CONFIG.levels[currentLevel];
  if (!levelConfig) {
    console.log('當前關卡配置不存在');
    return;
  }
  
  // 檢查地圖道具配置
  const mapItemA = levelConfig.mapItemA || 0;
  const mapItemB = levelConfig.mapItemB || 0;
  
  console.log(`地圖道具配置: mapItemA=${mapItemA}, mapItemB=${mapItemB}`);
  
  // 生成 mapItemA
  if (mapItemA > 0) {
    for (let i = 0; i < mapItemA; i++) {
      const item = createMapItem('mapItemA');
      if (item) {
        items.push(item);
        console.log(`生成地圖道具: mapItemA 位置 (${item.x.toFixed(1)}, ${item.y.toFixed(1)})`);
      }
    }
  }
  
  // 生成 mapItemB
  if (mapItemB > 0) {
    for (let i = 0; i < mapItemB; i++) {
      const item = createMapItem('mapItemB');
      if (item) {
        items.push(item);
        console.log(`生成地圖道具: mapItemB 位置 (${item.x.toFixed(1)}, ${item.y.toFixed(1)})`);
      }
    }
  }
  
  console.log(`地圖道具生成完成，總共 ${items.length} 個道具`);
}

// 創建地圖道具的輔助函數
function createMapItem(itemType) {
  const itemConfig = itemSettings[itemType];
  const itemSize = itemConfig ? itemConfig.size : 32; // 預設大小32
  
  // 計算道具的有效生成範圍（離邊緣50像素）
  const margin = 50;
  const minX = margin + itemSize / 2;
  const maxX = MAP_WIDTH - margin - itemSize / 2;
  const minY = margin + itemSize / 2;
  const maxY = MAP_HEIGHT - margin - itemSize / 2;
  
  // 確保有效範圍不為負數
  if (minX >= maxX || minY >= maxY) {
    console.warn(`道具 ${itemType} 無法生成：地圖太小或道具太大`);
    return null;
  }
  
  // 重試機制：最多嘗試10次找到不在安全區域的位置
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    const testItem = {
      type: itemType,
      x: Math.random() * (maxX - minX) + minX,
      y: Math.random() * (maxY - minY) + minY,
      width: itemSize,
      height: itemSize,
      collected: false,
      animationTime: 0,
      floatOffset: Math.random() * Math.PI * 2 // 隨機浮動相位
    };
    
    // 檢查是否不在安全區域內
    if (!isInSafeZone(testItem.x, testItem.y, testItem.width, testItem.height)) {
      return testItem;
    }
    
    attempts++;
  }
  
  console.warn(`道具 ${itemType} 無法找到合適位置：嘗試${maxAttempts}次後仍在安全區域內`);
  return null;
}

// 怪物死亡時掉落道具
function dropMonsterItem(monster) {
  // 獲取怪物設定
  const monsterConfig = GAME_CONFIG.monsterSettings[monster.type];
  if (!monsterConfig) {
    return;
  }
  
  // 檢查掉落 monsterItemA
  if (monsterConfig.dropItemA > 0 && Math.random() < monsterConfig.dropItemA) {
    const itemConfig = itemSettings['monsterItemA'];
    const itemSize = itemConfig ? itemConfig.size : 32;
    
    const item = {
      type: 'monsterItemA',
      x: monster.x + monster.width / 2 - itemSize / 2,
      y: monster.y + monster.height / 2 - itemSize / 2,
      width: itemSize,
      height: itemSize,
      collected: false,
      animationTime: 0,
      floatOffset: Math.random() * Math.PI * 2
    };
    
    items.push(item);
    console.log(`怪物掉落道具: monsterItemA 位置 (${item.x.toFixed(1)}, ${item.y.toFixed(1)}) 大小: ${itemSize}`);
  }
  
  // 檢查掉落 monsterItemB
  if (monsterConfig.dropItemB > 0 && Math.random() < monsterConfig.dropItemB) {
    const itemConfig = itemSettings['monsterItemB'];
    const itemSize = itemConfig ? itemConfig.size : 32;
    
    const item = {
      type: 'monsterItemB',
      x: monster.x + monster.width / 2 - itemSize / 2,
      y: monster.y + monster.height / 2 - itemSize / 2,
      width: itemSize,
      height: itemSize,
      collected: false,
      animationTime: 0,
      floatOffset: Math.random() * Math.PI * 2
    };
    
    items.push(item);
    console.log(`怪物掉落道具: monsterItemB 位置 (${item.x.toFixed(1)}, ${item.y.toFixed(1)}) 大小: ${itemSize}`);
  }
}

// 檢查道具收集
function checkItemCollection() {
  const playerCenterX = player.x + player.width / 2;
  const playerCenterY = player.y + player.height / 2;
  
  for (let i = items.length - 1; i >= 0; i--) {
    const item = items[i];
    if (item.collected) continue;
    
    const itemCenterX = item.x + item.width / 2;
    const itemCenterY = item.y + item.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(playerCenterX - itemCenterX, 2) + 
      Math.pow(playerCenterY - itemCenterY, 2)
    );
    
    if (distance < 50) { // 收集範圍
      item.collected = true;
      itemCounts[item.type]++;
      totalItemsCollected++;
      
      console.log(`收集道具: ${item.type} (總計: ${itemCounts[item.type]})`);
      
      // 創建收集特效
      const itemConfig = itemSettings[item.type];
      if (itemConfig) {
        particleSystem.createExplosion(itemCenterX, itemCenterY, itemConfig.color, 6);
      }
      
      // 播放收集音效
      audioSystem.playSFX(audioSystem.hitSound);
    }
  }
}

// 更新道具動畫
function updateItems() {
  const currentTime = Date.now();
  
  for (const item of items) {
    if (!item.collected) {
      item.animationTime = currentTime;
    }
  }
}

// 繪製單個道具
function drawSingleItem(item, offsetX, offsetY) {
  if (item.collected) return;
  
  const x = item.x - offsetX;
  const y = item.y - offsetY;
  
  // 檢查是否在可視範圍內
  if (x < -50 || x > VIEW_WIDTH + 50 || y < -50 || y > VIEW_HEIGHT + 50) {
    return;
  }
  
  const itemConfig = itemSettings[item.type];
  if (!itemConfig) return;
  
  // 浮動動畫
  const floatY = y + Math.sin((Date.now() + item.floatOffset * 1000) / 1000) * 3;
  
  // 繪製道具
  if (itemImages[item.type]) {
    // 使用圖片
    ctx.drawImage(itemImages[item.type], x, floatY, item.width, item.height);
  } else {
    // 使用預設顏色
    ctx.fillStyle = itemConfig.color;
    ctx.fillRect(x, floatY, item.width, item.height);
    
    // 添加邊框
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, floatY, item.width, item.height);
  }
}

// 繪製道具（保留原函數以維持相容性）
function drawItems(offsetX, offsetY) {
  for (const item of items) {
    drawSingleItem(item, offsetX, offsetY);
  }
}

// 繪製道具統計
function drawItemStats() {
  const startX = 22; // 移到左側，與血量面板對齊
  const startY = 110; // 血量面板下方 (60 + 35 + 5)
  const baseItemSize = 18;
  const spacing = 8;
  
  // 獲取當前關卡的通關條件
  const config = GAME_CONFIG.levels[currentLevel];
  const exitCondition = config ? config.exitCondition : null;
  
  // 只顯示當前關卡需要的道具
  const requiredItems = exitCondition ? Object.keys(exitCondition) : [];
  
  // 計算需要的背景高度
  const itemCount = requiredItems.length;
  const backgroundHeight = 50 + (itemCount * 22);
  
  // 繪製半透明背景，帶有圓角和邊框
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(startX - 8, startY - 8, 180, backgroundHeight);
  
  // 繪製邊框
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  ctx.strokeRect(startX - 8, startY - 8, 180, backgroundHeight);
  
  // 標題
  ctx.fillStyle = '#FFD700';
  ctx.font = 'bold 13px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(GAME_CONFIG.gameInfo.uiText.passItem, startX, startY + 10);
  
  let y = startY + 30;
  
  if (requiredItems.length === 0) {
    // 如果沒有通關條件，顯示提示
    ctx.fillStyle = '#FFFF00';
    ctx.font = '11px Arial';
    ctx.fillText(GAME_CONFIG.gameInfo.uiText.noItemRequirement, startX, y);
  } else {
    // 顯示需要的道具
    for (const itemType of requiredItems) {
      const count = itemCounts[itemType] || 0;
      const requiredCount = exitCondition[itemType];
      const itemConfig = itemSettings[itemType];
      
      if (!itemConfig) continue;
      
      // 統一道具圖示大小
      const displaySize = baseItemSize;
      
      // 繪製道具圖示背景（圓角矩形）
      const iconX = startX;
      const iconY = y - 2;
      
      // 繪製道具圖示
      if (itemImages[itemType]) {
        ctx.drawImage(itemImages[itemType], iconX, iconY, displaySize, displaySize);
      } else {
        ctx.fillStyle = itemConfig.color;
        ctx.fillRect(iconX, iconY, displaySize, displaySize);
        
        // 添加邊框
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.strokeRect(iconX, iconY, displaySize, displaySize);
      }
      
      // 顯示數量文字
      const textX = startX + baseItemSize + spacing;
      const textY = y + 12;
      
      // 道具名稱
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '11px Arial';
      ctx.fillText(itemConfig.name, textX, textY);
      
      // 數量（帶顏色）
      const countText = `${count}/${requiredCount}`;
      const countWidth = ctx.measureText(countText).width;
      const countX = startX + 160 - countWidth; // 右對齊（調整為新的面板寬度）
      
      if (count >= requiredCount) {
        ctx.fillStyle = '#00FF00'; // 綠色表示已達到要求
      } else {
        ctx.fillStyle = '#FF6666'; // 較柔和的紅色表示未達到要求
      }
      
      ctx.font = 'bold 11px Arial';
      ctx.fillText(countText, countX, textY);
      
      y += 22;
    }
  }
}

// 重置道具系統
function resetItems() {
  console.log('重置道具系統...');
  console.log('重置前道具數量:', items.length);
  items = [];
  itemCounts = {
    mapItemA: 0,
    mapItemB: 0,
    monsterItemA: 0,
    monsterItemB: 0
  };
  totalItemsCollected = 0;
  console.log('道具系統已重置，道具數量:', items.length);
} 


