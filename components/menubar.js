// ১. মেনুবারটি HTML ফাইলে অটোমেটিক লোড করার ফাংশন
async function loadMenuBar() {
    try {
        const response = await fetch('components/menubar.html');
        const menuHtml = await response.text();
        document.getElementById('menubar-placeholder').innerHTML = menuHtml;
    } catch (error) {
        console.error('Error loading the menubar:', error);
    }
}

// পেজ লোড হলেই মেনুবার লোড হবে
document.addEventListener('DOMContentLoaded', loadMenuBar);

// ২. মোবাইলে হ্যামবার্গার মেনু ওপেন/ক্লোজ করার ফাংশন
window.toggleMobileMenu = function() {
    const menu = document.getElementById('mobile-menu');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
        menu.classList.add('flex');
    } else {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
    }
};

// ৩. ট্যাবে ক্লিক করলে নির্দিষ্ট পেজ ওপেন করার ফাংশন
window.showPage = function(targetPage) {
    const pages = ['game', 'rules', 'heritage', 'projects'];
    
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
