export default class VideoWidget {
    constructor() {
        this.videoWidget = document.getElementById('video-widget')
        if (!this.videoWidget) return
        this.init()
    }

    init() {
        const videoContainers = this.videoWidget.querySelectorAll('.video--content')
        videoContainers.forEach(container => this.setupContainer(container))
    }

    setupContainer(container) {
        const iframe = container.querySelector('iframe')
        if (!iframe) return

        const playButton = this.createPlayButton()
        container.appendChild(playButton)
        container.dataset.playing = 'false'

        container.addEventListener('click', () => this.handleVideoClick(iframe, playButton))
    }

    createPlayButton() {
        const button = document.createElement('button')
        button.className = 'video-play-button'
        button.setAttribute('aria-label', 'Play video')
        button.innerHTML = '<svg width="19" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="white"/></svg>'
        return button
    }

    handleVideoClick(iframe, playButton) {
        const container = iframe.closest('.video--content')
        const isPlaying = container.dataset.playing === 'true'
        
        if (isPlaying) {
            this.updateVideo(iframe, playButton, container, false)
        } else {
            this.pauseOtherVideos()
            this.updateVideo(iframe, playButton, container, true)
        }
    }

    updateVideo(iframe, playButton, container, play) {
        // Update iframe src
        const currentSrc = iframe.src.replace(/[?&]autoplay=1/, '')
        iframe.src = play ? `${currentSrc}${currentSrc.includes('?') ? '&' : '?'}autoplay=1` : currentSrc

        // Update UI
        playButton.innerHTML = play ? 
            '<svg width="19" height="16" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.2087 10.0031C16.2093 10.2506 16.1458 10.4942 16.0244 10.7099C15.903 10.9257 15.7279 11.1064 15.516 11.2344L2.38366 19.268C2.16225 19.4036 1.90867 19.4776 1.64909 19.4824C1.38952 19.4872 1.13337 19.4227 0.907097 19.2954C0.682978 19.1701 0.49628 18.9873 0.366204 18.7659C0.236128 18.5446 0.167367 18.2925 0.166992 18.0357V1.97038C0.167367 1.71361 0.236128 1.46157 0.366204 1.24018C0.49628 1.0188 0.682978 0.836051 0.907097 0.710741C1.13337 0.583455 1.38952 0.518881 1.64909 0.523688C1.90867 0.528494 2.16225 0.602508 2.38366 0.738085L15.516 8.77168C15.7279 8.89971 15.903 9.08041 16.0244 9.29619C16.1458 9.51196 16.2093 9.75548 16.2087 10.0031Z" fill="white"/></svg>' :
            '<svg width="19" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5V19L19 12L8 5Z" fill="white"/></svg>'
        
        playButton.style.background = play ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.7)'
        playButton.setAttribute('aria-label', play ? 'Pause video' : 'Play video')
        container.dataset.playing = play.toString()
    }

    pauseOtherVideos() {
        this.videoWidget.querySelectorAll('.video--content[data-playing="true"]').forEach(container => {
            const iframe = container.querySelector('iframe')
            const playButton = container.querySelector('.video-play-button')
            this.updateVideo(iframe, playButton, container, false)
        })
    }
}