document.addEventListener('DOMContentLoaded', () => {
  const PAIRS = [
    { id: 1, term: 'אבולוציה',      def: 'שינוי בתכונות תורשתיות של אוכלוסיות לאורך דורות' },
    { id: 2, term: 'מוטציה',        def: 'שינוי אקראי ב-DNA' },
    { id: 3, term: 'ברירה טבעית',   def: 'פרטים מותאמים שורדים יותר' },
    { id: 4, term: 'התאמה',         def: 'תכונה שעוזרת לשרוד בסביבה' },
    { id: 5, term: 'מאובן',         def: 'שרידי יצור שנשתמרו בסלע' },
    { id: 6, term: 'תורשה',         def: 'העברת תכונות מהורים לצאצאים' },
  ];

  const modeScreen  = document.getElementById('modeScreen');
  const gameSection = document.getElementById('gameSection');
  const grid        = document.getElementById('memoryGrid');
  const resetBtn    = document.getElementById('resetBtn');
  const winOverlay  = document.getElementById('winOverlay');
  const winResetBtn = document.getElementById('winResetBtn');
  const winModeBtn  = document.getElementById('winModeBtn');
  const movesEl     = document.getElementById('moveCount');
  const turnLabel   = document.getElementById('turnLabel');
  const p1Block     = document.getElementById('p1Block');
  const p2Block     = document.getElementById('p2Block');
  const p1Name      = document.getElementById('p1Name');
  const p2Name      = document.getElementById('p2Name');
  const score1El    = document.getElementById('score1');
  const score2El    = document.getElementById('score2');
  const winTitle    = document.getElementById('winTitle');
  const winMovesEl  = document.getElementById('winMoves');

  let gameMode = null;
  let currentPlayer = 1;
  let scores = { 1: 0, 2: 0 };
  let flipped = [];
  let matched = 0;
  let moves = 0;
  let locked = false;
  let botSeen = new Map(); // pairId -> card elements the bot has observed

  // ── Mode selection ──────────────────────────────────────────────────────────

  document.getElementById('modeBot').addEventListener('click', () => startGame('bot'));
  document.getElementById('modeFriend').addEventListener('click', () => startGame('friend'));

  function startGame(mode) {
    gameMode = mode;
    p1Name.textContent = mode === 'bot' ? 'אתה' : 'שחקן 1';
    p2Name.textContent = mode === 'bot' ? 'בוט'  : 'שחקן 2';
    modeScreen.style.display = 'none';
    gameSection.style.display = '';
    resetGame();
  }

  function goToModeScreen() {
    gameSection.style.display = 'none';
    modeScreen.style.display  = '';
    winOverlay.classList.add('hidden');
  }

  resetBtn.addEventListener('click', goToModeScreen);
  winModeBtn.addEventListener('click', goToModeScreen);
  winResetBtn.addEventListener('click', resetGame);

  // ── Game setup ──────────────────────────────────────────────────────────────

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildDeck() {
    const deck = [];
    PAIRS.forEach(p => {
      deck.push({ pairId: p.id, type: 'term', text: p.term });
      deck.push({ pairId: p.id, type: 'def',  text: p.def  });
    });
    return shuffle(deck);
  }

  function render() {
    grid.innerHTML = '';
    buildDeck().forEach(card => {
      const el = document.createElement('div');
      el.className = 'memory-card';
      el.dataset.pairId = card.pairId;
      el.dataset.type   = card.type;
      el.innerHTML = `
        <div class="memory-card__inner">
          <div class="memory-card__face">🧬</div>
          <div class="memory-card__content">
            <span class="memory-card__type">${card.type === 'term' ? 'מושג' : 'הגדרה'}</span>
            <span class="memory-card__text">${card.text}</span>
          </div>
        </div>`;
      el.addEventListener('click', onCardClick);
      grid.appendChild(el);
    });
  }

  function resetGame() {
    currentPlayer = 1;
    scores        = { 1: 0, 2: 0 };
    flipped       = [];
    matched       = 0;
    moves         = 0;
    locked        = false;
    botSeen       = new Map();
    movesEl.textContent = 0;
    score1El.textContent = 0;
    score2El.textContent = 0;
    winOverlay.classList.add('hidden');
    render();
    updateTurnUI();
  }

  // ── Turn display ────────────────────────────────────────────────────────────

  function updateTurnUI() {
    p1Block.classList.toggle('active', currentPlayer === 1);
    p2Block.classList.toggle('active', currentPlayer === 2);
    const name = currentPlayer === 1 ? p1Name.textContent : p2Name.textContent;
    turnLabel.textContent = gameMode === 'bot' && currentPlayer === 2 ? 'תור הבוט' : `תור ${name}`;
  }

  // ── Human click ─────────────────────────────────────────────────────────────

  function onCardClick(e) {
    if (gameMode === 'bot' && currentPlayer === 2) return;
    const card = e.currentTarget;
    if (locked || card.classList.contains('flipped') || card.classList.contains('matched')) return;
    flipCard(card);
  }

  // ── Card flip (shared by human and bot) ─────────────────────────────────────

  function flipCard(card) {
    card.classList.add('flipped');

    // Bot memorises every card it sees
    const pid = card.dataset.pairId;
    if (!botSeen.has(pid)) botSeen.set(pid, []);
    const seen = botSeen.get(pid);
    if (!seen.includes(card)) seen.push(card);

    flipped.push(card);

    if (flipped.length === 2) {
      locked = true;
      moves++;
      movesEl.textContent = moves;
      setTimeout(checkMatch, 300);
    }
  }

  // ── Match resolution ────────────────────────────────────────────────────────

  function checkMatch() {
    const [a, b] = flipped;
    flipped = [];

    if (a.dataset.pairId === b.dataset.pairId) {
      a.classList.add('matched');
      b.classList.add('matched');
      matched++;
      scores[currentPlayer]++;
      score1El.textContent = scores[1];
      score2El.textContent = scores[2];
      locked = false;

      if (matched === PAIRS.length) {
        setTimeout(showWin, 400);
        return;
      }
      // Scorer keeps their turn; if it was the bot, schedule next bot move
      if (gameMode === 'bot' && currentPlayer === 2) {
        setTimeout(botTurn, 700);
      }
    } else {
      a.classList.add('no-match');
      b.classList.add('no-match');
      setTimeout(() => {
        a.classList.remove('flipped', 'no-match');
        b.classList.remove('flipped', 'no-match');
        locked = false;
        switchTurn();
      }, 700);
    }
  }

  function switchTurn() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    updateTurnUI();
    if (gameMode === 'bot' && currentPlayer === 2) {
      setTimeout(botTurn, 800);
    }
  }

  // ── Bot logic ────────────────────────────────────────────────────────────────
  // Bot remembers all cards it has seen flipped. If it knows a complete pair
  // (both cards observed), it picks them. Otherwise it picks randomly.

  function botTurn() {
    const unmatched = [...grid.querySelectorAll('.memory-card:not(.matched):not(.flipped)')];
    if (unmatched.length < 2) return;

    let first, second;

    // Find a pair where bot has seen both cards
    let knownPair = null;
    for (const [, cards] of botSeen) {
      const avail = cards.filter(c => !c.classList.contains('matched') && !c.classList.contains('flipped'));
      if (avail.length >= 2) { knownPair = avail; break; }
    }

    if (knownPair) {
      [first, second] = knownPair;
    } else {
      // Pick first card randomly, then check if its pair-partner was seen
      const pool = shuffle([...unmatched]);
      first = pool[0];
      const partnerPid = first.dataset.pairId;
      const knownPartner = (botSeen.get(partnerPid) || []).find(
        c => c !== first && !c.classList.contains('matched') && !c.classList.contains('flipped')
      );
      second = knownPartner || pool.find(c => c !== first);
    }

    setTimeout(() => {
      flipCard(first);
      setTimeout(() => flipCard(second), 700);
    }, 400);
  }

  // ── Win screen ──────────────────────────────────────────────────────────────

  function showWin() {
    winMovesEl.textContent = moves;
    if (gameMode === 'bot') {
      if (scores[1] > scores[2])      winTitle.textContent = 'ניצחת! 🏆';
      else if (scores[2] > scores[1]) winTitle.textContent = 'הבוט ניצח 🤖';
      else                            winTitle.textContent = 'תיקו! 🤝';
    } else {
      if (scores[1] > scores[2])      winTitle.textContent = `${p1Name.textContent} ניצח! 🏆`;
      else if (scores[2] > scores[1]) winTitle.textContent = `${p2Name.textContent} ניצח! 🏆`;
      else                            winTitle.textContent = 'תיקו! 🤝';
    }
    winOverlay.classList.remove('hidden');
  }
});
