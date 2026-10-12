/* ============================================
   K-POP WAVE PHOTOBOOTH - APPLICATION LOGIC
   Multi-frame support with 4 unique designs
   ============================================ */

(function () {
    'use strict';

    // =============================================
    // FRAME DEFINITIONS
    // =============================================
    const FRAMES = [
        {
            id: 'toystory',
            name: 'Toy Story',
            icon: '🤠',
            slots: 3,
            layout: 'vertical',
            thumbBg: '#0c3494',
            slotColors: ['#e52521', '#facc15', '#22c55e'],
            slotBgs: ['#c6e9fc', '#c6e9fc', '#c6e9fc'],
            stickers: [
                { emoji: '🤠', pos: 'pos-tl' },
                { emoji: '🚀', pos: 'pos-tr' },
                { emoji: '👾', pos: 'pos-br' },
            ],
            labels: ['Woody & Jessie', 'Buzz Lightyear', 'Aliens'],
        },
        {
            id: 'kpop',
            name: 'K-Pop Wave',
            icon: '🎵',
            slots: 4,
            layout: 'grid', // 2x2
            thumbBg: '#2dd4a0',
            slotColors: ['#f87171', '#7bc8a4', '#a3e635', '#f87171'],
            slotBgs: ['#fecaca', '#d4edda', '#d9f99d', '#fecaca'],
            stickers: [
                { emoji: '☁️', pos: 'pos-tr' },
                { emoji: '⭐', pos: 'pos-tl' },
                { emoji: '💖', pos: 'pos-br' },
                { emoji: '🎵', pos: 'pos-bl' },
            ],
            labels: ['안녕하세요!', "Let's sing together!", '화이팅!', '감사합니다~ OMG'],
        },
        {
            id: 'mono',
            name: 'Monochrome',
            icon: '🖤',
            slots: 4,
            layout: 'grid',
            thumbBg: '#1a1a1a',
            slotColors: ['#e0e0e0', '#e0e0e0', '#e0e0e0', '#e0e0e0'],
            slotBgs: ['#2a2a2a', '#2a2a2a', '#2a2a2a', '#2a2a2a'],
            stickers: [
                { emoji: '✦', pos: 'pos-tr' },
                { emoji: '★', pos: 'pos-tl' },
                { emoji: '♡', pos: 'pos-br' },
                { emoji: '⚡', pos: 'pos-bl' },
            ],
            labels: ['Favorite!', 'My star ★', 'Bias wrecker', 'stan forever'],
        },
        {
            id: 'retro',
            name: 'Retro Diary',
            icon: '🍒',
            slots: 3,
            layout: 'vertical',
            thumbBg: '#faf3e8',
            slotColors: ['#d4d4d4', '#d4d4d4', '#d4d4d4'],
            slotBgs: ['#eee', '#eee', '#eee'],
            stickers: [
                { emoji: '🍒', pos: 'pos-tr' },
                { emoji: '🍓', pos: 'pos-tl' },
                { emoji: '💌', pos: 'pos-br' },
            ],
            labels: ['favorite person ♡', 'memories~', 'my girl!'],
        },
        {
            id: 'cartoon',
            name: 'Cartoon Fun',
            icon: '⭐',
            slots: 3,
            layout: 'vertical',
            thumbBg: '#fbbf24',
            slotColors: ['#3b82f6', '#3b82f6', '#3b82f6'],
            slotBgs: ['#e0f2fe', '#e0f2fe', '#e0f2fe'],
            stickers: [
                { emoji: '☁️', pos: 'pos-tr' },
                { emoji: '⭐', pos: 'pos-tl' },
                { emoji: '🌈', pos: 'pos-br' },
            ],
            labels: ['#awesome!', '!? wow', 'fun time ★'],
        },
    ];

    // =============================================
    // DOM ELEMENTS
    // =============================================
    const webcam = document.getElementById('webcam');
    const snapshotCanvas = document.getElementById('snapshotCanvas');
    const countdownOverlay = document.getElementById('countdownOverlay');
    const countdownNumber = document.getElementById('countdownNumber');
    const flashOverlay = document.getElementById('flashOverlay');
    const btnCapture = document.getElementById('btnCapture');
    const btnDownload = document.getElementById('btnDownload');
    const btnReset = document.getElementById('btnReset');
    const photoCountEl = document.getElementById('photoCount');
    const photoTotalEl = document.getElementById('photoTotal');
    const stripContainer = document.getElementById('stripContainer');
    const frameOptionsEl = document.getElementById('frameOptions');
    const finalCanvas = document.getElementById('finalCanvas');
    const bgParticles = document.getElementById('bgParticles');

    // =============================================
    // STATE
    // =============================================
    let currentFrameIndex = 0;
    let photoCount = 0;
    let photos = [null, null, null, null]; // max 4 slots
    let currentFilterCSS = '';
    let timerSeconds = 3;
    let isCapturing = false;
    let stream = null;

    // =============================================
    // INIT
    // =============================================
    function init() {
        initParticles();
        initWebcam();
        buildFrameSelector();
        selectFrame(0);
        bindEvents();
    }

    // =============================================
    // PARTICLES
    // =============================================
    function initParticles() {
        const colors = ['#2dd4a0', '#ff6b9d', '#fbbf24', '#60a5fa', '#a78bfa'];
        for (let i = 0; i < 18; i++) {
            const p = document.createElement('div');
            p.classList.add('particle');
            const size = Math.random() * 7 + 3;
            p.style.width = size + 'px';
            p.style.height = size + 'px';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (Math.random() * 15 + 10) + 's';
            p.style.animationDelay = (Math.random() * 10) + 's';
            bgParticles.appendChild(p);
        }
    }

    // =============================================
    // WEBCAM
    // =============================================
    async function initWebcam() {
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 960 }, facingMode: 'user' },
                audio: false,
            });
            webcam.srcObject = stream;
            webcam.addEventListener('loadeddata', () => { btnCapture.disabled = false; });
        } catch (err) {
            console.error('Camera error:', err);
            alert('Cannot access camera. Please allow camera permissions and reload.');
        }
    }

    // =============================================
    // FRAME SELECTOR
    // =============================================
    function buildFrameSelector() {
        frameOptionsEl.innerHTML = '';
        FRAMES.forEach((frame, idx) => {
            const btn = document.createElement('button');
            btn.className = 'frame-option' + (idx === 0 ? ' active' : '');
            btn.dataset.frameIndex = idx;

            const thumbDiv = document.createElement('div');
            thumbDiv.className = 'frame-thumb';
            thumbDiv.style.background = frame.thumbBg;

            if (frame.layout === 'grid') {
                const grid = document.createElement('div');
                grid.className = 'frame-thumb-grid';
                for (let i = 0; i < 4; i++) {
                    const slot = document.createElement('div');
                    slot.className = 'thumb-slot';
                    slot.style.borderColor = frame.slotColors[i] || '#ccc';
                    grid.appendChild(slot);
                }
                thumbDiv.appendChild(grid);
            } else {
                const vert = document.createElement('div');
                vert.className = 'frame-thumb-vert';
                for (let i = 0; i < 3; i++) {
                    const slot = document.createElement('div');
                    slot.className = 'thumb-slot';
                    slot.style.borderColor = frame.slotColors[i] || '#ccc';
                    vert.appendChild(slot);
                }
                thumbDiv.appendChild(vert);
            }

            const nameSpan = document.createElement('span');
            nameSpan.className = 'frame-option-name';
            nameSpan.textContent = frame.icon + ' ' + frame.name;

            btn.appendChild(thumbDiv);
            btn.appendChild(nameSpan);
            frameOptionsEl.appendChild(btn);
        });
    }

    function selectFrame(index) {
        currentFrameIndex = index;
        const frame = FRAMES[index];

        // Update frame selector active state
        document.querySelectorAll('.frame-option').forEach((btn, i) => {
            btn.classList.toggle('active', i === index);
        });

        // Update photo total
        photoTotalEl.textContent = frame.slots;

        // Reset photos if switching to a frame with fewer slots than current photos
        // Keep existing photos when possible
        resetBooth();

        // Build strip preview
        buildStripPreview(frame);
    }

    // =============================================
    // STRIP PREVIEW BUILDER
    // =============================================
    function buildStripPreview(frame) {
        // Remove all frame classes
        stripContainer.className = 'strip-container frame-' + frame.id;

        const now = new Date();
        const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        let html = '';

        // Toy Story special template preview
        if (frame.id === 'toystory') {
            html += `<div class="toystory-slots-wrapper">
                <div class="photo-slot slot-0" id="photoSlot0">
                    <div class="slot-placeholder"><span>1</span></div>
                </div>
                <div class="photo-slot slot-1" id="photoSlot1">
                    <div class="slot-placeholder"><span>2</span></div>
                </div>
                <div class="photo-slot slot-2" id="photoSlot2">
                    <div class="slot-placeholder"><span>3</span></div>
                </div>
            </div>
            <img src="assets/toystory_overlay.png" class="toystory-overlay-img" alt="Toy Story Frame" />`;
            stripContainer.innerHTML = html;
            return;
        }

        // Header (shared)
        html += `<div class="strip-header">
            <div class="strip-date">${dateStr}</div>
            <div class="strip-badge">+82-🇰🇷</div>
        </div>`;

        // Frame-specific decorations (before slots)
        if (frame.id === 'mono') {
            html += `<span class="mono-deco-star">✦</span>`;
            html += `<span class="mono-deco-star">★</span>`;
            html += `<span class="mono-deco-star">✧</span>`;
        }
        if (frame.id === 'cartoon') {
            html += `<div class="cartoon-stripe red"></div>`;
        }

        // Photo slots
        const slotsClass = frame.layout === 'grid' ? 'photo-slots-grid' : 'photo-slots-vert';

        if (frame.id === 'cartoon') {
            // Cartoon: interleave slots with stripe bands
            const stripeSeq = ['blue', 'red'];
            for (let i = 0; i < frame.slots; i++) {
                const sticker = frame.stickers[i] || {};
                const label = frame.labels[i] || '';
                html += `<div class="${slotsClass}">
                    <div class="photo-slot slot-${i}" id="photoSlot${i}">
                        <div class="slot-placeholder"><span>${i + 1}</span></div>
                        ${sticker.emoji ? `<div class="slot-sticker ${sticker.pos}">${sticker.emoji}</div>` : ''}
                        <div class="slot-label">${label}</div>
                    </div>
                </div>`;
                if (i < frame.slots - 1) {
                    html += `<div class="cartoon-stripe ${stripeSeq[i % 2]}"></div>`;
                }
            }
            html += `<div class="cartoon-stripe blue"></div>`;
        } else {
            // Normal: all slots in one container
            html += `<div class="${slotsClass}">`;
            for (let i = 0; i < frame.slots; i++) {
                const sticker = frame.stickers[i] || {};
                const label = frame.labels[i] || '';
                html += `<div class="photo-slot slot-${i}" id="photoSlot${i}">
                    <div class="slot-placeholder"><span>${i + 1}</span></div>
                    ${sticker.emoji ? `<div class="slot-sticker ${sticker.pos}">${sticker.emoji}</div>` : ''}
                    <div class="slot-label">${label}</div>
                </div>`;
            }
            html += `</div>`;
        }

        // Frame-specific footer
        html += buildFooter(frame);

        stripContainer.innerHTML = html;
    }

    function buildFooter(frame) {
        switch (frame.id) {
            case 'kpop':
                return `<div class="strip-footer-kpop">
                    <div class="kpop-my-bundle">My Bundle of</div>
                    <div class="kpop-title-row">
                        <span class="kpop-kr">설레는</span>
                        <div class="kpop-en">
                            <span class="kpop-kp">KP</span><span class="kpop-op">OP</span>
                            <div class="kpop-badges">
                                <span class="kpop-badge sing">SING</span>
                                <span class="kpop-badge rap">RAP</span>
                            </div>
                            <span class="kpop-wave">WAVE</span>
                            <span class="kpop-badge dance">DANCE</span>
                        </div>
                    </div>
                    <div class="kpop-bottom">
                        <span class="kpop-tag">K-POP</span>
                        <span class="kpop-stars">★★★</span>
                        <span class="kpop-wm">photobooth</span>
                    </div>
                </div>`;

            case 'mono':
                return `<div class="strip-footer-mono">
                    <div class="mono-stars-deco">✦ ★ ✦</div>
                    <div class="mono-title">Favorite.</div>
                    <div class="mono-subtitle">my favorite person</div>
                    <div class="mono-bottom">
                        <span class="mono-bolt">⚡</span>
                        <span style="color:rgba(255,255,255,0.3);font-size:0.6rem;letter-spacing:2px;">PHOTOBOOTH</span>
                        <span class="mono-bolt">⚡</span>
                    </div>
                </div>`;

            case 'retro':
                return `<div class="strip-footer-retro">
                    <div class="retro-title">Memories</div>
                    <div class="retro-subtitle">make me smile</div>
                    <div class="retro-deco">🍒 🍓 💌</div>
                    <div class="retro-bottom">
                        <span class="retro-heart-tag">♡ my diary</span>
                        <span style="color:#8b2252;font-size:0.55rem;font-weight:600;letter-spacing:1px;">PHOTOBOOTH</span>
                        <span class="retro-heart-tag">xoxo ♡</span>
                    </div>
                </div>`;

            case 'cartoon':
                return `<div class="strip-footer-cartoon">
                    <div class="cartoon-title">FUN TIME!</div>
                    <div class="cartoon-subtitle">smile & say cheese</div>
                    <div class="cartoon-stars">⭐ ☁️ ⭐</div>
                    <div class="cartoon-bottom">
                        <span class="cartoon-cloud">🌈</span>
                        <span class="cartoon-wm">photobooth</span>
                        <span class="cartoon-cloud">☁️</span>
                    </div>
                </div>`;

            default:
                return '';
        }
    }

    // =============================================
    // EVENT BINDINGS
    // =============================================
    function bindEvents() {
        btnCapture.addEventListener('click', startCapture);
        btnDownload.addEventListener('click', downloadStrip);
        btnReset.addEventListener('click', resetBooth);

        // Frame selection
        frameOptionsEl.addEventListener('click', (e) => {
            const btn = e.target.closest('.frame-option');
            if (!btn) return;
            selectFrame(parseInt(btn.dataset.frameIndex, 10));
        });

        // Filters
        document.querySelectorAll('.filter-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                const val = btn.dataset.filter;
                currentFilterCSS = val === 'none' ? '' : val;
                webcam.style.filter = currentFilterCSS || '';
            });
        });

        // Timer
        document.querySelectorAll('.timer-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timer-btn').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                timerSeconds = parseInt(btn.dataset.timer, 10);
            });
        });
    }

    // =============================================
    // CAPTURE FLOW
    // =============================================
    async function startCapture() {
        const frame = FRAMES[currentFrameIndex];
        if (isCapturing || photoCount >= frame.slots) return;
        isCapturing = true;
        btnCapture.disabled = true;

        countdownOverlay.classList.add('active');
        await runCountdown(timerSeconds);
        countdownOverlay.classList.remove('active');

        takePhoto();
        isCapturing = false;
        if (photoCount < frame.slots) btnCapture.disabled = false;
    }

    function runCountdown(seconds) {
        return new Promise((resolve) => {
            let remaining = seconds;
            countdownNumber.textContent = remaining;
            const interval = setInterval(() => {
                remaining--;
                if (remaining <= 0) {
                    clearInterval(interval);
                    countdownNumber.textContent = '📸';
                    setTimeout(resolve, 200);
                } else {
                    countdownNumber.textContent = remaining;
                }
            }, 1000);
        });
    }

    function takePhoto() {
        const frame = FRAMES[currentFrameIndex];

        // Flash
        flashOverlay.classList.add('flash');
        setTimeout(() => flashOverlay.classList.remove('flash'), 500);

        // Capture
        const ctx = snapshotCanvas.getContext('2d');
        snapshotCanvas.width = webcam.videoWidth;
        snapshotCanvas.height = webcam.videoHeight;
        ctx.save();
        ctx.translate(snapshotCanvas.width, 0);
        ctx.scale(-1, 1);
        if (currentFilterCSS) ctx.filter = currentFilterCSS;
        ctx.drawImage(webcam, 0, 0);
        ctx.restore();

        const dataURL = snapshotCanvas.toDataURL('image/jpeg', 0.92);
        photos[photoCount] = dataURL;

        // Update slot
        const slot = document.getElementById('photoSlot' + photoCount);
        if (slot) {
            const img = document.createElement('img');
            img.src = dataURL;
            img.alt = 'Photo ' + (photoCount + 1);
            slot.appendChild(img);
            slot.classList.add('filled', 'just-filled');
            setTimeout(() => slot.classList.remove('just-filled'), 600);
        }

        photoCount++;
        photoCountEl.textContent = photoCount;

        // All done?
        if (photoCount >= frame.slots) {
            btnCapture.disabled = true;
            btnDownload.disabled = false;
            stripContainer.classList.add('completed');
            playSound();
        }
    }

    function playSound() {
        try {
            const ac = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.connect(gain); gain.connect(ac.destination);
            osc.frequency.setValueAtTime(800, ac.currentTime);
            osc.frequency.exponentialRampToValueAtTime(400, ac.currentTime + 0.15);
            gain.gain.setValueAtTime(0.12, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.2);
            osc.start(ac.currentTime); osc.stop(ac.currentTime + 0.2);
        } catch (e) { /* ignore */ }
    }

    // =============================================
    // RESET
    // =============================================
    function resetBooth() {
        const frame = FRAMES[currentFrameIndex];
        photoCount = 0;
        photos = [null, null, null, null];
        photoCountEl.textContent = '0';
        btnDownload.disabled = true;
        stripContainer.classList.remove('completed');

        // Clear images from slots
        for (let i = 0; i < 4; i++) {
            const slot = document.getElementById('photoSlot' + i);
            if (slot) {
                slot.classList.remove('filled', 'just-filled');
                const img = slot.querySelector('img');
                if (img) img.remove();
            }
        }

        if (stream) btnCapture.disabled = false;
    }

    // =============================================
    // DOWNLOAD STRIP (Canvas Rendering)
    // =============================================
    async function downloadStrip() {
        const frame = FRAMES[currentFrameIndex];
        if (photoCount < frame.slots) return;

        const canvas = finalCanvas;
        const ctx = canvas.getContext('2d');

        // Dimensions
        const W = frame.id === 'toystory' ? 1152 : 800;
        const H = frame.id === 'toystory' ? 2048 : (frame.layout === 'grid' ? 1400 : 1600);
        canvas.width = W;
        canvas.height = H;

        // Render based on frame type
        switch (frame.id) {
            case 'toystory': await renderToyStory(ctx, W, H); break;
            case 'kpop': await renderKpop(ctx, W, H); break;
            case 'mono': await renderMono(ctx, W, H); break;
            case 'retro': await renderRetro(ctx, W, H); break;
            case 'cartoon': await renderCartoon(ctx, W, H); break;
        }

        // Download
        const link = document.createElement('a');
        link.download = `photobooth-${frame.id}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // =============================================
    // CANVAS RENDERER: TOY STORY
    // =============================================
    async function renderToyStory(ctx, W, H) {
        const scale = W / 576;

        // Background
        ctx.fillStyle = '#0c3494';
        ctx.fillRect(0, 0, W, H);

        const slotTops = [57, 380, 705];
        const slotLeft = 146;
        const slotW = 286;
        const slotH = 262;

        for (let i = 0; i < 3; i++) {
            const sx = slotLeft * scale;
            const sy = slotTops[i] * scale;
            const sw = slotW * scale;
            const sh = slotH * scale;

            if (photos[i]) {
                const img = await loadImage(photos[i]);
                ctx.save();
                roundRectClip(ctx, sx, sy, sw, sh, 36);
                drawCover(ctx, img, sx, sy, sw, sh);
                ctx.restore();
            } else {
                ctx.save();
                roundRectClip(ctx, sx, sy, sw, sh, 36);
                const skyGrad = ctx.createLinearGradient(sx, sy, sx, sy + sh);
                skyGrad.addColorStop(0, '#c6e9fc');
                skyGrad.addColorStop(0.5, '#ebf9fe');
                skyGrad.addColorStop(0.7, '#c8e37c');
                skyGrad.addColorStop(1, '#88a201');
                ctx.fillStyle = skyGrad;
                ctx.fillRect(sx, sy, sw, sh);
                ctx.restore();
            }
        }

        // Draw pixel-perfect Toy Story overlay on top
        const overlayImg = await loadImage('assets/toystory_overlay.png');
        ctx.drawImage(overlayImg, 0, 0, W, H);
    }

    // =============================================
    // CANVAS RENDERER: K-POP WAVE
    // =============================================
    async function renderKpop(ctx, W, H) {
        // Background
        ctx.fillStyle = '#2dd4a0';
        ctx.fillRect(0, 0, W, H);

        // Gradient overlay
        const grad = ctx.createLinearGradient(0, 0, 0, H * 0.4);
        grad.addColorStop(0, 'rgba(255,255,255,0.15)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H * 0.4);

        // Header
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        drawPill(ctx, 30, 25, dateStr, 'rgba(255,255,255,0.3)', 'rgba(0,0,0,0.6)', 13);
        drawPill(ctx, W - 120, 25, '+82-🇰🇷', 'rgba(255,255,255,0.35)', 'rgba(0,0,0,0.7)', 13);

        // 2x2 Photo grid
        const pad = 30, gap = 14;
        const photoW = (W - pad * 2 - gap) / 2;
        const photoH = photoW;
        const startY = 65;

        const colors = ['#f87171', '#7bc8a4', '#a3e635', '#f87171'];
        const bgs = ['#fecaca', '#d4edda', '#d9f99d', '#fecaca'];
        const labels = ['안녕하세요!', "Let's sing together!", '화이팅!', '감사합니다~ OMG'];
        const stickers = ['☁️', '⭐', '💖', '🎵'];

        for (let i = 0; i < 4; i++) {
            const col = i % 2, row = Math.floor(i / 2);
            const x = pad + col * (photoW + gap);
            const y = startY + row * (photoH + gap);

            // Frame
            ctx.fillStyle = colors[i];
            roundRect(ctx, x - 5, y - 5, photoW + 10, photoH + 10, 14); ctx.fill();
            ctx.fillStyle = bgs[i];
            roundRect(ctx, x, y, photoW, photoH, 10); ctx.fill();

            // Photo
            if (photos[i]) {
                const img = await loadImage(photos[i]);
                ctx.save();
                roundRectClip(ctx, x, y, photoW, photoH, 10);
                drawCover(ctx, img, x, y, photoW, photoH);
                ctx.restore();
            }

            // Label
            drawLabel(ctx, x + photoW - 10, y + photoH - 10, labels[i], 'rgba(255,255,255,0.75)', 'rgba(0,0,0,0.7)', 11, 'right');

            // Sticker
            ctx.font = '22px serif';
            ctx.fillText(stickers[i], i % 2 === 0 ? x + photoW - 26 : x + 4, y + 22);
        }

        // Footer
        const fy = startY + 2 * (photoH + gap) + 16;
        ctx.textAlign = 'center';
        ctx.font = '600 15px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillText('My Bundle of', W / 2, fy);

        ctx.font = '800 46px "Fredoka", sans-serif';
        ctx.fillStyle = '#0f0f1a';
        ctx.fillText('설레는', W / 2 - 90, fy + 50);

        ctx.textAlign = 'left';
        ctx.font = '900 42px "Fredoka", sans-serif';
        ctx.fillStyle = '#0f0f1a';
        ctx.fillText('KP', W / 2 + 10, fy + 50);
        const kpw = ctx.measureText('KP').width;
        ctx.fillStyle = '#fbbf24';
        ctx.fillText('OP', W / 2 + 10 + kpw, fy + 50);

        ctx.font = '900 42px "Fredoka", sans-serif';
        ctx.fillStyle = '#0f0f1a';
        ctx.textAlign = 'center';
        ctx.fillText('WAVE', W / 2, fy + 100);

        // Badges
        ctx.fillStyle = '#fbbf24';
        roundRect(ctx, W / 2 + 80, fy + 25, 48, 17, 6); ctx.fill();
        ctx.font = '700 10px "Fredoka", sans-serif';
        ctx.fillStyle = '#0f0f1a';
        ctx.textAlign = 'center';
        ctx.fillText('SING', W / 2 + 104, fy + 37);

        ctx.fillStyle = '#ff6b9d';
        roundRect(ctx, W / 2 + 80, fy + 44, 42, 17, 6); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.fillText('RAP', W / 2 + 101, fy + 56);

        ctx.fillStyle = '#60a5fa';
        roundRect(ctx, W / 2 + 55, fy + 82, 55, 20, 7); ctx.fill();
        ctx.fillStyle = '#0f0f1a';
        ctx.font = '700 11px "Fredoka", sans-serif';
        ctx.fillText('DANCE', W / 2 + 82, fy + 96);

        // Bottom bar
        const by = fy + 124;
        ctx.fillStyle = '#0f0f1a';
        roundRect(ctx, 30, by, 60, 22, 4); ctx.fill();
        ctx.font = '800 11px "Fredoka", sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText('K-POP', 38, by + 16);

        ctx.font = '16px serif';
        ctx.fillStyle = '#fbbf24';
        ctx.textAlign = 'center';
        ctx.fillText('★★★', W / 2, by + 16);

        ctx.font = '600 10px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.textAlign = 'right';
        ctx.fillText('PHOTOBOOTH', W - 30, by + 15);

        // Checkerboard bottom
        const cs = 16;
        for (let cx = 0; cx < W; cx += cs * 2) {
            ctx.fillStyle = '#0f0f1a';
            ctx.fillRect(cx, H - 14, cs, 14);
        }

        ctx.textAlign = 'left';
    }

    // =============================================
    // CANVAS RENDERER: MONOCHROME STAR
    // =============================================
    async function renderMono(ctx, W, H) {
        // Background
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, W, H);

        // Subtle noise texture (grid of faint dots)
        ctx.fillStyle = 'rgba(255,255,255,0.02)';
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * W, y = Math.random() * H;
            ctx.fillRect(x, y, 2, 2);
        }

        // Scattered star decorations
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.font = '28px serif';
        ctx.fillText('✦', W - 50, 45);
        ctx.fillText('★', 20, H * 0.4);
        ctx.font = '20px serif';
        ctx.fillText('✧', W - 35, H * 0.6);
        ctx.fillText('⚡', 15, 60);
        ctx.fillText('✦', W / 2 + 100, 40);

        // Border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, W - 2, H - 2);

        // Header
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        drawPill(ctx, 30, 25, dateStr, 'rgba(255,255,255,0.08)', 'rgba(255,255,255,0.4)', 12);

        // 2x2 Photo grid
        const pad = 35, gap = 14;
        const photoW = (W - pad * 2 - gap) / 2;
        const photoH = photoW;
        const startY = 60;

        for (let i = 0; i < 4; i++) {
            const col = i % 2, row = Math.floor(i / 2);
            const x = pad + col * (photoW + gap);
            const y = startY + row * (photoH + gap);

            // White frame
            ctx.fillStyle = '#e0e0e0';
            roundRect(ctx, x - 4, y - 4, photoW + 8, photoH + 8, 10); ctx.fill();

            // Dark inner
            ctx.fillStyle = '#2a2a2a';
            roundRect(ctx, x, y, photoW, photoH, 8); ctx.fill();

            // Photo
            if (photos[i]) {
                const img = await loadImage(photos[i]);
                ctx.save();
                roundRectClip(ctx, x, y, photoW, photoH, 8);
                drawCover(ctx, img, x, y, photoW, photoH);
                ctx.restore();
            }

            // Label
            const labels = ['Favorite!', 'My star ★', 'Bias wrecker', 'stan forever'];
            ctx.font = '600 13px "Caveat", cursive';
            ctx.fillStyle = 'rgba(255,255,255,0.7)';
            ctx.textAlign = 'right';
            ctx.fillText(labels[i], x + photoW - 6, y + photoH - 8);
            ctx.textAlign = 'left';

            // Sticker
            const stk = ['✦', '★', '♡', '⚡'];
            ctx.font = '18px serif';
            ctx.fillStyle = '#e0e0e0';
            ctx.fillText(stk[i], col === 0 ? x + photoW - 22 : x + 4, y + 20);
        }

        // Footer
        const fy = startY + 2 * (photoH + gap) + 20;
        ctx.textAlign = 'center';

        // Stars deco
        ctx.font = '18px serif';
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.fillText('✦   ★   ✦', W / 2, fy);

        // "Favorite." in handwritten style
        ctx.font = '700 56px "Caveat", cursive';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Favorite.', W / 2, fy + 55);

        // Subtitle
        ctx.font = '600 13px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.letterSpacing = '3px';
        ctx.fillText('MY FAVORITE PERSON', W / 2, fy + 78);

        // Bottom
        ctx.font = '16px serif';
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillText('⚡', W / 2 - 80, fy + 110);
        ctx.fillText('⚡', W / 2 + 80, fy + 110);

        ctx.font = '600 10px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillText('PHOTOBOOTH', W / 2, fy + 112);

        ctx.textAlign = 'left';
    }

    // =============================================
    // CANVAS RENDERER: RETRO DIARY
    // =============================================
    async function renderRetro(ctx, W, H) {
        // Background - cream
        ctx.fillStyle = '#faf3e8';
        ctx.fillRect(0, 0, W, H);

        // Lined paper
        ctx.strokeStyle = 'rgba(139,34,82,0.06)';
        ctx.lineWidth = 1;
        for (let ly = 0; ly < H; ly += 24) {
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(W, ly);
            ctx.stroke();
        }

        // Gingham corners
        drawGingham(ctx, 0, 0, 80, 80, '#e74c6f22');
        drawGingham(ctx, W - 80, H - 80, 80, 80, '#e74c6f22');

        // Red border frame
        ctx.strokeStyle = '#8b2252';
        ctx.lineWidth = 6;
        roundRect(ctx, 3, 3, W - 6, H - 6, 12);
        ctx.stroke();

        // Header
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        drawPill(ctx, 30, 25, dateStr, 'rgba(139,34,82,0.1)', '#8b2252', 12);

        // 3 Polaroid photos (vertical)
        const pad = 60;
        const photoW = W - pad * 2;
        const photoH = photoW * 0.65;
        const gap = 20;
        const startY = 60;
        const polaroidPad = 12;
        const polaroidBottom = 35;

        const labels = ['favorite person ♡', 'memories~', 'my girl!'];
        const stickers = ['🍒', '🍓', '💌'];

        for (let i = 0; i < 3; i++) {
            const y = startY + i * (photoH + polaroidPad * 2 + polaroidBottom + gap);

            // Polaroid shadow
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            roundRect(ctx, pad - polaroidPad + 4, y + 4,
                photoW + polaroidPad * 2, photoH + polaroidPad + polaroidBottom, 4);
            ctx.fill();

            // Polaroid white border
            ctx.fillStyle = '#ffffff';
            roundRect(ctx, pad - polaroidPad, y,
                photoW + polaroidPad * 2, photoH + polaroidPad + polaroidBottom, 4);
            ctx.fill();

            // Polaroid inner border
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.strokeRect(pad, y + polaroidPad, photoW, photoH);

            // Photo background
            ctx.fillStyle = '#eee';
            ctx.fillRect(pad, y + polaroidPad, photoW, photoH);

            // Photo
            if (photos[i]) {
                const img = await loadImage(photos[i]);
                ctx.save();
                ctx.beginPath();
                ctx.rect(pad, y + polaroidPad, photoW, photoH);
                ctx.clip();
                drawCover(ctx, img, pad, y + polaroidPad, photoW, photoH);
                ctx.restore();
            }

            // Label (handwritten on polaroid bottom)
            ctx.font = '600 16px "Caveat", cursive';
            ctx.fillStyle = '#8b2252';
            ctx.textAlign = 'center';
            ctx.fillText(labels[i], W / 2, y + polaroidPad + photoH + 22);

            // Sticker
            ctx.font = '24px serif';
            ctx.fillText(stickers[i], pad + photoW - 10, y + 20);
            ctx.textAlign = 'left';
        }

        // Footer
        const fy = startY + 3 * (photoH + polaroidPad * 2 + polaroidBottom + gap) - gap + 10;

        ctx.textAlign = 'center';

        // "Memories" title
        ctx.font = '700 48px "Caveat", cursive';
        ctx.fillStyle = '#8b2252';
        ctx.fillText('Memories', W / 2, fy);

        // Subtitle
        ctx.font = '700 12px "Outfit", sans-serif';
        ctx.fillStyle = '#c05';
        ctx.fillText('MAKE ME SMILE', W / 2, fy + 20);

        // Deco
        ctx.font = '22px serif';
        ctx.fillText('🍒  🍓  💌', W / 2, fy + 50);

        // Bottom
        ctx.font = '600 13px "Caveat", cursive';
        ctx.fillStyle = '#8b2252';
        ctx.fillText('♡ my diary', W / 2 - 100, fy + 76);
        ctx.fillText('xoxo ♡', W / 2 + 100, fy + 76);

        ctx.font = '600 10px "Outfit", sans-serif';
        ctx.fillStyle = 'rgba(139,34,82,0.4)';
        ctx.fillText('PHOTOBOOTH', W / 2, fy + 76);

        ctx.textAlign = 'left';
    }

    // =============================================
    // CANVAS RENDERER: CARTOON FUN
    // =============================================
    async function renderCartoon(ctx, W, H) {
        // Background - yellow
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(0, 0, W, H);

        // Yellow grid pattern
        ctx.strokeStyle = 'rgba(0,0,0,0.06)';
        ctx.lineWidth = 1;
        const gridSize = 20;
        for (let gx = 0; gx < W; gx += gridSize) {
            ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
        }
        for (let gy = 0; gy < H; gy += gridSize) {
            ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
        }

        // Border
        ctx.strokeStyle = '#e59500';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, W - 6, H - 6);

        // Header
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        drawPill(ctx, 30, 22, dateStr, 'rgba(255,255,255,0.4)', 'rgba(0,0,0,0.6)', 12);

        // Color stripe bands & photos
        const pad = 40;
        const photoW = W - pad * 2;
        const photoH = photoW * 0.65;
        const stripeH = 28;
        const gap = 16;
        let yPos = 55;

        const stripeColors = [
            ['#ef4444', '#dc2626'],
            ['#3b82f6', '#2563eb'],
            ['#ef4444', '#dc2626'],
        ];
        const labels = ['#awesome!', '!? wow', 'fun time ★'];

        for (let i = 0; i < 3; i++) {
            // Stripe band
            const sg = ctx.createLinearGradient(0, yPos, W, yPos);
            sg.addColorStop(0, stripeColors[i][0]);
            sg.addColorStop(1, stripeColors[i][1]);
            ctx.fillStyle = sg;
            roundRect(ctx, 10, yPos, W - 20, stripeH, 6); ctx.fill();

            // Polka dots on stripe
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            for (let d = 0; d < 5; d++) {
                const dx = 30 + d * (W - 60) / 4;
                ctx.beginPath();
                ctx.arc(dx, yPos + stripeH / 2, 6, 0, Math.PI * 2);
                ctx.fill();
            }

            yPos += stripeH + 8;

            // Photo frame
            // Outer frame (blue with shadow)
            ctx.fillStyle = 'rgba(30,64,175,0.3)';
            roundRect(ctx, pad - 6 + 4, yPos + 4, photoW + 12, photoH + 12, 18); ctx.fill();

            ctx.fillStyle = '#3b82f6';
            roundRect(ctx, pad - 6, yPos, photoW + 12, photoH + 12, 18); ctx.fill();

            // Inner light area
            ctx.fillStyle = '#e0f2fe';
            roundRect(ctx, pad, yPos + 6, photoW, photoH, 14); ctx.fill();

            // Photo
            if (photos[i]) {
                const img = await loadImage(photos[i]);
                ctx.save();
                roundRectClip(ctx, pad, yPos + 6, photoW, photoH, 14);
                drawCover(ctx, img, pad, yPos + 6, photoW, photoH);
                ctx.restore();
            }

            // Label
            drawLabel(ctx, pad + photoW - 6, yPos + photoH - 2, labels[i], 'rgba(255,255,255,0.85)', '#1e40af', 12, 'right');

            // Stickers
            const stk = ['☁️', '⭐', '🌈'];
            ctx.font = '26px serif';
            ctx.textAlign = 'left';
            ctx.fillText(stk[i], pad + photoW - 30, yPos + 30);

            yPos += photoH + 12 + gap;
        }

        // Final stripe
        const sg = ctx.createLinearGradient(0, yPos, W, yPos);
        sg.addColorStop(0, '#3b82f6');
        sg.addColorStop(1, '#2563eb');
        ctx.fillStyle = sg;
        roundRect(ctx, 10, yPos, W - 20, stripeH, 6); ctx.fill();
        yPos += stripeH + 12;

        // Footer
        ctx.textAlign = 'center';

        ctx.font = '800 42px "Fredoka", sans-serif';
        ctx.fillStyle = '#1e40af';
        ctx.fillText('FUN TIME!', W / 2, yPos + 5);

        // Text shadow effect
        ctx.fillStyle = 'rgba(30,64,175,0.15)';
        ctx.fillText('FUN TIME!', W / 2 + 3, yPos + 8);

        ctx.font = '600 13px "Fredoka", sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillText('smile & say cheese', W / 2, yPos + 26);

        ctx.font = '26px serif';
        ctx.fillText('⭐  ☁️  ⭐', W / 2, yPos + 56);

        // Bottom
        ctx.font = '24px serif';
        ctx.fillText('🌈', W / 2 - 100, yPos + 84);
        ctx.fillText('☁️', W / 2 + 100, yPos + 84);

        ctx.font = '700 10px "Fredoka", sans-serif';
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillText('PHOTOBOOTH', W / 2, yPos + 82);

        ctx.textAlign = 'left';
    }

    // =============================================
    // CANVAS HELPERS
    // =============================================
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function roundRectClip(ctx, x, y, w, h, r) {
        roundRect(ctx, x, y, w, h, r);
        ctx.clip();
    }

    function drawCover(ctx, img, x, y, w, h) {
        const ir = img.width / img.height;
        const sr = w / h;
        let dw, dh, dx, dy;
        if (ir > sr) {
            dh = h; dw = h * ir; dx = x - (dw - w) / 2; dy = y;
        } else {
            dw = w; dh = w / ir; dx = x; dy = y - (dh - h) / 2;
        }
        ctx.drawImage(img, dx, dy, dw, dh);
    }

    function drawPill(ctx, x, y, text, bg, fg, fontSize) {
        ctx.font = `600 ${fontSize}px "Outfit", sans-serif`;
        const m = ctx.measureText(text);
        const pw = m.width + 16;
        const ph = fontSize + 8;
        ctx.fillStyle = bg;
        roundRect(ctx, x, y, pw, ph, ph / 2); ctx.fill();
        ctx.fillStyle = fg;
        ctx.textAlign = 'left';
        ctx.fillText(text, x + 8, y + fontSize + 1);
    }

    function drawLabel(ctx, x, y, text, bg, fg, fontSize, align) {
        ctx.font = `700 ${fontSize}px "Outfit", sans-serif`;
        const m = ctx.measureText(text);
        const lw = m.width + 10;
        const lh = fontSize + 6;
        const lx = align === 'right' ? x - lw : x;
        ctx.fillStyle = bg;
        roundRect(ctx, lx, y - lh, lw, lh, 5); ctx.fill();
        ctx.fillStyle = fg;
        ctx.textAlign = 'left';
        ctx.fillText(text, lx + 5, y - 4);
    }

    function drawGingham(ctx, ox, oy, w, h, color) {
        const size = 10;
        for (let gx = 0; gx < w; gx += size * 2) {
            for (let gy = 0; gy < h; gy += size * 2) {
                ctx.fillStyle = color;
                ctx.fillRect(ox + gx, oy + gy, size, size);
                ctx.fillRect(ox + gx + size, oy + gy + size, size, size);
            }
        }
    }

    // =============================================
    // START
    // =============================================
    document.addEventListener('DOMContentLoaded', init);
})();
