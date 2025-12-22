export default function search() {
    const searchSection = document.querySelector('.search');
    const searchResults = document.querySelector('.search-results');
    const searchInput = document.querySelector('#search-input');
    const searchForm = searchSection?.querySelector('form');
    const closeButton = searchResults?.querySelector('button.close');
    const triggerButtons = document.querySelectorAll('[trigger-route="search"]');

    if (!searchSection || !searchResults) return;

    let searchTimeout = null;
    let isSearchVisible = false;

    // Initialize: Hide both search and search results
    const hideSearch = () => {
        isSearchVisible = false;
        
        // Clear any pending search timeout
        if (searchTimeout) {
            clearTimeout(searchTimeout);
            searchTimeout = null;
        }
        
        // Hide search results first
        searchResults.classList.remove('is-visible');
        
        // Then hide search form (faster timing to match transition)
        setTimeout(() => {
            searchSection.classList.remove('is-visible');
            if (searchInput) {
                searchInput.value = '';
            }
        }, 100);
    };

    const showSearch = () => {
        isSearchVisible = true;
        
        // Show search form
        searchSection.classList.add('is-visible');
        
        // Focus input after transition (faster timing to match transition)
        setTimeout(() => {
            if (searchInput) {
                searchInput.focus();
            }
        }, 200);
    };

    const showSearchResults = () => {
        // Only show results if search form is visible
        if (isSearchVisible) {
            searchResults.classList.add('is-visible');
        }
    };

    const hideSearchResults = () => {
        searchResults.classList.remove('is-visible');
    };

    // Handle input with 0.5s delay
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            
            // Clear existing timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            if (value.length > 0) {
                // Show results after 0.5s
                searchTimeout = setTimeout(() => {
                    showSearchResults();
                }, 300);
            } else {
                // Hide results immediately if input is empty
                hideSearchResults();
            }
        });
    }

    // Handle form submission
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    // Handle trigger buttons
    triggerButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (isSearchVisible) {
                hideSearch();
            } else {
                showSearch();
            }
        });
    });

    // Handle close button
    if (closeButton) {
        closeButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            hideSearch();
            hideSearchResults();
        });
    }

    // Handle click outside
    document.addEventListener('click', (e) => {
        if (!isSearchVisible) return;
        
        const clickedInsideSearch = searchSection.contains(e.target);
        const clickedInsideResults = searchResults.contains(e.target);
        const clickedTrigger = e.target.closest('[trigger-route="search"]');
        
        if (!clickedInsideSearch && !clickedInsideResults && !clickedTrigger) {
            hideSearch();
            hideSearchResults();
        }
    });

    // Initialize: Ensure both are hidden on load (without transitions)
    searchSection.style.transition = 'none';
    searchResults.style.transition = 'none';
    searchSection.classList.remove('is-visible');
    searchResults.classList.remove('is-visible');
    
    // Force reflow
    void searchSection.offsetHeight;
    void searchResults.offsetHeight;
    
    // Re-enable transitions
    searchSection.style.transition = '';
    searchResults.style.transition = '';
}