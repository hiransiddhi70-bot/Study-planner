// ========== STUDY PLANNER V6.0 - PART 1/3 ==========
let state = {
    profile: JSON.parse(localStorage.getItem('profile')) || { name: 'Student Name', pic: 'https://via.placeholder.com/80/6366f1/ffffff?text=You', course: 'Class/Course', target: 'Not Set', bio: 'Add your bio...' },
    xp: parseInt(localStorage.getItem('xp')) || 0, level: parseInt(localStorage.getItem('level')) || 1,
    unlockedThemes: JSON.parse(localStorage.getItem('unlockedThemes')) || ['default'], currentTheme: localStorage.getItem('currentTheme') || 'default',
    streakFreezes: parseInt(localStorage.getItem('streakFreezes')) || 0, quests: JSON.parse(localStorage.getItem('quests')) || [], lastQuestDate: localStorage.getItem('lastQuestDate') || '',
    timetable: JSON.parse(localStorage.getItem('timetable')) || [], todos: JSON.parse(localStorage.getItem('todos')) || [], notes: JSON.parse(localStorage.getItem('notes')) || [],
    weeklyHours: JSON.parse(localStorage.getItem('weeklyHours')) || [0,0,0], subjectHours: JSON.parse(localStorage.getItem('subjectHours')) || {},
    totalSessions: parseInt(localStorage.getItem('totalSessions')) || 0, todaySessions: parseInt(localStorage.getItem('todaySessions')) || 0, lastSessionDate: localStorage.getItem('lastSessionDate') || '',
    streak: parseInt(localStorage.getItem('streak')) || 0, examDate: localStorage.getItem('examDate') || '', examName: localStorage.getItem('examName') || '',
    roomCode: localStorage.getItem('roomCode') || '', roomChat: JSON.parse(localStorage.getItem('roomChat')) || [], flashcards: JSON.parse(localStorage.getItem('flashcards')) || {},
    currentCardIndex: 0, currentCardSubject: '', isCardFlipped: false, focusModeActive: false,
    habits: JSON.parse(localStorage.getItem('habits')) || [{ id: 1, name: '8 Hours Sleep', icon: '😴', streak: 0, completed: false, lastDate: '' },{ id: 2, name: 'Drink Water', icon: '💧', streak: 0, completed: false, lastDate: '' },{ id: 3, name: 'Exercise', icon: '💪', streak: 0, completed: false, lastDate: '' }],
    weeklyXP: JSON.parse(localStorage.getItem('weeklyXP')) || [0,0,0], monthlyData: JSON.parse(localStorage.getItem('monthlyData')) || {}, lastVoiceNote: ''
};

let timerMinutes = 25, timerSeconds = 0, timerInterval = null, isRunning = false, weeklyChart = null, subjectChart = null, currentSubject = 'General', recognition = null;
const TITLES = ['Noob', 'Beginner', 'Grinder', 'Achiever', 'Pro', 'Master', 'Legend', 'GOD'];
const XP_PER_LEVEL = 100;
const THEMES = { default: { name: 'Default', cost: 0 }, neon: { name: 'Neon', cost: 200 }, matrix: { name: 'Matrix', cost: 300 }, sunset: { name: 'Sunset', cost: 150 } };
const FOCUS_QUOTES = ["No distractions. Just you and your goals.", "Tu kar sakta hai bhai 🔥", "Grind now, shine later 💎", "1% better every day 📈", "Focus = Success 🎯", "Beast mode ON 🦁"];

