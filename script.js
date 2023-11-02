// Define a mapping of keyboard keys to color names for the Stroop test.
const keyColorMapping = { 'a': 'red', 's': 'green', 'd': 'blue', 'f': 'yellow' };

// Variables to store the state of the test.
let lastPair = null; // Variable to remember the last word-color pair to avoid repetitions.
let results = []; // Array to hold all the results of the trials.
let averages = null; // Variable to store the average reaction times after calculation.

// Function to display the word with the given color on the page.
function display(word, color) {
    const displayElement = document.getElementById("divLeft");
    displayElement.innerHTML = word;
    displayElement.style.color = color;
}

// Function to generate a non-repeating word-color pair.
function wordColourCreator() {
    const colors = ['red', 'green', 'blue', 'yellow'];
    let word, color;

    do {
        // Randomly select a word and a color.
        word = colors[Math.floor(Math.random() * colors.length)];
        color = colors[Math.floor(Math.random() * colors.length)];
    } while (lastPair && word === lastPair.word && color === lastPair.color);

    // Update the last pair and return the new one.
    lastPair = { word, color };
    return lastPair;
}

// Function to handle the keypress event and resolve when the correct key is pressed.
function waitForKeypress(requiredColor) {
    return new Promise(resolve => {
        const keyHandler = event => {
            // Check if the pressed key is the one mapped to the required color.
            if (keyColorMapping[event.key.toLowerCase()] === requiredColor) {
                document.removeEventListener('keydown', keyHandler);
                resolve(Date.now());
            }
        };
        document.addEventListener('keydown', keyHandler);
    });
}

// Function to manage the countdown before each trial.
async function countdownTimer(duration, displayElement) {
    for (let timeLeft = duration; timeLeft > 0; timeLeft--) {
        displayElement.textContent = `Next trial starts in ${timeLeft}...`;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    displayElement.textContent = ''; // Clear the display after countdown.
}

async function beginTest(numberOfTrials, numberOfWords) {
    const startButton = document.querySelector('#startButton');
    const downloadButton = document.querySelector('#downloadData');

    const countdownDisplay = document.getElementById('divLeft');

    // Disable the start button to avoid multiple test initiations.
    startButton.disabled = true;
    downloadButton.disabled = true;



    // Create an array to store the results.
    results = [];

    // Iterate over the set number of trials, starting from 1.
    for (let trial = 1; trial <= numberOfTrials; trial++) {
        // Start a countdown before each trial.
        await countdownTimer(5, countdownDisplay);

        // Iterate over the set number of words per trial.
        for (let wordIndex = 0; wordIndex < numberOfWords; wordIndex++) {
            const { word, color } = wordColourCreator();
            display(word, color);

            // Capture the start time and wait for the correct keypress.
            const startTime = Date.now();
            const endTime = await waitForKeypress(color);
            const reactionTime = endTime - startTime;
            const congruency = word === color ? 'Congruent' : 'Incongruent';

            // Store each reaction time along with its congruency status and trial number.
            results.push({ trial, congruency, reactionTime });
        }
    }

    countdownDisplay.textContent = "Done";
    // After the test, re-enable the start button.
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



// Initialization code to set up event listeners and start the test.
function initTest() {
    // Event listener to start the test when the 'Start' button is clicked.
    document.querySelector('#startButton').addEventListener('click', () => beginTest(5, 2));
}

// Call the initialization function when the script loads.
initTest();
