// ========== API ENDPOINTS ==========
const API_BASE = 'http://meterverifier.kesug.com/water-meter-verifier/api/';

const API = {
    getStatus: API_BASE + 'get_status.php',
    setMode: API_BASE + 'set_mode.php',
    updateState: API_BASE + 'update_state.php',
    setCoeff: API_BASE + 'set_coeff.php',
    addPulse: API_BASE + 'add_pulse.php',
    setValve: API_BASE + 'set_valve.php',
    resetCounters: API_BASE + 'reset_counters.php',
    getHistory: API_BASE + 'get_history.php'
};

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentState = null;
let refreshInterval = null;

// ========== ПОЛУЧЕНИЕ СОСТОЯНИЯ ==========
async function fetchState() {
    try {
        const response = await fetch(API.getStatus);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        currentState = data;
        updateUI();
        updateLastUpdateTime();
    } catch (error) {
        console.error('[ERROR] Fetch state failed:', error);
        showConnectionError();
    }
}

// ========== ПОЛУЧЕНИЕ ИСТОРИИ ==========
async function fetchHistory() {
    try {
        const response = await fetch(API.getHistory);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        updateHistoryUI(data);
    } catch (error) {
        console.error('[ERROR] Fetch history failed:', error);
    }
}

// ========== ОБНОВЛЕНИЕ UI ИСТОРИИ ==========
function updateHistoryUI(historyData) {
    const historyContainer = document.getElementById('history-list');
    const commandsContainer = document.getElementById('commands-list');
    
    let history = [];
    let commands = [];
    
    if (historyData.success === true) {
        history = historyData.history || [];
        commands = historyData.commands || [];
    } else {
        history = historyData.history || [];
        commands = historyData.commands || [];
    }
    
    if (historyContainer) {
        if (history.length === 0) {
            historyContainer.innerHTML = '<div class="loading">История пуста</div>';
        } else {
            historyContainer.innerHTML = history.map(record => `
                <div class="history-item">
                    <span class="history-time">${new Date(record.created_at).toLocaleTimeString()}</span>
                    <span class="history-mode">${record.mode}</span>
                    <span class="history-error">${parseFloat(record.error_percent).toFixed(2)}%</span>
                    <span class="history-volume">${parseFloat(record.volume_etalon).toFixed(1)} л</span>
                </div>
            `).join('');
        }
    }
    
    if (commandsContainer) {
        if (commands.length === 0) {
            commandsContainer.innerHTML = '<div class="loading">Команд не было</div>';
        } else {
            commandsContainer.innerHTML = commands.map(cmd => `
                <div class="command-item">
                    <span class="command-time">${new Date(cmd.created_at).toLocaleTimeString()}</span>
                    <span class="command-name">${cmd.command}</span>
                    <span class="command-value">${cmd.value}</span>
                </div>
            `).join('');
        }
    }
}

// ========== ОБНОВЛЕНИЕ ДАННЫХ ==========
async function updateSensorData() {
    try {
        const response = await fetch(API.updateState);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return true;
    } catch (error) {
        console.error('[ERROR] Update failed:', error);
        return false;
    }
}

// ========== СМЕНА РЕЖИМА ==========
async function setMode(mode) {
    try {
        const response = await fetch(API.setMode, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mode: mode })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        currentState = data;
        updateUI();
        updateLastUpdateTime();
        fetchHistory();
    } catch (error) {
        console.error('[ERROR] Set mode failed:', error);
        alert('Ошибка смены режима: ' + error.message);
    }
}

// ========== УПРАВЛЕНИЕ КЛАПАНОМ ==========
async function setValve(state) {
    if (currentState?.mode !== 'AUTO') {
        alert('Управление клапаном доступно только в режиме AUTO');
        return;
    }
    try {
        const response = await fetch(API.setValve, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ valve: state })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        currentState = data;
        updateUI();
        updateLastUpdateTime();
        fetchHistory();
    } catch (error) {
        console.error('[ERROR] Set valve failed:', error);
        alert('Ошибка управления клапаном: ' + error.message);
    }
}

