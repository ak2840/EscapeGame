const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// 地圖與視窗設定
const VIEW_WIDTH = canvas.width;
const VIEW_HEIGHT = canvas.height;
const MAP_WIDTH = VIEW_WIDTH * 5;
const MAP_HEIGHT = VIEW_HEIGHT * 5;

// 玩家設定
const player = {
  x: MAP_WIDTH / 2,
  y: MAP_HEIGHT / 2,
  width: 40,
  height: 60,
  speed: 4,
  moving: false,
  color: '#FFD700',
};

// 鍵盤狀態
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  Space: false,
};

// 鍵盤事件
window.addEventListener('keydown', (e) => {
  if (e.code in keys) {
    keys[e.code] = true;
    if (e.code === 'Space') {
      if (gameOver) {
        // 遊戲結束時按空白鍵重新開始
        restartGame();
      } else if (gameWon) {
        // 通關時按空白鍵重新開始
        restartGame();
      } else if (checkExit()) {
        // 在出口位置按空白鍵通關
        gameWon = true;
        console.log('恭喜通關！');
      } else {
        // 執行動作：打招呼
        console.log('哈囉！');
      }
    }
  }
});
window.addEventListener('keyup', (e) => {
  if (e.code in keys) {
    keys[e.code] = false;
  }
});

// 怪物設定
const NORMAL_MONSTER_COUNT = 50;
const TRACKER_MONSTER_COUNT = 20;
const MONSTER_COUNT = NORMAL_MONSTER_COUNT + TRACKER_MONSTER_COUNT;
const monsters = [];

// 遊戲狀態
let gameOver = false;
let gameWon = false;
let lastAttackTime = 0;
const ATTACK_COOLDOWN = 300; // 0.3秒冷卻時間

// 倒數計時
const GAME_TIME = 60000; // 60秒
let gameStartTime = 0;
let remainingTime = GAME_TIME;

// 擊殺計數器
let killCount = 0;

// 安全區域設定
const SAFE_ZONE_SIZE = 200; // 4格 x 50像素 = 200像素
const SAFE_ZONE_CENTER_X = MAP_WIDTH / 2;
const SAFE_ZONE_CENTER_Y = MAP_HEIGHT / 2;
const SAFE_ZONE_LEFT = SAFE_ZONE_CENTER_X - SAFE_ZONE_SIZE / 2;
const SAFE_ZONE_RIGHT = SAFE_ZONE_CENTER_X + SAFE_ZONE_SIZE / 2;
const SAFE_ZONE_TOP = SAFE_ZONE_CENTER_Y - SAFE_ZONE_SIZE / 2;
const SAFE_ZONE_BOTTOM = SAFE_ZONE_CENTER_Y + SAFE_ZONE_SIZE / 2;

// 攻擊特效
const attackEffects = [];

// 攻擊彈幕
const projectiles = [];
const PROJECTILE_SPEED = 8;
const PROJECTILE_SIZE = 4;

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
  // 隨機選擇地圖邊緣
  const side = Math.floor(Math.random() * 4); // 0:上, 1:右, 2:下, 3:左
  
  switch (side) {
    case 0: // 上邊緣
      exit.x = Math.random() * (MAP_WIDTH - exit.width);
      exit.y = 0;
      break;
    case 1: // 右邊緣
      exit.x = MAP_WIDTH - exit.width;
      exit.y = Math.random() * (MAP_HEIGHT - exit.height);
      break;
    case 2: // 下邊緣
      exit.x = Math.random() * (MAP_WIDTH - exit.width);
      exit.y = MAP_HEIGHT - exit.height;
      break;
    case 3: // 左邊緣
      exit.x = 0;
      exit.y = Math.random() * (MAP_HEIGHT - exit.height);
      break;
  }
}

function spawnMonsters() {
  // 生成普通怪物
  for (let i = 0; i < NORMAL_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(40, 40);
    monsters.push({
      x: position.x,
      y: position.y,
      width: 40,
      height: 40,
      color: '#FF4444',
      hp: 2,
      dx: 0,
      dy: 0,
      type: 'normal',
      speed: 1,
    });
  }
  
  // 生成追蹤怪物
  for (let i = 0; i < TRACKER_MONSTER_COUNT; i++) {
    const position = getRandomPositionOutsideSafeZone(40, 40);
    monsters.push({
      x: position.x,
      y: position.y,
      width: 40,
      height: 40,
      color: '#FF0088',
      hp: 2,
      dx: 0,
      dy: 0,
      type: 'tracker',
      speed: 1.5,
    });
  }
}

function drawMonsters(offsetX, offsetY) {
  for (const m of monsters) {
    // 只繪製在可視範圍內的怪物
    if (
      m.x + m.width > offsetX &&
      m.x < offsetX + VIEW_WIDTH &&
      m.y + m.height > offsetY &&
      m.y < offsetY + VIEW_HEIGHT
    ) {
      ctx.fillStyle = m.color;
      ctx.fillRect(m.x - offsetX, m.y - offsetY, m.width, m.height);
    }
  }
}

