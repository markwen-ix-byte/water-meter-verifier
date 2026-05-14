// ========== MOCK-ДАННЫЕ (структура из ЛР2 и ЛР3) ==========
let mockState = {
    device_id: "verifier_001",
    mode: "AUTO",
    timestamp: 0,
    cnt_verified: 0,
    cnt_etalon: 0,
    volume_verified: 0.0,
    volume_etalon: 0.0,
    error_percent: 0.0,
    temperature: 23.5,
    humidity: 45.0,
    valve: false,
    status: "ok",
    coeff_verified: 1.0,
    coeff_etalon: 1.0
};

// Время старта для timestamp
const startTime = Date.now();

// Доступные коэффициенты для MANUAL режима
const COEFF_LIST = [0.8, 0.9, 1.0, 1.1, 1.2];

// Для DEMO режима
let demoStep = 0;
const DEMO_ERRORS = [-5, 0, 5, 10];
let demoCounter = 0;

// Переменные для интервалов
let autoInterval = null;
let refreshInterval = null;

// ========== ФУНКЦИЯ ПЕРЕСЧЁТА ОБЪЁМОВ И ПОГРЕШНОСТИ ==========
function recalcVolumes() {
    mockState.volume_verified = mockState.cnt_verified * mockState.coeff_verified;
    mockState.volume_etalon = mockState.cnt_etalon * mockState.coeff_etalon;
    
    if (mockState.volume_etalon > 0) {
        mockState.error_percent = ((mockState.volume_verified - mockState.volume_etalon) / mockState.volume_etalon) * 100;
    } else {
        mockState.error_percent = 0.0;
    }
    
    // Округление
    mockState.error_percent = Math.round(mockState.error_percent * 100) / 100;
    mockState.volume_verified = Math.round(mockState.volume_verified * 100) / 100;
    mockState.volume_etalon = Math.round(mockState.volume_etalon * 100) / 100;
}

// ========== ОБНОВЛЕНИЕ TIMESTAMP ==========
function updateTimestamp() {
    mockState.timestamp = Math.floor((Date.now() - startTime) / 1000);
}

// ========== ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ DOM ==========
function updateUI() {
    // Основные параметры
    document.getElementById('device-id').textContent = mockState.device_id;
    
    const modeSpan = document.getElementById('current-mode');
    modeSpan.textContent = mockState.mode;
    modeSpan.setAttribute('data-mode', mockState.mode);
    
    // Счётчики
    document.getElementById('cnt-verified').textContent = mockState.cnt_verified;
    document.getElementById('volume-verified').textContent = mockState.volume_verified.toFixed(2);
    document.getElementById('cnt-etalon').textContent = mockState.cnt_etalon;
    document.getElementById('volume-etalon').textContent = mockState.volume_etalon.toFixed(2);
    
    // Датчики
    document.getElementById('temperature').textContent = mockState.temperature.toFixed(1);
    document.getElementById('humidity').textContent = mockState.humidity.toFixed(1);
    
    // Погрешность
    const errorSpan = document.getElementById('error-percent');
    errorSpan.textContent = mockState.error_percent.toFixed(2);
    
    if (Math.abs(mockState.error_percent) > 10) {
        errorSpan.style.color = '#e74c3c';
    } else if (Math.abs(mockState.error_percent) > 5) {
        errorSpan.style.color = '#f39c12';
    } else {
        errorSpan.style.color = '#27ae60';
    }
    
    // Коэффициент
    document.getElementById('coeff-verified').textContent = mockState.coeff_verified.toFixed(2);
    document.getElementById('current-coeff').textContent = mockState.coeff_verified.toFixed(2);
    
    // Состояние клапана
    const valveSpan = document.getElementById('valve-status');
    const valveBtn = document.getElementById('valveToggleBtn');
    
    if (mockState.valve) {
        valveSpan.innerHTML = '🔓 ОТКРЫТ';
        valveSpan.style.color = '#27ae60';
        if (valveBtn) valveBtn.textContent = '🔒 ЗАКРЫТЬ КЛАПАН';
    } else {
        valveSpan.innerHTML = '🔒 ЗАКРЫТ';
        valveSpan.style.color = '#e74c3c';
        if (valveBtn) valveBtn.textContent = '🔓 ОТКРЫТЬ КЛАПАН';
    }
    
    // Статус системы
    const statusSpan = document.getElementById('system-status');
    statusSpan.textContent = mockState.status === 'ok' ? '✅ OK' : '⚠️ ОШИБКА';
    statusSpan.style.color = mockState.status === 'ok' ? '#27ae60' : '#e74c3c';
    
    document.getElementById('timestamp').textContent = mockState.timestamp;
    
    // Показываем/скрываем блоки в зависимости от режима
    const manualCard = document.getElementById('manualCard');
    const demoCard = document.getElementById('demoCard');
    const valveCard = document.getElementById('valveCard');
    
    if (mockState.mode === 'MANUAL') {
        manualCard.style.display = 'block';
        demoCard.style.display = 'none';
        valveCard.style.display = 'block';
    } else if (mockState.mode === 'DEMO') {
        manualCard.style.display = 'none';
        demoCard.style.display = 'block';
        valveCard.style.display = 'none';
    } else if (mockState.mode === 'SERVICE') {
        manualCard.style.display = 'none';
        demoCard.style.display = 'none';
        valveCard.style.display = 'none';
    } else {
        manualCard.style.display = 'none';
        demoCard.style.display = 'none';
        valveCard.style.display = 'block';
    }
    
    // Подсказка для AUTO режима
    const hint = document.getElementById('valveHint');
    if (hint) {
        if (mockState.mode === 'AUTO' && !mockState.valve) {
            hint.style.display = 'block';
            hint.innerHTML = '💡 Открой клапан, чтобы началась автоматическая поверка!';
        } else if (mockState.mode === 'AUTO' && mockState.valve) {
            hint.style.display = 'block';
            hint.innerHTML = '✅ Поверка идёт! Импульсы генерируются автоматически.';
            hint.style.background = '#d5f5e3';
        } else {
            hint.style.display = 'none';
        }
    }
    
    // Время обновления
    const now = new Date();
    document.getElementById('last-update').textContent = now.toLocaleTimeString();
    
    // Логирование в консоль (JSON)
    console.log('[STATE]', JSON.stringify(mockState, null, 2));
}

