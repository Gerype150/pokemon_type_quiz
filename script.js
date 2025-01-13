const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=1000";
const typeApiUrl = "https://pokeapi.co/api/v2/type";
let score = 0;
let minigameId = 21;
let timer;
let progressBar;

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
async function generateTypeQuestion() {
  const allPokemon = await fetchPokemonData();
  const typeIcons = await fetchPokemonTypes();
  const randomIndex = Math.floor(Math.random() * allPokemon.length);
  const pokemon = allPokemon[randomIndex];
  const details = await fetchPokemonDetails(pokemon.url);
  const types = details.types.map(typeInfo => typeInfo.type.name);
  const correctAnswer = types[0];
  const imageUrl = details.sprites.front_default;

  const allTypes = Object.keys(typeIcons);
  const options = [correctAnswer, ...allTypes.filter(type => type !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3)];

  return {
    question: `What type is ${pokemon.name}?`,
    options: options.sort(() => 0.5 - Math.random()),
    answer: correctAnswer,
    imageUrl: imageUrl,
    typeIcons: typeIcons,
    pokemonName: pokemon.name
  };
}

// Generate a single question based on Pokémon data
async function generateNameQuestion() {
  const allPokemon = await fetchPokemonData();
  const randomIndex = Math.floor(Math.random() * allPokemon.length);
  const pokemon = allPokemon[randomIndex];
  const details = await fetchPokemonDetails(pokemon.url);
  const imageUrl = details.sprites.front_default;

  // Generate options with random Pokémon names
  const options = [pokemon.name, ...allPokemon.filter(p => p.name !== pokemon.name).sort(() => 0.5 - Math.random()).slice(0, 3).map(p => p.name)];

  return {
    question: `What is the name of this Pokémon?`,
    options: options.sort(() => 0.5 - Math.random()), // Shuffle options
    answer: pokemon.name,
    imageUrl: imageUrl,
    typeIcons: null, // No type icons needed for name question
    pokemonName: pokemon.name
  };
}

// Initialize quiz
async function initQuiz(minigameId) {
  switch (minigameId) {
    case 0:
      const Typequestion = await generateTypeQuestion();
      loadQuestion(Typequestion);
      startScreen.classList.add("hidden");
      quizScreen.classList.remove("hidden");
      break;
    case 1:
      const Namequestion = await generateNameQuestion();
      loadQuestion(Namequestion);
      startScreen.classList.add("hidden");
      quizScreen.classList.remove("hidden");
      break;
    default:
      console.error("Invalid minigame ID");
  }
}

// Start Quiz
function startQuiz() {

  if (minigameId === 21) {
    document.getElementById("type-quiz-btn").addEventListener("click", () => {
      minigameId = 0;
      initQuiz(minigameId);
    });
  
    document.getElementById("name-quiz-btn").addEventListener("click", () => {
      minigameId = 1;
      initQuiz(minigameId);
    });
  }
  

  restartButton.addEventListener("click", async () => {
    resetScore();
    currentScoreElement.textContent = score;
    resultScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    startQuiz();
  });
}

// Load Question
async function loadQuestion(question) {
  questionElement.textContent = question.question;
  questionElement.innerHTML = question.question.replace(
    new RegExp(`\\b${question.pokemonName}\\b`, 'gi'),
    (match) => `<span class="pokemon-name">${match.charAt(0).toUpperCase() + match.slice(1)}</span>`
  );
  optionsContainer.innerHTML = "";
  imageElement.src = question.imageUrl;

  progressBar = document.getElementById("progress-bar");
  resetProgressBar();

  question.options.forEach((option) => {
    const button = createOptionButton(option, question.typeIcons);
    button.addEventListener("click", () => handleOptionClick(option, question, timer));
    optionsContainer.appendChild(button);
  });

  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => handleTimeout(question), 5000);
}

function resetProgressBar() {
  progressBar.style.transition = "none";
  progressBar.style.width = "100%";
  progressBar.offsetWidth;
  progressBar.style.transition = "width 5s linear";
  progressBar.style.width = "0%";
}

function stopProgressBar() {
  if (progressBar) {
    const computedStyle = window.getComputedStyle(progressBar);
    const currentWidth = computedStyle.width;
    progressBar.style.transition = "none";
    progressBar.style.width = currentWidth;
  }
}

function createOptionButton(option, typeIcons) {
  const button = document.createElement("button");
  button.textContent = option.charAt(0).toUpperCase() + option.slice(1);

  if (typeIcons) {
    const icon = document.createElement("img");
    icon.src = typeIcons[option];
    icon.alt = option;
    button.prepend(icon);
  }

  button.disabled = true;
  setTimeout(() => button.disabled = false, 300);

  return button;
}

function handleOptionClick(option, question) {
  clearTimeout(timer);
  stopProgressBar();

  Array.from(optionsContainer.children).forEach(btn => btn.disabled = true);

  highlightAnswers(question);

  setTimeout(async () => {
    if (option === question.answer) {
      console.log(minigameId);
      score++;
      currentScoreElement.textContent = score;
      switch (minigameId) {
        case 0:{
          const newQuestion = await generateTypeQuestion();
          loadQuestion(newQuestion);
          break;
        }
        case 1:{
          const newQuestion = await generateNameQuestion();
          loadQuestion(newQuestion);
          break;
        }}
    } else {
      showResults();
    }
  }, 1500);
}

function handleTimeout(question) {
  highlightAnswers(question);
  setTimeout(() => showResults(), 1500);
}

function highlightAnswers(question) {
  question.options.forEach((opt) => {
    const btn = Array.from(optionsContainer.children).find(b => b.textContent.trim() === opt.charAt(0).toUpperCase() + opt.slice(1));
    btn.style.backgroundColor = opt === question.answer ? "green" : "red";
  });
}

// Show Results
function showResults() {
  quizScreen.classList.add("hidden");
  resultScreen.classList.remove("hidden");
  scoreElement.textContent = `Score: ${score}`;
}

//Reset Score
function resetScore() {
  score = 0;
  currentScoreElement.textContent = score;
}

// DOM elements
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const imageElement = document.getElementById("pokemon-image");
const scoreElement = document.getElementById("score");
const currentScoreElement = document.getElementById("current-score");
const restartButton = document.getElementById("restart-btn");

// Initialize the quiz
startQuiz();