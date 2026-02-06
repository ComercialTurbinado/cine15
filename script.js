// Função para scroll suave até o formulário
function scrollToForm() {
    const formSection = document.getElementById('form');
    if (formSection) {
        formSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Máscara para telefone (WhatsApp)
function maskPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
        }
    }
    
    input.value = value;
}

// Configurar máscara de telefone quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    const whatsappInput = document.getElementById('whatsapp');
    
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function() {
            maskPhone(this);
        });
    }
    
    // Configurar data mínima como hoje
    const dataFestaInput = document.getElementById('dataFesta');
    if (dataFestaInput) {
        const today = new Date().toISOString().split('T')[0];
        dataFestaInput.setAttribute('min', today);
    }
    
    // Handle do formulário
    const form = document.getElementById('reservationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Efeito de scroll suave no navbar (adicionar sombra quando rolar)
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = '0 2px 20px rgba(212, 175, 55, 0.1)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });
});

// URL do Google Apps Script (Web App) - Substitua pela URL após publicar o script
// Como obter: Crie uma planilha > Extensões > Apps Script > Cole o código de google-apps-script.js > Implantar > Implantar como aplicativo da Web > Copie a URL
const SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbya0w-_Qn6SDsV9JBSDYigalKUO6sqEOtnzL1snLASEkenb7SxKtjAT_PZJ7g7DmzP6aw/exec';