// ========== АВТОМАТИЧЕСКАЯ ГЕНЕРАЦИЯ ИМПУЛЬСОВ (ДЛЯ AUTO РЕЖИМА) ==========
function startAutoImpulses() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
    }
    
    if (mockState.mode === 'AUTO' && mockState.valve) {
        autoInterval = setInterval(() => {
            // Эталонный счётчик выдаёт стабильные импульсы (1-3)
            const etalonPulses = Math.floor(Math.random() * 3) + 1;
            
            // Поверяемый счётчик может врать (погрешность ±15%)
            const errorFactor = 1 + (Math.random() - 0.5) * 0.3;
            let verifiedPulses = Math.max(1, Math.round(etalonPulses * errorFactor));
            
            mockState.cnt_etalon += etalonPulses;
            mockState.cnt_verified += verifiedPulses;
            
            recalcVolumes();
            updateUI();
            
            console.log(`[AUTO] Эталон +${etalonPulses}, Поверяемый +${verifiedPulses} | Погрешность: ${mockState.error_percent.toFixed(2)}%`);
        }, 1500);
    }
}

function stopAutoImpulses() {
    if (autoInterval) {
        clearInterval(autoInterval);
        autoInterval = null;
        console.log('[AUTO] Генерация импульсов остановлена');
    }
}

// ========== УПРАВЛЕНИЕ КЛАПАНОМ ==========
function toggleValve() {
    mockState.valve = !mockState.valve;
    
    if (mockState.mode === 'AUTO') {
        if (mockState.valve) {
            startAutoImpulses();
            console.log('[AUTO] Клапан открыт → начата поверка');
        } else {
            stopAutoImpulses();
            console.log('[AUTO] Клапан закрыт → поверка остановлена');
        }
    }
    
    updateUI();
}

// ========== СБРОС СЧЁТЧИКОВ ==========
function resetCounters() {
    mockState.cnt_verified = 0;
    mockState.cnt_etalon = 0;
    recalcVolumes();
    updateUI();
    console.log('[SYSTEM] Счётчики сброшены');
}

// ========== ФУНКЦИЯ СМЕНЫ РЕЖИМА ==========
function setMode(newMode) {
    const validModes = ['AUTO', 'MANUAL', 'DEMO', 'SERVICE'];
    
    if (!validModes.includes(newMode)) {
        console.warn('Unknown mode, fallback to AUTO');
        newMode = 'AUTO';
    }
    
    const oldMode = mockState.mode;
    mockState.mode = newMode;
    
    // Останавливаем авто-генерацию
    stopAutoImpulses();
    
    // Сбрасываем клапан при переключении из AUTO
    if (oldMode === 'AUTO' && newMode !== 'AUTO') {
        mockState.valve = false;
    }
    
    // Если переключаемся в AUTO
    if (newMode === 'AUTO') {
        if (mockState.valve) {
            startAutoImpulses();
        }
    }
    
    // Если переключаемся в DEMO
    if (newMode === 'DEMO') {
        demoStep = 0;
        demoCounter = 0;
        mockState.cnt_verified = 0;
        mockState.cnt_etalon = 0;
        recalcVolumes();
    }
    
    // Если переключаемся в SERVICE
    if (newMode === 'SERVICE') {
        mockState.error_percent = 0;
    }
    
    updateUI();
    console.log(`[SYSTEM] Режим изменён: ${oldMode} → ${newMode}`);
}

