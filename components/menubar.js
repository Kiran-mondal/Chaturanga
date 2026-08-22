// ১. index.html লোড হওয়ার সাথে সাথে মেনুবার ইনজেক্ট করার ফাংশন
document.addEventListener('DOMContentLoaded', () => {
    fetch('components/menubar.html')
        .then(response => response.text())
        .then(html => { 
            document.getElementById('menubar-placeholder').innerHTML = html; 
            // বাই ডিফল্ট 'home' পেজটি ওপেন করবে
            showPage('home');
        })
        .catch(err => console.error("Error loading menubar: ", err));
});

// ২. মোবাইলের মেনু ওপেন/ক্লোজ করার লজিক
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

// ৩. ট্যাব ক্লিক করলে নির্দিষ্ট পেজ দেখানো এবং বাকিগুলো লুকানোর লজিক
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
