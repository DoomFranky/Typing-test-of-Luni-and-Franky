/**
 * Point culture (en Français car je suis un peu obligé): 
 * Dans ce genre de jeu, un mot equivaut a 5 caractères, y compris les espaces. 
 * La precision, c'est le pourcentage de caractères tapées correctement sur toutes les caractères tapées.
 * 
 * Sur ce... Amusez-vous bien ! 
 */
let startTime = null, previousEndTime = null;
let currentWordIndex = 0;
let inputCount=1;
const wordsToType = [];

const modeSelect = document.getElementById("mode");
const wordDisplay = document.getElementById("word-display");
const inputField = document.getElementById("input-field");
const results = document.getElementById("results");

const words = {
    easy: ["apple", "banana", "grape", "orange", "cherry"],
    medium: ["keyboard", "monitor", "printer", "charger", "battery"],
    hard: ["synchronize", "complicated", "development", "extravagant", "misconception"]
};

// Generate a random word from the selected mode
const getRandomWord = (mode) => {
    const wordList = words[mode];
    return wordList[Math.floor(Math.random() * wordList.length)];
};

// Initialize the typing test
const startTest = (wordCount = 50) => {
    wordsToType.length = 0; // Clear previous words
    wordDisplay.innerHTML = ""; // Clear display
    currentWordIndex = 0;
    inputCount=0;
    startTime = null;
    previousEndTime = null;

    for (let i = 0; i < wordCount; i++) {
        wordsToType.push(getRandomWord(modeSelect.value));
    }

    wordsToType.forEach((word, index) => {
        const span = document.createElement("span");
        span.textContent = word + " ";
        if (index === 0) span.style.color = "red"; // Highlight first word
        wordDisplay.appendChild(span);
    });

    inputField.value = "";
    results.textContent = "";

	// 🟢 Initialisation pour stocker les WPM de chaque mot tapé
    window.wpmHistory = [];
};

// Start the timer when user begins typing
const startTimer = () => {
    if (!startTime) startTime = Date.now();
};

//Count the number of input who is type
const inputCounter = ()=>{
    return inputCount ++
}

// Calculate and return WPM & accuracy
const getCurrentStats = () => {
    const elapsedTime = (Date.now() - previousEndTime) / 1000; // Seconds
    const wpm = (wordsToType[currentWordIndex].length / 5) / (elapsedTime / 60); // 5 chars = 1 word
    const accuracy = (wordsToType[currentWordIndex].length / inputCounter()) * 100;

    return { wpm: wpm.toFixed(2), accuracy: accuracy.toFixed(2) };
};

// Move to the next word and update stats only on spacebar press
/*const updateWord = (event) => {
    if (event.key === " ") { // Check if spacebar is pressed
        if (inputField.value.trim() === wordsToType[currentWordIndex]) {
            if (!previousEndTime) previousEndTime = startTime;

            const { wpm, accuracy } = getCurrentStats();
            results.textContent = `WPM: ${wpm}, Accuracy: ${accuracy}%`;
            inputCount=-1;
            currentWordIndex++;
            previousEndTime = Date.now();
            highlightNextWord();

            inputField.value = ""; // Clear input field after space
            event.preventDefault(); // Prevent adding extra spaces
        }
    }
};*/

const updateWord = (event) => {
    if (event.key === " ") { // Check si espace est pressé
        if (inputField.value.trim() === wordsToType[currentWordIndex]) {
            if (!previousEndTime) previousEndTime = startTime;

            const { wpm, accuracy } = getCurrentStats();
            results.textContent = `WPM: ${wpm}, Accuracy: ${accuracy}%`;

            // Stockage de l'historique WPM
            if (!window.wpmHistory) window.wpmHistory = [];
            window.wpmHistory.push(parseFloat(wpm));

            inputCount = -1;
            currentWordIndex++;
            previousEndTime = Date.now();

            // Si le test est terminé
            if (currentWordIndex >= wordsToType.length) {
                const totalTime = (Date.now() - startTime) / 1000 / 60; // En minutes
                const totalChars = wordsToType.join(" ").length;
                const avgWPM = (totalChars / 5) / totalTime;
                const totalInputs = inputCount + totalChars;
                const totalAccuracy = (totalChars / totalInputs) * 100;

                // ✅ Enregistrement propre dans localStorage
                localStorage.setItem("typingResults", JSON.stringify({
                    avgWPM: avgWPM.toFixed(2),           // PAS "avg WPM"
                    accuracy: totalAccuracy.toFixed(2),
                    wpmHistory: window.wpmHistory
                }));

                // Historique des tests
                const testHistory = JSON.parse(localStorage.getItem("testHistory")) || [];

                testHistory.push({
                    avgWPM: avgWPM.toFixed(2),
                    date: new Date().toLocaleString()
                });

                localStorage.setItem("testHistory", JSON.stringify(testHistory));

                // Redirection
                window.location.href = "Game_over.html";
                return;
            }

            // Passage au mot suivant
            highlightNextWord();
            inputField.value = "";
            event.preventDefault(); // Empêche l'espace d’être tapé
        }
    }
};


// Highlight the current word in red
const highlightNextWord = () => {
    const wordElements = wordDisplay.children;

    if (currentWordIndex < wordElements.length) {
        if (currentWordIndex > 0) {
            wordElements[currentWordIndex - 1].style.color = "black";
        }
        wordElements[currentWordIndex].style.color = "red";
    }
};

// Event listeners
// Attach `updateWord` to `keydown` instead of `input`
inputField.addEventListener("keydown", (event) => {
    startTimer();
    updateWord(event);
    inputCounter();
});
modeSelect.addEventListener("change", () => startTest());

// Start the test
startTest();
