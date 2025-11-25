export default function headerDefault() {
    const header = document.querySelector('header[header-type="default"]');
    if (header) {
        header.classList.add('header-default');
    }
}