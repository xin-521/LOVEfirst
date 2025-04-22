// Get references to the elements
const mainContainer = document.getElementById('mainContainer');
const initialScreen = document.getElementById('initialScreen');
const successScreen = document.getElementById('successScreen');
const goodbyeContainer = document.getElementById('goodbyeContainer'); // New container
const goodbyeMessageText = document.getElementById('goodbyeMessageText'); // New text element
const character = document.getElementById('character');
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
const bgMusic = document.getElementById('bgMusic');

// Image sources
const initialCharSrc = 'images/char-initial.png';
const confusedCharSrc = 'images/char-confused.png';
const angryCharSrc = 'images/char-angry.png';
const sadCharSrc = 'images/char-sad.png';
const happyCharSrc = 'images/char-happy.png';

// Scaling parameters
let yesScale = 1.0;
let noScale = 1.0;
const scaleIncrement = 0.2;
const shrinkDecrement = 0.15;
let targetYesWidth = null;
let originalYesWidth = null;

// Flags and State
let scalingActive = true;
let isNoButtonClicked = false;
let musicStarted = false;
let goodbyeTimeoutId = null; // <<<--- ID for the goodbye timeout

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing...");
    if (!mainContainer || !initialScreen || !successScreen || !goodbyeContainer || !goodbyeMessageText || !character || !yesButton || !noButton) {
        console.error("One or more essential elements not found!");
        return; // Stop if critical elements are missing
    }
    if (!bgMusic) console.warn("Audio element #bgMusic not found.");

    // Calculate button widths
    originalYesWidth = yesButton.offsetWidth;
    const containerPaddingLeft = parseFloat(getComputedStyle(mainContainer).paddingLeft);
    const containerPaddingRight = parseFloat(getComputedStyle(mainContainer).paddingRight);
    const availableWidth = mainContainer.clientWidth - containerPaddingLeft - containerPaddingRight;
    targetYesWidth = availableWidth * 0.75; // Target 75% width
    console.log(`Original Yes Width: ${originalYesWidth}, Target Yes Width: ${targetYesWidth}`);

    // Reset visual state
    resetVisualState();

    // Reset flags
    scalingActive = true;
    isNoButtonClicked = false;
    yesScale = 1.0;
    noScale = 1.0;
    if (goodbyeTimeoutId) { // Clear any leftover timeout from previous state
        clearTimeout(goodbyeTimeoutId);
        goodbyeTimeoutId = null;
    }

    // Add event listeners
    removeNoButtonListeners(); // Clear first
    addNoButtonListeners();
    yesButton.removeEventListener('click', handleYesClick);
    yesButton.addEventListener('click', handleYesClick);

    console.log("Initialization complete.");

    // Attempt Autoplay Music
    attemptAutoplay();
});

// --- Reset Visual State Function ---
function resetVisualState() {
    if (character) character.src = initialCharSrc;
    if (yesButton) {
        yesButton.style.transform = 'scale(1)';
        yesButton.style.opacity = '1';
        yesButton.style.pointerEvents = 'auto';
    }
    if (noButton) {
        noButton.style.transform = 'scale(1)';
        noButton.style.opacity = '1';
        noButton.classList.remove('hidden-final');
        noButton.style.pointerEvents = 'auto';
        noButton.style.display = 'inline-block'; // Ensure it's visible
    }
    if (initialScreen) {
        initialScreen.style.opacity = '1';
        initialScreen.style.visibility = 'visible';
        initialScreen.classList.remove('hidden-final'); // Remove hiding class
        initialScreen.style.display = 'flex'; // Ensure it's visible
    }
    if (successScreen) {
        successScreen.classList.add('hidden');
        successScreen.classList.remove('visible');
    }
     if (goodbyeContainer) { // Reset goodbye screen too
        goodbyeContainer.classList.add('hidden');
        goodbyeContainer.classList.remove('visible');
     }
     if (goodbyeMessageText) {
        goodbyeMessageText.textContent = ''; // Clear text
     }
    console.log("Visual state reset.");
}


// --- Autoplay Music ---
function attemptAutoplay() {
    if (bgMusic) {
        console.log("Attempting to autoplay background music...");
        const playPromise = bgMusic.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log("Background music autoplay started successfully.");
                musicStarted = true;
            }).catch(error => {
                console.error("Background music autoplay failed:", error);
                musicStarted = false;
            });
        }
    }
}

// --- Play Music Manually (Fallback) ---
function playMusicManually() {
    if (!musicStarted && bgMusic) {
        console.log("Attempting manual audio play...");
        bgMusic.play().then(() => {
            musicStarted = true;
            console.log("Manual play successful.");
        }).catch(e => console.error("Manual play failed:", e));
    }
}

