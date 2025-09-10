// login.js
// Basic client-side login (demo). Stores username in sessionStorage and redirects to quiz.html

const form = document.getElementById('loginForm');
const guestBtn = document.getElementById('guestBtn');
const loginError = document.getElementById('loginError');

function saveUserAndRedirect(name){
  const user = name.trim();
  if(!user){
    loginError.textContent = 'Please enter a username.';
    loginError.style.display = 'block';
    return;
  }
  // Save the username to session storage for this session
  sessionStorage.setItem('quiz_user', user);
  // Redirect to quiz page
  window.location.href = 'quiz.html';
}
form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const user = document.getElementById('username').value;
  const pwd = document.getElementById('password').value;
  // demo: accept any non-empty credentials
  if(!user || !pwd){
    loginError.textContent = 'Please enter both username and password.';
    loginError.style.display = 'block';
    return;
  }
  saveUserAndRedirect(user);
});

guestBtn.addEventListener('click', ()=>{
  // create a random guest name
  const guestName = 'Guest_' + Math.floor(Math.random()*9000 + 1000);
  saveUserAndRedirect(guestName);
});