// ========== ДОБАВЛЕНИЕ ИМПУЛЬСОВ ==========
async function addPulse(type) {
    if (currentState?.mode !== 'MANUAL') {
        alert('Добавление импульсов доступно только в режиме MANUAL');
        return;
    }
    try {
        const response = await fetch(API.addPulse, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: type })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        currentState = data;
        updateUI();
        updateLastUpdateTime();
    } catch (error) {
        console.error('[ERROR] Add pulse failed:', error);
        alert('Ошибка добавления импульса: ' + error.message);
    }
}

// ========== ИЗМЕНЕНИЕ КОЭФФИЦИЕНТА ==========
async function setCoefficient(coeff) {
    if (currentState?.mode !== 'MANUAL') {
        alert('Изменение коэффициента доступно только в режиме MANUAL');
        return;
    }
    try {
        const response = await fetch(API.setCoeff, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coeff: coeff })
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        currentState = data;
        updateUI();
        updateLastUpdateTime();
    } catch (error) {
        console.error('[ERROR] Set coefficient failed:', error);
        alert('Ошибка изменения коэффициента: ' + error.message);
    }
}

// ========== СБРОС СЧЁТЧИКОВ ==========
async function resetCounters() {
    try {
        const response = await fetch(API.resetCounters, { method: 'POST' });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        currentState = data;
        updateUI();
        updateLastUpdateTime();
    } catch (error) {
        console.error('[ERROR] Reset counters failed:', error);
        alert('Ошибка сброса счётчиков: ' + error.message);
    }
}

