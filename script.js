const quoteDisplayElement = document.getElementById('quote-display');
const quoteInputElement = document.getElementById('quote-input');
const timerElement = document.getElementById('time');
const wpmElement = document.getElementById('wpm');
const accuracyElement = document.getElementById('accuracy');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

const nameEntryScreen = document.getElementById('name-entry-screen');
const finalWpm = document.getElementById('final-wpm');
const finalAcc = document.getElementById('final-acc');
const usernameInput = document.getElementById('username');
const saveBtn = document.getElementById('save-btn');
const leaderboardList = document.getElementById('leaderboard-list');

let timer;
let maxTime = 60;
let timeLeft = maxTime;
let isPlaying = false;
let totalKeystrokes = 0;
let correctKeystrokes = 0;

// Hardcoded quotes for fast, reliable loading
const quotes = [
    "Programming is the art of telling another human what one wants the computer to do.",
    "A good programmer is someone who always looks both ways before crossing a one-way street.",
    "There are only two hard things in Computer Science: cache invalidation and naming things.",
    "First, solve the problem. Then, write the code.",
    "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    "Simplicity is the soul of efficiency.",
    "Code is like humor. When you have to explain it, it's bad.",
    "Fix the cause, not the symptom.",
    "Software is like entropy: It is difficult to grasp, weighs nothing, and obeys the Second Law of Thermodynamics; i.e., it always increases.",
    "Java is to JavaScript what car is to Carpet."
];

function getRandomQuote() {
    return quotes[Math.floor(Math.random() * quotes.length)];
}

function renderNewQuote() {
    const quote = getRandomQuote();
    quoteDisplayElement.innerHTML = '';
    quote.split('').forEach(character => {
        const characterSpan = document.createElement('span');
        characterSpan.innerText = character;
        quoteDisplayElement.appendChild(characterSpan);
    });
    quoteInputElement.value = '';
}

function startTest() {
    if (isPlaying) return;
    
    // Reset test vars
    totalKeystrokes = 0;
    correctKeystrokes = 0;
    timeLeft = maxTime;
    timerElement.innerText = timeLeft + 's';
    wpmElement.innerText = '0';
    accuracyElement.innerText = '100%';
    quoteInputElement.disabled = false;
    nameEntryScreen.classList.add('hidden');
    saveBtn.innerText = "Save Score";
    saveBtn.disabled = false;
    usernameInput.value = '';
    
    renderNewQuote();
    quoteInputElement.focus();
    
    isPlaying = true;
    startTimer();
}

function resetTest() {
    clearInterval(timer);
    isPlaying = false;
    quoteInputElement.disabled = true;
    quoteInputElement.value = '';
    quoteDisplayElement.innerText = 'Press "Start Test" to begin...';
    timeLeft = maxTime;
    timerElement.innerText = timeLeft + 's';
    wpmElement.innerText = '0';
    accuracyElement.innerText = '100%';
    nameEntryScreen.classList.add('hidden');
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        if(timeLeft > 0) {
            timeLeft--;
            timerElement.innerText = timeLeft + 's';
            updateStats();
        } else {
            endTest();
        }
    }, 1000);
}

function updateStats() {
    const timeElapsed = maxTime - timeLeft;
    if(timeElapsed > 0) {
        // Assume 5 characters = 1 word
        const wpm = Math.round((correctKeystrokes / 5) / (timeElapsed / 60));
        wpmElement.innerText = wpm > 0 ? wpm : 0;
    }
    
    if(totalKeystrokes > 0) {
        const accuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100);
        accuracyElement.innerText = accuracy + '%';
    }
}

function endTest() {
    clearInterval(timer);
    isPlaying = false;
    quoteInputElement.disabled = true;
    
    const finalCalculatedWPM = wpmElement.innerText;
    const finalCalculatedAcc = accuracyElement.innerText.replace('%', '');
    
    finalWpm.innerText = finalCalculatedWPM;
    finalAcc.innerText = finalCalculatedAcc;
    nameEntryScreen.classList.remove('hidden');
}

quoteInputElement.addEventListener('input', () => {
    if(!isPlaying) return;
    
    const arrayQuote = quoteDisplayElement.querySelectorAll('span');
    const arrayValue = quoteInputElement.value.split('');
    let correct = true;
    let currentCorrectKeys = 0;
    
    arrayQuote.forEach((characterSpan, index) => {
        const character = arrayValue[index];
        if (character == null) {
            characterSpan.className = '';
            correct = false;
        } else if (character === characterSpan.innerText) {
            characterSpan.className = 'correct';
            currentCorrectKeys++;
        } else {
            characterSpan.className = 'incorrect';
            correct = false;
        }
    });

    totalKeystrokes++;
    correctKeystrokes = currentCorrectKeys;
    
    // Auto-advance to next quote if finished correctly
    if (correct && arrayValue.length === arrayQuote.length) {
        renderNewQuote(); 
    }
});

startBtn.addEventListener('click', startTest);
resetBtn.addEventListener('click', resetTest);

// API Interactions
saveBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if(!username) {
        alert('Please enter your name to save your score!');
        return;
    }
    
    const wpm = finalWpm.innerText;
    const accuracy = finalAcc.innerText;
    
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;

    fetch('save_score.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username,
            wpm: parseInt(wpm),
            accuracy: parseInt(accuracy)
        })
    })
    .then(async res => {
        const data = await res.json();
        if(res.ok && data.status === 'success') {
             nameEntryScreen.innerHTML = '<h3>Score Saved!</h3><p>Excellent typing.</p>';
             fetchLeaderboard();
        } else {
             throw new Error(data.message || 'Error occurred');
        }
    })
    .catch(err => {
        console.warn(err);
        alert('Could not save score. Are you running a local PHP server? (Error: ' + err.message + ')');
        saveBtn.innerText = "Save Score";
        saveBtn.disabled = false;
    });
});

function fetchLeaderboard() {
    fetch('get_scores.php')
        .then(res => {
            if(!res.ok) throw new Error("Backend not reachable");
            return res.json();
        })
        .then(data => {
            leaderboardList.innerHTML = '';
            if(data.records && data.records.length > 0) {
                data.records.forEach((score, index) => {
                    const li = document.createElement('li');
                    li.innerHTML = `<span class="leader-name">${index + 1}. ${score.username}</span> 
                                    <span class="leader-score">${score.wpm} WPM <span style="font-size:0.8em; color:var(--text-secondary)">(${score.accuracy}%)</span></span>`;
                    leaderboardList.appendChild(li);
                });
            } else {
                leaderboardList.innerHTML = '<li style="justify-content:center; color:var(--text-secondary);">No scores yet. Be the first!</li>';
            }
        })
        .catch(err => {
            console.warn("Backend not found, showing default msg.");
            leaderboardList.innerHTML = '<li style="justify-content:center; color:var(--text-secondary);">Cannot load scores without PHP server running.</li>';
        });
}

// Initial fetch attempt
fetchLeaderboard();
