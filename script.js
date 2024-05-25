let questions = [];
let currentQuestionIndex = 0;
let score = 0;

document.addEventListener('DOMContentLoaded', (event) => {
  fetchQuestions();
});

async function fetchQuestions(){
  const response = await fetch('https://opentdb.com/api.php?amount=10&category=20');
  const data = await response.json();
  questions = data.results;
  loadQuestion();
}

function loadQuestion(){
  const questionContainer = document.getElementById('question-container');
  questionContainer.innerHTML = '';

  if (currentQuestionIndex >= questions.length) {
    showScore();
    return;
  }

  const question = questions[currentQuestionIndex];
  const questionElement = document.createElement('div');
  questionElement.innerHTML = `<h2>${question.question}</h2>`;
  questionContainer.appendChild(questionElement);

  const answers = [...question.incorrect_answers, question.correct_answer].sort(() => Math.random() - 0.5);
  answers.forEach(answer => {
    const button = document.createElement('button');
    button.innerText = answer;
    button.onclick = () => selectAnswer(answer, question.correct_answer);
    questionContainer.appendChild(button);
  });
}

function selectAnswer(selected, correct){
  const buttons = document.querySelectorAll('#question-container button');
  buttons.forEach(button => {
    button.disabled = true;
    if (button.innerText === correct) {
      button.style.backgroundColor = 'green';
    } else if (button.innerText === selected) {
      button.style.backgroundColor = 'red';
    }
  });

  if (selected === correct) {
    score++;
    document.getElementById('score').innerText = score;
  }

  document.getElementById('next-button').disabled = false;
}

function loadNextQuestion(){
  currentQuestionIndex++;
  document.getElementById('next-button').disabled = true;
  loadQuestion();
}

function showScore(){
  const questionContainer = document.getElementById('question-container');
  questionContainer.innerHTML = `<h2>You've completed the quiz!</h2><p>Your final score is ${score} out of ${questions.length}</p>`;
  document.getElementById('next-button').style.display = 'none';
}
