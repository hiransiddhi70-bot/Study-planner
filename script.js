// ========== STUDY PLANNER V1.5 - FULL CODE ==========

// ----- STATE -----
let state = {
    profile: JSON.parse(localStorage.getItem('profile')) || {
        name: 'Student Name',
        pic: 'https://via.placeholder.com/80/6366f1/ffffff?text=You',
        course: 'Class/Course',
        target: 'Not Set',
        bio: 'Add your bio...'
    },
    timetable: JSON.parse(localStorage.getItem('timetable')) || [],
    totalSessions: parseInt(localStorage.getItem('totalSessions')) || 0,
    todaySessions: parseInt(localStorage.getItem('todaySessions')) || 0,
    lastSessionDate: localStorage.getItem('lastSessionDate') || '',
    streak: parseInt(localStorage.getItem('streak')) || 0,
    examDate: localStorage.getItem('examDate') || '',
    examName: localStorage.getItem('examName') || ''
};

let timerMinutes = 25;
let timerSeconds = 0;
let timerInterval = null;
let isRunning = false;

// ----- DOM ELEMENTS -----
const timerDisplay = document.getElementById('timerDisplay');
const startBtn = document.getElementById('startTimer');
const resetBtn = document.getElementById('resetTimer');
const todaySessionsEl = document.getElementById('todaySessions');
const streakCountEl = document.getElementById('streakCount');
const totalHoursEl = document.getElementById('totalHours');
const examNameInput = document.getElementById('examName');
const examDateInput = document.getElementById('examDate');
const setExamBtn = document.getElementById('setExam');
const countdownDisplay = document.getElementById('countdownDisplay');
const lofiSelect = document.getElementById('lofiSelect');
const playLofiBtn = document.getElementById('playLofi');
const lofiFrame = document.getElementById('lofiFrame');
const darkModeToggle = document.getElementById('darkModeToggle');

// Profile
const editProfileBtn = document.getElementById('editProfileBtn');
const profileModal = document.getElementById('profileModal');
const saveProfileBtn = document.getElementById('saveProfile');
const closeProfileBtn = document.getElementById('closeProfile');
const profilePic = document.getElementById('profilePic');
const profileName = document.getElementById('profileName');
const profileCourse = document.getElementById('profileCourse');
const profileTarget = document.getElementById('profileTarget');
const profileBio = document.getElementById('profileBio');

// Timetable
const addSlotBtn = document.getElementById('addSlotBtn');
const timetableModal = document.getElementById('timetableModal');
const saveSlotBtn = document.getElementById('saveSlot');
const closeSlotBtn = document.getElementById('closeSlot');
const timetableList = document.getElementById('timetableList');

// ----- INIT -----
function init() {
    loadProfile();
    loadTimetable();
    updateStats();
    updateCountdown();
    checkStreak();
    updateAchievements();
    setInterval(updateCountdown, 1000);
    
    // Load dark mode
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.textContent = '☀️';
    }
}

// ----- PROFILE -----
function loadProfile() {
    profilePic.src = state.profile.pic;
    profileName.textContent = state.profile.name;
    profileCourse.textContent = state.profile.course;
    profileTarget.textContent = `Target: ${state.profile.target}`;
    profileBio.textContent = state.profile.bio;
}

editProfileBtn?.addEventListener('click', () => {
    document.getElementById('editName').value = state.profile.name;
    document.getElementById('editPic').value = state.profile.pic;
    document.getElementById('editCourse').value = state.profile.course;
    document.getElementById('editTarget').value = state.profile.target;
    document.getElementById('editBio').value = state.profile.bio;
    profileModal.style.display = 'flex';
});

closeProfileBtn?.addEventListener('click', () => {
    profileModal.style.display = 'none';
});

saveProfileBtn?.addEventListener('click', () => {
    state.profile = {
        name: document.getElementById('editName').value || 'Student Name',
        pic: document.getElementById('editPic').value || 'https://via.placeholder.com/80/6366f1/ffffff?text=You',
        course: document.getElementById('editCourse').value || 'Class/Course',
        target: document.getElementById('editTarget').value || 'Not Set',
        bio: document.getElementById('editBio').value || 'Add your bio...'
    };
    localStorage.setItem('profile', JSON.stringify(state.profile));
    loadProfile();
    profileModal.style.display = 'none';
});

// ----- TIMETABLE -----
function loadTimetable() {
    timetableList.innerHTML = '';
    if (state.timetable.length === 0) {
        timetableList.innerHTML = '<p style="color:var(--text-light);text-align:center;">No slots yet. Click + Add Slot</p>';
        return;
    }
    
    state.timetable.sort((a, b) => a.time.localeCompare(b.time));
    
    state.timetable.forEach((slot, index) => {
        const slotEl = document.createElement('div');
        slotEl.className = 'timetable-slot';
        slotEl.innerHTML = `
            <div class="timetable-time">${slot.time}</div>
            <div class="timetable-subject">${slot.subject}</div>
            <button class="btn btn-danger" style="padding:6px 12px;" onclick="deleteSlot(${index})">×</button>
        `;
        timetableList.appendChild(slotEl);
    });
}

