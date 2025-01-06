const apiUrl = "https://pokeapi.co/api/v2/pokemon?limit=1000";
const typeApiUrl = "https://pokeapi.co/api/v2/type";

async function fetchPokemonData() {
  const response = await fetch(apiUrl);
  const data = await response.json();
  const allPokemon = data.results;

  const selectedPokemon = allPokemon.sort(() => 0.5 - Math.random()).slice(0, 10);
  return selectedPokemon;
}

async function fetchPokemonDetails(url) {
  const response = await fetch(url);
  const data = await response.json();
  return data;
}

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

async function generateQuestion() {
  const pokemonData = await fetchPokemonData();
  const typeIcons = await fetchPokemonTypes();
  const pokemon = pokemonData[Math.floor(Math.random() * pokemonData.length)];
  const details = await fetchPokemonDetails(pokemon.url);
  const types = details.types.map(typeInfo => typeInfo.type.name);
  const correctAnswer = types[0];
  const imageUrl = details.sprites.front_default;

  const allTypes = Object.keys(typeIcons);
  const options = [correctAnswer, ...allTypes.filter(type => type !== correctAnswer).sort(() => 0.5 - Math.random()).slice(0, 3)];

  return {
    question: `¿What primary type is this Pokemon?:  ${pokemon.name}`,
    options: options.sort(() => 0.5 - Math.random()),
    answer: correctAnswer,
    imageUrl: imageUrl,
    typeIcons: typeIcons
  };
}

async function initQuiz() {
  const question = await generateQuestion();
  startQuiz(question);
}

function startQuiz(question) {
  let score = 0;

  document.getElementById("start-btn").addEventListener("click", () => {
    startScreen.classList.add("hidden");
    quizScreen.classList.remove("hidden");
    loadQuestion(question);
  });

  async function loadQuestion(question) {
    questionElement.textContent = question.question;
    optionsContainer.innerHTML = "";
    imageElement.src = question.imageUrl;

    question.options.forEach((option) => {
      const button = document.createElement("button");
      button.textContent = option.charAt(0).toUpperCase() + option.slice(1);
      const icon = document.createElement("img");
      icon.src = question.typeIcons[option];
      icon.alt = option;

      button.prepend(icon);
      button.addEventListener("click", async () => {
        if (option === question.answer) {
          score++;
          currentScoreElement.textContent = score;
          const newQuestion = await generateQuestion();
          loadQuestion(newQuestion);
        } else {
          showResults();
        }
      });
      optionsContainer.appendChild(button);
    });
  }

  function showResults() {
    quizScreen.classList.add("hidden");
    resultScreen.classList.remove("hidden");
    scoreElement.textContent = `Tu puntuación es: ${score}`;
  }

  restartButton.addEventListener("click", async () => {
    score = 0;
    currentScoreElement.textContent = score;
    resultScreen.classList.add("hidden");
    startScreen.classList.remove("hidden");
    const question = await generateQuestion();
    loadQuestion(question);
  });
}

const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");

const questionElement = document.getElementById("question");
const optionsContainer = document.getElementById("options-container");
const imageElement = document.getElementById("pokemon-image");

const nextButton = document.getElementById("next-btn");
const scoreElement = document.getElementById("score");
const currentScoreElement = document.getElementById("current-score");
const restartButton = document.getElementById("restart-btn");

initQuiz();