export default function singlePostIndexing() {
    // get class element blogs-content
    const singlePostContent = document.querySelector('.single-post-content');
    if (!singlePostContent) return;

    // get all h1, h2, h3, h4, h5, h6 elements
    const headings = singlePostContent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (!headings.length) return;

    // add id "title--" and indexing number to each heading
    headings.forEach((heading, index) => {
        heading.id = `title--${index + 1}`;
    });

    // get class element singlePostIndexing
    const singlePostIndexing = document.querySelector('.single-post-indexing');
    if (!singlePostIndexing) return;

    // clear existing ul to prevent duplication on resize
    const existingUl = singlePostIndexing.querySelector('ul');
    if (existingUl) {
        existingUl.remove();
    }

    // inject ul element to singlePostIndexing after h6 element
    const ul = document.createElement('ul');
    singlePostIndexing.appendChild(ul);

    // add li element to ul for each heading
    headings.forEach((heading, index) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `#title--${index + 1}`;
        link.textContent = heading.textContent;
        link.style.transition = 'color 0.6s ease, opacity 0.6s ease';
        li.appendChild(link);
        ul.appendChild(li);
    });

    // Get all index links
    const indexLinks = ul.querySelectorAll('a');
    
    // Calculate the offset based on scroll-margin-top
    const getScrollMarginTop = () => {
        const computedStyle = getComputedStyle(headings[0]);
        return parseFloat(computedStyle.scrollMarginTop) || 0;
    };

    // Function to update active link based on scroll position
    const updateActiveLink = () => {
        // Disable active state on mobile screens (max-width: 1023px)
        if (window.innerWidth <= 1024) {
            // Remove active class from all links on mobile
            indexLinks.forEach(link => link.classList.remove('active'));
            return;
        }

        const scrollMarginTop = getScrollMarginTop();
        const scrollPosition = window.scrollY + scrollMarginTop + 1; // +1 for precision

        let currentActiveIndex = -1;

        // Find which heading is currently at or past the scroll-margin-top position
        headings.forEach((heading, index) => {
            const headingTop = heading.offsetTop;
            if (scrollPosition >= headingTop) {
                currentActiveIndex = index;
            }
        });

        // Remove active class from all links
        indexLinks.forEach(link => link.classList.remove('active'));

        // Add active class to the current link
        if (currentActiveIndex >= 0) {
            indexLinks[currentActiveIndex].classList.add('active');
        }
    };

    // Listen to scroll events with throttling for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        scrollTimeout = setTimeout(updateActiveLink, 10);
    }, { passive: true });

    // Initial check on load
    updateActiveLink();

    // Update on window resize (as scroll-margin-top might change)
    let resizeTimeout;
    window.addEventListener('resize', () => {
        if (resizeTimeout) {
            clearTimeout(resizeTimeout);
        }
        resizeTimeout = setTimeout(updateActiveLink, 100);
    }, { passive: true });
}