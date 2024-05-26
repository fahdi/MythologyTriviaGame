let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let answeredQuestions = {};  // Track answered questions
let playerName = '';

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
  const previousButton = document.getElementById('previous-button');
  const nextButton = document.getElementById('next-button');
  const infoContainer = document.getElementById('info-container');
  const gameScreen = document.getElementById('game-screen');
  preloader.style.display = show ? 'block' : 'none';
  previousButton.style.display = show ? 'none' : 'inline-block';
  nextButton.style.display = show ? 'none' : 'inline-block';
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

  // check if username is not empty
  let playerName = document.getElementById('username')
  playerName.addEventListener('input', () => {
    let inputError = document.querySelector('.input-error')
    inputError.style.display = 'none'
  });

  if (playerName.value.trim() === "") {
    let inputError = document.querySelector('.input-error')
    inputError.style.display = 'block'
    return
  }
  
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

function loadQuestion(){
  const questionContainer = document.getElementById('question-container');
  questionContainer.classList.add('fade-in');
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
    updateNavigationButtons();

    questionContainer.classList.remove('fade-out');
    questionContainer.classList.add('fade-in');
  }, 1000);
}

function selectAnswer(button, selected, correct){
  const buttons = document.querySelectorAll('#question-container button');
  buttons.forEach(btn => {
    btn.disabled = true;
    if (btn.innerHTML === decodeHtmlEntities(correct)) {
      btn.classList.add('correct');
    } else if (btn.innerHTML === decodeHtmlEntities(selected)) {
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

  document.getElementById('next-button').disabled = false;
  triggerLoadingBar();  // Start the loading bar animation
  setTimeout(() => {
    loadNextQuestion();
  }, 2000);  // Automatically load the next question after 2 seconds
}

function triggerLoadingBar(){
  const loadingBar = document.getElementById('loading-bar');
  loadingBar.style.width = '100%';
  setTimeout(() => {
    loadingBar.style.width = '0%';
  }, 2000);
}

function loadNextQuestion(){
  if (answeredQuestions[currentQuestionIndex]) {
    currentQuestionIndex++;
    document.getElementById('next-button').disabled = true;
    loadQuestion();
  }
}

function loadPreviousQuestion(){
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    loadQuestion();
  }
}

function showScore(){
  const questionContainer = document.getElementById('question-container');
  questionContainer.innerHTML = `
    <h2>Congratulations!</h2>
    <p>You've completed the quiz.</p>
    <p>Your final score is <strong>${score}</strong> out of <strong>${questions.length}</strong>.</p>
    <p>You answered ${score} questions correctly and ${questions.length - score} questions incorrectly.</p>
    <button id="restart-button" onclick="restartGame()">Restart Game</button>
  `;
  document.getElementById('progress-bar').style.display = 'none';
  document.getElementById('previous-button').style.display = 'none';
  document.getElementById('next-button').style.display = 'none';
}

function restartGame(){
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

function updateNavigationButtons(){
  const previousButton = document.getElementById('previous-button');
  const nextButton = document.getElementById('next-button');
  previousButton.disabled = currentQuestionIndex === 0;
  nextButton.disabled = !answeredQuestions[currentQuestionIndex];
}
