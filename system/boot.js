// Загрузчик xCore OS
// Системный файл - не изменять без необходимости

(function() {
    console.log('xCore OS - Загрузка системы...');
    
    // Проверка совместимости
    const isCompatible = () => {
        const checks = {
            localStorage: typeof(Storage) !== 'undefined',
            modernBrowser: typeof window !== 'undefined'
        };
        
        if (!checks.localStorage) {
            alert('Ваш браузер не поддерживает сохранение настроек');
        }
        
        return checks;
    };
    
    // Пре-загрузка
    window.xCoreBoot = {
        version: 'os-070626',
        timestamp: Date.now(),
        checks: isCompatible()
    };
    
    console.log('Загрузчик готов');
})();