// ========== ОБНОВЛЕНИЕ UI ==========
function updateUI() {
    if (!currentState) return;
    
    const modeSpan = document.getElementById('current-mode');
    modeSpan.textContent = currentState.mode;
    modeSpan.setAttribute('data-mode', currentState.mode);
    
    document.getElementById('cnt-verified').textContent = currentState.cnt_verified ?? 0;
    document.getElementById('volume-verified').textContent = (currentState.volume_verified ?? 0).toFixed(2);
    document.getElementById('cnt-etalon').textContent = currentState.cnt_etalon ?? 0;
    document.getElementById('volume-etalon').textContent = (currentState.volume_etalon ?? 0).toFixed(2);
    document.getElementById('temperature').textContent = (currentState.temperature ?? 0).toFixed(1);
    document.getElementById('humidity').textContent = (currentState.humidity ?? 0).toFixed(1);
    
    const errorSpan = document.getElementById('error-percent');
    const errorValue = currentState.error_percent ?? 0;
    errorSpan.textContent = errorValue.toFixed(2);
    
    if (Math.abs(errorValue) > 10) errorSpan.style.color = '#e74c3c';
    else if (Math.abs(errorValue) > 5) errorSpan.style.color = '#f39c12';
    else errorSpan.style.color = '#27ae60';
    
    document.getElementById('coeff-verified').textContent = (currentState.coeff_verified ?? 1.0).toFixed(2);
    document.getElementById('current-coeff').textContent = (currentState.coeff_verified ?? 1.0).toFixed(2);
    
    const valveSpan = document.getElementById('valve-status');
    const valveBtn = document.getElementById('valveToggleBtn');
    
    if (currentState.valve) {
        valveSpan.innerHTML = '🔓 ОТКРЫТ';
        valveSpan.style.color = '#27ae60';
        if (valveBtn) valveBtn.textContent = '🔒 ЗАКРЫТЬ КЛАПАН';
    } else {
        valveSpan.innerHTML = '🔒 ЗАКРЫТ';
        valveSpan.style.color = '#e74c3c';
        if (valveBtn) valveBtn.textContent = '🔓 ОТКРЫТЬ КЛАПАН';
    }
    
    document.getElementById('timestamp').textContent = currentState.timestamp ?? 0;
    
    const manualCard = document.getElementById('manualCard');
    const demoCard = document.getElementById('demoCard');
    const valveCard = document.getElementById('valveCard');
    
    if (currentState.mode === 'MANUAL') {
        if (manualCard) manualCard.style.display = 'block';
        if (demoCard) demoCard.style.display = 'none';
        if (valveCard) valveCard.style.display = 'none';
    } else if (currentState.mode === 'DEMO') {
        if (manualCard) manualCard.style.display = 'none';
        if (demoCard) demoCard.style.display = 'block';
        if (valveCard) valveCard.style.display = 'none';
    } else if (currentState.mode === 'SERVICE') {
        if (manualCard) manualCard.style.display = 'none';
        if (demoCard) demoCard.style.display = 'none';
        if (valveCard) valveCard.style.display = 'none';
    } else {
        if (manualCard) manualCard.style.display = 'none';
        if (demoCard) demoCard.style.display = 'none';
        if (valveCard) valveCard.style.display = 'block';
    }
    
    const hint = document.getElementById('valveHint');
    if (hint && currentState.mode === 'AUTO') {
        if (!currentState.valve) {
            hint.style.display = 'block';
            hint.innerHTML = '💡 Открой клапан, чтобы началась автоматическая поверка!';
        } else {
            hint.style.display = 'block';
            hint.innerHTML = '✅ Поверка идёт! Импульсы генерируются автоматически.';
            hint.style.background = '#d5f5e3';
        }
    } else if (hint) {
        hint.style.display = 'none';
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ==========
function updateLastUpdateTime() {
    document.getElementById('last-update').textContent = new Date().toLocaleTimeString();
}

function showConnectionError() {
    document.getElementById('last-update').textContent = '❌ Ошибка соединения';
}

// ========== АВТООБНОВЛЕНИЕ ==========
function startAutoRefresh() {
    if (refreshInterval) clearInterval(refreshInterval);
    
    async function refreshCycle() {
        await updateSensorData();
        await fetchState();
        await fetchHistory();
    }
    
    refreshInterval = setInterval(refreshCycle, 2000);
    console.log('[SYSTEM] Auto-refresh started (interval: 2s)');
}

function stopAutoRefresh() {
    if (refreshInterval) {
        clearInterval(refreshInterval);
        refreshInterval = null;
        console.log('[SYSTEM] Auto-refresh stopped');
    }
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', async () => {
    console.log('========================================');
    console.log('💧 УМНЫЙ ПОВЕРИТЕЛЬ СЧЁТЧИКОВ (с БД)');
    console.log('========================================');
    
    await fetchState();
    await fetchHistory();
    startAutoRefresh();
    
    // Кнопки режимов
    document.querySelectorAll('[data-mode]').forEach(btn => {
        btn.addEventListener('click', (e) => setMode(e.target.dataset.mode));
    });
    
    // Кнопка клапана
    const valveBtn = document.getElementById('valveToggleBtn');
    if (valveBtn) valveBtn.addEventListener('click', () => setValve(!currentState?.valve));
    
    // Кнопки MANUAL
    document.getElementById('manualVerifiedBtn')?.addEventListener('click', () => addPulse('verified'));
    document.getElementById('manualEtalonBtn')?.addEventListener('click', () => addPulse('etalon'));
    
    // Кнопки коэффициентов
    document.querySelectorAll('.btn-coeff').forEach(btn => {
        btn.addEventListener('click', (e) => setCoefficient(parseFloat(e.target.dataset.coeff)));
    });
    
    // Кнопка сброса
    document.getElementById('resetCountersBtn')?.addEventListener('click', resetCounters);
    
    // Вкладки истории
    const tabs = document.querySelectorAll('.tab');
    const historyList = document.getElementById('history-list');
    const commandsList = document.getElementById('commands-list');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'states') {
                historyList.style.display = 'block';
                commandsList.style.display = 'none';
            } else {
                historyList.style.display = 'none';
                commandsList.style.display = 'block';
            }
        });
    });
});

window.addEventListener('beforeunload', () => stopAutoRefresh());