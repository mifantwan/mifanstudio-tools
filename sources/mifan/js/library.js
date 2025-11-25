// Import
import '../sass/library.sass'
// Start of Selection
const initLibraryList = [];

// DOM Ready listener
const onDOMContentLoaded = () => initLibraryList.length && initLibraryList.forEach(func => func());

document.readyState === 'loading' 
    ? document.addEventListener('DOMContentLoaded', onDOMContentLoaded)
    : onDOMContentLoaded();