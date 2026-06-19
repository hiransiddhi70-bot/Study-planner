document.addEventListener('DOMContentLoaded', () => {
    // ========== POMODORO TIMER ==========
    let timer;
    let timeLeft = 25 * 60;
    let isRunning = false;
    let sessions = parseInt(localStorage.getItem('sessions') || '0');
    let streak = parseInt(localStorage.getItem('streak') || '0');
    let lastStudyDate = localStorage.getItem('lastStudyDate');

    const timerDisplay = document.getElementById('timer');
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const sessionsEl = document.getElementById('sessions');
    const streakEl = document.getElementById('streak');

    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.textContent = 'Pause';
        timer = setInterval(() => {
            timeLeft--;
            updateTimerDisplay();
            if (timeLeft <= 0) {
                clearInterval(timer);
                isRunning = false;
                sessions++;
                localStorage.setItem('sessions', sessions);
                sessionsEl.textContent = sessions;
                updateStreak();
                alert('🎉 Pomodoro Complete! 5 min break lo.');
                timeLeft = 5 * 60;
                updateTimerDisplay();
                startBtn.textContent = 'Start';
            }
        }, 1000);
    }

    function resetTimer() {
        clearInterval(timer);
        isRunning = false;
        timeLeft = 25 * 60;
        updateTimerDisplay();
        startBtn.textContent = 'Start';
    }

    function updateStreak() {
        const today = new Date().toDateString();
        if (lastStudyDate!== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastStudyDate === yesterday.toDateString()) {
                streak++;
            } else {
                streak = 1;
            }
            localStorage.setItem('streak', streak);
            localStorage.setItem('lastStudyDate', today);
            streakEl.textContent = streak;
            lastStudyDate = today;
        }
    }

    startBtn?.addEventListener('click', () => {
        isRunning? (clearInterval(timer), isRunning = false, startBtn.textContent = 'Start') : startTimer();
    });
    resetBtn?.addEventListener('click', resetTimer);
    sessionsEl.textContent = sessions;
    streakEl.textContent = streak;
    updateTimerDisplay();

    // ========== GOALS ==========
    const goalInput = document.getElementById('goalInput');
    const setGoalBtn = document.getElementById('setGoalBtn');
    const goalProgress = document.getElementById('goalProgress');
    const goalText = document.getElementById('goalText');
    let dailyGoal = parseInt(localStorage.getItem('dailyGoal') || '0');

    function updateGoalDisplay() {
        const progress = dailyGoal > 0? Math.min((sessions / dailyGoal) * 100, 100) : 0;
        goalProgress.style.width = progress + '%';
        goalText.textContent = dailyGoal > 0? `${sessions}/${dailyGoal} Sessions` : 'Goal set nahi kiya';
    }

    setGoalBtn?.addEventListener('click', () => {
        const goal = parseInt(goalInput.value);
        if (goal > 0) {
            dailyGoal = goal;
            localStorage.setItem('dailyGoal', dailyGoal);
            updateGoalDisplay();
            goalInput.value = '';
        }
    });
    updateGoalDisplay();

    // ========== ASSIGNMENTS ==========
    const assignmentInput = document.getElementById('assignmentInput');
    const dueDateInput = document.getElementById('dueDateInput');
    const addAssignmentBtn = document.getElementById('addAssignmentBtn');
    const assignmentList = document.getElementById('assignmentList');
    let assignments = JSON.parse(localStorage.getItem('assignments') || '[]');

    function renderAssignments() {
        assignmentList.innerHTML = '';
        assignments.forEach((task, index) => {
            const daysLeft = Math.ceil((new Date(task.due) - new Date()) / (1000 * 60 * 60 * 24));
            const badgeClass = daysLeft <= 1? 'badge-danger' : daysLeft <= 3? 'badge-warning' : 'badge-success';
            const item = document.createElement('div');
            item.className = `task-item ${task.done? 'completed' : ''}`;
            item.innerHTML = `
                <div style="display:flex;align-items:center;gap:10px;">
                    <input type="checkbox" class="task-checkbox" ${task.done? 'checked' : ''} data-index="${index}">
                    <div>
                        <div>${task.text}</div>
                        <span class="badge ${badgeClass}">${daysLeft} days left</span>
                    </div>
                </div>
                <button class="delete-btn" data-index="${index}">Delete</button>
            `;
            assignmentList.appendChild(item);
        });
    }

    addAssignmentBtn?.addEventListener('click', () => {
        if (assignmentInput.value && dueDateInput.value) {
            assignments.push({ text: assignmentInput.value, due: dueDateInput.value, done: false });
            localStorage.setItem('assignments', JSON.stringify(assignments));
            assignmentInput.value = '';
            dueDateInput.value = '';
            renderAssignments();
        }
    });

    assignmentList?.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            assignments.splice(e.target.dataset.index, 1);
        } else if (e.target.classList.contains('task-checkbox')) {
            assignments[e.target.dataset.index].done = e.target.checked;
        }
        localStorage.setItem('assignments', JSON.stringify(assignments));
        renderAssignments();
    });
    renderAssignments();

    // ========== HABIT TRACKER ==========
    const habitCalendar = document.getElementById('habitCalendar');
    let habits = JSON.parse(localStorage.getItem('habits') || '{}');

    function renderHabitCalendar() {
        habitCalendar.innerHTML = '';
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const day = document.createElement('div');
            day.className = `habit-day ${habits[dateStr]? 'done' : ''}`;
            day.textContent = date.getDate();
            day.dataset.date = dateStr;
            habitCalendar.appendChild(day);
        }
    }

    habitCalendar?.addEventListener('click', (e) => {
        if (e.target.classList.contains('habit-day')) {
            const date = e.target.dataset.date;
            habits[date] =!habits[date];
            localStorage.setItem('habits', JSON.stringify(habits));
            renderHabitCalendar();
        }
    });
    renderHabitCalendar();

    // ========== MOOD TRACKER ==========
    const moodBtns = document.querySelectorAll('.mood-btn');
    let moods = JSON.parse(localStorage.getItem('moods') || '{}');
    const todayStr = new Date().toISOString().split('T')[0];

    moodBtns.forEach(btn => {
        if (moods[todayStr] === btn.dataset.mood) btn.classList.add('active');
        btn.addEventListener('click', () => {
            moodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            moods[todayStr] = btn.dataset.mood;
            localStorage.setItem('moods', JSON.stringify(moods));
        });
    });

    // ========== SUBJECT CHART ==========
    const subjectChart = document.getElementById('subjectChart');
    if (subjectChart) {
        new Chart(subjectChart, {
            type: 'doughnut',
            data: {
                labels: ['Math', 'Physics', 'Chemistry', 'Biology'],
                datasets: [{
                    data: [12, 8, 6, 4],
                    backgroundColor: ['#6366f1', '#ec4899', '#22c55e', '#f59e0b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }

    // ========== FLASHCARDS ==========
    const flashcard = document.getElementById('flashcard');
    const flashcardFront = document.getElementById('flashcardFront');
    const flashcardBack = document.getElementById('flashcardBack');
    const nextCardBtn = document.getElementById('nextCardBtn');
    let flashcards = JSON.parse(localStorage.getItem('flashcards') || '[{"q":"Capital of India?","a":"New Delhi"},{"q":"H2O =?","a":"Water"}]');
    let currentCard = 0;

    function showCard() {
        if (flashcards.length === 0) return;
        flashcardFront.textContent = flashcards[currentCard].q;
        flashcardBack.textContent = flashcards[currentCard].a;
        flashcard.classList.remove('flipped');
    }

    flashcard?.addEventListener('click', () => flashcard.classList.toggle('flipped'));
    nextCardBtn?.addEventListener('click', () => {
        currentCard = (currentCard + 1) % flashcards.length;
        showCard();
    });
    showCard();

    // ========== EXAM COUNTDOWN ==========
    const examDateInput = document.getElementById('examDateInput');
    const examNameInput = document.getElementById('examNameInput');
    const setExamBtn = document.getElementById('setExamBtn');
    const countdownDisplay = document.getElementById('countdownDisplay');
    let examData = JSON.parse(localStorage.getItem('examData') || 'null');

    function updateCountdown() {
        if (!examData) return;
        const daysLeft = Math.ceil((new Date(examData.date) - new Date()) / (1000 * 60 * 60 * 24));
        countdownDisplay.innerHTML = `
            <div class="stat-value">${daysLeft > 0? daysLeft : 0}</div>
            <div class="stat-label">Days to ${examData.name}</div>
        `;
    }

    setExamBtn?.addEventListener('click', () => {
        if (examDateInput.value && examNameInput.value) {
            examData = { date: examDateInput.value, name: examNameInput.value };
            localStorage.setItem('examData', JSON.stringify(examData));
            updateCountdown();
        }
    });

    if (examData) updateCountdown();
// ========== V1.2: WEEKLY REPORT ==========
document.getElementById('generateReport')?.addEventListener('click', () => {
    const weeklyData = [4, 6, 3, 8, 5, 7, sessions]; // Last 7 days
    new Chart(document.getElementById('weeklyChart'), {
        type: 'bar',
        data: {
            labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
            datasets: [{ label: 'Sessions', data: weeklyData, backgroundColor: '#6366f1' }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
});

// ========== V1.2: CGPA CALCULATOR ==========
document.getElementById('calcCGPA')?.addEventListener('click', () => {
    const s1 = parseFloat(document.getElementById('sub1').value) || 0;
    const s2 = parseFloat(document.getElementById('sub2').value) || 0;
    const s3 = parseFloat(document.getElementById('sub3').value) || 0;
    const avg = (s1 + s2 + s3) / 3;
    const cgpa = (avg / 10).toFixed(2);
    document.getElementById('cgpaResult').innerHTML = `
        <div class="stat-value">${cgpa}</div>
        <div class="stat-label">${avg >= 90? 'Grade: A+' : avg >= 80? 'Grade: A' : 'Keep Going!'}</div>
    `;
});

// ========== V1.2: LOFI PLAYER ==========
document.getElementById('musicSelect')?.addEventListener('change', (e) => {
    const player = document.getElementById('lofiPlayer');
    player.src = e.target.value;
    if(e.target.value) player.play();
});
// ========== V1.3: STUDENT PROFILE ==========
let profile = JSON.parse(localStorage.getItem('studentProfile') || '{"name":"Student Name","pic":"https://via.placeholder.com/80/6366f1/ffffff?text=You","course":"Class/Course","target":"Not Set","bio":"Add your bio..."}');
let totalStudyMins = parseInt(localStorage.getItem('totalStudyMins') || '0');

function loadProfile() {
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profilePic').src = profile.pic;
    document.getElementById('profileCourse').textContent = profile.course;
    document.getElementById('profileTarget').textContent = `Target: ${profile.target}`;
    document.getElementById('profileBio').textContent = profile.bio;
    document.getElementById('totalHours').textContent = Math.floor(totalStudyMins / 60);
}

// Update total hours jab bhi session complete ho
function updateTotalHours() {
    totalStudyMins += 25; // Har pomodoro = 25 min
    localStorage.setItem('totalStudyMins', totalStudyMins);
    document.getElementById('totalHours').textContent = Math.floor(totalStudyMins / 60);
}

// Profile modal
document.getElementById('editProfileBtn')?.addEventListener('click', () => {
    document.getElementById('editName').value = profile.name;
    document.getElementById('editPic').value = profile.pic;
    document.getElementById('editCourse').value = profile.course;
    document.getElementById('editTarget').value = profile.target;
    document.getElementById('editBio').value = profile.bio;
    document.getElementById('profileModal').style.display = 'flex';
});

document.getElementById('closeProfile')?.addEventListener('click', () => {
    document.getElementById('profileModal').style.display = 'none';
});

document.getElementById('saveProfile')?.addEventListener('click', () => {
    profile.name = document.getElementById('editName').value || 'Student Name';
    profile.pic = document.getElementById('editPic').value || 'https://via.placeholder.com/80/6366f1/ffffff?text=You';
    profile.course = document.getElementById('editCourse').value || 'Class/Course';
    profile.target = document.getElementById('editTarget').value || 'Not Set';
    profile.bio = document.getElementById('editBio').value || 'Add your bio...';
    localStorage.setItem('studentProfile', JSON.stringify(profile));
    loadProfile();
    document.getElementById('profileModal').style.display = 'none';
});

loadProfile();

// Pomodoro complete hone pe hours update kar - startTimer function mein ye line add kar:
// updateTotalHours(); // alert('🎉 Pomodoro Complete!')
updateTotalHours();
});
