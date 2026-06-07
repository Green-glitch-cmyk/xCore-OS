// Ядро xCore OS
// Управление системой

(function() {
    // Системные процессы
    const systemProcesses = [];
    
    // Добавить процесс
    window.xCoreKernel = {
        processes: systemProcesses,
        
        registerProcess: function(name, callback) {
            systemProcesses.push({ name, callback, active: true });
            console.log(`Процесс зарегистрирован: ${name}`);
        },
        
        getSystemInfo: function() {
            return {
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                language: navigator.language,
                online: navigator.onLine
            };
        }
    };
    
    // Регистрируем базовый процесс
    window.xCoreKernel.registerProcess('system-monitor', () => {
        // Мониторинг системы (будет дополняться)
        return { status: 'ok' };
    });
})();