// Get references to the elements
const mainContainer = document.getElementById('mainContainer');
const initialScreen = document.getElementById('initialScreen');
const successScreen = document.getElementById('successScreen');
const character = document.getElementById('character'); // 小人的图片元素
const yesButton = document.getElementById('yesButton');
const noButton = document.getElementById('noButton');
const bgMusic = document.getElementById('bgMusic'); // *** Audio Element ***

// Image sources (确保路径正确)
const initialCharSrc = 'images/char-initial.png';
const confusedCharSrc = 'images/char-confused.png';
const angryCharSrc = 'images/char-angry.png';
const sadCharSrc = 'images/char-sad.png';
const happyCharSrc = 'images/char-happy.png';

// Scaling parameters
let yesScale = 1.0;
let noScale = 1.0;
const scaleIncrement = 0.2; // "可以" 每次增大比例
const shrinkDecrement = 0.15; // "不要" 每次缩小比例
let targetYesWidth = null;
let originalYesWidth = null;

// Flags
let scalingActive = true;
let isNoButtonClicked = false;
let musicStarted = false; // Flag to track if music has successfully started

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing...");

    // Check if elements exist
    if (!mainContainer || !initialScreen || !successScreen || !character || !yesButton || !noButton) {
        console.error("One or more essential visual elements not found!");
    }
    if (!bgMusic) {
        console.warn("Audio element #bgMusic not found.");
    }

    // Get original width and calculate target width
    if (yesButton && mainContainer) {
        originalYesWidth = yesButton.offsetWidth;
        const containerPaddingLeft = parseFloat(getComputedStyle(mainContainer).paddingLeft);
        const containerPaddingRight = parseFloat(getComputedStyle(mainContainer).paddingRight);
        const availableWidth = mainContainer.clientWidth - containerPaddingLeft - containerPaddingRight;
        targetYesWidth = availableWidth * 0.75;
        console.log(`Original Yes Width: ${originalYesWidth}, Target Yes Width: ${targetYesWidth}, Available Width: ${availableWidth}`);
    } else {
        console.error("Cannot calculate button widths.");
        targetYesWidth = 200; // Default fallback
        originalYesWidth = 100; // Default fallback
    }

    // Explicitly Reset Initial State (Visuals)
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
        noButton.style.display = 'inline-block';
        console.log("Initial button styles set. No button opacity:", noButton.style.opacity, "transform:", noButton.style.transform);
    }
    if (initialScreen) {
        initialScreen.style.opacity = '1';
        initialScreen.style.visibility = 'visible';
    }
     if (successScreen) {
        successScreen.classList.add('hidden'); // Use display: none initially
        successScreen.classList.remove('visible');
     }


    // Reset flags
    scalingActive = true;
    isNoButtonClicked = false;
    yesScale = 1.0;
    noScale = 1.0;

    // Add event listeners
    if (noButton) {
        removeNoButtonListeners();
        addNoButtonListeners();
    }
    if (yesButton) {
        yesButton.removeEventListener('click', handleYesClick);
        yesButton.addEventListener('click', handleYesClick);
    }

    console.log("Initialization complete. Visual elements set. Event listeners added.");

    // --- Attempt to Play Background Music On Load ---
    if (bgMusic) {
        console.log("Attempting to autoplay background music...");
        const playPromise = bgMusic.play();

        if (playPromise !== undefined) {
            playPromise.then(_ => {
                console.log("Background music autoplay started successfully.");
                musicStarted = true;
            }).catch(error => {
                console.error("Background music autoplay failed:", error);
                console.warn("Browser likely blocked autoplay. Music might start after user interaction.");
                musicStarted = false;
            });
        } else {
            console.warn("Audio play() did not return a promise.");
        }
    }
    // --- End of Initialization ---
});

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
    // Fallback audio trigger
    if (!musicStarted && bgMusic) {
        console.log("Attempting manual audio play on No click...");
        bgMusic.play().then(() => { musicStarted = true; console.log("Manual play successful."); })
                      .catch(e => console.error("Manual play failed on No click:", e));
    }

    // Button Scaling Logic
    console.log("No button clicked. Scaling active:", scalingActive);
    if (!scalingActive || !originalYesWidth || !yesButton || !noButton || !character) return;

    if (!isNoButtonClicked) {
        isNoButtonClicked = true;
        character.src = angryCharSrc;
        console.log("First click on No. Character set to angry.");
    }

    console.log(`Before scale update - Yes Scale: ${yesScale}, No Scale: ${noScale}`);
    const currentYesWidth = originalYesWidth * yesScale;
    console.log(`Current Yes Width: ${currentYesWidth}, Target Yes Width: ${targetYesWidth}`);

    const yesIsLargeEnough = currentYesWidth >= targetYesWidth;
    const noIsTooSmall = noScale <= shrinkDecrement;
    console.log(`Check hide condition: yesIsLargeEnough=${yesIsLargeEnough}, noIsTooSmall=${noIsTooSmall}`);

    if (yesIsLargeEnough || noIsTooSmall) {
        console.log("Condition met: Hiding No button and finalizing Yes button size.");
        yesScale = targetYesWidth / originalYesWidth;
        noScale = 0;
        yesButton.style.transform = `scale(${yesScale})`;
        noButton.style.transform = 'scale(0)';
        noButton.classList.add('hidden-final');
        noButton.style.pointerEvents = 'none';
        scalingActive = false;
        removeNoButtonListeners();
        character.src = sadCharSrc;
        console.log("No button hidden. Character set to sad. Scaling deactivated.");
    } else {
        console.log("Condition not met: Scaling buttons.");
        yesScale += scaleIncrement;
        noScale -= shrinkDecrement;
        noScale = Math.max(0, noScale);
        console.log(`After scale update - Yes Scale: ${yesScale}, No Scale: ${noScale}`);
        yesButton.style.transform = `scale(${yesScale})`;
        noButton.style.transform = `scale(${noScale})`;
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
    console.log("No button listeners added.");
}
function removeNoButtonListeners() {
    if (!noButton) return;
    noButton.removeEventListener('mouseover', handleNoMouseOver);
    noButton.removeEventListener('mouseout', handleNoMouseOut);
    noButton.removeEventListener('click', handleNoClick);
    console.log("No button listeners removed.");
}

// --- "可以" Button Logic ---
function handleYesClick() {
     // Fallback audio trigger
    if (!musicStarted && bgMusic) {
        console.log("Attempting manual audio play on Yes click...");
        bgMusic.play().then(() => { musicStarted = true; console.log("Manual play successful."); })
                      .catch(e => console.error("Manual play failed on Yes click:", e));
    }

    // Success Screen Logic
    console.log("Yes button clicked.");
    if (!initialScreen || !successScreen || !character) return;

    scalingActive = false;
    isNoButtonClicked = false;
    removeNoButtonListeners();

    character.src = happyCharSrc;
    console.log("Character set to happy.");

    setTimeout(() => {
        console.log("Starting transition to success screen.");
        initialScreen.style.opacity = '0';
        initialScreen.style.visibility = 'hidden';
        if (noButton) noButton.style.display = 'none';

        successScreen.classList.remove('hidden'); // Set display from none to block/flex etc.
        setTimeout(() => {
            successScreen.classList.add('visible'); // Start opacity transition
            console.log("Success screen made visible.");
        }, 50); // Short delay necessary after changing display

    }, 150);
}

// --- End of script ---