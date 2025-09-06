// Script pour gérer l'état actif de la navbar et le menu mobile
document.addEventListener('DOMContentLoaded', function() {
    // Récupérer l'URL actuelle
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Mapper les pages aux liens de navigation
    const pageMapping = {
        'index.html': '/',
        'contact.html': '/contact.html',
        'Products.html': '/products.html',
        'TrustSafetyPage.html': '/trust-safety.html',
        'Cart.html': '/cart.html',
        'Checkout.html': '/checkout.html',
        'Confirmation.html': '/confirmation.html'
    };
    
    // Trouver le lien correspondant à la page actuelle
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        // Supprimer la classe active de tous les liens
        link.classList.remove('active');
        
        // Vérifier si ce lien correspond à la page actuelle
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPath || 
            linkHref === currentPage || 
            linkHref === pageMapping[currentPage]) {
            link.classList.add('active');
        }
    });

    // Menu mobile
    const menuToggle = document.getElementById('menuToggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', function() {
            navLinksContainer.classList.toggle('mobile-menu-open');
            menuToggle.classList.toggle('menu-open');
        });

        // Fermer le menu quand on clique sur un lien
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinksContainer.classList.remove('mobile-menu-open');
                menuToggle.classList.remove('menu-open');
            });
        });

        // Fermer le menu quand on clique en dehors
        document.addEventListener('click', function(event) {
            if (!menuToggle.contains(event.target) && !navLinksContainer.contains(event.target)) {
                navLinksContainer.classList.remove('mobile-menu-open');
                menuToggle.classList.remove('menu-open');
            }
        });
    }
});




    // Récupérer l'URL actuelle
    const currentPath = window.location.pathname;
    const currentPage = currentPath.split('/').pop() || 'index.html';
    
    // Mapper les pages aux liens de navigation
    const pageMapping = {
        'index.html': '/',
        'contact.html': '/contact.html',
        'Products.html': '/products.html',
        'TrustSafetyPage.html': '/trust-safety.html',
        'Cart.html': '/cart.html',
        'Checkout.html': '/checkout.html',
        'Confirmation.html': '/confirmation.html'
    };
    
    // Trouver le lien correspondant à la page actuelle
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        // Supprimer la classe active de tous les liens
        link.classList.remove('active');
        
        // Vérifier si ce lien correspond à la page actuelle
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPath || 
            linkHref === currentPage || 
            linkHref === pageMapping[currentPage]) {
            link.classList.add('active');
        }
    });

    // Menu mobile
    const menuToggle = document.getElementById('menuToggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', function() {
            navLinksContainer.classList.toggle('mobile-menu-open');
            menuToggle.classList.toggle('menu-open');
        });

        // Fermer le menu quand on clique sur un lien
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinksContainer.classList.remove('mobile-menu-open');
                menuToggle.classList.remove('menu-open');
            });
        });

        // Fermer le menu quand on clique en dehors
        document.addEventListener('click', function(event) {
            if (!menuToggle.contains(event.target) && !navLinksContainer.contains(event.target)) {
                navLinksContainer.classList.remove('mobile-menu-open');
                menuToggle.classList.remove('menu-open');
            }
        });
    };


