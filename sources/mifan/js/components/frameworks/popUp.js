export default function popUp() {
    const popUps = document.querySelectorAll('.mifan-popup');
    popUps.forEach(popUp => {
        popUp.addEventListener('click', () => {
            popUp.classList.remove('show');
        });
    });
}