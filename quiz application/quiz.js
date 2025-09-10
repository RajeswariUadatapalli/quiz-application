// quiz.js
// Handles category selection, quiz flow, scoring, attempts tracking and redirect to result page.

// Sample quiz data: categories -> array of questions
const QUIZ_DATA = {
  "Data Sciencs": [
    { q: "What does 'IaC' stand for in DevOps?", options: ["Infrastructure as Code","Integration and Control","Instance and Cluster","Interface and Compute"], a:0 },
    { q: "Which cloud provider offers the 'Lambda' serverless product?", options: ["Google Cloud","Azure","AWS","IBM Cloud"], a:2 },
    { q: "Which model family is primarily used for image recognition?", options: ["RNN","Transformer","CNN","GAN"], a:2 },
    { q: "Common container runtime used with Kubernetes?", options: ["Docker Engine","Systemd","Nginx","MySQL"], a:0 },
    { q: "What does 'MLOps' focus on?", options: ["Designing UIs","Operationalizing ML models","Networking hardware","Mobile optimization"], a:1 }
  ],
   "Operating Systems": [
    { q: "Which of the following is NOT an operating system?", options: ["Windows","Linux","Oracle","MacOS"], a:2 },
    { q: "Which scheduling algorithm is used in time-sharing systems?", options: ["FCFS","Round Robin","SJF","Priority"], a:1 },
    { q: "What is the smallest unit of memory the OS can allocate?", options: ["Page","Segment","Frame","Block"], a:0 },
    { q: "Which OS concept prevents multiple processes from accessing the same resource?", options: ["Deadlock","Mutual Exclusion","Thrashing","Context Switching"], a:1 },
    { q: "Which component manages process scheduling?", options: ["Compiler","Scheduler","Loader","Assembler"], a:1 }
  ],

  "HTML & CSS Fundamentals": [
    { q: "Which HTML tag is used to create a hyperlink?", options: ["<link>","<a>","<href>","<nav>"], a:1 },
    { q: "Which CSS property controls the space between an element's border and its content?", options: ["margin","padding","gap","border-spacing"], a:1 },
    { q: "What is responsive design?", options: ["Same everywhere","Adapts layout to screen sizes","Only CSS","No images"], a:1 },
    { q: "Which HTML element should contain the page's main heading?", options: ["<h1>","<header>","<title>","<main>"], a:0 },
    { q: "Which unit is relative to root font-size in CSS?", options: ["px","em","rem","vh"], a:2 }
  ]

};

// State
let user = null;
let currentCategory = null;
let questions = [];
let index = 0;
let answers = []; // user answers indexes or null
const PASS_THRESHOLD = 50; // percent

// DOM refs
const welcomeEl = document.getElementById('welcome');
const categoriesEl = document.getElementById('categories');
const startBtn = document.getElementById('startBtn');
const viewScoresBtn = document.getElementById('viewScores');

const introView = document.getElementById('introView');
const quizView = document.getElementById('quizView');
const qIndexEl = document.getElementById('q-index');
const qTitleEl = document.getElementById('q-title');
const answersEl = document.getElementById('answers');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const finishBtn = document.getElementById('finishBtn');
const progbar = document.getElementById('progbar');
const scoreLive = document.getElementById('scoreLive');
const totalQ = document.getElementById('totalQ');
const logoutBtn = document.getElementById('logoutBtn');

// Protect page — require login
function requireLogin(){
  user = sessionStorage.getItem('quiz_user');
  if(!user){
    // not logged in, redirect to login
    window.location.href = 'login.html';
  } else {
    welcomeEl.textContent ='Hello, ${user}';
  }
}

// render category list
function renderCategories(){
  categoriesEl.innerHTML = '';
  Object.keys(QUIZ_DATA).forEach(cat=>{
    const div = document.createElement('div');
    div.className = 'category';
    div.tectContent='${cat}(${QUIZ_DATA[cat].length}Qs)';
    div.onclick = ()=>selectCategory(cat, div);
    categoriesEl.appendChild(div);
    console.log("Rendering categories....")
    console.log(Object.keys(QUIZ_DATA));
  });
}

function selectCategory(cat, el){
  // highlight
  [...categoriesEl.children].forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  currentCategory = cat;
  startBtn.disabled = false;
  // reset intro text
  introView.querySelector('p').textContent = 'You selected: ${cat}. Click Start Quiz to begin.';
}

// start quiz
startBtn.addEventListener('click', ()=>{
  if(!currentCategory) return;
  questions = QUIZ_DATA[currentCategory].slice(); // copy
  // optional: shuffle questions or keep order
  // questions = shuffle(questions);
  answers = new Array(questions.length).fill(null);
  index = 0;
  totalQ.textContent = questions.length;
  showQuizView();
  renderQuestion();
});