// --- "不要" Button Interaction Logic ---
function handleNoMouseOver() {
    if (scalingActive && !isNoButtonClicked && character) {
        character.src = confusedCharSrc;
    }
}
function handleNoMouseOut() {
     if (scalingActive && !isNoButtonClicked && character) {
        character.src = initialCharSrc;
     }
}
function handleNoClick() {
    playMusicManually(); // Try to play music on interaction

    if (!scalingActive || !originalYesWidth || !yesButton || !noButton || !character) return;

    if (!isNoButtonClicked) {
        isNoButtonClicked = true;
        character.src = angryCharSrc;
    }

    const currentYesWidth = originalYesWidth * yesScale;
    const yesIsLargeEnough = currentYesWidth >= targetYesWidth;
    const noIsTooSmall = noScale <= shrinkDecrement; // Check if scale would go to 0 or less

    if (yesIsLargeEnough || noIsTooSmall) {
        // --- Final "No" click ---
        console.log("Condition met: Hiding No button.");
        yesScale = targetYesWidth / originalYesWidth; // Set final size for Yes
        noScale = 0; // Ensure No button scale is 0
        yesButton.style.transform = `scale(${yesScale})`;
        noButton.style.transform = 'scale(0)';
        noButton.classList.add('hidden-final'); // Apply class for potential transition/hiding
        noButton.style.pointerEvents = 'none';
        scalingActive = false; // Stop further scaling
        removeNoButtonListeners(); // Remove listeners from No button
        character.src = sadCharSrc;
        console.log("No button hidden. Scaling deactivated. Character sad.");

        // --- Start the Goodbye Timeout ---
        if (goodbyeTimeoutId) clearTimeout(goodbyeTimeoutId); // Clear previous just in case
        goodbyeTimeoutId = setTimeout(showGoodbyeMessage, 5000); // 5 seconds
        console.log(`Goodbye timeout started (ID: ${goodbyeTimeoutId}). Will trigger in 3s.`);
        // --------------------------------

    } else {
        // --- Intermediate "No" click ---
        yesScale += scaleIncrement;
        noScale -= shrinkDecrement;
        noScale = Math.max(0, noScale); // Don't go below 0

        yesButton.style.transform = `scale(${yesScale})`;
        noButton.style.transform = `scale(${noScale})`;

        // Change to sad character earlier if No button gets small
        if (noScale < 0.7 && character.src !== sadCharSrc && isNoButtonClicked) {
             character.src = sadCharSrc;
             console.log("No button shrinking. Character set to sad.");
        }
    }
}
function addNoButtonListeners() {
    if (!noButton) return;
    noButton.addEventListener('mouseover', handleNoMouseOver);
    noButton.addEventListener('mouseout', handleNoMouseOut);
    noButton.addEventListener('click', handleNoClick);
}
function removeNoButtonListeners() {
    if (!noButton) return;
    noButton.removeEventListener('mouseover', handleNoMouseOver);
    noButton.removeEventListener('mouseout', handleNoMouseOut);
    noButton.removeEventListener('click', handleNoClick);
}

// --- "可以" Button Logic ---
function handleYesClick() {
    playMusicManually(); // Try to play music on interaction

    // --- Cancel the Goodbye Timeout if it's running ---
    if (goodbyeTimeoutId) {
        clearTimeout(goodbyeTimeoutId);
        goodbyeTimeoutId = null;
        console.log("Goodbye timeout cancelled because 'Yes' was clicked.");
    }
    // -------------------------------------------------

    console.log("Yes button clicked.");
    if (!initialScreen || !successScreen || !character) return;

    scalingActive = false; // Stop any scaling
    isNoButtonClicked = false; // Reset flag
    removeNoButtonListeners(); // Remove listeners from No button

    character.src = happyCharSrc; // Show happy character immediately

    // Start transition to success screen
    setTimeout(() => {
        console.log("Fading out initial screen for success.");
        initialScreen.classList.add('hidden-final'); // Use class to fade out
        if (noButton) noButton.style.display = 'none'; // Hide No button completely

        successScreen.classList.remove('hidden'); // Remove display: none
        setTimeout(() => { // Short delay for display change to register
            successScreen.classList.add('visible'); // Start fade-in
            console.log("Success screen made visible.");
        }, 50);

    }, 150); // Small delay after click
}


// --- Goodbye Message Logic ---
function showGoodbyeMessage() {
    console.log("Timeout expired. Showing goodbye message sequence.");
    goodbyeTimeoutId = null; // Mark timeout as finished

    if (!initialScreen || !goodbyeContainer || !goodbyeMessageText) {
        console.error("Cannot show goodbye message - elements missing.");
        return;
    }

    // 1. Hide the initial screen content immediately
    initialScreen.style.transition = 'none'; // Disable transitions for immediate hide
    initialScreen.style.display = 'none';
    console.log("Initial screen hidden for goodbye message.");

    // 2. Prepare and show "好吧"
    goodbyeMessageText.textContent = '好吧😂';
    goodbyeContainer.classList.remove('hidden'); // Remove display: none
    setTimeout(() => { // Short delay for display change
        goodbyeContainer.classList.add('visible'); // Start fade-in
        console.log("Displayed '好吧'.");

        // 3. Schedule change to "祝你幸福"
        setTimeout(() => {
            if (goodbyeMessageText) { // Check if element still exists
                 goodbyeMessageText.textContent = '祝你幸福😅';
                 console.log("Changed text to '祝你幸福'.");
            }
        }, 1500); // Wait 1.5 seconds before changing text

    }, 50); // Delay for display change
}

// --- End of script ---