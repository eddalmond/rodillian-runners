function createHeader(currentPage) {
    const header = document.createElement('header');
    header.className = 'header';
    
    header.innerHTML = `
        <nav class="nav">
            <a href="/" class="logo">Rodillian Runners</a>
            <button class="nav-toggle" aria-label="Toggle navigation">
                <span></span>
                <span></span>
                <span></span>
            </button>
            <ul class="nav-links">
                <li><a href="/" ${currentPage === 'home' ? 'class="active"' : ''}>Home</a></li>
                <li><a href="/club-activities/" ${currentPage === 'club-activities' ? 'class="active"' : ''}>Club Activities</a></li>
                <li><a href="/membership/" ${currentPage === 'membership' ? 'class="active"' : ''}>Membership</a></li>
                <li><a href="/records/" ${currentPage === 'records' ? 'class="active"' : ''}>Records</a></li>
                <li><a href="/championship/" ${currentPage === 'championship' ? 'class="active"' : ''}>Championship</a></li>
                <li><a href="/championship-race-calendar/" ${currentPage === 'championship-race-calendar' ? 'class="active"' : ''}>Race Calendar</a></li>
                <li><a href="/distance-league/" ${currentPage === 'distance-league' ? 'class="active"' : ''}>Distance League</a></li>
                <li><a href="/photos/" ${currentPage === 'photos' ? 'class="active"' : ''}>Photos</a></li>
                <li><a href="/contact/" ${currentPage === 'contact' ? 'class="active"' : ''}>Contact</a></li>
            </ul>
        </nav>
    `;
    
    const navToggle = header.querySelector('.nav-toggle');
    const navLinks = header.querySelector('.nav-links');
    
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
    
    return header;
}

function createFooter() {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
        <div class="container">
            <p>&copy; 2026 Rodillian Runners. All rights reserved.</p>
        </div>
    `;
    return footer;
}

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const pageName = body.dataset.page || 'home';
    
    const existingHeader = document.querySelector('header.header');
    if (!existingHeader) {
        document.body.insertBefore(createHeader(pageName), document.body.firstChild);
    }
    
    const existingFooter = document.querySelector('footer.footer');
    if (!existingFooter) {
        document.body.appendChild(createFooter());
    }
});
