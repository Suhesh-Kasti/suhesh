document.addEventListener("DOMContentLoaded", function() {
// Get the required HTML elements
const questionTextElement = document.getElementById('question-text');
const optionsContainer = document.getElementById('options');
const feedbackMessageElement = document.getElementById('feedback-message');
const correctCountElement = document.getElementById('correct-count');
const wrongCountElement = document.getElementById('wrong-count');
const tryAgainButton = document.getElementById('try-again-button');

// Get the code from the query parameter or the window.quizCode variable
var urlParams = new URLSearchParams(window.location.search);
var codeFromUrl = urlParams.get('code');
var quizCode = codeFromUrl || window.quizCode || "nmap101"; // Use code from URL, window.quizCode variable, or default to "h01"

// Game state variables
let score = 0;
let currentQuestionIndex = 0;
let currentCategory = quizCode;

  // Define question sets
  var questionSets = {
"nmap101": [
{"correctAnswer": "Yes", "options": ["Yes", "Yes", "Yes", "Yes"], "question": "Is this game in a experimental state?"}
    ]
  };


// Function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Function to display a question
function displayQuestion(question, callback) {
  if (!questionTextElement || !optionsContainer) {
    console.error("Missing HTML elements. Make sure they exist and the script is placed after them.");
    return;
  }

  // Display the question
  questionTextElement.textContent = question.question;

  // Shuffle options for a random order
  const shuffledOptions = question.options.slice();
  shuffleArray(shuffledOptions);

  // Clear previous options
  optionsContainer.innerHTML = '';

  // Display the options
  shuffledOptions.forEach(function (option) {
    const optionButton = document.createElement('button');
    optionButton.textContent = option;
    optionButton.classList.add('option', 'p-2', 'px-5', 'm-3', 'btn', 'btn-primary', 'btn-sm');
    optionsContainer.appendChild(optionButton);
  });

  // Call the callback function after displaying options
  if (callback && typeof callback === 'function') {
    callback();
  }
}

  // Function to reset the game
  function resetGame() {
    score = 0;
    currentQuestionIndex = 0;
    updateScore();
    selectCategory(quizCode); // Set default category based on quizCode
    displayNextQuestion();
    tryAgainButton.style.display = "none"; // Hide the "Try Again" button
    feedbackMessageElement.textContent = ""; // Clear the feedback message
    optionsContainer.querySelectorAll('.option').forEach(function (option) {
      option.disabled = false; // Enable all options
      option.classList.remove("btn-success", "btn-danger", "btn-light"); // Reset option button styles
      option.classList.add("btn-primary"); // Set the default button style
    });
  }

// Function to update the score display
function updateScore() {
  correctCountElement.textContent = score;
  wrongCountElement.textContent = currentQuestionIndex - score;
}

 // Function to handle user's answer
  function checkAnswer(answer) {
    const currentQuestion = getCurrentQuestion();

    console.log("Selected answer:", answer);
    console.log("Correct answer:", currentQuestion.correctAnswer);

    if (currentQuestion && answer === currentQuestion.correctAnswer) {
      feedbackMessageElement.textContent = "Congratulations!! Correct answer.";
      feedbackMessageElement.style.color = "green"; // Set feedback message color to green for correct answers
      score++;
      optionsContainer.querySelectorAll('.option').forEach(function (option) {
        if (option.textContent === currentQuestion.correctAnswer) {
          option.classList.add("btn-success");
        } else {
          option.classList.remove("btn-primary");
          option.classList.add("btn-light"); // Reset other options to default color
          option.disabled = true; // Disable other options after correct answer
        }
      });
    } else {
      feedbackMessageElement.textContent = "Wrong Answer! The correct answer was: " + currentQuestion.correctAnswer;
      feedbackMessageElement.style.color = "red"; // Set feedback message color to red for incorrect answers
      optionsContainer.querySelectorAll('.option').forEach(function (option) {
        if (option.textContent === answer) {
          option.classList.add("btn-danger");
          option.disabled = true; // Disable the selected option after wrong answer
        }
      });
    }

    currentQuestionIndex++;
    updateScore();

    // Check if all questions are answered
    if (currentQuestionIndex < getCurrentQuestionSet().length) {
      // Pass displayNextQuestion as a callback to displayQuestion
      displayQuestion(getCurrentQuestion(), displayNextQuestion);
    } else {
      // All questions answered, display score and try again button
      displayScore();
      displayTryAgainButton();
    }
  }// Function to get the current question based on the category and index
function getCurrentQuestion() {
  const questionSet = questionSets[currentCategory];

  if (currentQuestionIndex < questionSet.length) {
    return questionSet[currentQuestionIndex];
  } else {
    // All questions have been answered, you may want to handle this case
    return null;
  }
}

// Function to get the current question set based on the category
function getCurrentQuestionSet() {
  return questionSets[currentCategory];
}

// Function to display the next question
function displayNextQuestion() {
  const currentQuestion = getCurrentQuestion();

  if (currentQuestion) {
    displayQuestion(currentQuestion);
  } else {
    // No more questions, you may want to handle this case
    console.log("Quiz completed!");
  }
}

 // Function to display the score
  function displayScore() {
    questionTextElement.textContent = "Quiz completed! Your score: " + score + " out of " + getCurrentQuestionSet().length;
    feedbackMessageElement.textContent = "";
    optionsContainer.querySelectorAll('.option').forEach(function (option) {
      option.disabled = true; // Disable all options after quiz completion
    });


  }// Function to display the "Try Again" button
function displayTryAgainButton() {
  optionsContainer.querySelectorAll('.option').forEach(function (option) {
    option.disabled = true;
  });
  tryAgainButton.style.display = "block";
}

// Function to select the category
function selectCategory(category) {
  currentCategory = category;
}

// Add event listener to handle button clicks using event delegation
optionsContainer.addEventListener('click', function (event) {
  if (event.target.classList.contains('option')) {
    checkAnswer(event.target.textContent);
  }
});

// Try Again button click event
tryAgainButton.addEventListener('click', resetGame);

// Initial setup
resetGame();

});

