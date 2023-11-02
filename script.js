// Define a mapping of keyboard keys to colors corresponding to the Stroop test.
const keyColorMapping = { 'a': 'red', 's': 'green', 'j': 'blue', 'k': 'yellow' };

// Variables to store the state of the test.
let lastPair = null; // Stores the last displayed word-color pair to avoid immediate repetition.
let results = []; // Array to hold the reaction time results of each trial.

// Function to display the word with the specified color on the page.
// @param {string} word - The word to be displayed.
// @param {string} color - The color in which the word should be displayed.
function display(word, color) {
    const displayElement = document.getElementById("divLeft");
    displayElement.innerHTML = word; // Sets the inner HTML of the div to the word.
    displayElement.style.color = color; // Sets the text color of the div to the specified color.
}

// Function to generate a random word-color pair that doesn't repeat the last one.
// @returns {Object} An object with 'word' and 'color' properties.
function wordColourCreator() {
    const colors = ['red', 'green', 'blue', 'yellow'];
    let word, color;

    do {
        // Select a random word and color from the colors array.
        word = colors[Math.floor(Math.random() * colors.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
    } while (lastPair && word === lastPair.word && color === lastPair.color);
    // Prevent immediate repetition of the same word-color pair.

    lastPair = { word, color }; // Update the lastPair with the new values.
    return lastPair; // Return the new non-repeating word-color pair.
}

// Function to listen for a keypress and return a promise that resolves when the correct key is pressed.
// @param {string} requiredColor - The color that the pressed key must correspond to.
// @returns {Promise<number>} A promise that resolves with the timestamp of the correct key press.
function waitForKeypress(requiredColor) {
    return new Promise(resolve => {
        const keyHandler = event => {
            if (keyColorMapping[event.key.toLowerCase()] === requiredColor) {
                document.removeEventListener('keydown', keyHandler); // Remove the event listener.
                resolve(Date.now()); // Resolve the promise with the current timestamp.
            }
        };
        document.addEventListener('keydown', keyHandler); // Attach the event listener to the document.
    });
}

// Function to start a countdown before each trial begins.
// @param {number} duration - The countdown duration in seconds.
// @param {HTMLElement} displayElement - The element where the countdown is displayed.
async function countdownTimer(duration, displayElement) {
    for (let timeLeft = duration; timeLeft > 0; timeLeft--) {
        document.getElementById("divLeft").style.color = "black"
        displayElement.textContent = `Next trial starts in ${timeLeft}...`; // Update the display with the countdown.
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second.
    }
    displayElement.textContent = ''; // Clear the display after the countdown ends.
}

// Function to initiate the Stroop test.
// @param {number} numberOfTrials - The total number of trials in the test.
// @param {number} numberOfWords - The number of words to display per trial.
async function beginTest(numberOfTrials, numberOfWords) {
    // Fetch the start and download buttons.
    const startButton = document.querySelector('#startButton');
    const downloadButton = document.querySelector('#downloadData');

    // Disable the start and download buttons to prevent re-initiation during the test.
    startButton.disabled = true;
    downloadButton.disabled = true;

    lastPair = null;
    results = []; 

    for (let trial = 1; trial <= numberOfTrials; trial++) {
        await countdownTimer(5, document.getElementById('divLeft')); // Start a 5-second countdown.

        for (let wordIndex = 0; wordIndex < numberOfWords; wordIndex++) {
            const { word, color } = wordColourCreator(); // Generate a non-repeating word-color pair.
            display(word, color); // Display the word in the selected color.

            const startTime = Date.now(); // Record the start time.
            const endTime = await waitForKeypress(color); // Wait for the correct keypress.
            const reactionTime = endTime - startTime; // Calculate the reaction time.
            const congruency = word === color ? 'Congruent' : 'Incongruent'; // Determine congruency.

            // Store the reaction time along with the trial number and congruency status.
            results.push({ trial, congruency, reactionTime });
        }
    }

    const displayElement = document.getElementById("divLeft");
    displayElement.textContent = "Experiment finished";
    displayElement.style.color = "black";

    // Re-enable the start and download buttons after the test completes.
    startButton.disabled = false;
    downloadButton.disabled = false;
}

function downloadData() {
    // Create a CSV string and add the headers.
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Trial Number,Type,Reaction Time (ms)\r\n"; // Column headers

    // Append data from the results
    results.forEach(results => {
        csvContent += `${results.trial},${results.congruency},${results.reactionTime}\r\n`;
    });

    // Encode the CSV content so it can be used as a URL.
    const encodedUri = encodeURI(csvContent);

    // Create a temporary anchor (link) element.
    const link = document.createElement("a");

    // Set the download attribute of the link to the filename.
    link.setAttribute("download", "stroop-test-results.csv");

    // Set the href of the link to the encoded URI.
    link.href = encodedUri;

    // Append the link to the body.
    document.body.appendChild(link);

    // Simulate a click on the link to start the download.
    link.click();

    // Remove the link after starting the download.
    document.body.removeChild(link);
}

// Initialize the test setup.
function initTest() {
    // Add a click event listener to the 'Start' button to begin the test.
    document.querySelector('#startButton').addEventListener('click', () => beginTest(10, 10));
}

// Execute the initialization function when the script loads.
initTest();