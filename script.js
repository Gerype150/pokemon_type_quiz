const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=1000"; // Fetch a large number of Pokémon
const typeApiUrl = "https://pokeapi.co/api/v2/type"; // URL to fetch Pokémon types

// Fetch Pokémon data
async function fetchPokemonData() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  return data.results;
}

// Fetch detailed Pokémon data to get their types and image
async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

// Fetch Pokémon types data and include icon URLs
async function fetchPokemonTypes() {
  const response = await fetch(typeApiUrl);
  const data = await response.json();
  const types = data.results;

  // Filter out invalid types and add icon URLs to valid types
  const validTypes = ["normal", "fire", "water", "electric", "grass", "ice", "fighting", "poison", "ground", "flying", "psychic", "bug", "rock", "ghost", "dragon", "dark", "steel", "fairy"];
  const typeIcons = {};
  types.forEach(type => {
    if (validTypes.includes(type.name)) {
      typeIcons[type.name] = `https://raw.githubusercontent.com/duiker101/pokemon-type-svg-icons/master/icons/${type.name}.svg`;
    }
  });

  return typeIcons;
}

// Generate a single question based on Pokémon data
async function generateQuestion() {
  const allPokemon = await fetchPokemonData();
  const typeIcons = await fetchPokemonTypes();
  const randomIndex = Math.floor(Math.random() * allPokemon.length);
  const pokemon = allPokemon[randomIndex];
  const details = await fetchPokemonDetails(pokemon.url);
  const types = details.types.map(typeInfo => typeInfo.type.name);
  const correctAnswer = types[0]; // Assuming the first type is the primary type
  const imageUrl = details.sprites.front_default; // Get the image URL

  // Generate options (including the correct answer and some random types)
  const allTypes = Object.keys(typeIcons);
  const options = [correctAnswer, ...allTypes.filter(type => type !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3)];

  return {
    question: `What type is ${pokemon.name}?`,
    options: options.toSorted(() => 0.5 - Math.random()), // Shuffle options
    answer: correctAnswer,
    imageUrl: imageUrl, // Include the image URL
    typeIcons: typeIcons // Include type icons
  };
}

// Initialize quiz
async function initQuiz() {
  const question = await generateQuestion();
  startQuiz(question);
}

// Start Quiz
function startQuiz(question) {
  let score = 0;

  document.getElementById("start-btn").addEventListener("click", () => {
    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    loadQuestion(question);
  });

// Load Question
async function loadQuestion(question) {
  questionElement.textContent = question.question;
  optionsContainer.innerHTML = "";
  imageElement.src = question.imageUrl; // Set the image source

  let timer;
  const progressBar = document.getElementById("progress-bar");
  progressBar.style.transition = "none"; // Reset the transition
  progressBar.style.width = "100%"; // Reset the progress bar

  // Force reflow to apply the width immediately
  progressBar.offsetWidth;

  progressBar.style.transition = "width 5s linear"; // Set the transition
  progressBar.style.width = "0%"; // Start the transition

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option.charAt(0).toUpperCase() + option.slice(1); // Capitalize the first letter
  
    // Add icon to the button
    const icon = document.createElement("img");
    icon.src = question.typeIcons[option]; // Use the type icon URL
    icon.alt = option;
  
    button.prepend(icon); // Add the icon to the button
    button.disabled = true; // Disable the button initially
    setTimeout(() => {
      button.disabled = false; // Enable the button after a fraction of a second
    }, 300); // Adjust the delay as needed
  
    button.addEventListener("click", async () => {
      clearTimeout(timer); // Clear the timer when an option is selected
      progressBar.style.transition = "none"; // Stop the progress bar transition
  
      // Disable all buttons to prevent multiple clicks
      Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);
  
      // Highlight correct and incorrect answers
      question.options.forEach((opt) => {
        const btn = Array.from(optionsContainer.children).find(b => b.textContent.trim() === opt.charAt(0).toUpperCase() + opt.slice(1));
        if (opt === question.answer) {
          btn.style.backgroundColor = "green";
        } else {
          btn.style.backgroundColor = "red";
        }
      });
  
      // Wait for 1.5 seconds before checking the answer
      setTimeout(async () => {
        if (option === question.answer) {
          score++;
          currentScoreElement.textContent = score; // Update the score display
          const newQuestion = await generateQuestion();
          loadQuestion(newQuestion);
        } else {
          showResults();
        }
      }, 1500);
    });
    optionsContainer.appendChild(button);
  });

  // Set a timer for 5 seconds
  timer = setTimeout(() => {
    // Highlight correct and incorrect answers
    question.options.forEach((opt) => {
      const btn = Array.from(optionsContainer.children).find(b => b.textContent.trim() === opt.charAt(0).toUpperCase() + opt.slice(1));
      if (opt === question.answer) {
        btn.style.backgroundColor = "green";
      } else {
        btn.style.backgroundColor = "red";
      }
    });

    // Wait for 1.5 seconds before showing results
    setTimeout(() => {
      showResults();
    }, 1500);
  }, 5000);
}

// Show Results
function showResults() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  scoreElement.textContent = `Score: ${score}`;
}

  // Restart Quiz
  restartButton.addEventListener("click", async () => {
    score = 0;
    currentScoreElement.textContent = score; // Reset the score display
    resultScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    initQuiz();
  });
}

// DOM elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const imageElement = document.getElementById("pokemon-image"); // Get the image element
const nextButton = document.getElementById("next-btn");
const scoreElement = document.getElementById("score");
const currentScoreElement = document.getElementById("current-score"); // Get the current score element
const restartButton = document.getElementById("restart-btn");

// Initialize the quiz
initQuiz();