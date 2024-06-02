let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 15; // Time in seconds for each question
let answeredQuestions = {};  // Track answered questions
let playerName = '';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('start-button').disabled = false;
});

async function fetchQuestions(category = 'any', difficulty = 'medium'){
    showPreloader(true);
    const url = buildApiUrl(category, difficulty);
    const data = await fetchData(url);
    initializeGame(data.results);
    loadQuestion();
    showPreloader(false);
    triggerFlash();
}

function buildApiUrl(category, difficulty){
    let url = `https://opentdb.com/api.php?amount=10&difficulty=${difficulty}`;
    if (category !== 'any') {
        url += `&category=${category}`;
    }
    return url;
}

async function fetchData(url){
    const response = await fetch(url);
    return await response.json();
}

function initializeGame(fetchedQuestions){
    questions = fetchedQuestions;
    currentQuestionIndex = 0;
    score = 0;
    answeredQuestions = {};
    updateScoreDisplay();
}

function showPreloader(show){
    const preloader = document.getElementById('preloader');
    const gameScreen = document.getElementById('game-screen');
    const infoContainer = document.getElementById('info-container');

    preloader.style.display = show ? 'block' : 'none';
    gameScreen.style.display = show ? 'none' : 'block';
    infoContainer.style.display = show ? 'none' : 'block';
}

function triggerFlash(){
    const flashScreen = document.createElement('div');
    flashScreen.className = 'flash';
    document.body.appendChild(flashScreen);
    setTimeout(() => document.body.removeChild(flashScreen), 500);
}

function startGame(){
    // check if username is not empty
    playerName = document.getElementById('username').value;
    let input = document.getElementById('username');
    input.addEventListener('input', () => {
        let inputError = document.querySelector('.input-error');
        inputError.style.display = 'none';
    });

    if (playerName.trim() === '' || playerName === null) {
        let inputError = document.querySelector('.input-error');
        inputError.style.display = 'block';
        return;
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

function startTimer(){
    clearInterval(timer);
    timeLeft = 15;
    updateTimerDisplay();
    updateProgressBar(timeLeft);

    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        updateProgressBar(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            timeIsUp();
        }
    }, 1000);
}

function updateTimerDisplay(){
    document.getElementById('timer').innerText = `Time left: ${timeLeft} seconds`;
}

function updateProgressBar(timeLeft){
    const percentage = (timeLeft / 15) * 100;
    document.getElementById('time-progress-top').style.width = `${percentage}%`;
    document.getElementById('time-progress-bottom').style.width = `${percentage}%`;
}

function timeIsUp(){
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
        renderQuestion(questionContainer, question);
        highlightPreviousAnswer(questionContainer);

        updateProgress();
        questionContainer.classList.remove('fade-out');
        questionContainer.classList.add('fade-in');

        startTimer();
    }, 1000);
}

function renderQuestion(container, question){
    const questionElement = document.createElement('div');
    questionElement.innerHTML = `<h2>${decodeHtmlEntities(question.question)}</h2>`;
    container.appendChild(questionElement);

    const answers = shuffleAnswers([...question.incorrect_answers, question.correct_answer]);
    answers.forEach(answer => {
        const button = document.createElement('button');
        button.innerHTML = decodeHtmlEntities(answer);
        button.onclick = () => selectAnswer(button, answer, question.correct_answer);
        button.disabled = !!answeredQuestions[currentQuestionIndex];
        container.appendChild(button);
    });
}

function highlightPreviousAnswer(container){
    if (answeredQuestions[currentQuestionIndex]) {
        const { selected, correct } = answeredQuestions[currentQuestionIndex];
        const buttons = container.querySelectorAll('button');
        buttons.forEach(btn => {
            if (btn.innerHTML === decodeHtmlEntities(correct)) {
                btn.classList.add('correct');
            } else if (btn.innerHTML === decodeHtmlEntities(selected)) {
                btn.classList.add('incorrect');
            }
        });
    }
}

function selectAnswer(button, selected, correct){
    clearInterval(timer);

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
            updateScoreDisplay();
            showFeedback('Correct!', 'correct');
        } else {
            showFeedback('Incorrect!', 'incorrect');
        }
    }

    triggerLoadingBar();
    setTimeout(loadNextQuestion, 2000);
}

function updateScoreDisplay(){
    document.getElementById('score').innerText = score;
}

function triggerLoadingBar(){
    const loadingBar = document.getElementById('loading-bar');
    if (loadingBar) {
        loadingBar.style.width = '100%';
        setTimeout(() => loadingBar.style.width = '0%', 2000);
    }
}

function loadNextQuestion(){
    if (answeredQuestions[currentQuestionIndex]) {
        currentQuestionIndex++;
        loadQuestion();
    }
}

// Submit the Player name and score to the server

async function submitData(name, score){
    try {
        const response = await fetch('/api/submit-score', {  // Updated endpoint URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, score })
        });
        const data = await response.json();
        console.log('Server response:', data);

    } catch (error) {
        console.error('Error submitting score:', error);
    }
}

function showScore(){
    // Pass the player name and score to the submitData function
    submitData(playerName, score);

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
    currentQuestionIndex = 0;
    score = 0;
    answeredQuestions = {};

    resetGameScreen();
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
}

function resetGameScreen(){
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
}

function showFeedback(message, className){
    const feedback = document.createElement('div');
    feedback.className = `feedback ${className}`;
    feedback.innerText = message;
    document.getElementById('question-container').appendChild(feedback);
    setTimeout(() => feedback.remove(), 1000);
}

function updateProgress(){
    const progress = document.getElementById('progress');
    const percentage = ((currentQuestionIndex + 1) / questions.length) * 100;
    progress.style.width = `${percentage}%`;
}

function shuffleAnswers(answers){
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
}