// view last score (if any)
viewScoresBtn.addEventListener('click', ()=>{
  const lastKey = 'lastResult_${user}';
  const raw = localStorage.getItem(lastKey);
  if(!raw){
    alert('No previous score recorded for this user.');
    return;
  }
  const last = JSON.parse(raw);
  const livecorrect=0
  for(let i=0;i<answers.length;i++)
  {
    if(answers[i]===questions[i].a)
    {
        livecorrect++;
    }
  }
  alert("live correct answers:",livecorrect)});

// show quiz view with smooth transition
function showQuizView(){
  introView.style.display = 'none';
  quizView.style.display = 'block';
  // reset controls visibility
  finishBtn.style.display = 'none';
  nextBtn.style.display = 'inline-block';
  prevBtn.style.display = 'inline-block';
}

// render current question
function renderQuestion(){
  const q = questions[index];
  // animate fade-out then update
  const card = document.getElementById('mainCard');
  card.classList.add('fade-out');
  setTimeout(()=>{
    qIndexEl.textContent = 'Question ${index+1} / ${questions.length}';
    qTitleEl.textContent = q.q;
    answersEl.innerHTML = '';
    q.options.forEach((opt,i)=>{
      const div = document.createElement('div');
      div.className = 'option';
      div.tabIndex = 0;
      div.textContent = opt;
      if(answers[index] === i) div.classList.add('selected');
      div.onclick = ()=>chooseOption(i, div);
      // keyboard support
      div.addEventListener('keydown', (e)=>{
        if(e.key === 'Enter' || e.key === ' ') chooseOption(i, div);
      });
      answersEl.appendChild(div);
    });

    // progress & control visibility
    updateProgress();
    prevBtn.disabled = index === 0;
    nextBtn.disabled = answers[index] == null; // only allow next when answered
    // if last question, show finish
    if(index === questions.length - 1){
      finishBtn.style.display = 'inline-block';
      nextBtn.style.display = 'none';
    } else {
      finishBtn.style.display = 'none';
      nextBtn.style.display = 'inline-block';
    }
    // show card back
    card.classList.remove('fade-out');
  }, 180);
}

function chooseOption(choice, el){
  // save answer
  answers[index] = choice;
  // clear previous selected
  [...answersEl.children].forEach(c=>{ c.classList.remove('selected') });
  el.classList.add('selected');
  // enable next
  nextBtn.disabled = false;
  finishBtn.disabled = false;
  // update live score preview (not final)
  const liveCorrect = answers.reduce((acc, a, i)=> acc + (a === questions[i].a ? 1 : 0), 0);
  scoreLive.textContent = liveCorrect;
}

// next / prev controls
prevBtn.addEventListener('click', ()=>{
  if(index > 0) { index--; renderQuestion(); }
});
nextBtn.addEventListener('click', ()=>{
  if(index < questions.length - 1 && answers[index] != null){ index++; renderQuestion(); }
});

// finish quiz
finishBtn.addEventListener('click', finishQuiz);

function finishQuiz(){
  // calculate score
  let correct = 0;
  for(let i=0;i<questions.length;i++){
    if(answers[i] === questions[i].a) correct++;
  }
  const total = questions.length;
  const percent = Math.round((correct/total)*100);
  const passed = percent >= PASS_THRESHOLD;

  // increment attempts for this user/category
  const attemptsKey ='attempts_${user}_${currentCategory}';
  const prevAttempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10);
  const attemptsNow = prevAttempts + 1;
  localStorage.setItem(attemptsKey, attemptsNow.toString());

  // store last result in localStorage (persist across sessions)
  const lastKey = 'lastResult_${user}';
  const lastObj = { category: currentCategory, correct, total, percent, passed, attempts: attemptsNow, timestamp: Date.now() };
  localStorage.setItem(lastKey, JSON.stringify(lastObj));

  // also store last result in sessionStorage for immediate read by result page
  sessionStorage.setItem('last_result', JSON.stringify(lastObj));

  // redirect to result page
  window.location.href = 'result.html';
}

// update progress bar width and live score display
function updateProgress(){
  const pct = Math.round((index / questions.length) * 100);
  progbar.style.width = pct + '%';
  // update live correct count preview
  const liveCorrect = answers.reduce((acc, a, i)=> acc + (a === questions[i].a ? 1 : 0), 0);
  scoreLive.textContent = liveCorrect;
}

// logout button
logoutBtn.addEventListener('click', ()=>{
  sessionStorage.removeItem('quiz_user');
  window.location.href = 'login.html';
});

// init
requireLogin();
renderCategories();