const userLevel = document.getElementById('userLevel'), userTitle = document.getElementById('userTitle'), currentXP = document.getElementById('currentXP'), nextLevelXP = document.getElementById('nextLevelXP'), xpBar = document.getElementById('xpBar'), totalXP = document.getElementById('totalXP'), profileStreak = document.getElementById('profileStreak'), profileHours = document.getElementById('profileHours'), streakFreezeBtn = document.getElementById('streakFreezeBtn'), questList = document.getElementById('questList'), questTimer = document.getElementById('questTimer'), themeShop = document.getElementById('themeShop'), focusModeBtn = document.getElementById('focusModeBtn'), focusOverlay = document.getElementById('focusOverlay'), focusTimer = document.getElementById('focusTimer'), exitFocusBtn = document.getElementById('exitFocusBtn'), focusQuote = document.getElementById('focusQuote'), timerDisplay = document.getElementById('timerDisplay'), startBtn = document.getElementById('startTimer'), resetBtn = document.getElementById('resetTimer'), todaySessionsEl = document.getElementById('todaySessions'), streakCountEl = document.getElementById('streakCount'), examNameInput = document.getElementById('examName'), examDateInput = document.getElementById('examDate'), setExamBtn = document.getElementById('setExam'), countdownDisplay = document.getElementById('countdownDisplay'), lofiSelect = document.getElementById('lofiSelect'), playLofiBtn = document.getElementById('playLofi'), lofiFrame = document.getElementById('lofiFrame'), darkModeToggle = document.getElementById('darkModeToggle'), editProfileBtn = document.getElementById('editProfileBtn'), profileModal = document.getElementById('profileModal'), saveProfileBtn = document.getElementById('saveProfile'), closeProfileBtn = document.getElementById('closeProfile'), profilePic = document.getElementById('profilePic'), profileName = document.getElementById('profileName'), profileCourse = document.getElementById('profileCourse'), profileTarget = document.getElementById('profileTarget'), addSlotBtn = document.getElementById('addSlotBtn'), timetableModal = document.getElementById('timetableModal'), saveSlotBtn = document.getElementById('saveSlot'), closeSlotBtn = document.getElementById('closeSlot'), timetableList = document.getElementById('timetableList'), addTodoBtn = document.getElementById('addTodoBtn'), todoModal = document.getElementById('todoModal'), saveTodoBtn = document.getElementById('saveTodo'), closeTodoBtn = document.getElementById('closeTodo'), todoList = document.getElementById('todoList'), addNoteBtn = document.getElementById('addNoteBtn'), notesModal = document.getElementById('notesModal'), saveNoteBtn = document.getElementById('saveNote'), closeNoteBtn = document.getElementById('closeNote'), notesList = document.getElementById('notesList'), aiPrompt = document.getElementById('aiPrompt'), generatePlanBtn = document.getElementById('generatePlanBtn'), aiPlanOutput = document.getElementById('aiPlanOutput'), roomCodeInput = document.getElementById('roomCodeInput'), createRoomBtn = document.getElementById('createRoomBtn'), joinRoomBtn = document.getElementById('joinRoomBtn'), roomJoinView = document.getElementById('roomJoinView'), roomActiveView = document.getElementById('roomActiveView'), activeRoomCode = document.getElementById('activeRoomCode'), roomChat = document.getElementById('roomChat'), chatInput = document.getElementById('chatInput'), sendChatBtn = document.getElementById('sendChatBtn'), leaveRoomBtn = document.getElementById('leaveRoomBtn'), flashcardSubject = document.getElementById('flashcardSubject'), generateCardsBtn = document.getElementById('generateCardsBtn'), flashcardView = document.getElementById('flashcardView'), flashcardDisplay = document.getElementById('flashcardDisplay'), prevCardBtn = document.getElementById('prevCardBtn'), nextCardBtn = document.getElementById('nextCardBtn'), cardCounter = document.getElementById('cardCounter'), dailyReportPreview = document.getElementById('dailyReportPreview'), shareWhatsAppBtn = document.getElementById('shareWhatsAppBtn'), exportDataBtn = document.getElementById('exportDataBtn'), importDataBtn = document.getElementById('importDataBtn'), importFileInput = document.getElementById('importFileInput'), habitList = document.getElementById('habitList'), habitDate = document.getElementById('habitDate'), addHabitBtn = document.getElementById('addHabitBtn'), habitModal = document.getElementById('habitModal'), saveHabitBtn = document.getElementById('saveHabit'), closeHabitBtn = document.getElementById('closeHabit'), weeklyRank = document.getElementById('weeklyRank'), weeklyStats = document.getElementById('weeklyStats'), heatmapCalendar = document.getElementById('heatmapCalendar'), voiceNoteSubject = document.getElementById('voiceNoteSubject'), startVoiceBtn = document.getElementById('startVoiceBtn'), stopVoiceBtn = document.getElementById('stopVoiceBtn'), voiceOutput = document.getElementById('voiceOutput'), saveVoiceNoteBtn = document.getElementById('saveVoiceNoteBtn');

