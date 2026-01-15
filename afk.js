const mineflayer = require('mineflayer')

// ===== 可自行調整的設定 =====
const HOST = 'mcFallout.net'
const PORT = 25565
const AFK_TURN_INTERVAL = 30000   // 30 秒轉頭一次
const RECONNECT_DELAY = 15000     // 15 秒後自動重連（被踢/斷線）
// ===========================

// 從環境變數讀取 Microsoft 登入 Email
const EMAIL = process.env.MC_EMAIL
if (!EMAIL) {
  console.error('❌ 請先設定環境變數 MC_EMAIL（你的 Microsoft 登入 Email）')
  process.exit(1)
}

let bot

function startBot () {
  console.log('🚀 啟動 bot…')

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: EMAIL,
    auth: 'microsoft'
  })

  bot.on('login', () => {
    console.log('✅ 已登入 (login)')
  })

  bot.on('spawn', () => {
    console.log('✅ Bot 已上線，開始 AFK')

    // 防 AFK：輕微、隨機轉頭（低風險）
    bot.afkTimer = setInterval(() => {
      const yaw = Math.random() * Math.PI * 2
      const pitch = (Math.random() - 0.5) * 0.1
      bot.look(yaw, pitch, true)
    }, AFK_TURN_INTERVAL)
  })

  // 顯示伺服器訊息（有些服會提示登入/規則）
  bot.on('message', msg => {
    console.log('💬', msg.toString())
  })

  bot.on('kicked', reason => {
    console.log('❌ 被踢出:', reason)
  })

  bot.on('end', () => {
    console.log('🔌 連線中斷，準備重連…')
    cleanupAndReconnect()
  })

  bot.on('error', err => {
    console.log('⚠️ error:', err)
  })
}

function cleanupAndReconnect () {
  try {
    if (bot && bot.afkTimer) clearInterval(bot.afkTimer)
    if (bot) bot.removeAllListeners()
  } catch (e) {}
  setTimeout(startBot, RECONNECT_DELAY)
}

// 啟動
startBot()
