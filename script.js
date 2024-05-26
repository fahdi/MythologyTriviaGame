let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15; // Time in seconds for each question
let answeredQuestions = {};  // Track answered questions

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('start-button').disabled = false;
});

async function fetchQuestions(category = 'any', difficulty = 'medium'){
  showPreloader(true);
  let url = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}`;
  if (category !== 'any') {
    url += `&category=${category}`;
  }
  const response = await fetch(url);
  const data = await response.json();
  questions = data.results;
  currentQuestionIndex = 0;
  score = 0;
  answeredQuestions = {};
  document.getElementById('score').innerText = score;
  loadQuestion();
  showPreloader(false);
  triggerFlash();
}

function showPreloader(show){
  const preloader = document.getElementById('preloader');
  const infoContainer = document.getElementById('info-container');
  const gameScreen = document.getElementById('game-screen');
  preloader.style.display = show ? 'block' : 'none';
  infoContainer.style.display = show ? 'none' : 'block';
  gameScreen.style.display = show ? 'none' : 'block';
}

function triggerFlash(){
  const flashScreen = document.createElement('div');
  flashScreen.className = 'flash';
  document.body.appendChild(flashScreen);
  setTimeout(() => {
    document.body.removeChild(flashScreen);
  }, 500);
}

function startGame(){
  const category = document.getElementById('trivia-category').value;
  const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
  document.getElementById('start-screen').style.display = 'none';
  fetchQuestions(category, difficulty);
}

function decodeHtmlEntities(text){
  const textArea = document.createElement('textarea');
  textArea.innerHTML = text;
  return textArea.value;
}

function startTimer(){
  clearInterval(timer);
  timeLeft = 15;
  document.getElementById('timer').innerText = `Time left: ${timeLeft} seconds`;
  updateProgressBar(timeLeft);  // Update progress bars at the start
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById('timer').innerText = `Time left: ${timeLeft} seconds`;
    updateProgressBar(timeLeft);  // Update progress bars every second
    if (timeLeft <= 0) {
      clearInterval(timer);
      timeIsUp();
    }
  }, 1000);
}

function updateProgressBar(timeLeft){
  const percentage = (timeLeft / 15) * 100;
  document.getElementById('time-progress-top').style.width = `${percentage}%`;
  document.getElementById('time-progress-bottom').style.width = `${percentage}%`;
}

function timeIsUp(){
  // Mark the question as incorrect and load the next question
  selectAnswer(null, '', questions[currentQuestionIndex].correct_answer);
}

function loadQuestion(){
  const questionContainer = document.getElementById('question-container');
  questionContainer.classList.remove('fade-in');
  questionContainer.classList.add('fade-out');
  setTimeout(() => {
    questionContainer.innerHTML = '';

    if (currentQuestionIndex >= questions.length) {
      showScore();
      return;
    }

    const question = questions[currentQuestionIndex];
    const questionElement = document.createElement('div');
    questionElement.innerHTML = `<h2>${decodeHtmlEntities(question.question)}</h2>`;
    questionContainer.appendChild(questionElement);

    const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
    answers.forEach(answer => {
      const button = document.createElement('button');
      button.innerHTML = decodeHtmlEntities(answer);
      button.onclick = () => selectAnswer(button, answer, question.correct_answer);
      button.disabled = !!answeredQuestions[currentQuestionIndex];  // Disable button if already answered
      questionContainer.appendChild(button);
    });

    if (answeredQuestions[currentQuestionIndex]) {
      const selectedAnswer = answeredQuestions[currentQuestionIndex];
      const buttons = document.querySelectorAll('#question-container button');
      buttons.forEach(btn => {
        if (btn.innerHTML === decodeHtmlEntities(selectedAnswer.correct)) {
          btn.classList.add('correct');
        } else if (btn.innerHTML === decodeHtmlEntities(selectedAnswer.selected)) {
          btn.classList.add('incorrect');
        }
      });
    }

    updateProgress();

    questionContainer.classList.remove('fade-out');
    questionContainer.classList.add('fade-in');

    // Start the timer for the new question
    startTimer();
  }, 1000);
}

function selectAnswer(button, selected, correct){
  clearInterval(timer); // Stop the timer when an answer is selected
  const buttons = document.querySelectorAll('#question-container button');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn && btn.innerHTML === decodeHtmlEntities(correct)) {
      btn.classList.add('correct');
    } else if (btn && btn.innerHTML === decodeHtmlEntities(selected)) {
      btn.classList.add('incorrect');
    }
  });

  if (!answeredQuestions[currentQuestionIndex]) {
    answeredQuestions[currentQuestionIndex] = { selected, correct };
    if (selected === correct) {
      score++;
      document.getElementById('score').innerText = score;
      showFeedback('Correct!', 'correct');
    } else {
      showFeedback('Incorrect!', 'incorrect');
    }
  }

  triggerLoadingBar();  // Start the loading bar animation
  setTimeout(() => {
    loadNextQuestion();
  }, 2000);  // Automatically load the next question after 2 seconds
}

function triggerLoadingBar(){
  const loadingBar = document.getElementById('loading-bar');
  if (loadingBar) {
    loadingBar.style.width = '100%';
    setTimeout(() => {
      loadingBar.style.width = '0%';
    }, 2000);
  }
}

function loadNextQuestion(){
  if (answeredQuestions[currentQuestionIndex]) {
    currentQuestionIndex++;
    loadQuestion();
  }
}

function showScore(){
  const gameScreen = document.getElementById('game-screen');
  gameScreen.innerHTML = `
    <div id="progress-bar-top">
      <div id="time-progress-top"></div>
    </div>
    <div class="game-inner">
      <div id="progress-bar">
        <div id="progress"></div>
      </div>
      <div id="question-container">
        <h2>Congratulations!</h2>
        <p>You've completed the quiz.</p>
        <p>Your final score is <strong>${score}</strong> out of <strong>${questions.length}</strong>.</p>
        <p>You answered ${score} questions correctly and ${questions.length - score} questions incorrectly.</p>
        <button id="restart-button" onclick="restartGame()">Restart Game</button>
      </div>
    </div>
    <div id="progress-bar-bottom">
      <div id="time-progress-bottom"></div>
    </div>
  `;
}

function restartGame(){
  // Reset the game state
  currentQuestionIndex = 0;
  score = 0;
  answeredQuestions = {};

  // Reset the game screen HTML to initial state
  document.getElementById('game-screen').innerHTML = `
    <div id="progress-bar-top">
      <div id="time-progress-top"></div>
    </div>
    <div class="game-inner">
      <div id="progress-bar">
        <div id="progress"></div>
      </div>
      <div id="question-container"></div>
      <div id="info-container">
        <p id="timer">Time left: 15 seconds</p>
        <p>Score: <span id="score">0</span></p>
      </div>
    </div>
    <div id="progress-bar-bottom">
      <div id="time-progress-bottom"></div>
    </div>
  `;
  document.getElementById('game-screen').style.display = 'none';
  document.getElementById('start-screen').style.display = 'block';
}

function showFeedback(message, className){
  const feedback = document.createElement('div');
  feedback.className = `feedback ${className}`;
  feedback.innerText = message;
  document.getElementById('question-container').appendChild(feedback);
  setTimeout(() => {
    feedback.remove();
  }, 1000);
}

function updateProgress(){
  const progress = document.getElementById('progress');
  const percentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  progress.style.width = `${percentage}%`;
}