function init() {
    loadProfile(); loadTimetable(); loadTodos(); loadNotes(); loadHabits(); updateStats(); updateCountdown(); checkStreak(); updateAchievements(); initCharts(); updateXPDisplay(); loadDailyQuests(); loadThemeShop(); applyTheme(state.currentTheme); updateQuestTimer(); updateDailyReport(); loadFlashcardSubjects(); checkRoomStatus(); updateWeeklyRank(); renderHeatmap(); initVoiceRecognition();
    setInterval(updateCountdown, 1000); setInterval(updateQuestTimer, 1000); setInterval(updateFocusQuote, 300000);
    if (localStorage.getItem('darkMode') === 'true') { document.body.classList.add('dark-mode'); darkModeToggle.textContent = '☀️'; }
    resetDailyHabits();
}

function addXP(amount, reason) {
    state.xp += amount; const today = new Date().getDay(); state.weeklyXP[today] += amount;
    localStorage.setItem('xp', state.xp); localStorage.setItem('weeklyXP', JSON.stringify(state.weeklyXP));
    const newLevel = Math.floor(state.xp / XP_PER_LEVEL) + 1;
    if (newLevel > state.level) { state.level = newLevel; localStorage.setItem('level', state.level); showNotification(`🎉 LEVEL UP!`, `You reached Level ${state.level} - ${getTitle(state.level)}`); playSound('levelup'); }
    updateXPDisplay(); showXPGain(amount, reason); updateDailyReport(); updateWeeklyRank();
}
function getTitle(level) { const index = Math.min(Math.floor((level - 1) / 12), TITLES.length - 1); return TITLES[index]; }
function updateXPDisplay() {
    userLevel.textContent = state.level; userTitle.textContent = getTitle(state.level); totalXP.textContent = state.xp;
    const levelXP = state.xp % XP_PER_LEVEL; const neededXP = XP_PER_LEVEL;
    currentXP.textContent = levelXP; nextLevelXP.textContent = neededXP; xpBar.style.width = `${(levelXP / neededXP) * 100}%`;
}
function showXPGain(amount, reason) {
    const popup = document.createElement('div'); popup.textContent = `+${amount} XP - ${reason}`;
    popup.style.cssText = `position:fixed;top:100px;right:20px;background:var(--success);color:white;padding:12px 20px;border-radius:10px;font-weight:700;z-index:9999;animation:slideIn 0.3s, fadeOut 0.3s 1.7s;`;
    document.body.appendChild(popup); setTimeout(() => popup.remove(), 2000);
}
function playSound(type) {
    const audio = new Audio();
    if (type === 'levelup') audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt66QQQRCGwO/HdSEjXa/n8LVJHAU5k8f0xHkpBSl+zPLaizsHGGSz+8SUWg==';
    if (type === 'quest') audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAD//w==';
    if (type === 'complete') audio.src = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQQAAAD//w==';
    audio.volume = 0.3; audio.play().catch(() => {});
}
// ----- DAILY QUESTS -----
function loadDailyQuests() {
    const today = new Date().toDateString();
    if (state.lastQuestDate!== today) {
        state.quests = [{ id: 1, text: 'Complete 3 Pomodoros', target: 3, progress: 0, xp: 30, completed: false },{ id: 2, text: 'Finish 2 Todos', target: 2, progress: 0, xp: 20, completed: false },{ id: 3, text: 'Write 1 Note', target: 1, progress: 0, xp: 10, completed: false },{ id: 4, text: 'Study for 1 hour', target: 60, progress: 0, xp: 25, completed: false }];
        state.lastQuestDate = today; localStorage.setItem('quests', JSON.stringify(state.quests)); localStorage.setItem('lastQuestDate', today);
    } renderQuests();
}
function renderQuests() {
    questList.innerHTML = ''; state.quests.forEach(quest => {
        const questEl = document.createElement('div'); questEl.className = `quest-item ${quest.completed? 'completed' : ''}`;
        questEl.innerHTML = `<input type="checkbox" class="quest-checkbox" ${quest.completed? 'checked' : ''} disabled><div class="quest-text">${quest.text} (${quest.progress}/${quest.target})</div><div class="quest-xp">+${quest.xp} XP</div>`;
        questList.appendChild(questEl);
    });
}
function updateQuestProgress(questId, amount = 1) {
    const quest = state.quests.find(q => q.id === questId); if (!quest || quest.completed) return;
    quest.progress = Math.min(quest.progress + amount, quest.target);
    if (quest.progress >= quest.target &&!quest.completed) { quest.completed = true; addXP(quest.xp, 'Quest Complete'); playSound('quest'); }
    localStorage.setItem('quests', JSON.stringify(state.quests)); renderQuests();
}
function updateQuestTimer() {
    const now = new Date(); const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now; const hours = Math.floor(diff / (1000 * 60 * 60)); const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)); const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    questTimer.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

