let config = {};

document.addEventListener('DOMContentLoaded', async function() {
    await loadConfig();
    
    const musicAlbum = document.querySelector('.music-album');
    const musicTitle = document.querySelector('.music-title');
    const musicArtist = document.querySelector('.music-artist');
    const progressBar = document.querySelector('.progress');
    const progressBarContainer = document.querySelector('.progress-bar');
    const currentTimeEl = document.querySelector('.time-stamps span:first-child');
    const totalTimeEl = document.querySelector('.time-stamps span:last-child');
    const playPauseBtn = document.querySelector('.control-button.play-pause');
    const prevBtn = document.querySelector('.control-buttons .control-button:first-child');
    const nextBtn = document.querySelector('.control-buttons .control-button:last-child');
    const volumeSlider = document.querySelector('.volume-slider');
    const volumeLevel = document.querySelector('.volume-level');

    const backgroundElement = document.querySelector('.background');
    const youtubeIframe = document.querySelector('.background-iframe');
    const backgroundImages = document.querySelectorAll('.bg-image');
    const bgSwitchBtn = document.getElementById('bgSwitchBtn');

    let currentBgMode = 'youtube'; 
    let currentImageIndex = 0;
    let bgInterval;

    const loadingBar = document.querySelector('.loading-progress');
    const loadingText = document.querySelector('.loading-text');
    const galleryImagesEl = document.querySelectorAll('.gallery-image');

    const audio = new Audio();
    let currentSongIndex = 0;
    let isPlaying = false;

    let resourceCount = 0;
    let resourcesLoaded = 0;

    updateUIFromConfig();

    if (bgSwitchBtn) {
        bgSwitchBtn.addEventListener('click', toggleBackground);
    }

    function toggleBackground() {
        const iframe = document.querySelector('.background-iframe');
    
        if (currentBgMode === 'youtube') {
            currentBgMode = 'images';
            backgroundElement.classList.remove('youtube-active');
            backgroundElement.classList.add('images-active');
    
            // iframe'i görünmez yap
            if (iframe) {
                iframe.style.opacity = '0';
            }
    
            showBackgroundImage(0);
            startBackgroundSlideshow();
    
        } else {
            currentBgMode = 'youtube';
            backgroundElement.classList.add('youtube-active');
            backgroundElement.classList.remove('images-active');
    
            clearInterval(bgInterval);
    
            // iframe src tekrar atanırsa gerekirse yeniden başlat
            if (iframe && config.youtubeVideo) {
                iframe.style.opacity = '1';
                iframe.src = `https://www.youtube.com/embed/${config.youtubeVideo}?autoplay=1&mute=1&controls=0&showinfo=0&loop=1&playlist=${config.youtubeVideo}&disablekb=1&modestbranding=1&iv_load_policy=3`;
            }
        }
    }
    
      
    function startBackgroundSlideshow() {
        clearInterval(bgInterval); 
        
        bgInterval = setInterval(() => {
            currentImageIndex = (currentImageIndex + 1) % backgroundImages.length;
            showBackgroundImage(currentImageIndex);
        }, 8000); 
    }

    function showBackgroundImage(index) {
        backgroundImages.forEach(img => {
            img.classList.remove('active');
        });
        
        if (backgroundImages[index]) {
            backgroundImages[index].classList.add('active');
        }
    }

    function loadBackgroundImages() {
        if (config.backgroundImages && config.backgroundImages.length > 0) {
            backgroundImages.forEach((imgEl, index) => {
                if (config.backgroundImages[index]) {
                    imgEl.style.backgroundImage = `url('${config.backgroundImages[index]}')`;
                }
            });
        }
        
        backgroundElement.classList.add('youtube-active');
    }

    function displayTeamMembers() {
        const teamMembersContainer = document.querySelector('.team-members');
        if (!teamMembersContainer) return; 
        
        teamMembersContainer.innerHTML = '';
        
        config.teamMembers.forEach(member => {
            const memberElement = document.createElement('div');
            memberElement.className = 'team-member';
            
            memberElement.innerHTML = `
                <div class="team-avatar" style="background-image: url('${member.avatar}');"></div>
                <div class="team-name">${member.name}</div>
            `;
            
            teamMembersContainer.appendChild(memberElement);
        });
    }

    function updateLoadingBar() {
        const progress = (resourcesLoaded / resourceCount) * 100;
        loadingBar.style.width = progress + '%';
        loadingText.textContent = `Yükleniyor... ${Math.floor(progress)}%`;
        
        if (progress >= 100) {
            loadingText.textContent = 'Sunucuya bağlanılıyor...';
            setTimeout(() => {
                loadingText.textContent = 'Tamamlandı!';
            }, 2000);
        }
    }

    function simulateLoading() {
        let progress = 0;
        const interval = setInterval(function() {
            progress += Math.random() * 2;
            if (progress > 100) {
                progress = 100;
                clearInterval(interval);
            }
            
            resourcesLoaded = progress / 100;
            updateLoadingBar();
        }, 200);
    }

    function initGallery() {
        galleryImagesEl.forEach((img, index) => {
            if (config.galleryImages[index]) {
                img.style.backgroundImage = `url(${config.galleryImages[index]})`;
            }
        });
        
        let currentGalleryIndex = 3; 
        setInterval(() => {
            const randomImgIndex = Math.floor(Math.random() * galleryImagesEl.length);
            currentGalleryIndex = (currentGalleryIndex + 1) % config.galleryImages.length;
            
            galleryImagesEl[randomImgIndex].style.opacity = 0;
            setTimeout(() => {
                galleryImagesEl[randomImgIndex].style.backgroundImage = `url(${config.galleryImages[currentGalleryIndex]})`;
                galleryImagesEl[randomImgIndex].style.opacity = 1;
            }, 500);
        }, 5000);
    }

    function initMusicPlayer() {
        loadSong(currentSongIndex);
        
        audio.volume = 0.7;
        volumeLevel.style.width = '70%';
        
        playPauseBtn.addEventListener('click', togglePlayPause);
        prevBtn.addEventListener('click', prevSong);
        nextBtn.addEventListener('click', nextSong);
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', nextSong);
        
        progressBarContainer.addEventListener('click', setProgress);
        
        volumeSlider.addEventListener('click', setVolume);
        
        togglePlayPause();
    }

    function loadSong(index) {
        const song = config.songs[index];
        musicTitle.textContent = song.title;
        musicArtist.textContent = song.artist;
        
        try {
            musicAlbum.style.backgroundImage = `url(${song.cover})`;
        } catch (e) {
            musicAlbum.style.backgroundColor = '#333';
        }
        
        audio.src = song.file;
        audio.load();
    }

    function togglePlayPause() {
        if (isPlaying) {
            playPauseBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>`;
            audio.pause();
        } else {
            playPauseBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="6" y="4" width="4" height="16"></rect>
                    <rect x="14" y="4" width="4" height="16"></rect>
                </svg>`;
            audio.play().catch(e => {
                console.log("Otomatik oynatma engellendi, kullanıcı etkileşimi gerekiyor:", e);
            });
        }
        
        isPlaying = !isPlaying;
    }

    function nextSong() {
        currentSongIndex = (currentSongIndex + 1) % config.songs.length;
        loadSong(currentSongIndex);
        
        if (isPlaying) {
            audio.play();
        }
    }

    function prevSong() {
        currentSongIndex = (currentSongIndex - 1 + config.songs.length) % config.songs.length;
        loadSong(currentSongIndex);
        
        if (isPlaying) {
            audio.play();
        }
    }

    function updateProgress() {
        const { duration, currentTime } = audio;
        if (duration) {
            const progressPercent = (currentTime / duration) * 100;
            progressBar.style.width = `${progressPercent}%`;
            
            currentTimeEl.textContent = formatTime(currentTime);
            totalTimeEl.textContent = formatTime(duration);
        }
    }

    function setProgress(e) {
        if (!audio.duration) return;
        
        const width = this.clientWidth;
        const clickX = e.offsetX;
        const duration = audio.duration;
        
        audio.currentTime = (clickX / width) * duration;
        
        const progressPercent = (audio.currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        
        currentTimeEl.textContent = formatTime(audio.currentTime);
    }
    
    progressBarContainer.addEventListener('mousedown', function(e) {
        setProgress.call(this, e);
        
        const onMouseMove = function(moveEvent) {
            setProgress.call(progressBarContainer, moveEvent);
        };
        
        const onMouseUp = function() {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    function setVolume(e) {
        const width = this.clientWidth;
        const clickX = e.offsetX;
        
        const volumeValue = Math.max(0, Math.min(1, clickX / width));
        audio.volume = volumeValue;
        
        volumeLevel.style.width = (volumeValue * 100) + '%';
    }
    
    volumeSlider.addEventListener('mousedown', function(e) {
        document.addEventListener('mousemove', volumeDrag);
        document.addEventListener('mouseup', function() {
            document.removeEventListener('mousemove', volumeDrag);
        });
        
        setVolume.call(this, e);
    });

    function volumeDrag(e) {
        const rect = volumeSlider.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        
        const width = volumeSlider.clientWidth;
        const volumeValue = Math.max(0, Math.min(1, offsetX / width));
        
        audio.volume = volumeValue;
        volumeLevel.style.width = (volumeValue * 100) + '%';
    }

    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    async function loadConfig() {
        try {
            const response = await fetch('config.json');
            config = await response.json();
            console.log('Config yüklendi:', config);
        } catch (error) {
            console.error('Config yüklenirken hata oluştu:', error);
            useDefaultConfig();
        }
    }

    function useDefaultConfig() {
        config = {
            serverName: "Baran",
            serverSlogan: "Loading Screen",
            youtubeVideo: "ioOqxSZb3vI",
            
            backgroundImages: [
                "img/backgrounds/bg1.jpg",
                "img/backgrounds/bg2.jpg",
                "img/backgrounds/bg3.jpg",
                "img/backgrounds/bg4.jpg",
                "img/backgrounds/bg5.jpg"
            ],
            
            teamMembers: [
                { name: "Admin 1", avatar: "img/team/admin1.jpg" },
                { name: "Admin 2", avatar: "img/team/admin2.jpg" },
                { name: "Admin 3", avatar: "img/team/admin3.jpg" },
                { name: "Admin 4", avatar: "img/team/admin4.jpg" }
            ],
            
            songs: [
                { title: "ŞARKI 1 BURAYI EDITLE", artist: "Baran", file: "music/music1.mp3", cover: "img/covers/music1.jpg" },
                { title: "ŞARKI 2 BURAYI EDITLE", artist: "Baran", file: "music/music2.mp3", cover: "img/covers/music2.jpg" }
                // { title: "ŞARKI 3 BURAYI EDITLE", artist: "Baran", file: "music/music3.mp3", cover: "img/covers/music3.jpg" },
                // { title: "ŞARKI 4 BURAYI EDITLE", artist: "Baran", file: "music/music4.mp3", cover: "img/covers/music4.jpg" }
            ],
            
            galleryImages: [
                "img/gallery/image1.jpg", 
                "img/gallery/image2.jpg", 
                "img/gallery/image3.jpg",
                "img/gallery/image4.jpg", 
                "img/gallery/image5.jpg", 
                "img/gallery/image6.jpg"
            ],
            
            serverRules: [
                { title: "Kural 1", text: "Diğer oyunculara saygılı olun." },
                { title: "Kural 2", text: "Hile kullanmak yasaktır." }
            ],
            
            announcement: {
                title: "Güncelleme",
                text: "Yeni güncelleme yayınlandı!"
            },
            
            socialLinks: [
                { name: "Discord", icon: "discord", text: "Discord sunucumuza katılın." },
                { name: "Instagram", icon: "instagram", text: "Instagram sayfamızı takip edin." },
                { name: "YouTube", icon: "youtube", text: "YouTube kanalımızı ziyaret edin." }
            ]
        };
    }

    function updateUIFromConfig() {
        if (config.serverName) {
            document.title = config.serverName + " - Loading Screen";
            const serverNameEl = document.querySelector('.server-name h1');
            if (serverNameEl) serverNameEl.textContent = config.serverName;
        }
        
        if (config.serverSlogan) {
            const serverSloganEl = document.querySelector('.server-name h2');
            if (serverSloganEl) serverSloganEl.textContent = config.serverSlogan;
        }
        
        if (config.youtubeVideo) {
            const iframe = document.querySelector('.background-iframe');
            if (iframe) {
                iframe.src = `https://www.youtube.com/embed/${config.youtubeVideo}?autoplay=1&mute=1&controls=0&showinfo=0&loop=1&playlist=${config.youtubeVideo}&disablekb=1&modestbranding=1&iv_load_policy=3`;
            }
        }
        
        loadBackgroundImages();
        
        if (config.keyButtons && config.keyButtons.length > 0) {
            const keyButtonsContainer = document.querySelector('.key-buttons');
            if (keyButtonsContainer) {
                keyButtonsContainer.innerHTML = '';
                config.keyButtons.forEach(button => {
                    const buttonEl = document.createElement('div');
                    buttonEl.className = 'key-button';
                    buttonEl.innerHTML = `
                        <p>${button.key}</p>
                        <p>${button.label}</p>
                    `;
                    keyButtonsContainer.appendChild(buttonEl);
                });
            }
        }
        
        if (config.socialLinks && config.socialLinks.length > 0) {
            const socialLinksContainer = document.querySelector('.social-links');
            if (socialLinksContainer) {
                socialLinksContainer.innerHTML = '';
                config.socialLinks.forEach(link => {
                    const linkEl = document.createElement('div');
                    linkEl.className = 'social-link';
                    
                    let iconSvg = '';
                    if (link.icon === 'discord') {
                        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7289DA" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>`;
                    } else if (link.icon === 'instagram') {
                        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E1306C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>`;
                    } else if (link.icon === 'youtube') {
                        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF0000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                            <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </svg>`;
                    }
                    
                    linkEl.innerHTML = `
                        <div class="social-icon">${iconSvg}</div>
                        <div class="social-text">${link.text}</div>
                    `;
                    socialLinksContainer.appendChild(linkEl);
                });
            }
        }
        
        if (config.announcement) {
            const announcementTitle = document.querySelector('.announcement-title');
            const announcementText = document.querySelector('.announcement-text');
            
            if (announcementTitle) announcementTitle.textContent = config.announcement.title;
            if (announcementText) announcementText.textContent = config.announcement.text;
        }
        
        if (config.serverRules && config.serverRules.length > 0) {
            const rulesListContainer = document.querySelector('.rules-list');
            if (rulesListContainer) {
                rulesListContainer.innerHTML = '';
                config.serverRules.forEach(rule => {
                    const ruleEl = document.createElement('div');
                    ruleEl.className = 'rule';
                    ruleEl.innerHTML = `
                        <div class="rule-title">${rule.title}</div>
                        <div class="rule-text">${rule.text}</div>
                    `;
                    rulesListContainer.appendChild(ruleEl);
                });
            }
        }
        
        initMusicPlayer();
        initGallery();
        displayTeamMembers();
    }
});