// Система хранения данных xCore OS

(function() {
    const STORAGE_KEYS = {
        settings: 'xCoreSettings',
        notes: 'xCoreNotes',
        bookmarks: 'xCoreBookmarks',
        history: 'xCoreHistory'
    };
    
    window.xCoreStorage = {
        // Сохранить данные
        save: function(key, data) {
            try {
                localStorage.setItem(STORAGE_KEYS[key] || key, JSON.stringify(data));
                return true;
            } catch(e) {
                console.error('Ошибка сохранения:', e);
                return false;
            }
        },
        
        // Загрузить данные
        load: function(key) {
            try {
                const data = localStorage.getItem(STORAGE_KEYS[key] || key);
                return data ? JSON.parse(data) : null;
            } catch(e) {
                console.error('Ошибка загрузки:', e);
                return null;
            }
        },
        
        // Удалить данные
        delete: function(key) {
            localStorage.removeItem(STORAGE_KEYS[key] || key);
        },
        
        // Очистить все данные
        clear: function() {
            if (confirm('Очистить все данные xCore OS?')) {
                localStorage.clear();
                alert('Данные очищены');
            }
        },
        
        // Экспорт настроек
        export: function() {
            const allData = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.startsWith('xCore')) {
                    allData[key] = localStorage.getItem(key);
                }
            }
            return JSON.stringify(allData);
        },
        
        // Импорт настроек
        import: function(jsonData) {
            try {
                const data = JSON.parse(jsonData);
                for (const key in data) {
                    localStorage.setItem(key, data[key]);
                }
                return true;
            } catch(e) {
                return false;
            }
        }
    };
})();