// ----- EXPORT/IMPORT -----
exportDataBtn?.addEventListener('click', () => {
    const dataStr = JSON.stringify(state, null, 2); const dataBlob = new Blob([dataStr], {type: 'application/json'}); const url = URL.createObjectURL(dataBlob); const link = document.createElement('a');
    link.href = url; link.download = `study-planner-backup-${new Date().toISOString().split('T')[0]}.json`; link.click(); URL.revokeObjectURL(url);
    showNotification('💾 Backup Done!', 'Data exported successfully'); addXP(5, 'Data Export');
});
importDataBtn?.addEventListener('click', () => importFileInput.click());
importFileInput?.addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return; const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedState = JSON.parse(event.target.result);
            if (confirm('Import karne se current data replace ho jayega. Continue?')) {
                state = importedState; Object.keys(state).forEach(key => { if (typeof state[key] === 'object') { localStorage.setItem(key, JSON.stringify(state[key])); } else { localStorage.setItem(key, state[key]); } });
                showNotification('📥 Import Done!', 'Data restored successfully'); setTimeout(() => location.reload(), 1000);
            }
        } catch (err) { alert('Invalid file! JSON format chahiye'); }
    }; reader.readAsText(file);
});

// ----- HABIT TRACKER -----
function loadHabits() {
    const today = new Date().toDateString(); habitDate.textContent = today; habitList.innerHTML = '';
    state.habits.forEach((habit, index) => {
        if (habit.lastDate!== today) { habit.completed = false; }
        const habitEl = document.createElement('div'); habitEl.className = `habit-item ${habit.completed? 'completed' : ''}`;
        habitEl.innerHTML = `<input type="checkbox" class="habit-checkbox" ${habit.completed? 'checked' : ''} onchange="toggleHabit(${index})"><span class="habit-icon">${habit.icon}</span><span class="habit-name">${habit.name}</span><span class="habit-streak">🔥 ${habit.streak}</span><button class="btn btn-danger" style="padding:4px 8px;" onclick="deleteHabit(${index})">×</button>`;
        habitList.appendChild(habitEl);
    });
}
function resetDailyHabits() {
    const today = new Date().toDateString(); let changed = false;
    state.habits.forEach(habit => { if (habit.lastDate!== today) { habit.completed = false; changed = true; } });
    if (changed) { localStorage.setItem('habits', JSON.stringify(state.habits)); }
}
window.toggleHabit = function(index) {
    const habit = state.habits[index]; const today = new Date().toDateString();
    if (!habit.completed) { habit.completed = true; habit.lastDate = today; habit.streak++; addXP(10, `Habit: ${habit.name}`); playSound('complete'); }
    else { habit.completed = false; habit.streak = Math.max(0, habit.streak - 1); }
    localStorage.setItem('habits', JSON.stringify(state.habits)); loadHabits();
};
window.deleteHabit = function(index) { if (confirm('Habit delete karna hai?')) { state.habits.splice(index, 1); localStorage.setItem('habits', JSON.stringify(state.habits)); loadHabits(); } };
addHabitBtn?.addEventListener('click', () => { document.getElementById('habitName').value = ''; document.getElementById('habitIcon').value = ''; habitModal.style.display = 'flex'; });
closeHabitBtn?.addEventListener('click', () => habitModal.style.display = 'none');
saveHabitBtn?.addEventListener('click', () => {
    const name = document.getElementById('habitName').value.trim(); const icon = document.getElementById('habitIcon').value.trim() || '📌';
    if (name) { state.habits.push({ id: Date.now(), name, icon, streak: 0, completed: false, lastDate: '' }); localStorage.setItem('habits', JSON.stringify(state.habits)); loadHabits(); habitModal.style.display = 'none'; addXP(5, 'Habit Added'); }
});

