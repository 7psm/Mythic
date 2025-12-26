// ============================================
//          CONFIGURATION API
// ============================================
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3001' 
    : 'https://mythic-api.onrender.com';

console.log('🌐 API URL:', API_URL);

// ============================================
//          BOUTON BACK TO TOP
// ============================================
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
        backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
        backToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
    } else {
        backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
        backToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ============================================
//          RÉVÉLATION AU SCROLL
// ============================================
const animateElements = document.querySelectorAll('.animate-in, .reveal');

const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, {
    threshold: 0.15, 
    rootMargin: '0px 0px -80px 0px' 
});

animateElements.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index * 0.08, 1)}s`;
    animateObserver.observe(el);
});

// ============================================
//      SMOOTH SCROLL VERS LES SECTIONS
// ============================================
document.querySelectorAll('a[href^="#v"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        const targetEl = document.getElementById(targetId);
        
        if (targetEl) {
            const navbar = document.querySelector('.navbar-container');
            const offset = (navbar?.offsetHeight || 0) + 20;
            const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
            
            window.scrollTo({ top, behavior: 'smooth' });
            closeModal();
        }
    });
});

// ============================================
//              MODAL VERSIONS
// ============================================
const versionModal = document.getElementById('versionModal');
const modalContent = document.getElementById('modalContent');
const closeModalBtn = document.getElementById('closeModal');
const navigateBtn = document.getElementById('navigate-to-version');
const versionList = document.getElementById('versionList');

navigateBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    loadVersionsForModal();
    versionModal.classList.remove('pointer-events-none', 'opacity-0');
    versionModal.classList.add('pointer-events-auto', 'opacity-100');
    setTimeout(() => {
        modalContent.classList.remove('scale-95');
        modalContent.classList.add('scale-100');
    }, 10);
});

closeModalBtn?.addEventListener('click', closeModal);
versionModal?.addEventListener('click', (e) => {
    if (e.target === versionModal) closeModal();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && versionModal?.classList.contains('opacity-100')) {
        closeModal();
    }
});

function closeModal() {
    modalContent.classList.remove('scale-100');
    modalContent.classList.add('scale-95');
    setTimeout(() => {
        versionModal.classList.add('pointer-events-none', 'opacity-0');
        versionModal.classList.remove('pointer-events-auto', 'opacity-100');
    }, 200);
}

// ============================================
//      CHARGER LES VERSIONS DEPUIS L'API
// ============================================
async function loadVersionsForModal() {
    versionList.innerHTML = '<p class="text-center text-gray-400 py-4">Chargement...</p>';
    
    try {
        const response = await fetch(`${API_URL}/api/versions/content`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const versions = await response.json();
        
        if (versions.length === 0) {
            versionList.innerHTML = '<p class="text-center text-gray-400 py-4">Aucune version disponible</p>';
            return;
        }
        
        const sortedVersions = versions.slice().reverse();
        
        versionList.innerHTML = sortedVersions.map(version => `
            <a href="#v${version.version}" 
               class="block px-4 py-3 text-white hover:bg-white/5 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gold/20 mb-2"
               onclick="closeModal()">
                <div class="flex items-center justify-between">
                    <span class="font-semibold">v${version.version}</span>
                    <span class="text-xs text-gray-500">${new Date(version.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                ${version.title ? `<div class="text-sm text-gray-400 mt-1">${version.title}</div>` : ''}
            </a>
        `).join('');
        
    } catch (error) {
        console.error('❌ Erreur chargement versions:', error);
        versionList.innerHTML = `
            <p class="text-center text-red-400 py-4">
                ❌ Impossible de charger les versions<br>
                <span class="text-xs text-gray-500">Erreur: ${error.message}</span>
            </p>
        `;
    }
}

// ============================================
// CHARGER ET AFFICHER LE CONTENU DES VERSIONS
// ============================================
async function loadVersionsContent() {
    const container = document.getElementById('versions-content');
    container.innerHTML = '<p class="text-center text-gray-400 py-8">Chargement des versions...</p>';
    
    try {
        const response = await fetch(`${API_URL}/api/versions/content`);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const versions = await response.json();
        
        if (versions.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-400 py-8">Aucune version disponible</p>';
            return;
        }
        
        const sortedVersions = versions.slice().reverse();
        
        container.innerHTML = sortedVersions.map((version, index) => `
            <article id="v${version.version}" class="section-shell scroll-mt-20 mb-16 ml-8 lg:ml-[10rem] animate-in delay-${Math.min(index + 1, 3)}">
                <div class="mb-8 pb-6 border-b border-gold/10">
                    <div class="flex items-center justify-between mb-4">
                        <div class="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/[0.12] border border-gold/20 rounded-md text-[0.8125rem] font-bold text-gold tracking-wide">
                            <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                            ${version.version}
                        </div>
                        <div class="text-sm font-medium text-zinc-500">
                            ${new Date(version.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </div>
                    </div>

                    <h2 class="text-3xl font-extrabold tracking-tight text-white mb-3 lg:text-2xl">
                        ${version.title || `Version ${version.version}`}
                    </h2>

                    ${version.description ? `
                        <p class="text-[1.0625rem] text-zinc-400 leading-relaxed md:text-base">
                            ${version.description}
                        </p>
                    ` : ''}
                </div>

                ${version.features && version.features.length > 0 ? `
                <div class="mb-10">
                    <div class="flex items-center gap-2.5 mb-5 pb-3 border-b border-gold/[0.08]">
                        <svg class="w-[18px] h-[18px] text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                            <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                        </svg>
                        <h3 class="text-[1.0625rem] font-bold text-white tracking-tight">Nouvelles fonctionnalités</h3>
                    </div>
                    <ul class="flex flex-col gap-3">
                        ${version.features.map(feature => `
                            <li class="flex items-start gap-4 p-4 bg-white/[0.02] border border-gold/[0.08] rounded-lg hover:bg-white/[0.04] hover:border-gold/[0.15] hover:translate-x-1 transition-all duration-250">
                                <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gold/10 rounded-lg text-gold text-base">${feature.icon}</div>
                                <div class="flex-1 pt-0.5">
                                    <div class="font-semibold text-white mb-1 text-[0.9375rem]">
                                        ${feature.title}
                                        <span class="inline-flex items-center px-2 py-0.5 rounded bg-green-500/15 text-green-500 border border-green-500/20 text-[0.6875rem] font-bold uppercase tracking-wide ml-2">New</span>
                                    </div>
                                    <div class="text-zinc-400 text-sm leading-relaxed">
                                        ${feature.description}
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                ${version.improvements && version.improvements.length > 0 ? `
                <div class="mb-10">
                    <div class="flex items-center gap-2.5 mb-5 pb-3 border-b border-gold/[0.08]">
                        <svg class="w-[18px] h-[18px] text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd"/>
                        </svg>
                        <h3 class="text-[1.0625rem] font-bold text-white tracking-tight">Améliorations</h3>
                    </div>
                    <ul class="flex flex-col gap-3">
                        ${version.improvements.map(improvement => `
                            <li class="flex items-start gap-4 p-4 bg-white/[0.02] border border-gold/[0.08] rounded-lg hover:bg-white/[0.04] hover:border-gold/[0.15] hover:translate-x-1 transition-all duration-250">
                                <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gold/10 rounded-lg text-gold text-base">${improvement.icon}</div>
                                <div class="flex-1 pt-0.5">
                                    <div class="font-semibold text-white mb-1 text-[0.9375rem]">
                                        ${improvement.title}
                                        <span class="inline-flex items-center px-2 py-0.5 rounded bg-blue-500/15 text-blue-500 border border-blue-500/20 text-[0.6875rem] font-bold uppercase tracking-wide ml-2">Improved</span>
                                    </div>
                                    <div class="text-zinc-400 text-sm leading-relaxed">
                                        ${improvement.description}
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                ${version.fixes && version.fixes.length > 0 ? `
                <div class="mb-10">
                    <div class="flex items-center gap-2.5 mb-5 pb-3 border-b border-gold/[0.08]">
                        <svg class="w-[18px] h-[18px] text-gold flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
                        </svg>
                        <h3 class="text-[1.0625rem] font-bold text-white tracking-tight">Corrections de bugs</h3>
                    </div>
                    <ul class="flex flex-col gap-3">
                        ${version.fixes.map(fix => `
                            <li class="flex items-start gap-4 p-4 bg-white/[0.02] border border-gold/[0.08] rounded-lg hover:bg-white/[0.04] hover:border-gold/[0.15] hover:translate-x-1 transition-all duration-250">
                                <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-gold/10 rounded-lg text-gold text-base">${fix.icon}</div>
                                <div class="flex-1 pt-0.5">
                                    <div class="font-semibold text-white mb-1 text-[0.9375rem]">
                                        ${fix.title}
                                        <span class="inline-flex items-center px-2 py-0.5 rounded bg-orange-400/15 text-orange-400 border border-orange-400/20 text-[0.6875rem] font-bold uppercase tracking-wide ml-2">Fixed</span>
                                    </div>
                                    <div class="text-zinc-400 text-sm leading-relaxed">
                                        ${fix.description}
                                    </div>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
            </article>
        `).join('');
        
        const animateElements = document.querySelectorAll('.animate-in');
        animateElements.forEach((el) => {
            animateObserver.observe(el);
        });
        
    } catch (error) {
        console.error('❌ Erreur chargement contenu:', error);
        container.innerHTML = `
            <p class="text-center text-red-400 py-8">
                ❌ Erreur de connexion à l'API<br>
                <span class="text-xs text-gray-500">Erreur: ${error.message}</span>
            </p>
        `;
    }
}

loadVersionsContent();
