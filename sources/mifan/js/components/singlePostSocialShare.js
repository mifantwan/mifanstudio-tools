export default function singlePostSocialShare() {
    const socialShareButtons = document.querySelectorAll('.button--social-share');
    
    if (socialShareButtons.length === 0) return;
    
    socialShareButtons.forEach(button => {
        button.addEventListener('click', () => {
            const socialShare = button.getAttribute('social-share');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            
            let shareUrl = '';
            
            switch(socialShare) {
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?text=${title}%20${url}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                default:
                    console.warn('Unknown social share platform:', socialShare);
                    return;
            }
            
            window.open(shareUrl, '_blank', 'width=600,height=400');
        });
    });
}