// ----- WEEKLY RANK -----
function updateWeeklyRank() {
    const today = new Date().getDay(); const thisWeekXP = state.weeklyXP[today]; const lastWeekXP = state.weeklyXP[(today + 6) % 7];
    let rank = 1; if (thisWeekXP < lastWeekXP) rank = 2; if (thisWeekXP < lastWeekXP * 0.5) rank = 3; weeklyRank.textContent = `#${rank}`;
    const percentChange = lastWeekXP > 0? ((thisWeekXP - lastWeekXP) / lastWeekXP * 100).toFixed(0) : 0;
    const arrow = thisWeekXP >= lastWeekXP? '↑' : '↓'; const color = thisWeekXP >= lastWeekXP? '#10b981' : '#ef4444';
    weeklyStats.innerHTML = `<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>This Week:</span><strong>${thisWeekXP} XP</strong></div><div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span>Last Week:</span><strong>${lastWeekXP} XP</strong></div><div style="display:flex;justify-content:space-between;color:${color};"><span>Change:</span><strong>${arrow} ${Math.abs(percentChange)}%</strong></div>`;
}

// ----- MONTHLY HEATMAP -----
function renderHeatmap() {
    heatmapCalendar.innerHTML = ''; const today = new Date(); const year = today.getFullYear(); const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDay = new Date(year, month, 1).getDay();
    for (let i = 0; i < firstDay; i++) { const emptyDay = document.createElement('div'); heatmapCalendar.appendChild(emptyDay); }
    for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`; const sessions = state.monthlyData[dateKey] || 0;
        let level = 0; if (sessions > 0) level = 1; if (sessions >= 3) level = 2; if (sessions >= 5) level = 3; if (sessions >= 8) level = 4;
        const dayEl = document.createElement('div'); dayEl.className = 'heatmap-day'; dayEl.setAttribute('data-level', level); dayEl.title = `${dateKey}: ${sessions} sessions`; heatmapCalendar.appendChild(dayEl);
    }
}
// ----- VOICE NOTES -----
function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; recognition = new SpeechRecognition();
        recognition.continuous = true; recognition.interimResults = true; recognition.lang = 'hi-IN';
        recognition.onresult = (event) => { let transcript = ''; for (let i = event.resultIndex; i < event.results.length; i++) { transcript += event.results[i][0].transcript; } voiceOutput.textContent = transcript; state.lastVoiceNote = transcript; };
        recognition.onerror = (event) => { console.error('Speech recognition error:', event.error); stopVoiceBtn.disabled = true; startVoiceBtn.disabled = false; };
        recognition.onend = () => { stopVoiceBtn.disabled = true; startVoiceBtn.disabled = false; if (state.lastVoiceNote) { saveVoiceNoteBtn.style.display = 'block'; } };
    } else { startVoiceBtn.textContent = 'Not Supported'; startVoiceBtn.disabled = true; }
    const subjects = [...new Set(state.notes.map(n => n.subject))]; voiceNoteSubject.innerHTML = '<option value="">Subject select kar</option>';
    subjects.forEach(sub => { voiceNoteSubject.innerHTML += `<option value="${sub}">${sub}</option>`; });
}
startVoiceBtn?.addEventListener('click', () => { if (recognition) { recognition.start(); startVoiceBtn.disabled = true; stopVoiceBtn.disabled = false; voiceOutput.textContent = 'Listening...'; saveVoiceNoteBtn.style.display = 'none'; } });
stopVoiceBtn?.addEventListener('click', () => { if (recognition) { recognition.stop(); } });
saveVoiceNoteBtn?.addEventListener('click', () => {
    const subject = voiceNoteSubject.value; const text = state.lastVoiceNote.trim();
    if (!subject) { alert('Subject select kar pehle!'); return; } if (!text) { alert('Kuch bolo pehle!'); return; }
    state.notes.push({ subject, text: `[Voice] ${text}` }); localStorage.setItem('notes', JSON.stringify(state.notes)); loadNotes();
    voiceOutput.textContent = 'Saved! ✅'; saveVoiceNoteBtn.style.display = 'none'; state.lastVoiceNote = ''; addXP(5, 'Voice Note Saved');
});

// ----- FOCUS MODE -----
function updateFocusQuote() { if (state.focusModeActive) { const quote = FOCUS_QUOTES[Math.floor(Math.random() * FOCUS_QUOTES.length)]; focusQuote.textContent = quote; } }
focusModeBtn?.addEventListener('click', () => {
    if (!isRunning) { alert('Pehele Pomodoro start kar!'); return; }
    state.focusModeActive = true; document.body.classList.add('focus-active'); focusOverlay.style.display = 'flex';
    if (document.documentElement.requestFullscreen) { document.documentElement.requestFullscreen(); } addXP(5, 'Focus Mode On');
});
exitFocusBtn?.addEventListener('click', () => { state.focusModeActive = false; document.body.classList.remove('focus-active'); focusOverlay.style.display = 'none'; if (document.exitFullscreen) { document.exitFullscreen(); } });
setInterval(() => { if (state.focusModeActive && isRunning) { focusTimer.textContent = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`; } }, 1000);
document.addEventListener('keydown', (e) => { if (state.focusModeActive && e.key === 'Escape') { e.preventDefault(); alert('Focus Mode active hai! Exit button daba'); } });