function updatePlayer() {
  player.moving = false;
  if (keys.ArrowUp) {
    player.y -= player.speed;
    player.moving = true;
  }
  if (keys.ArrowDown) {
    player.y += player.speed;
    player.moving = true;
  }
  if (keys.ArrowLeft) {
    player.x -= player.speed;
    player.moving = true;
  }
  if (keys.ArrowRight) {
    player.x += player.speed;
    player.moving = true;
  }
  // 邊界限制
  player.x = Math.max(0, Math.min(MAP_WIDTH - player.width, player.x));
  player.y = Math.max(0, Math.min(MAP_HEIGHT - player.height, player.y));
}

function drawPlayer(offsetX, offsetY) {
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - offsetX, player.y - offsetY, player.width, player.height);
}

function clearScreen() {
  ctx.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
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
  if (!player.moving) {
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
        
        lastAttackTime = currentTime;
        // 一次只攻擊一隻
        break;
      }
    }
  }
}

function updateMonsters() {
  for (const m of monsters) {
    if (m.type === 'tracker') {
      // 追蹤怪物：檢查與玩家的距離
      const px = player.x + player.width / 2;
      const py = player.y + player.height / 2;
      const mx = m.x + m.width / 2;
      const my = m.y + m.height / 2;
      
      const dx = px - mx;
      const dy = py - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
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
      // 普通怪物：隨機移動
      if (Math.random() < 0.02) { // 2% 機率改變方向
        m.dx = (Math.random() - 0.5) * 2 * m.speed;
        m.dy = (Math.random() - 0.5) * 2 * m.speed;
      }
    }
    
    // 移動怪物
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
  }
}

function checkCollision() {
  for (const m of monsters) {
    if (
      player.x < m.x + m.width &&
      player.x + player.width > m.x &&
      player.y < m.y + m.height &&
      player.y + player.height > m.y
    ) {
      gameOver = true;
      console.log('遊戲結束！你被怪物碰到了！');
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
        if (m.hp <= 0) {
          monsters.splice(p.targetMonster, 1);
          killCount++;
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
  
  // 重置玩家位置
  player.x = MAP_WIDTH / 2;
  player.y = MAP_HEIGHT / 2;
  player.moving = false;
  
  // 清空所有怪物和彈幕
  monsters.length = 0;
  projectiles.length = 0;
  attackEffects.length = 0;
  
  // 重新生成怪物和出口
  spawnMonsters();
  spawnExit();
  
  console.log('遊戲重新開始！');
}

function drawGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  
  ctx.fillStyle = '#FF0000';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('遊戲結束！', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 50);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px Arial';
  ctx.fillText('按空白鍵重新開始', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 20);
}

function updateTimer() {
  if (!gameOver && !gameWon) {
    const currentTime = Date.now();
    remainingTime = Math.max(0, GAME_TIME - (currentTime - gameStartTime));
    
    if (remainingTime <= 0) {
      gameOver = true;
      console.log('時間到！遊戲結束！');
    }
  }
}

function drawTimer() {
  const seconds = Math.ceil(remainingTime / 1000);
  const color = seconds <= 3 ? '#FF0000' : seconds <= 5 ? '#FFFF00' : '#FFFFFF';
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, 10, 110, 40);
  
  ctx.fillStyle = color;
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`時間: ${seconds}秒`, VIEW_WIDTH - 65, 35);
}

function drawKillCount() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(VIEW_WIDTH - 120, 60, 110, 40);
  
  ctx.fillStyle = '#00FF00';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`擊殺: ${killCount}`, VIEW_WIDTH - 65, 85);
}

function drawGameInstructions() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(10, 10, 150, 180);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '16px Arial';
  ctx.textAlign = 'left';
  
  const instructions = [
    '【操作】',
    '方向鍵：移動',
    '空白鍵：執行動作',
    '',
    '【規則】',
    '• 停止時自動攻擊',
    '• 找到綠色出口通關'
  ];
  
  instructions.forEach((text, index) => {
    if (text.startsWith('【')) {
      ctx.fillStyle = '#FFFF00';
      ctx.font = '16px Arial';
    } else if (text.startsWith('•')) {
      ctx.fillStyle = '#00FFFF';
      ctx.font = '14px Arial';
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '14px Arial';
    }
    ctx.fillText(text, 20, 30 + index * 16);
  });
}

function drawVictory() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  
  ctx.fillStyle = '#00FF00';
  ctx.font = '48px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('恭喜通關！', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 50);
  
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '24px Arial';
  ctx.fillText('按空白鍵重新開始', VIEW_WIDTH / 2, VIEW_HEIGHT / 2 + 20);
}

function drawGrid(offsetX, offsetY) {
  const gridSize = 50;
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

function gameLoop() {
  if (!gameOver && !gameWon) {
    updatePlayer();
    updateMonsters();
    updateProjectiles();
    updateAttackEffects();
    updateTimer();
    autoAttack();
    checkCollision();
  }
  
  const { offsetX, offsetY } = getCameraOffset();
  clearScreen();
  drawGrid(offsetX, offsetY);
  drawExit(offsetX, offsetY);
  drawMonsters(offsetX, offsetY);
  drawPlayer(offsetX, offsetY);
  drawProjectiles(offsetX, offsetY);
  drawAttackEffects(offsetX, offsetY);
  
  // 顯示遊戲說明和計時器
  drawGameInstructions();
  drawTimer();
  drawKillCount();
  
  if (gameOver) {
    drawGameOver();
  } else if (gameWon) {
    drawVictory();
  }
  
  requestAnimationFrame(gameLoop);
}

spawnMonsters();
spawnExit();
gameStartTime = Date.now();
gameLoop(); 