addSlotBtn?.addEventListener('click', () => {
    document.getElementById('slotTime').value = '';
    document.getElementById('slotSubject').value = '';
    timetableModal.style.display = 'flex';
});

closeSlotBtn?.addEventListener('click', () => {
    timetableModal.style.display = 'none';
});

saveSlotBtn?.addEventListener('click', () => {
    const time = document.getElementById('slotTime').value;
    const subject = document.getElementById('slotSubject').value;
    
    if (time && subject) {
        state.timetable.push({ time, subject });
        localStorage.setItem('timetable', JSON.stringify(state.timetable));
        loadTimetable();
        timetableModal.style.display = 'none';
    }
});

window.deleteSlot = function(index) {
    state.timetable.splice(index, 1);
    localStorage.setItem('timetable', JSON.stringify(state.timetable));
    loadTimetable();
};

// ----- ACHIEVEMENTS -----
function updateAchievements() {
    const badges = document.querySelectorAll('.badge');
    badges.forEach(badge => {
        const required = parseInt(badge.dataset.sessions);
        if (state.totalSessions >= required) {
            badge.classList.remove('locked');
            badge.classList.add('unlocked');
        }
    });
}

// ----- POMODORO TIMER -----
function updateTimerDisplay() {
    timerDisplay.textContent = `${String(timerMinutes).padStart(2, '0')}:${String(timerSeconds).padStart(2, '0')}`;
}

function startTimer() {
    if (isRunning) return;
    isRunning = true;
    startBtn.textContent = 'Pause';
    
    timerInterval = setInterval(() => {
        if (timerSeconds === 0) {
            if (timerMinutes === 0) {
                completeSession();
                return;
            }
            timerMinutes--;
            timerSeconds = 59;
        } else {
            timerSeconds--;
        }
        updateTimerDisplay();
    }, 1000);
}

function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.textContent = 'Start';
}

function resetTimer() {
    pauseTimer();
    timerMinutes = 25;
    timerSeconds = 0;
    updateTimerDisplay();
}

function completeSession() {
    pauseTimer();
    resetTimer();
    
    // Update stats
    const today = new Date().toDateString();
    if (state.lastSessionDate !== today) {
        state.todaySessions = 0;
        state.lastSessionDate = today;
        state.streak++;
    }
    state.todaySessions++;
    state.totalSessions++;
    
    localStorage.setItem('todaySessions', state.todaySessions);
    localStorage.setItem('totalSessions', state.totalSessions);
    localStorage.setItem('lastSessionDate', state.lastSessionDate);
    localStorage.setItem('streak', state.streak);
    
    updateStats();
    updateAchievements();
    alert('🎉 Pomodoro Complete! Great job!');
}

startBtn?.addEventListener('click', () => {
    isRunning ? pauseTimer() : startTimer();
});

resetBtn?.addEventListener('click', resetTimer);

// ----- STATS -----
function updateStats() {
    todaySessionsEl.textContent = state.todaySessions;
    streakCountEl.textContent = state.streak;
    const totalHours = Math.floor((state.totalSessions * 25) / 60);
    totalHoursEl.textContent = totalHours;
}

function checkStreak() {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (state.lastSessionDate !== today && state.lastSessionDate !== yesterday) {
        if (state.lastSessionDate !== '') {
            state.streak = 0;
            localStorage.setItem('streak', 0);
        }
    }
}

// ----- EXAM COUNTDOWN -----
function updateCountdown() {
    if (!state.examDate) {
        countdownDisplay.textContent = 'Set your exam date';
        return;
    }
    
    const examTime = new Date(state.examDate).getTime();
    const now = new Date().getTime();
    const diff = examTime - now;
    
    if (diff < 0) {
        countdownDisplay.textContent = 'Exam Day! 🔥';
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    countdownDisplay.innerHTML = `${days}d ${hours}h ${minutes}m<br><span style="font-size:1rem;color:var(--text-light);">${state.examName}</span>`;
}

setExamBtn?.addEventListener('click', () => {
    state.examName = examNameInput.value;
    state.examDate = examDateInput.value;
    localStorage.setItem('examName', state.examName);
    localStorage.setItem('examDate', state.examDate);
    updateCountdown();
});

// ----- LOFI PLAYER -----
playLofiBtn?.addEventListener('click', () => {
    const videoId = lofiSelect.value;
    lofiFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    lofiFrame.style.display = 'block';
});

// ----- DARK MODE -----
darkModeToggle?.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDark);
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
});

// ----- INIT APP -----
init();