// result.js
// Reads the last_result from sessionStorage (set by quiz.js), displays score and message,
// checks pass percentage and if it's the user's first attempt for that category.

const user = sessionStorage.getItem('quiz_user');
const resultBlock = document.getElementById('resultBlock');
const userLabel = document.getElementById('userLabel');
const backBtn = document.getElementById('backBtn');
const logoutBtn = document.getElementById('logoutBtn');

if(!user){
  // not logged in -> go to login
  window.location.href = 'login.html';
}

userLabel.textContent = 'Hello, ${user}';

const raw = sessionStorage.getItem('last_result') || localStorage.getItem('lastResult_${user}');
if(!raw){
  resultBlock.innerHTML = '<div class="result-title">No result found.</div><div class="result-sub">Return and take a quiz to see results.</div>';
} else {
  const res = JSON.parse(raw);
  const passed = res.passed;
  const attemptsKey = 'attempts_${user}_${res.category}';
  const attempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10);
// header
  const title = document.createElement('div');
  title.className = 'result-title';
  title.textContent = passed ? 'Congratulations!' : 'Result';

  // message
  const sub = document.createElement('div');
  sub.className = 'result-sub';
  if(passed){
    if(attempts === 1){
      sub.innerHTML = 'Congratulations on passing <strong>${res.category}</strong> on your <strong>first attempt</strong>!';
    } else {
      sub.innerHTML = 'You passed <strong>${res.category}</strong> — nice job! This was attempt #${attempts}.';
    }
  } else {
    sub.innerHTML = 'You scored below the passing threshold. Keep practicing and try again! Attempt #${attempts}.';
  }

  // score card
  const scoreCard = document.createElement('div');
  scoreCard.style.textAlign = 'center';
  scoreCard.innerHTML = `<div style="font-size:2.2rem;font-weight:800">${res.correct}/${res.total}</div><div style="color:var(--muted);margin-top:6px">${res.percent}%</div>`;

  // details and actions
  const details = document.createElement('div');
  details.style.marginTop = '12px';
  details.innerHTML = `<div style="color:var(--muted)"><strong>Category:</strong> ${res.category}</div>
                       <div style="color:var(--muted);margin-top:6px"><strong>Attempts:</strong> ${attempts}</div>`;

  resultBlock.appendChild(title);
  resultBlock.appendChild(sub);
  resultBlock.appendChild(scoreCard);
  resultBlock.appendChild(details);
 // offer actions
  const actions = document.createElement('div');
  actions.style.marginTop = '14px';
  actions.style.display = 'flex';
  actions.style.gap = '8px';
  actions.style.justifyContent = 'center';

  const retryBtn = document.createElement('button');
  retryBtn.className = 'btn primary';
  retryBtn.textContent = 'Retake Quiz';
  retryBtn.onclick = ()=> { window.location.href = 'quiz.html'; };

  const reviewBtn = document.createElement('button');
  reviewBtn.className = 'btn ghost';
  reviewBtn.textContent = 'Back to Categories';
  reviewBtn.onclick = ()=> { window.location.href = 'quiz.html'; };

  actions.appendChild(retryBtn);
  actions.appendChild(reviewBtn);
  resultBlock.appendChild(actions);
}

// back & logout handlers
backBtn.addEventListener('click', ()=> window.location.href = 'quiz.html');
logoutBtn.addEventListener('click', ()=>{
  sessionStorage.removeItem('quiz_user');
  window.location.href = 'login.html';
});