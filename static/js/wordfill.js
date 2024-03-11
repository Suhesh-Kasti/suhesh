document.addEventListener("DOMContentLoaded", function() {
  // Get the required HTML elements
  const questionTextElement = document.getElementById('question-word');
  const userInputElement = document.getElementById('user-input');
  const feedbackMessageElement = document.getElementById('feedback-word');
  const confirmButton = document.getElementById('confirm-button');
  const scoreElement = document.getElementById('score-word');

// Get the code from the query parameter or the window.quizCode variable
var urlParams = new URLSearchParams(window.location.search);
var codeFromUrl = urlParams.get('code');
var wordCode = codeFromUrl || window.wordCode || "000"; // Use code from URL, window.quizCode variable, or default to "h01"

  // Define question sets
  const questionSets = {
"nmap101": [
  { "correctAnswer": "Yes", "question": "Is this game as well in experimental state?" },
    ]
  };

  // Game state variables
  let currentQuestionIndex = 0;
  let currentCategory = wordCode; // You can change this to switch categories
  let score = 0;
  let totalQuestions = 0;

  // Function to display a question
  function displayQuestion(question) {
    if (!questionTextElement || !userInputElement) {
      console.error("Missing HTML elements. Make sure they exist and the script is placed after them.");
      return;
    }

    // Display the question
    questionTextElement.textContent = question.question;

    // Clear previous user input
    userInputElement.value = "";
  }


function checkAnswer() {
  // Check if the answer has already been processed
  if (confirmButton.disabled) {
    return;
  }

  // Disable the button to prevent multiple clicks
  confirmButton.disabled = true;

  const currentQuestion = getCurrentQuestion();
  const userAnswer = userInputElement.value.trim().toLowerCase(); // Remove leading/trailing spaces from user input

  if (userAnswer === currentQuestion.correctAnswer.toLowerCase()) {
    feedbackMessageElement.textContent = "Congratulations!! Correct answer.";
    feedbackMessageElement.style.color = "green"; // Set feedback message color to green for correct answers
    score++;
  } else {
    feedbackMessageElement.textContent = "Wrong Answer! The correct answer was: " + currentQuestion.correctAnswer;
    feedbackMessageElement.style.color = "red"; // Set feedback message color to red for incorrect answers
  }

  currentQuestionIndex++;
  updateScore();

  // Check if all questions are answered
  if (currentQuestionIndex < getCurrentQuestionSet().length) {
    // Enable the button for the next question after a short delay
    setTimeout(() => {
      confirmButton.disabled = false;
    }, 100);
    displayNextQuestion();
  } else {
    // All questions answered, display final score
    displayFinalScore();
  }
}


// Separate function to handle Enter key press
function handleEnterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent the default form submission behavior
    checkAnswer();
  }
}

// Attach Enter key press event listener
userInputElement.addEventListener('keydown', handleEnterKey);


  // Function to update the score display
  function updateScore() {
    scoreElement.textContent = `Correct: ${score} | Wrong: ${currentQuestionIndex - score}`;
  }

  // Function to display the final score
  function displayFinalScore() {
    const totalQuestions = getCurrentQuestionSet().length;
    feedbackMessageElement.textContent = `Final Score: Correct: ${score} | Wrong: ${totalQuestions - score}`;
  }

   // Function to get the current question based on the category and index
  function getCurrentQuestion() {
    const questionSet = questionSets[currentCategory];

    if (currentQuestionIndex < questionSet.length) {
      return questionSet[currentQuestionIndex];
    } else {
      // All questions have been answered, return null
      return null;
    }
  }

  // Function to get the current question set based on the category
  function getCurrentQuestionSet() {
    const questionSet = questionSets[currentCategory] || [];
    return questionSet;
  }

function displayNextQuestion() {
  const currentQuestionSet = getCurrentQuestionSet();

  if (currentQuestionSet.length === 0) {
    // No questions defined for this category
    feedbackMessageElement.textContent = "There are no questions defined for this category.";
    userInputElement.disabled = true;
    confirmButton.disabled = true;
  } else {
    const currentQuestion = getCurrentQuestion();

    if (currentQuestion) {
      displayQuestion(currentQuestion);
    } else {
      // No more questions, handle this case
      feedbackMessageElement.textContent = "You have completed all the questions for this category.";
      userInputElement.disabled = true;
      confirmButton.disabled = true;
    }
  }
}
  // Function to reset the game
  function resetGame() {
    currentQuestionIndex = 0;
    score = 0;
    totalQuestions = getCurrentQuestionSet().length;
    updateScore();
    displayNextQuestion();
  }

  // Add event listener to handle button click
  confirmButton.addEventListener('click', checkAnswer);


  // Initial setup
  totalQuestions = getCurrentQuestionSet().length;
  displayNextQuestion();
});
