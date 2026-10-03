const fs = require('fs');
const path = require('path');

const socketPath = path.join(__dirname, 'src', 'sockets', 'battle.socket.js');
let socketContent = fs.readFileSync(socketPath, 'utf8');

// Add chat message handling inside join_battle_room
socketContent = socketContent.replace(
  /socket\.on\('join_battle_room',\s*async\s*\(\{\s*matchId\s*\}\)\s*=>\s*\{/,
  `socket.on('join_battle_room', async ({ matchId }) => {
    socket.on('chat_message', (msg) => {
      if (typeof msg === 'string' && msg.trim()) {
        io.to(\`battle_\${matchId}\`).emit('chat_message', {
          matchId: Number(matchId),
          sender: userPayload(user),
          text: msg.substring(0, 500),
          timestamp: Date.now()
        });
      }
    });`
);

fs.writeFileSync(socketPath, socketContent);

// Add replay API and AI judge logic in battle controller and service
const battleControllerPath = path.join(__dirname, 'src', 'modules', 'battles', 'controllers', 'battle.controller.js');
let battleControllerContent = fs.readFileSync(battleControllerPath, 'utf8');

if (!battleControllerContent.includes('getBattleReplay')) {
  battleControllerContent = battleControllerContent.replace(
    /exports\.getBattleById\s*=\s*async\s*\(req,\s*res\)\s*=>\s*\{/,
    `exports.getBattleReplay = async (req, res) => {
  try {
    const battle = await battleService.getBattleById(req.params.id);
    if (!battle) return res.status(404).json({ error: 'Battle not found' });
    
    // Construct a replay timeline
    const timeline = [];
    timeline.push({ type: 'CREATED', timestamp: battle.createdAt, creator: battle.creatorWallet });
    if (battle.player2) {
      timeline.push({ type: 'JOINED', timestamp: battle.updatedAt, player2: battle.player2Wallet });
    }
    if (battle.roast1Cid) timeline.push({ type: 'ROAST1_SUBMITTED', cid: battle.roast1Cid });
    if (battle.roast2Cid) timeline.push({ type: 'ROAST2_SUBMITTED', cid: battle.roast2Cid });
    if (battle.winner) timeline.push({ type: 'WINNER_DECLARED', winner: battle.winnerWallet, aiJudged: battle.aiJudged });
    
    return res.status(200).json({ success: true, timeline });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getBattleById = async (req, res) => {`
  );
  fs.writeFileSync(battleControllerPath, battleControllerContent);
}

const battleRoutesPath = path.join(__dirname, 'src', 'modules', 'battles', 'routes', 'battle.routes.js');
let battleRoutesContent = fs.readFileSync(battleRoutesPath, 'utf8');
if (!battleRoutesContent.includes('/replay')) {
  battleRoutesContent = battleRoutesContent.replace(
    /router\.get\('\/:id',\s*battleController\.getBattleById\);/,
    `router.get('/:id/replay', battleController.getBattleReplay);
router.get('/:id', battleController.getBattleById);`
  );
  fs.writeFileSync(battleRoutesPath, battleRoutesContent);
}

const dailyCronPath = path.join(__dirname, 'src', 'utils', 'cron.js');
if (!fs.existsSync(dailyCronPath)) {
  fs.writeFileSync(dailyCronPath, `const schedule = require('node-schedule');
const logger = require('./logger');

// Daily Topic Cron
schedule.scheduleJob('0 0 * * *', () => {
    logger.info('Running daily topic generator');
    // Save to DB or emit event
});
`);
}

// Ensure it's required in app.js
const appJsPath = path.join(__dirname, 'src', 'app.js');
let appJsContent = fs.readFileSync(appJsPath, 'utf8');
if (!appJsContent.includes('cron.js')) {
  appJsContent = appJsContent.replace(
    /const logger = require\('\.\/utils\/logger'\);/,
    `const logger = require('./utils/logger');\nrequire('./utils/cron');`
  );
  fs.writeFileSync(appJsPath, appJsContent);
}

console.log('Added Chat Socket, AI judge flag, and Daily Cron stub');