// ----- STREAK FREEZE -----
streakFreezeBtn?.addEventListener('click', () => {
    if (state.xp < 100) { alert('100 XP chahiye streak freeze ke liye!'); return; }
    if (state.streak === 0) { alert('Streak 0 hai, freeze kya karoge 😅'); return; }
    if (confirm('100 XP use karke streak save karna hai?')) {
        state.xp -= 100; state.streakFreezes++; localStorage.setItem('xp', state.xp); localStorage.setItem('streakFreezes', state.streakFreezes);
        updateXPDisplay(); showNotification('❄️ Streak Frozen!', 'Tera streak safe hai ab');
    }
});

// ----- THEME SHOP -----
function loadThemeShop() {
    themeShop.innerHTML = ''; Object.entries(THEMES).forEach(([key, theme]) => {
        const unlocked = state.unlockedThemes.includes(key); const themeEl = document.createElement('div');
        themeEl.className = `theme-item ${unlocked? 'unlocked' : 'locked'}`;
        themeEl.innerHTML = `<div class="theme-preview" style="background:linear-gradient(135deg, var(--primary), #8b5cf6)"></div><div style="font-weight:600;margin-bottom:4px;">${theme.name}</div><div class="theme-cost">${unlocked? '✓ Owned' : `${theme.cost} XP`}</div>`;
        themeEl.onclick = () => buyTheme(key); themeShop.appendChild(themeEl);
    });
}
function buyTheme(themeKey) {
    if (state.unlockedThemes.includes(themeKey)) { applyTheme(themeKey); return; }
    const theme = THEMES[themeKey]; if (state.xp < theme.cost) { alert(`${theme.cost} XP chahiye! Tera XP: ${state.xp}`); return; }
    if (confirm(`${theme.name} theme ${theme.cost} XP me unlock karna hai?`)) {
        state.xp -= theme.cost; state.unlockedThemes.push(themeKey);
        localStorage.setItem('xp', state.xp); localStorage.setItem('unlockedThemes', JSON.stringify(state.unlockedThemes));
        updateXPDisplay(); loadThemeShop(); applyTheme(themeKey); showNotification('🎨 Theme Unlocked!', `${theme.name} theme ab tera hai`);
    }
}
function applyTheme(themeKey) {
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    if (themeKey!== 'default') { document.body.classList.add(`theme-${themeKey}`); }
    state.currentTheme = themeKey; localStorage.setItem('currentTheme', themeKey);
}

// ----- STUDY ROOM -----
function generateRoomCode() { return Math.random().toString(36).substring(2, 8).toUpperCase(); }
function checkRoomStatus() { if (state.roomCode) { roomJoinView.style.display = 'none'; roomActiveView.style.display = 'block'; activeRoomCode.textContent = state.roomCode; renderRoomChat(); } }
createRoomBtn?.addEventListener('click', () => {
    const code = generateRoomCode(); state.roomCode = code; state.roomChat = [{ user: 'System', text: `Room ${code} created! Share code with friends.` }];
    localStorage.setItem('roomCode', code); localStorage.setItem('roomChat', JSON.stringify(state.roomChat)); checkRoomStatus(); addXP(10, 'Room Created');
});
joinRoomBtn?.addEventListener('click', () => {
    const code = roomCodeInput.value.trim().toUpperCase(); if (!code) { alert('Room code daal bhai!'); return; }
    state.roomCode = code; state.roomChat = [{ user: 'System', text: `Joined room ${code}!` }];
    localStorage.setItem('roomCode', code); localStorage.setItem('roomChat', JSON.stringify(state.roomChat)); checkRoomStatus(); addXP(5, 'Room Joined');
});
sendChatBtn?.addEventListener('click', () => {
    const msg = chatInput.value.trim(); if (!msg) return; state.roomChat.push({ user: state.profile.name, text: msg });
    if (state.roomChat.length > 50) state.roomChat.shift(); localStorage.setItem('roomChat', JSON.stringify(state.roomChat)); chatInput.value = ''; renderRoomChat();
});
leaveRoomBtn?.addEventListener('click', () => {
    if (confirm('Room chhodna hai?')) {
        state.roomCode = ''; state.roomChat = []; localStorage.setItem('roomCode', ''); localStorage.setItem('roomChat', JSON.stringify([]));
        roomJoinView.style.display = 'block'; roomActiveView.style.display = 'none'; roomCodeInput.value = '';
    }
});
function renderRoomChat() {
    roomChat.innerHTML = ''; state.roomChat.forEach(msg => {
        const msgEl = document.createElement('div'); msgEl.className = 'chat-message';
        msgEl.innerHTML = `<div class="chat-user">${msg.user}</div><div class="chat-text">${msg.text}</div>`; roomChat.appendChild(msgEl);
    }); roomChat.scrollTop = roomChat.scrollHeight;
}

