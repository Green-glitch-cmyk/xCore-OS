// xCore OS - Ядро системы
// Версия: os-070626 pre-alpha

const xCore = {
    name: 'xCore OS',
    version: '1.1.0',
    status: 'alpha',
    releaseDate: '2026-06-07',
    wallpaper: 0,
    windows: [],
    nextWindowId: 1,
    windowCounter: 0,
    
    // Инициализация
    init: function() {
        console.log(`${this.name} ${this.version} (${this.status}) загружена`);
        this.loadSettings();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
        this.bindEvents();
        this.bindHotkeys();
        this.initSidePanel();
        this.initCharms();
        this.updateWeather();
        this.updateGreeting();
        setInterval(() => this.updateWeather(), 60000);
    },
    
    // Боковая панель (бургер)
    initSidePanel: function() {
        const menuToggle = document.getElementById('menuToggle');
        const sidePanel = document.getElementById('sidePanel');
        const panelClose = document.getElementById('panelClose');
        
        if (menuToggle) {
            menuToggle.onclick = (e) => {
                e.stopPropagation();
                sidePanel.classList.toggle('open');
            };
        }
        
        if (panelClose) {
            panelClose.onclick = () => sidePanel.classList.remove('open');
        }
        
        document.querySelectorAll('.panel-item').forEach(item => {
            item.onclick = () => {
                const action = item.dataset.action;
                switch(action) {
                    case 'home': sidePanel.classList.remove('open'); break;
                    case 'apps': this.openApp('appslist'); sidePanel.classList.remove('open'); break;
                    case 'settings': this.openApp('settings'); sidePanel.classList.remove('open'); break;
                    case 'wallpapers': this.openApp('wallpapers'); sidePanel.classList.remove('open'); break;
                    case 'about': this.about(); sidePanel.classList.remove('open'); break;
                }
            };
        });
        
        const shutdownBtn = document.getElementById('shutdownBtn');
        if (shutdownBtn) shutdownBtn.onclick = () => this.shutdown();
    },
    
    // Charms
    initCharms: function() {
        const charmsBtn = document.getElementById('charmsBtn');
        const charms = document.getElementById('charms');
        
        if (charmsBtn) {
            charmsBtn.onclick = () => charms.classList.toggle('active');
        }
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                charms.classList.remove('active');
            }
        });
    },
    
    // Горячие клавиши
    bindHotkeys: function() {
        document.addEventListener('keydown', (e) => {
            if (e.altKey && (e.key === 'c' || e.key === 'C')) {
                e.preventDefault();
                document.getElementById('charms').classList.toggle('active');
            }
            if (e.altKey && (e.key === 's' || e.key === 'S')) {
                e.preventDefault();
                document.getElementById('sidePanel').classList.toggle('open');
            }
            if (e.altKey && e.key === 'F4') {
                e.preventDefault();
                const windows = document.querySelectorAll('.window');
                if (windows.length > 0) {
                    const lastWindow = windows[windows.length - 1];
                    const id = lastWindow.id.split('-')[1];
                    this.closeWindow(parseInt(id));
                }
            }
        });
    },
    
    // Загрузка настроек
    loadSettings: function() {
        const saved = localStorage.getItem('xCoreSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            this.wallpaper = settings.wallpaper || 0;
            this.applyWallpaper();
        }
    },
    
    saveSettings: function() {
        localStorage.setItem('xCoreSettings', JSON.stringify({ wallpaper: this.wallpaper }));
    },
    
    applyWallpaper: function() {
        document.body.style.backgroundColor = '#1b3a4b';
        document.body.style.backgroundImage = `url('wallpapers/w${this.wallpaper}.svg')`;
        document.body.style.backgroundSize = 'cover';
    },
    
    setWallpaper: function(n) {
        this.wallpaper = n;
        this.applyWallpaper();
        this.saveSettings();
        this.showNotification('Обои', 'Фон изменён');
        this.closeCurrentWindow();
    },
    
    updateClock: function() {
        const now = new Date();
        const clockEl = document.getElementById('clock');
        const dateEl = document.getElementById('date');
        if (clockEl) clockEl.innerHTML = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        if (dateEl) dateEl.innerHTML = now.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });
    },
    
    updateWeather: function() {
        const temps = ['+23°', '+21°', '+25°', '+19°'];
        const icons = ['☀️', '⛅', '🌧️', '🌤️'];
        const random = Math.floor(Math.random() * 4);
        const tempEl = document.getElementById('weatherTemp');
        const iconEl = document.getElementById('weatherIcon');
        if (tempEl) tempEl.innerText = temps[random];
        if (iconEl) iconEl.innerText = icons[random];
    },
    
    updateGreeting: function() {
        const hour = new Date().getHours();
        const greetingEl = document.getElementById('greeting');
        let text = '';
        if (hour < 12) text = 'Доброе утро';
        else if (hour < 18) text = 'Добрый день';
        else text = 'Добрый вечер';
        if (greetingEl) greetingEl.innerText = text;
    },
    
    // ========== ОТКРЫТИЕ ПРИЛОЖЕНИЯ (ГЛАВНОЕ) ==========
    openApp: function(appName) {
        // Получаем контент и заголовок
        const appContent = this.getAppContent(appName);
        const appTitle = this.getAppTitle(appName);
        const appIcon = this.getAppIcon(appName);
        
        // Уникальный ID окна
        const windowId = this.nextWindowId++;
        this.windowCounter++;
        
        // Смещение для каскада окон
        const offset = this.windowCounter * 25;
        const maxOffset = Math.min(offset, 150);
        
        // Создаём HTML окна
        const windowHtml = `
            <div class="window" id="window-${windowId}" 
                 style="top: ${60 + maxOffset}px; left: ${80 + maxOffset}px; width: 520px; min-height: 400px; z-index: ${windowId + 200}">
                <div class="window-header">
                    <span class="window-title">${appIcon} ${appTitle}</span>
                    <div class="window-controls">
                        <span class="window-close" data-window-id="${windowId}">✖</span>
                    </div>
                </div>
                <div class="window-content">
                    ${appContent}
                </div>
            </div>
        `;
        
        // Добавляем в DOM
        const container = document.getElementById('windowsContainer');
        container.insertAdjacentHTML('beforeend', windowHtml);
        
        // Навешиваем обработчики
        const newWindow = document.getElementById(`window-${windowId}`);
        this.makeDraggable(`window-${windowId}`);
        
        // Обработчик кнопки закрытия
        const closeBtn = newWindow.querySelector('.window-close');
        if (closeBtn) {
            closeBtn.onclick = () => this.closeWindow(windowId);
        }
        
        // Добавляем в панель задач
        this.addToTaskbar(appName, windowId);
        
        // Уведомление
        this.showNotification('Приложение', `Запущено: ${appTitle}`);
        
        // Анимация появления уже в CSS
    },
    
    // Получить содержимое приложения
    getAppContent: function(appName) {
        switch(appName) {
            case 'calc':
                const calcId = Date.now();
                return `
                    <div class="app-calc">
                        <div class="display" id="calcDisplay${calcId}">0</div>
                        <button onclick="xCore.calcPress('7', 'calcDisplay${calcId}')">7</button>
                        <button onclick="xCore.calcPress('8', 'calcDisplay${calcId}')">8</button>
                        <button onclick="xCore.calcPress('9', 'calcDisplay${calcId}')">9</button>
                        <button onclick="xCore.calcPress('/', 'calcDisplay${calcId}')">/</button>
                        <button onclick="xCore.calcPress('4', 'calcDisplay${calcId}')">4</button>
                        <button onclick="xCore.calcPress('5', 'calcDisplay${calcId}')">5</button>
                        <button onclick="xCore.calcPress('6', 'calcDisplay${calcId}')">6</button>
                        <button onclick="xCore.calcPress('*', 'calcDisplay${calcId}')">*</button>
                        <button onclick="xCore.calcPress('1', 'calcDisplay${calcId}')">1</button>
                        <button onclick="xCore.calcPress('2', 'calcDisplay${calcId}')">2</button>
                        <button onclick="xCore.calcPress('3', 'calcDisplay${calcId}')">3</button>
                        <button onclick="xCore.calcPress('-', 'calcDisplay${calcId}')">-</button>
                        <button onclick="xCore.calcPress('0', 'calcDisplay${calcId}')">0</button>
                        <button onclick="xCore.calcPress('.', 'calcDisplay${calcId}')">.</button>
                        <button onclick="xCore.calcResult('calcDisplay${calcId}')">=</button>
                        <button onclick="xCore.calcPress('+', 'calcDisplay${calcId}')">+</button>
                        <button onclick="xCore.calcClear('calcDisplay${calcId}')">C</button>
                    </div>
                `;
                
            case 'notes':
                const savedNotes = localStorage.getItem('xCoreNotes') || '';
                return `
                    <div class="app-notes">
                        <textarea id="notesTextarea" placeholder="Введите заметку..." style="width: 100%; height: 250px; padding: 10px; font-family: monospace; resize: vertical;">${savedNotes}</textarea>
                        <div style="margin-top: 10px; display: flex; gap: 10px;">
                            <button onclick="xCore.saveNotes()">💾 Сохранить</button>
                            <button onclick="xCore.clearNotes()">🗑️ Очистить</button>
                        </div>
                    </div>
                `;
                
            case 'browser':
                const lastUrl = localStorage.getItem('lastUrl') || 'https://google.com';
                return `
                    <div class="app-browser">
                        <div style="display: flex; gap: 8px; margin-bottom: 10px;">
                            <input type="text" id="browserUrlInput" value="${lastUrl}" style="flex: 1; padding: 6px;">
                            <button onclick="xCore.browserGo()">Перейти</button>
                            <button onclick="xCore.browserBack()">◀ Назад</button>
                        </div>
                        <iframe id="browserFrame" src="${lastUrl}" style="width: 100%; height: 300px; border: 1px solid #ccc;"></iframe>
                    </div>
                `;
                
            case 'wallpapers':
                return `
                    <div class="app-wallpapers">
                        <h3 style="margin-bottom: 15px;">🖼️ Выберите фон</h3>
                        <button onclick="xCore.setWallpaper(0)">🔵 Синий (стандарт)</button>
                        <button onclick="xCore.setWallpaper(1)">⚪ Светлый</button>
                        <button onclick="xCore.setWallpaper(2)">⚫ Тёмный</button>
                        <hr style="margin: 15px 0;">
                        <button onclick="xCore.closeCurrentWindow()">✖ Закрыть</button>
                    </div>
                `;
                
            case 'settings':
                return `
                    <div class="app-settings">
                        <h3>⚙️ Настройки xCore OS</h3>
                        <div style="margin: 15px 0;">
                            <label>🔊 Звуки: </label>
                            <input type="checkbox" id="soundCheckbox">
                        </div>
                        <div style="margin: 15px 0;">
                            <label>🌙 Тёмная тема: </label>
                            <input type="checkbox" id="darkThemeCheckbox">
                        </div>
                        <div style="margin: 15px 0;">
                            <label>💾 Очистить все данные: </label>
                            <button onclick="xCore.clearAllData()">Очистить</button>
                        </div>
                        <hr>
                        <p style="margin-top: 15px; font-size: 12px; color: #666;">Версия: ${this.version}</p>
                        <p style="font-size: 11px; color: #999;">Статус: ${this.status}</p>
                    </div>
                `;
                
            case 'appslist':
                return `
                    <div class="app-appslist">
                        <h3>📦 Все приложения</h3>
                        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 15px;">
                            <button onclick="xCore.openApp('calc')">🧮 Калькулятор</button>
                            <button onclick="xCore.openApp('notes')">📝 Заметки</button>
                            <button onclick="xCore.openApp('browser')">🌐 Браузер</button>
                            <button onclick="xCore.openApp('wallpapers')">🖼️ Обои</button>
                            <button onclick="xCore.openApp('settings')">⚙️ Настройки</button>
                        </div>
                    </div>
                `;
                
            default:
                return `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 20px;">📦</div>
                        <h3>Приложение в разработке</h3>
                        <p>Скоро появится!</p>
                        <button onclick="xCore.closeCurrentWindow()" style="margin-top: 20px;">Закрыть</button>
                    </div>
                `;
        }
    },
    
    getAppTitle: function(appName) {
        const titles = {
            calc: 'Калькулятор',
            notes: 'Заметки',
            browser: 'xCore Browser',
            wallpapers: 'Обои',
            settings: 'Настройки',
            appslist: 'Все приложения',
            media: 'Медиа',
            files: 'Файлы',
            terminal: 'Терминал',
            store: 'Магазин',
            games: 'Игры',
            draw: 'Рисование'
        };
        return titles[appName] || 'Приложение';
    },
    
    getAppIcon: function(appName) {
        const icons = {
            calc: '🧮', notes: '📝', browser: '🌐', wallpapers: '🖼️',
            settings: '⚙️', appslist: '📦', media: '🎵', files: '📁',
            terminal: '💻', store: '🏪', games: '🎮', draw: '🎨'
        };
        return icons[appName] || '📄';
    },
    
    // Калькулятор
    calcPress: function(val, displayId) {
        const display = document.getElementById(displayId);
        if (display.innerText === '0' && val !== '.') {
            display.innerText = val;
        } else {
            display.innerText += val;
        }
    },
    calcClear: function(displayId) {
        const display = document.getElementById(displayId);
        display.innerText = '0';
    },
    calcResult: function(displayId) {
        const display = document.getElementById(displayId);
        try {
            display.innerText = eval(display.innerText);
        } catch(e) {
            display.innerText = 'Ошибка';
            setTimeout(() => { 
                if(document.getElementById(displayId)) 
                    document.getElementById(displayId).innerText = '0'; 
            }, 1000);
        }
    },
    
    // Заметки
    saveNotes: function() {
        const textarea = document.getElementById('notesTextarea');
        if (textarea) {
            localStorage.setItem('xCoreNotes', textarea.value);
            this.showNotification('Заметки', 'Сохранено');
        }
    },
    clearNotes: function() {
        const textarea = document.getElementById('notesTextarea');
        if (textarea) {
            textarea.value = '';
            localStorage.removeItem('xCoreNotes');
            this.showNotification('Заметки', 'Очищено');
        }
    },
    
    // Браузер
    browserGo: function() {
        const urlInput = document.getElementById('browserUrlInput');
        const frame = document.getElementById('browserFrame');
        if (urlInput && frame) {
            let url = urlInput.value;
            if (!url.startsWith('http')) url = 'https://' + url;
            frame.src = url;
            localStorage.setItem('lastUrl', url);
        }
    },
    browserBack: function() {
        const frame = document.getElementById('browserFrame');
        if (frame && frame.contentWindow.history.length > 1) {
            frame.contentWindow.history.back();
        }
    },
    
    // Управление окнами
    closeWindow: function(windowId) {
        const win = document.getElementById(`window-${windowId}`);
        if (win) {
            win.classList.add('closing');
            setTimeout(() => {
                win.remove();
                this.removeFromTaskbar(windowId);
            }, 200);
        }
    },
    
    closeCurrentWindow: function() {
        const windows = document.querySelectorAll('.window');
        if (windows.length > 0) {
            const last = windows[windows.length - 1];
            const id = last.id.split('-')[1];
            this.closeWindow(parseInt(id));
        }
    },
    
    closeAllWindows: function() {
        document.querySelectorAll('.window').forEach(win => {
            win.classList.add('closing');
            setTimeout(() => win.remove(), 200);
        });
        document.getElementById('taskbarApps').innerHTML = '';
        this.windowCounter = 0;
    },
    
    addToTaskbar: function(appName, windowId) {
        const taskbarApps = document.getElementById('taskbarApps');
        const appBtn = document.createElement('div');
        appBtn.className = 'taskbar-app';
        appBtn.innerHTML = `${this.getAppIcon(appName)} ${this.getAppTitle(appName)}`;
        appBtn.onclick = () => this.focusWindow(windowId);
        appBtn.id = `taskbar-${windowId}`;
        taskbarApps.appendChild(appBtn);
    },
    
    removeFromTaskbar: function(windowId) {
        const btn = document.getElementById(`taskbar-${windowId}`);
        if (btn) btn.remove();
    },
    
    focusWindow: function(windowId) {
        const win = document.getElementById(`window-${windowId}`);
        if (win) {
            win.style.zIndex = ++this.nextWindowId;
            win.style.opacity = '1';
        }
    },
    
    makeDraggable: function(windowId) {
        const win = document.getElementById(windowId);
        if (!win) return;
        
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        const header = win.querySelector('.window-header');
        
        header.onmousedown = dragMouseDown;
        
        function dragMouseDown(e) {
            if (e.target.classList.contains('window-close')) return;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDrag;
            document.onmousemove = elementDrag;
        }
        
        function elementDrag(e) {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            win.style.top = (win.offsetTop - pos2) + "px";
            win.style.left = (win.offsetLeft - pos1) + "px";
        }
        
        function closeDrag() {
            document.onmouseup = null;
            document.onmousemove = null;
        }
    },
    
    // Charms функции
    search: function() {
        const query = prompt('Поиск в xCore OS:');
        if (query) this.showNotification('Поиск', `По запросу "${query}" ничего не найдено`);
        document.getElementById('charms').classList.remove('active');
    },
    
    settings: function() {
        this.openApp('settings');
        document.getElementById('charms').classList.remove('active');
    },
    
    wallpaperMenu: function() {
        this.openApp('wallpapers');
        document.getElementById('charms').classList.remove('active');
    },
    
    about: function() {
        this.showNotification('О системе', `xCore OS ${this.version} (${this.status}) | 7 июня 2026`);
        document.getElementById('charms').classList.remove('active');
    },
    
    lock: function() {
        this.showNotification('Блокировка', 'Функция будет в следующей версии');
        document.getElementById('charms').classList.remove('active');
    },
    
    shutdown: function() {
        if (confirm('Выключить xCore OS?')) {
            this.showNotification('Система', 'Завершение работы...');
            setTimeout(() => window.close(), 500);
        }
        document.getElementById('charms').classList.remove('active');
    },
    
    clearAllData: function() {
        if (confirm('Очистить все данные xCore OS? Это удалит заметки, настройки и историю браузера.')) {
            localStorage.clear();
            this.showNotification('Система', 'Все данные очищены. Перезагрузка...');
            setTimeout(() => location.reload(), 1500);
        }
    },
    
    showNotification: function(title, message) {
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const notif = document.createElement('div');
        notif.className = 'notification';
        notif.innerHTML = `<strong>${title}</strong><br><small>${message}</small>`;
        container.appendChild(notif);
        
        setTimeout(() => {
            notif.style.opacity = '0';
            notif.style.transform = 'translateX(100%)';
            setTimeout(() => notif.remove(), 300);
        }, 3000);
    },
    
    // Обработка плиток
    bindEvents: function() {
        // Плитки
        document.querySelectorAll('.tile, .rec-item').forEach(el => {
            const app = el.dataset.app;
            if (app) {
                el.onclick = () => this.openApp(app);
            }
        });
        
        // Глобальный поиск
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.showNotification('Поиск', `Поиск: ${searchInput.value}`);
                }
            });
        }
    }
};

// Запуск
window.addEventListener('DOMContentLoaded', () => xCore.init());