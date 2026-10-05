const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src', 'app', 'battle', '[id]', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf8');

if (!pageContent.includes('chatMessages')) {
    pageContent = pageContent.replace(
        /const \[showResult, setShowResult\] = useState\(false\)/,
        `const [showResult, setShowResult] = useState(false)\n  const [chatMessages, setChatMessages] = useState<any[]>([])\n  const [chatInput, setChatInput] = useState('')`
    );
}

if (!pageContent.includes(`socket.on('chat_message'`)) {
    pageContent = pageContent.replace(
        /onSpectatorCount\(\(count\) => \{/g,
        `onSpectatorCount((count) => {\n      const { socket } = require('@/lib/socket');\n      socket?.off('chat_message').on('chat_message', (msg: any) => { setChatMessages(prev => [...prev, msg].slice(-50)) });`
    );
}

const sendChatMessageFn = `
  const sendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const { socket } = require('@/lib/socket');
    socket?.emit('chat_message', chatInput);
    setChatInput('');
  }
`;

if (!pageContent.includes('sendChatMessage')) {
    pageContent = pageContent.replace(
        /const handleRoastSubmit = async \(\) => \{/,
        sendChatMessageFn + '\n  const handleRoastSubmit = async () => {'
    );
}

const chatUI = `
            {/* Spectator Chat */}
            <div className="mt-8 rounded-xl border border-white/10 bg-black/40 p-6 backdrop-blur-md">
              <h3 className="mb-4 text-xl font-bold text-white flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-indigo-400" />
                Spectator Chat
              </h3>
              <div className="flex flex-col gap-2 h-64 overflow-y-auto mb-4 p-4 border border-white/5 rounded-lg bg-black/20">
                {chatMessages.length === 0 ? (
                  <div className="text-white/40 text-sm text-center my-auto">No messages yet. Be the first!</div>
                ) : (
                  chatMessages.map((msg, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-xs text-white/50">{msg.sender?.username || 'Unknown'}</span>
                      <span className="text-sm text-white/90">{msg.text}</span>
                    </div>
                  ))
                )}
              </div>
              <form onSubmit={sendChatMessage} className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-white/10 bg-black/50 px-4 py-2 text-sm text-white placeholder:text-white/30 focus:border-indigo-500 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600"
                >
                  Send
                </button>
              </form>
            </div>
`;

if (!pageContent.includes('Spectator Chat')) {
    pageContent = pageContent.replace(
        /\{!\(isPlayer1 \|\| isPlayer2\) && battle\.status === 'active' && \(/,
        chatUI + '\n            {!(isPlayer1 || isPlayer2) && battle.status === \'active\' && ('
    );
}

fs.writeFileSync(pagePath, pageContent);
console.log('Patched battle page with Spectator Chat UI.');

const dashboardPath = path.join(__dirname, 'src', 'app', 'dashboard', 'page.tsx');
let dashboardContent = fs.readFileSync(dashboardPath, 'utf8');

const dailyTopicBanner = `
        {/* Daily Topic Banner */}
        <div className="mb-8 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-400" />
              Daily Topic: "Tech Bros in Web3"
            </h3>
            <p className="text-sm text-white/70 mt-1">Join the daily battle for 2x XP multiplier!</p>
          </div>
          <button className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors">
            Create Match
          </button>
        </div>
`;

if (!dashboardContent.includes('Daily Topic Banner')) {
    dashboardContent = dashboardContent.replace(
        /<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">/,
        dailyTopicBanner + '\n        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">'
    );
    fs.writeFileSync(dashboardPath, dashboardContent);
    console.log('Patched dashboard page with Daily Topic Banner.');
}
