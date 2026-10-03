const fs = require('fs');
const path = require('path');

const battleServicePath = path.join(__dirname, 'src', 'modules', 'battles', 'services', 'battle.service.js');
let battleService = fs.readFileSync(battleServicePath, 'utf8');

// Replace transferFromUserToEscrow in createBattle
battleService = battleService.replace(
  /const entryTxHash = await escrowService\.transferFromUserToEscrow\(\{([\s\S]*?)\}\);/g,
  `let entryTxHash = 'on-chain-escrow';
      if (process.env.ONCHAIN_ESCROW !== 'true') {
        entryTxHash = await escrowService.transferFromUserToEscrow({$1});
      }`
);

// Replace refundBattleEscrowOnCancel to skip when ONCHAIN_ESCROW=true
battleService = battleService.replace(
  /async refundBattleEscrowOnCancel\(battle\) \{/g,
  `async refundBattleEscrowOnCancel(battle) {
    if (process.env.ONCHAIN_ESCROW === 'true') {
      return ['on-chain-refund'];
    }`
);

// Same for distributePayouts
battleService = battleService.replace(
  /async distributePayouts\(battle\) \{/g,
  `async distributePayouts(battle) {
    if (process.env.ONCHAIN_ESCROW === 'true') {
      return ['on-chain-payout'];
    }`
);

// Pass deadlines to createMatchOnChain
battleService = battleService.replace(
  /chainCreate = await chainService\.createMatchOnChain\(\{([\s\S]*?)sourcePublic: creatorWalletPublic,\n\s*\}\);/g,
  `const now = Math.floor(Date.now() / 1000);
        chainCreate = await chainService.createMatchOnChain({$1sourcePublic: creatorWalletPublic,
          joinDeadline: now + 3600, // 1 hour
          roastDeadline: now + 3600 * 24, // 24 hours
          voteEnd: now + 3600 * 48 // 48 hours
        });`
);

fs.writeFileSync(battleServicePath, battleService);

const chainServicePath = path.join(__dirname, 'src', 'modules', 'battles', 'services', 'battleChain.service.js');
let chainService = fs.readFileSync(chainServicePath, 'utf8');

// Modify createMatchOnChain to accept new parameters
chainService = chainService.replace(
  /async createMatchOnChain\(\{ entryFee, topicCid, sourceSecret, sourcePublic \}\) \{/g,
  `async createMatchOnChain({ entryFee, topicCid, sourceSecret, sourcePublic, joinDeadline, roastDeadline, voteEnd }) {`
);

chainService = chainService.replace(
  /args: \[\n\s*StellarSdk\.nativeToScVal\(Number\(entryFee \|\| 0\), \{ type: 'i128' \}\),\n\s*StellarSdk\.nativeToScVal\(topicCid, \{ type: 'string' \}\),\n\s*StellarSdk\.nativeToScVal\(new StellarSdk\.Address\(userAddress\), \{ type: 'address' \}\),\n\s*\],/g,
  `args: [
          StellarSdk.nativeToScVal(Number(entryFee || 0), { type: 'i128' }),
          StellarSdk.nativeToScVal(topicCid, { type: 'string' }),
          StellarSdk.nativeToScVal(new StellarSdk.Address(userAddress), { type: 'address' }),
          StellarSdk.nativeToScVal(Number(joinDeadline || 0), { type: 'u64' }),
          StellarSdk.nativeToScVal(Number(roastDeadline || 0), { type: 'u64' }),
          StellarSdk.nativeToScVal(Number(voteEnd || 0), { type: 'u64' }),
        ],`
);

fs.writeFileSync(chainServicePath, chainService);

console.log('Patched battle.service.js and battleChain.service.js for ONCHAIN_ESCROW flag');
