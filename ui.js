// --- UI & HISTORY LOGIC ---
function logMoveToHistory(pieceName, toSquare, isCapture, isWhite) {
    const historyFeed = document.getElementById('move-history-feed');
    if (historyFeed.innerText.includes('awaits')) historyFeed.innerHTML = ''; 

    const colorLabel = isWhite ? '<span class="text-amber-500 font-bold">Player</span>' : '<span class="text-red-500 font-bold">Computer</span>';
    const actionText = isCapture ? `<span class="text-red-400 font-bold">captured on</span>` : `moved to`;
    
    const entry = document.createElement('div');
    entry.className = 'border-b border-stone-800/50 pb-1 opacity-0 animate-fade-in';
    entry.innerHTML = `> ${colorLabel}'s ${pieceName} ${actionText} [${toSquare}]`;
    
    historyFeed.appendChild(entry);
    historyFeed.scrollTop = historyFeed.scrollHeight; 
}

function updateGraveyardUI() {
    document.getElementById('black-graveyard').innerHTML = capturedBlack.map(p => `<span class="inline-block p-1 bg-stone-950/70 rounded border border-amber-500/10 graveyard-piece">${pieceSigns[p]}</span>`).join('');
    document.getElementById('white-graveyard').innerHTML = capturedWhite.map(p => `<span class="inline-block p-1 bg-stone-950/70 rounded border border-amber-500/10 graveyard-piece">${pieceSigns[p]}</span>`).join('');
}

function showEndGameModal(title, description, icon, userWon) {
    const teachingReport = generateAITeachingReport(userWon);
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalDesc').innerHTML = `<span class="block mb-3">${description}</span><div class="text-[11px] bg-amber-500/10 p-2 rounded text-amber-400 border border-amber-500/20">${teachingReport}</div>`;
    document.getElementById('modalIcon').innerText = icon;
    document.getElementById('gameOverModal').classList.remove('hidden');
    gameMetrics.userMistakes = [];
    gameMetrics.userAggressionCount = 0;
                          }