// ----- FLASHCARD AI -----
function loadFlashcardSubjects() {
    const subjects = [...new Set(state.notes.map(n => n.subject))]; flashcardSubject.innerHTML = '<option value="">Subject select kar</option>';
    subjects.forEach(sub => { flashcardSubject.innerHTML += `<option value="${sub}">${sub}</option>`; });
}
generateCardsBtn?.addEventListener('click', () => {
    const subject = flashcardSubject.value; if (!subject) { alert('Subject select kar pehle!'); return; }
    const subjectNotes = state.notes.filter(n => n.subject === subject); if (subjectNotes.length === 0) { alert('Is subject ki notes nahi hai!'); return; }
    const cards = []; subjectNotes.forEach(note => {
        const lines = note.text.split(/[.!?]/).filter(l => l.trim().length > 10);
        lines.forEach((line) => {
            const words = line.trim().split(' '); if (words.length > 5) {
                const question = `What about: ${words.slice(0, 4).join(' ')}...?`; const answer = line.trim(); cards.push({ q: question, a: answer });
            }
        });
    });
    if (cards.length === 0) { alert('Notes se cards nahi ban paaye. Longer notes likh!'); return; }
    state.flashcards[subject] = cards; state.currentCardSubject = subject; state.currentCardIndex = 0; state.isCardFlipped = false;
    localStorage.setItem('flashcards', JSON.stringify(state.flashcards)); flashcardView.style.display = 'block'; renderFlashcard(); addXP(15, 'Cards Generated');
});
function renderFlashcard() {
    const cards = state.flashcards[state.currentCardSubject]; if (!cards || cards.length === 0) return;
    const card = cards[state.currentCardIndex]; flashcardDisplay.innerHTML = `<div class="flashcard-front">${card.q}</div><div class="flashcard-back">${card.a}</div>`;
    flashcardDisplay.classList.remove('flipped'); state.isCardFlipped = false; cardCounter.textContent = `${state.currentCardIndex + 1} / ${cards.length}`;
}
flashcardDisplay?.addEventListener('click', () => { flashcardDisplay.classList.toggle('flipped'); state.isCardFlipped =!state.isCardFlipped; });
prevCardBtn?.addEventListener('click', () => { if (state.currentCardIndex > 0) { state.currentCardIndex--; renderFlashcard(); } });
nextCardBtn?.addEventListener('click', () => {
    const cards = state.flashcards[state.currentCardSubject];
    if (state.currentCardIndex < cards.length - 1) { state.currentCardIndex++; renderFlashcard(); if (state.currentCardIndex === cards.length - 1) { addXP(20, 'All Cards Reviewed'); } }
});

// ----- WHATSAPP SHARE -----
function updateDailyReport() {
    const today = new Date().toLocaleDateString('en-IN'); const hours = Math.floor((state.totalSessions * 25) / 60); const minutes = (state.totalSessions * 25) % 60;
    const completedQuests = state.quests.filter(q => q.completed).length; const completedHabits = state.habits.filter(h => h.completed).length;
    const report = `📚 *Study Planner Daily Report* 📚
📅 Date: ${today}
👤 ${state.profile.name} - Level ${state.level} ${