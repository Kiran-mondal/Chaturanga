// মেনুবারের পুরো HTML ডিজাইনটিকে একটি ভ্যারিয়েবলের মধ্যে রাখা হলো
const menubarHTML = `
<nav class="w-full max-w-[400px] md:max-w-[600px] heritage-card rounded-lg p-3 mt-4 mb-2 z-50 relative transition-all mx-auto">
    <div class="flex justify-between items-center relative z-20">
        <div class="text-amber-500 font-extrabold tracking-widest text-sm uppercase">चतुरङ्ग</div>
        
        <div class="hidden sm:flex gap-4">
            <button onclick="showPage('home')" class="nav-btn-home text-[11px] text-amber-200 font-bold uppercase tracking-wider hover:text-amber-500 border-b-2 border-amber-500 pb-1 transition-all">Home</button>
            <button onclick="showPage('game')" class="nav-btn-game text-[11px] text-stone-400 font-bold uppercase tracking-wider hover:text-amber-500 border-b-2 border-transparent pb-1 transition-all">Play</button>
            <button onclick="showPage('rules')" class="nav-btn-rules text-[11px] text-stone-400 font-bold uppercase tracking-wider hover:text-amber-500 border-b-2 border-transparent pb-1 transition-all">Rules</button>
            <button onclick="showPage('heritage')" class="nav-btn-heritage text-[11px] text-stone-400 font-bold uppercase tracking-wider hover:text-amber-500 border-b-2 border-transparent pb-1 transition-all">Heritage</button>
            <button onclick="showPage('projects')" class="nav-btn-projects text-[11px] text-stone-400 font-bold uppercase tracking-wider hover:text-amber-500 border-b-2 border-transparent pb-1 transition-all">Projects</button>
        </div>

        <button onclick="toggleMobileMenu()" class="sm:hidden text-amber-500 hover:text-amber-300 focus:outline-none transition">
            <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
    </div>

    <div id="mobile-menu" class="hidden sm:hidden flex-col items-center gap-5 pt-6 pb-6 w-full bg-[#160d07]/95 backdrop-blur-md absolute left-0 top-full rounded-b-xl border-x border-b border-amber-600/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-10 transition-all">
        <button onclick="showPage('home'); toggleMobileMenu()" class="nav-btn-home text-[14px] text-amber-200 font-extrabold uppercase tracking-[0.2em] transition-all">Home</button>
        <button onclick="showPage('game'); toggleMobileMenu()" class="nav-btn-game text-[14px] text-stone-400 font-extrabold uppercase tracking-[0.2em] transition-all">Play</button>
        <button onclick="showPage('rules'); toggleMobileMenu()" class="nav-btn-rules text-[14px] text-stone-400 font-extrabold uppercase tracking-[0.2em] transition-all">Rules</button>
        <button onclick="showPage('heritage'); toggleMobileMenu()" class="nav-btn-heritage text-[14px] text-stone-400 font-extrabold uppercase tracking-[0.2em] transition-all">Heritage</button>
        <button onclick="showPage('projects'); toggleMobileMenu()" class="nav-btn-projects text-[14px] text-stone-400 font-extrabold uppercase tracking-[0.2em] transition-all">Projects</button>
    </div>
</nav>
`;

// ফাইল লোড হওয়ার সাথে সাথে মেনুবারটি index.html-এ বসিয়ে দেবে
document.addEventListener('DOMContentLoaded', () => {
    const placeholder = document.getElementById('menubar-placeholder');
    if (placeholder) {
        placeholder.innerHTML = menubarHTML;
        showPage('home'); // ওয়েবসাইট খুললেই প্রথমে Home পেজ দেখাবে
    }
});

// মোবাইল মেনু ওপেন/ক্লোজ করার ফাংশন
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menu.classList.add('flex');
    } else {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
    }
};

// পেজ পরিবর্তন করার ফাংশন
window.showPage = function(targetPage) {
    const pages = ['home', 'game', 'rules', 'heritage', 'projects'];
    
    pages.forEach(page => {
        const container = document.getElementById(`${page}-container`);
        const btns = document.querySelectorAll(`.nav-btn-${page}`);
        
        if (page === targetPage) {
            if(container) { 
                container.style.display = 'flex'; 
                container.classList.remove('hidden'); 
            }
            btns.forEach(btn => {
                btn.classList.add('text-amber-200', 'border-amber-500'); 
                btn.classList.remove('text-stone-400', 'border-transparent');
            });
        } else {
            if(container) { 
                container.style.display = 'none'; 
                container.classList.add('hidden'); 
            }
            btns.forEach(btn => {
                btn.classList.add('text-stone-400', 'border-transparent'); 
                btn.classList.remove('text-amber-200', 'border-amber-500');
            });
        }
    });
};