// ========== ДЛЯ MANUAL РЕЖИМА ==========
function addVerifiedPulse() {
    if (mockState.mode !== 'MANUAL') {
        console.log('[MANUAL] Импульсы доступны только в MANUAL режиме');
        return;
    }
    mockState.cnt_verified++;
    recalcVolumes();
    updateUI();
    console.log(`[MANUAL] Импульс поверяемого: ${mockState.cnt_verified}`);
}

function addEtalonPulse() {
    if (mockState.mode !== 'MANUAL') {
        console.log('[MANUAL] Импульсы доступны только в MANUAL режиме');
        return;
    }
    mockState.cnt_etalon++;
    recalcVolumes();
    updateUI();
    console.log(`[MANUAL] Импульс эталонного: ${mockState.cnt_etalon}`);
}

function setCoefficient(coeff) {
    if (mockState.mode !== 'MANUAL') {
        console.log('[MANUAL] Изменение коэффициента доступно только в MANUAL режиме');
        return;
    }
    mockState.coeff_verified = coeff;
    recalcVolumes();
    updateUI();
    console.log(`[MANUAL] Коэффициент изменён на ${coeff} л/имп`);
}

// ========== DEMO РЕЖИМ ==========
function demoUpdate() {
    if (mockState.mode !== 'DEMO') return;
    
    demoCounter++;
    if (demoCounter >= 8) {
        demoCounter = 0;
        
        const targetError = DEMO_ERRORS[demoStep % DEMO_ERRORS.length];
        
        mockState.cnt_etalon += 1;
        mockState.cnt_verified += Math.round(1 + targetError / 100);
        
        if (mockState.cnt_etalon % 4 === 0) {
            demoStep++;
        }
        
        recalcVolumes();
        updateUI();
        console.log(`[DEMO] Погрешность: ${mockState.error_percent.toFixed(2)}%`);
    }
}

// ========== ОБНОВЛЕНИЕ ТЕМПЕРАТУРЫ ==========
function refreshTemperature() {
    mockState.temperature = +(19 + Math.random() * 8).toFixed(1);
    mockState.humidity = +(35 + Math.random() * 30).toFixed(1);
    updateTimestamp();
    
    if (mockState.mode === 'DEMO') {
        demoUpdate();
    }
    
    updateUI();
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', () => {
    updateTimestamp();
    recalcVolumes();
    updateUI();
    
    console.log('========================================');
    console.log('💧 УМНЫЙ ПОВЕРИТЕЛЬ СЧЁТЧИКОВ ЗАПУЩЕН');
    console.log('========================================');
    console.log('🔵 AUTO режим: открой клапан → импульсы сами пойдут');
    console.log('🟠 MANUAL режим: добавляй импульсы вручную');
    console.log('🟡 DEMO режим: автоматическая демонстрация');
    console.log('========================================');
    
    // Обработчики кнопок режимов
    document.querySelectorAll('[data-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            setMode(mode);
        });
    });
    
    // Кнопка клапана
    const valveBtn = document.getElementById('valveToggleBtn');
    if (valveBtn) {
        valveBtn.addEventListener('click', toggleValve);
    }
    
    // Кнопка сброса
    const resetBtn = document.getElementById('resetCountersBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetCounters);
    }
    
    // Кнопки для MANUAL режима
    const manualVerifiedBtn = document.getElementById('manualVerifiedBtn');
    const manualEtalonBtn = document.getElementById('manualEtalonBtn');
    
    if (manualVerifiedBtn) {
        manualVerifiedBtn.addEventListener('click', addVerifiedPulse);
    }
    if (manualEtalonBtn) {
        manualEtalonBtn.addEventListener('click', addEtalonPulse);
    }
    
    // Кнопки коэффициентов
    document.querySelectorAll('.btn-coeff').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const coeff = parseFloat(e.target.dataset.coeff);
            setCoefficient(coeff);
        });
    });
    
    // Автообновление температуры каждые 3 секунды
    refreshInterval = setInterval(refreshTemperature, 3000);
});