// Função para lidar com o envio do formulário
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('reservationForm');
    const submitBtn = form.querySelector('.btn-submit');
    
    // Coletar dados do formulário
    const formData = {
        nome: document.getElementById('nome').value.trim(),
        whatsapp: document.getElementById('whatsapp').value.trim(),
        dataFesta: document.getElementById('dataFesta').value,
        tema: document.getElementById('tema').value,
        pacote: document.getElementById('pacote').value
    };
    
    // Validação básica
    if (!formData.nome || !formData.whatsapp || !formData.dataFesta || !formData.tema || !formData.pacote) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Estado de loading
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';
    
    try {
        // Enviar para Google Sheets via GET (funciona com no-cors; o Apps Script usa doGet(e) e e.parameter)
        if (SHEETS_WEB_APP_URL && SHEETS_WEB_APP_URL !== 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI') {
            const params = new URLSearchParams(formData);
            await fetch(SHEETS_WEB_APP_URL + '?' + params.toString(), { method: 'GET', mode: 'no-cors' });
        }
        
        // Salvar dados para a página de obrigado e WhatsApp
        sessionStorage.setItem('cine15_formData', JSON.stringify({
            nome: formData.nome,
            whatsapp: formData.whatsapp,
            dataFesta: formData.dataFesta,
            tema: formData.tema,
            pacote: formData.pacote
        }));
        
        // Redirecionar para página de obrigado
        window.location.href = 'obrigado.html';
        
    } catch (error) {
        console.error('Erro ao enviar:', error);
        // Mesmo com erro (ex: CORS), salva e redireciona para obrigado
        sessionStorage.setItem('cine15_formData', JSON.stringify({
            nome: formData.nome,
            whatsapp: formData.whatsapp,
            dataFesta: formData.dataFesta,
            tema: formData.tema,
            pacote: formData.pacote
        }));
        window.location.href = 'obrigado.html';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// Função auxiliar para formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Função auxiliar para obter label do tema
function getTemaLabel(value) {
    const temas = {
        'classico': 'Clássico',
        'balada': 'Balada',
        'jardim': 'Jardim',
        'outro': 'Outro'
    };
    return temas[value] || value;
}

// Função auxiliar para obter label do pacote
function getPacoteLabel(value) {
    const pacotes = {
        'silver': 'Silver',
        'gold': 'Gold',
        'diamond': 'Diamond'
    };
    return pacotes[value] || value;
}

// Função para mostrar mensagem de sucesso
function showSuccessMessage() {
    // Criar elemento de mensagem
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #D4AF37 0%, #E5E4E2 100%);
        color: #000;
        padding: 1.5rem 2rem;
        border-radius: 8px;
        box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
        z-index: 10000;
        font-weight: 600;
        text-align: center;
        max-width: 40%;
        animation: slideDown 0.3s ease;
    `;
    messageDiv.innerHTML = `
        <p style="margin: 0; font-size: 1.1rem;">
            ✅ Solicitação enviada com sucesso!<br>
            <small style="font-size: 0.9rem; opacity: 0.8;">Entraremos em contato em breve via WhatsApp.</small>
        </p>
    `;
    
    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateX(-50%) translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateX(-50%) translateY(0);
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(messageDiv);
    
    // Remover mensagem após 5 segundos
    setTimeout(() => {
        messageDiv.style.animation = 'slideDown 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
            document.head.removeChild(style);
        }, 300);
    }, 5000);
}

// Efeito de parallax removido para evitar sobreposição durante o scroll

// ============================================
// SISTEMA DE CARREGAMENTO SEQUENCIAL DE VÍDEO
// ============================================

class VideoChunkLoader {
    constructor(videoElement1, videoElement2, basePath = 'video', totalChunks = null, chunkSize = 400) {
        this.video1 = videoElement1;
        this.video2 = videoElement2;
        this.basePath = basePath;
        this.totalChunks = totalChunks; // null = detectar automaticamente
        this.chunkSize = chunkSize; // em KB
        this.currentChunkIndex = 0;
        this.currentVideo = 1; // 1 ou 2 - qual vídeo está ativo
        this.nextVideo = 2; // qual vídeo está sendo preparado
        this.loadedChunks = new Map(); // cache de chunks pré-carregados
        this.isTransitioning = false;
    }
    
    getActiveVideo() {
        return this.currentVideo === 1 ? this.video1 : this.video2;
    }
    
    getNextVideo() {
        return this.nextVideo === 1 ? this.video1 : this.video2;
    }
    
    swapVideos() {
        this.currentVideo = this.currentVideo === 1 ? 2 : 1;
        this.nextVideo = this.nextVideo === 1 ? 2 : 1;
    }

    async detectTotalChunks() {
        // Se totalChunks não foi especificado, tentar detectar
        if (this.totalChunks === null) {
            console.log('Detectando número de chunks...');
            // Tentar encontrar quantos chunks existem (máximo 20)
            for (let i = 1; i <= 20; i++) {
                const testPath = `${this.basePath}/video_chunk_${i}.mp4`;
                try {
                    const response = await fetch(testPath, { method: 'HEAD' });
                    if (!response.ok) {
                        // Se não encontrou, o total é i-1
                        this.totalChunks = i - 1;
                        console.log(`Chunk ${i} não encontrado. Total detectado: ${this.totalChunks}`);
                        break;
                    } else {
                        console.log(`Chunk ${i} encontrado`);
                    }
                } catch (error) {
                    // Se deu erro, o total é i-1
                    this.totalChunks = i - 1;
                    console.log(`Erro ao verificar chunk ${i}. Total detectado: ${this.totalChunks}`);
                    break;
                }
            }
            
            // Se não encontrou nenhum, usar fallback de 8 (baseado no que foi criado anteriormente)
            if (this.totalChunks === null || this.totalChunks === 0) {
                console.warn('Não foi possível detectar número de chunks, tentando usar 8 chunks');
                this.totalChunks = 8;
            } else {
                console.log(`✅ Detectados ${this.totalChunks} chunks de vídeo`);
            }
        }
    }

    async init() {
        try {
            // Detectar número de chunks se necessário
            await this.detectTotalChunks();
            
            // Configurar ambos os elementos de vídeo
            this.video1.loop = false;
            this.video1.muted = true;
            this.video1.playsInline = true;
            this.video1.preload = 'auto';
            
            this.video2.loop = false;
            this.video2.muted = true;
            this.video2.playsInline = true;
            this.video2.preload = 'auto';
            this.video2.classList.add('hero-video-hidden');

            // Configurar event listeners
            this.setupVideoListeners(this.video1);
            this.setupVideoListeners(this.video2);

            // Carregar e reproduzir o primeiro chunk no vídeo 1
            console.log('Iniciando carregamento do primeiro chunk...');
            await this.loadAndPlayChunk(1, this.video1);
            
            // Pré-carregar o segundo chunk no vídeo 2
            if (this.totalChunks > 1) {
                this.preloadChunk(2, this.video2);
            }
            
        } catch (error) {
            console.error('Erro ao inicializar carregamento de vídeo:', error);
            if (this.video1) this.video1.style.display = 'none';
            if (this.video2) this.video2.style.display = 'none';
        }
    }
    
    setupVideoListeners(video) {
        video.addEventListener('ended', () => {
            this.handleVideoEnded(video);
        });
        
        video.addEventListener('error', (e) => {
            console.error('Erro no vídeo:', e);
            // Tentar próximo chunk mesmo com erro
            setTimeout(() => this.handleVideoEnded(video), 300);
        });

        // Verificar se o próximo vídeo está pronto quando o atual estiver quase terminando
        video.addEventListener('timeupdate', () => {
            if (video === this.getActiveVideo() && !this.isTransitioning && video.duration) {
                const remaining = video.duration - video.currentTime;
                const nextChunk = this.currentChunkIndex + 1;
                const nextVideo = this.getNextVideo();
                
                // Se faltam menos de 0.5s, garantir que o próximo está pronto
                if (remaining < 0.5 && remaining > 0.01) {
                    if (nextChunk <= this.totalChunks || (nextChunk > this.totalChunks && nextVideo.src.includes('video_chunk_1'))) {
                        // Verificar se o próximo vídeo já está totalmente carregado
                        if (nextVideo.readyState < 4) {
                            console.log(`⚠️ Próximo vídeo ainda não está totalmente pronto (readyState: ${nextVideo.readyState})`);
                        }
                    }
                }
            }
        });
    }
    
    handleVideoEnded(video) {
        if (video === this.getActiveVideo() && !this.isTransitioning) {
            console.log(`🎬 Vídeo terminou: Chunk ${this.currentChunkIndex}`);
            const nextChunk = this.currentChunkIndex + 1;
            const nextVideo = this.getNextVideo();
            
            // Calcular qual é o próximo chunk (loop se necessário)
            let targetChunk = nextChunk;
            if (targetChunk > this.totalChunks) {
                targetChunk = 1; // Loop
            }
            
            // Verificar se o próximo vídeo já está totalmente carregado
            if (nextVideo.readyState >= 4) {
                console.log(`✅ Próximo vídeo está pronto, fazendo transição instantânea...`);
                this.instantTransition();
            } else if (nextVideo.readyState >= 3) {
                console.log(`⚠️ Próximo vídeo quase pronto (readyState: ${nextVideo.readyState}), fazendo transição...`);
                this.instantTransition();
            } else {
                // Se não está pronto, esperar um pouco e tentar
                console.log(`⏳ Próximo vídeo não está pronto (readyState: ${nextVideo.readyState}), aguardando...`);
                setTimeout(() => {
                    if (nextVideo.readyState >= 3) {
                        this.instantTransition();
                    } else {
                        // Carregar agora se ainda não estiver pronto
                        this.loadAndPlayChunk(targetChunk, nextVideo).then(() => {
                            this.instantTransition();
                        });
                    }
                }, 50);
            }
        }
    }

    async loadAndPlayChunk(chunkNumber, videoElement) {
        const chunkPath = `${this.basePath}/video_chunk_${chunkNumber}.mp4`;
        this.currentChunkIndex = chunkNumber;

        try {
            console.log(`[Vídeo ${videoElement.id}] Carregando chunk ${chunkNumber}/${this.totalChunks}...`);
            
            videoElement.src = chunkPath;
            videoElement.load();
            
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error(`Timeout ao carregar chunk ${chunkNumber}`));
                }, 15000);
                
                const onCanPlay = () => {
                    clearTimeout(timeout);
                    videoElement.removeEventListener('error', onError);
                    resolve();
                };
                
                const onError = (e) => {
                    clearTimeout(timeout);
                    videoElement.removeEventListener('canplay', onCanPlay);
                    console.error(`Erro ao carregar chunk ${chunkNumber}:`, e);
                    reject(new Error(`Erro ao carregar chunk ${chunkNumber}`));
                };

                videoElement.addEventListener('canplay', onCanPlay, { once: true });
                videoElement.addEventListener('error', onError, { once: true });
            });

            // Se for o vídeo ativo, mostrar e reproduzir
            const isActiveVideo = videoElement === this.getActiveVideo();
            console.log(`[Vídeo ${videoElement.id}] Chunk ${chunkNumber} carregado. É vídeo ativo? ${isActiveVideo}`);
            console.log(`[Vídeo ${videoElement.id}] ReadyState: ${videoElement.readyState}`);
            
            if (isActiveVideo) {
                // Remover todas as classes que possam esconder o vídeo
                videoElement.classList.remove('ready', 'hero-video-hidden');
                videoElement.classList.add('active');
                videoElement.currentTime = 0;
                
                // Garantir que o vídeo está visível
                videoElement.style.opacity = '0.3';
                videoElement.style.display = 'block';
                videoElement.style.visibility = 'visible';
                
                console.log(`[Vídeo ${videoElement.id}] Classes:`, videoElement.className);
                console.log(`[Vídeo ${videoElement.id}] Opacity:`, window.getComputedStyle(videoElement).opacity);
                
                try {
                    const playPromise = videoElement.play();
                    if (playPromise !== undefined) {
                        await playPromise;
                    }
                    console.log(`✅ [Vídeo ${videoElement.id}] Chunk ${chunkNumber} reproduzindo com sucesso!`);
                } catch (playError) {
                    console.warn('⚠️ Erro ao reproduzir automaticamente:', playError);
                    // Tentar novamente após um pequeno delay
                    setTimeout(async () => {
                        try {
                            const playPromise = videoElement.play();
                            if (playPromise !== undefined) {
                                await playPromise;
                            }
                            console.log(`✅ [Vídeo ${videoElement.id}] Chunk ${chunkNumber} reproduzindo após retry`);
                        } catch (e) {
                            console.error('❌ Erro ao reproduzir após retry:', e);
                        }
                    }, 500);
                }
            } else {
                // Se for o vídeo de standby, apenas marcar como ready
                videoElement.classList.remove('hero-video-hidden');
                videoElement.classList.add('ready');
                videoElement.style.opacity = '0'; // Manter oculto
            }

            // Pré-carregar próximo chunk no vídeo de standby
            const nextChunk = chunkNumber + 1;
            if (nextChunk <= this.totalChunks) {
                const nextVideo = this.getNextVideo();
                this.preloadChunk(nextChunk, nextVideo);
            } else if (nextChunk > this.totalChunks && chunkNumber === this.totalChunks) {
                // Se chegou no último, pré-carregar o primeiro no próximo vídeo para loop
                const nextVideo = this.getNextVideo();
                this.preloadChunk(1, nextVideo);
            }

        } catch (error) {
            console.error(`Erro ao carregar chunk ${chunkNumber}:`, error);
            // Tentar próximo chunk mesmo com erro
            if (chunkNumber < this.totalChunks) {
                setTimeout(() => {
                    const nextVideo = this.getNextVideo();
                    this.loadAndPlayChunk(chunkNumber + 1, nextVideo);
                }, 500);
            }
        }
    }
    
    async preloadChunk(chunkNumber, videoElement) {
        if (chunkNumber > this.totalChunks) {
            // Pré-carregar o primeiro para loop
            chunkNumber = 1;
        }
        
        // Se já está carregado, não precisa carregar novamente
        if (videoElement.src && videoElement.src.includes(`video_chunk_${chunkNumber}.mp4`)) {
            return;
        }
        
        const chunkPath = `${this.basePath}/video_chunk_${chunkNumber}.mp4`;
        
        try {
            console.log(`[Vídeo ${videoElement.id}] Pré-carregando chunk ${chunkNumber}...`);
            
            videoElement.src = chunkPath;
            videoElement.load();
            
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error(`Timeout ao pré-carregar chunk ${chunkNumber}`));
                }, 15000);
                
                const onCanPlay = () => {
                    clearTimeout(timeout);
                    videoElement.removeEventListener('error', onError);
                    videoElement.currentTime = 0; // Garantir que está no início
                    // Não adicionar classe 'ready' aqui, apenas garantir que não está oculto
                    if (!videoElement.classList.contains('active')) {
                        videoElement.classList.remove('hero-video-hidden');
                        videoElement.classList.add('ready');
                    }
                    console.log(`[Vídeo ${videoElement.id}] Chunk ${chunkNumber} pronto para reprodução`);
                    resolve();
                };
                
                const onError = (e) => {
                    clearTimeout(timeout);
                    videoElement.removeEventListener('canplay', onCanPlay);
                    reject(new Error(`Erro ao pré-carregar chunk ${chunkNumber}`));
                };

                videoElement.addEventListener('canplay', onCanPlay, { once: true });
                videoElement.addEventListener('error', onError, { once: true });
            });
            
        } catch (error) {
            console.error(`Erro ao pré-carregar chunk ${chunkNumber}:`, error);
        }
    }
    
    async instantTransition() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        const currentVideo = this.getActiveVideo();
        const nextVideo = this.getNextVideo();
        
        // Calcular próximo chunk
        let nextChunkNumber = this.currentChunkIndex + 1;
        if (nextChunkNumber > this.totalChunks) {
            nextChunkNumber = 1; // Loop
        }
        
        console.log(`🔄 Transição instantânea: Chunk ${this.currentChunkIndex} → Chunk ${nextChunkNumber}`);
        
        // Pausar e resetar o vídeo atual IMEDIATAMENTE
        currentVideo.pause();
        currentVideo.currentTime = 0;
        
        // Ocultar o vídeo atual INSTANTANEAMENTE (sem fade)
        currentVideo.classList.remove('active');
        currentVideo.classList.add('ready');
        currentVideo.style.opacity = '1';
        currentVideo.style.zIndex = '0';
        
        // Mostrar e reproduzir o próximo vídeo INSTANTANEAMENTE
        nextVideo.currentTime = 0;
        nextVideo.classList.remove('ready', 'hero-video-hidden');
        nextVideo.classList.add('active');
        nextVideo.style.opacity = '1';
        nextVideo.style.zIndex = '1';
        
        // Atualizar índice ANTES de trocar referências
        this.currentChunkIndex = nextChunkNumber;
        
        // Reproduzir o próximo vídeo IMEDIATAMENTE
        try {
            await nextVideo.play();
            console.log(`✅ Chunk ${nextChunkNumber} iniciado com sucesso`);
            
            // Trocar referências dos vídeos
            this.swapVideos();
            
            // Pré-carregar o próximo chunk no vídeo que ficou em standby
            const standbyVideo = this.getNextVideo();
            let chunkToPreload = this.currentChunkIndex + 1;
            if (chunkToPreload > this.totalChunks) {
                chunkToPreload = 1; // Loop
            }
            
            this.preloadChunk(chunkToPreload, standbyVideo);
            
        } catch (error) {
            console.error('❌ Erro ao reproduzir próximo vídeo:', error);
        }
        
        this.isTransitioning = false;
    }
}

// Inicializar carregamento de vídeo quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado, procurando elementos de vídeo...');
    const heroVideo1 = document.getElementById('heroVideo1');
    const heroVideo2 = document.getElementById('heroVideo2');
    
    console.log('heroVideo1 encontrado:', !!heroVideo1);
    console.log('heroVideo2 encontrado:', !!heroVideo2);
    
    if (heroVideo1 && heroVideo2) {
        console.log('✅ Ambos os vídeos encontrados, inicializando VideoChunkLoader...');
        // Configurações do vídeo
        // Ajuste o basePath conforme a estrutura de pastas do seu projeto
        // Exemplo: se os chunks estão em /videos/, use 'videos'
        const videoLoader = new VideoChunkLoader(
            heroVideo1,
            heroVideo2,
            'video',        // Caminho base dos chunks (ajuste conforme necessário)
            null,           // null = detectar automaticamente quantos chunks existem
            400             // Tamanho aproximado de cada chunk em KB
        );

        // Iniciar carregamento
        videoLoader.init().catch(error => {
            console.error('❌ Erro ao inicializar carregamento de vídeo:', error);
            console.error('Stack:', error.stack);
            if (heroVideo1) heroVideo1.style.display = 'none';
            if (heroVideo2) heroVideo2.style.display = 'none';
        });
    } else {
        console.error('❌ Elementos de vídeo não encontrados!');
        console.error('heroVideo1:', heroVideo1);
        console.error('heroVideo2:', heroVideo2);
    }

    // ============================================
    // PORTFOLIO - Modal de Vídeo Local (sem download)
    // ============================================
    const portfolioGrid = document.querySelector('.portfolio-grid');
    const videoSources = {
        video1: 'portifolio/Menina-1.webm',
        video2: 'portifolio/Menina-3_1.webm',
        video3: 'portifolio/menina-4_4.webm'
    };
    let videoModal = null;
    let modalVideo = null;

    function createVideoModal() {
        const modal = document.createElement('div');
        modal.className = 'video-popup-modal';
        modal.id = 'videoPopupModal';
        modal.innerHTML = `
            <div class="video-popup-overlay"></div>
            <div class="video-popup-content">
                <button class="video-popup-close" aria-label="Fechar">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
                <div class="video-popup-player">
                    <video controls preload="none" controlsList="nodownload" disablePictureInPicture disableRemotePlayback playsinline>
                    </video>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const video = modal.querySelector('video');
        const closeBtn = modal.querySelector('.video-popup-close');
        const overlay = modal.querySelector('.video-popup-overlay');

        closeBtn.addEventListener('click', () => closeVideoModal());
        overlay.addEventListener('click', () => closeVideoModal());
        video.addEventListener('click', (e) => e.stopPropagation());
        video.addEventListener('contextmenu', (e) => e.preventDefault());

        const escHandler = (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) closeVideoModal();
        };
        document.addEventListener('keydown', escHandler);
        modal._escHandler = escHandler;

        return { modal, video };
    }

    function openVideoModal(videoSrc) {
        if (!videoSrc) return;
        if (!videoModal) {
            const elements = createVideoModal();
            videoModal = elements.modal;
            modalVideo = elements.video;
        }
        document.body.style.overflow = 'hidden';
        videoModal.classList.add('active');
        requestAnimationFrame(() => {
            modalVideo.src = videoSrc;
            modalVideo.load();
            const playWhenReady = () => modalVideo.play().catch(() => {});
            if (modalVideo.readyState >= 2) playWhenReady();
            else modalVideo.addEventListener('loadeddata', playWhenReady, { once: true });
        });
    }

    function closeVideoModal() {
        if (!videoModal || !modalVideo) return;
        modalVideo.pause();
        modalVideo.currentTime = 0;
        modalVideo.src = '';
        modalVideo.load();
        videoModal.classList.remove('active');
        document.body.style.overflow = '';
        if (videoModal._escHandler) {
            document.removeEventListener('keydown', videoModal._escHandler);
            delete videoModal._escHandler;
        }
        setTimeout(() => {
            if (videoModal && !videoModal.classList.contains('active')) {
                videoModal.remove();
                videoModal = null;
                modalVideo = null;
            }
        }, 300);
    }

    if (portfolioGrid) {
        portfolioGrid.addEventListener('click', function(e) {
            const card = e.target.closest('.portfolio-card');
            if (!card) return;
            const videoId = card.getAttribute('data-video');
            const videoSrc = videoSources[videoId];
            if (videoSrc) openVideoModal(videoSrc);
        });
    }
});

