document.addEventListener("DOMContentLoaded", async function () {
  const container = document.getElementById("flashcard-container");
  if (!container) return;

  const questionText = document.getElementById("flashcard-question-text");
  const answerText = document.getElementById("flashcard-answer-text");
  const currentSpan = document.getElementById("flashcard-current");
  const totalSpan = document.getElementById("flashcard-total");

  var urlParams = new URLSearchParams(window.location.search);
  var codeFromUrl = urlParams.get("code");
  // Optional dataset fallback if added to body
  var code = codeFromUrl || document.body.dataset.quizCode || "nmap101";

  let flashcards = [];
  let currentIndex = 0;
  let isFlipped = false;

  try {
    // Attempt to load wordfill by default since they map perfectly as scenarios to answers
    const response = await fetch(`/questions/quiz/${code}.json`);
    if (!response.ok) throw new Error("Flashcards not found");
    flashcards = await response.json();

    // Shuffle the deck!
    flashcards = flashcards.sort(() => 0.5 - Math.random());
    totalSpan.innerText = flashcards.length;
    showCard(0);
  } catch (err) {
    console.error("Flashcards Error:", err);
    questionText.innerText = "Check back soon for flashcards!";
  }

  function showCard(index) {
    if (flashcards.length === 0) return;
    currentIndex = index;
    isFlipped = false;
    container.style.transform = "rotateY(0deg)";

    questionText.innerText = flashcards[currentIndex].question;
    answerText.innerText = flashcards[currentIndex].correctAnswer;
    currentSpan.innerText = currentIndex + 1;
  }

  window.flipCard = function (e) {
    // Ignore flip if user clicks the actual answer button
    if (e && e.target.tagName === 'BUTTON') return;

    isFlipped = !isFlipped;
    container.style.transform = isFlipped ? "rotateY(180deg)" : "rotateY(0deg)";
  }

  window.nextFlashcard = function (event) {
    if (event) event.stopPropagation();

    // Reset flip visually before text swaps
    isFlipped = false;
    container.style.transform = "rotateY(0deg)";

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % flashcards.length;
      showCard(currentIndex);
    }, 250); // slight delay to allow smooth flip transit
  }
});
