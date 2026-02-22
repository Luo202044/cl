const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileNav = document.getElementById('mobileNav');

if (mobileMenuBtn && mobileNav) {
  mobileMenuBtn.addEventListener('click', function() {
    mobileNav.classList.toggle('show');
    const icon = mobileMenuBtn.querySelector('i');
    if (icon) {
      icon.className = mobileNav.classList.contains('show') ? 'fas fa-times' : 'fas fa-bars';
    }
  });
}
