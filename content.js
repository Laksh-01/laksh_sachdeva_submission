const botImgURL = chrome.runtime.getURL("assets/bot.png");

const bot1ImgURL = chrome.runtime.getURL("assets/chatbot1.png");
const profileImgUrl = chrome.runtime.getURL("assets/profile.png");

const sendImgUrl = chrome.runtime.getURL("assets/send.png");


const cancelImgUrl = chrome.runtime.getURL("assets/cancel.png");

const binImgUrl = chrome.runtime.getURL("assets/bin.png");

const copyImgUrl = chrome.runtime.getURL("assets/cpy.png");

let currentProblemId = null;

let isScriptInjected = false;

let miniPageReference = false; 




function injectScriptAndListenForXHR() {
  if (isScriptInjected) return;
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL("inject.js"); 
  document.documentElement.appendChild(script);
  script.onload = () => {
    console.log('inject.js script injected');
    isScriptInjected = true;  
  };
  script.onerror = () => {
    console.error('Failed to inject inject.js script');
  };
}
window.addEventListener('load', injectScriptAndListenForXHR);
window.addEventListener('apiCodeExtracted', (event) => {
    const sourceCode = event.detail.sourceCode;  // Updated variable name

    if (sourceCode) {
        localStorage.setItem('editorialCode', sourceCode); // Store sourceCode (or editorialCode)
        console.log("Source Code stored in localStorage:", sourceCode);

        chrome.runtime.sendMessage({
            type: 'api-code-extracted',
            sourceCode: sourceCode  // Send the correct field (sourceCode)
        });
    } else {
        console.log("No source code to store.");
    }
});




const observer = new MutationObserver(() => {
    addBotButton(); // Call function to open AI solver
    updateProblemIdOnUrlChange(); // Update the problem ID based on URL change
    get_code_from_localStorage();
});

// Observe the body for changes (child elements added or removed)

observer.observe(document.body, { childList: true, subtree: true });
function get_code_from_localStorage() {
    // Retrieve the code from localStorage
    const code_written_by_user = localStorage.getItem('editorialCode');
    
    // Check if the code exists in localStorage
    if (code_written_by_user) {
        console.log("Code retrieved from localStorage:", code_written_by_user);
        return code_written_by_user;
    } else {
        console.log('No code found in localStorage');
        return null;  // Return null if no code is stored
    }
}

// Check if the page is a problem page
function onProblemsPage() {
    return window.location.pathname.startsWith('/problems/');
}

function updateProblemIdOnUrlChange() {
    const azProblemUrl = window.location.href;
    const problemId = extractProblemNameFromURL(azProblemUrl);
    currentProblemId = problemId;
    console.log(currentProblemId);
}

function extractProblemNameFromURL(url) {
    // Extract the part of the URL after '/problems/' and before the '?'
    const problemNameMatch = url.match(/\/problems\/([^?]+)/);
    if (!problemNameMatch || !problemNameMatch[1]) {
        console.error("Problem name not found in URL.");
        return "UnknownProblem";
    }

    // Get the problem name and make it unique by appending a simple hash
    const problemName = problemNameMatch[1];
    const uniqueId = generateUniqueId(problemName);
    return `${problemName}-${uniqueId}`;
}

// Function to generate a unique identifier based on the problem name
function generateUniqueId(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char; // Bitwise manipulation for hash
        hash |= 0; // Convert to 32-bit integer
    }
    return Math.abs(hash); // Ensure the ID is positive
}





// Function to add or update the bot button
function addBotButton() {
    let mode = true;
    if (!onProblemsPage() || document.getElementById("add-bot-button")) return; // Only add button on problem pages


    // Utility function to apply multiple styles
    const applyStyles = (element, styles) => {
        Object.assign(element.style, styles);
    };


    // Create the button container
    const botButtonContainer = document.createElement('div');
    botButtonContainer.id = "add-bot-button";
    applyStyles(botButtonContainer, {
        display: "flex",
        alignItems: "center", // Center image vertically
        justifyContent: "center", // Center image horizontally
        height: "40px",
        width: "40px",
        cursor: "pointer",
        backgroundColor:"#171D28",//Update based on mode
        border: "none", // Borderless for a cleaner look
        borderRadius: "10%", // Circular shape
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
        marginRight: "20px", // Add margin from the right side
    });

    // Create the button
    const botButton = document.createElement('button');

// Define the two colors
const defaultColor = "#171D28";
const smallScreenColor = "#2E384C";

// Apply initial styles
Object.assign(botButton.style, {
    backgroundColor: window.innerWidth < 768 ? smallScreenColor : defaultColor,
    border: "none",
    borderRadius: "15px",
    padding: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "60px",
    height: "60px",
    transition: "background-color 0.3s"
});

// Listen for window resize to update the background color
window.addEventListener('resize', () => {
    botButton.style.backgroundColor = window.innerWidth < 768 ? smallScreenColor : defaultColor;
});


    // Create the SVG icon
    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute("viewBox", "0 0 122.88 119.35");
    svgIcon.setAttribute("fill", "white");
    svgIcon.setAttribute("width", "122.88");
    svgIcon.setAttribute("height", "119.35");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M57.49,29.2V23.53a14.41,14.41,0,0,1-2-.93A12.18,12.18,0,0,1,50.44,7.5a12.39,12.39,0,0,1,2.64-3.95A12.21,12.21,0,0,1,57,.92,12,12,0,0,1,61.66,0,12.14,12.14,0,0,1,72.88,7.5a12.14,12.14,0,0,1,0,9.27,12.08,12.08,0,0,1-2.64,3.94l-.06.06a12.74,12.74,0,0,1-2.36,1.83,11.26,11.26,0,0,1-2,.93V29.2H94.3a15.47,15.47,0,0,1,15.42,15.43v2.29H115a7.93,7.93,0,0,1,7.9,7.91V73.2A7.93,7.93,0,0,1,115,81.11h-5.25v2.07A15.48,15.48,0,0,1,94.3,98.61H55.23L31.81,118.72a2.58,2.58,0,0,1-3.65-.29,2.63,2.63,0,0,1-.63-1.85l1.25-18h-.21A15.45,15.45,0,0,1,13.16,83.18V81.11H7.91A7.93,7.93,0,0,1,0,73.2V54.83a7.93,7.93,0,0,1,7.9-7.91h5.26v-2.3A15.45,15.45,0,0,1,28.57,29.2H57.49ZM82.74,47.32a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm-42.58,0a9.36,9.36,0,1,1-9.36,9.36,9.36,9.36,0,0,1,9.36-9.36Zm6.38,31.36a2.28,2.28,0,0,1-.38-.38,2.18,2.18,0,0,1-.52-1.36,2.21,2.21,0,0,1,.46-1.39,2.4,2.4,0,0,1,.39-.39,3.22,3.22,0,0,1,3.88-.08A22.36,22.36,0,0,0,56,78.32a14.86,14.86,0,0,0,5.47,1A16.18,16.18,0,0,0,67,78.22,25.39,25.39,0,0,0,72.75,75a3.24,3.24,0,0,1,3.89.18,3,3,0,0,1,.37.41,2.22,2.22,0,0,1,.42,1.4,2.33,2.33,0,0,1-.58,1.35,2.29,2.29,0,0,1-.43.38,30.59,30.59,0,0,1-7.33,4,22.28,22.28,0,0,1-7.53,1.43A21.22,21.22,0,0,1,54,82.87a27.78,27.78,0,0,1-7.41-4.16l0,0ZM94.29,34.4H28.57A10.26,10.26,0,0,0,18.35,44.63V83.18A10.26,10.26,0,0,0,28.57,93.41h3.17a2.61,2.61,0,0,1,2.41,2.77l-1,14.58L52.45,94.15a2.56,2.56,0,0,1,1.83-.75h40a10.26,10.26,0,0,0,10.22-10.23V44.62A10.24,10.24,0,0,0,94.29,34.4Z");
    svgIcon.appendChild(path);

    // Add the second SVG to the same container
    const secondSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    secondSvg.setAttribute("viewBox", "0 0 24 24");
    secondSvg.setAttribute("fill", "white");
    secondSvg.setAttribute("width", "24");
    secondSvg.setAttribute("height", "24");

    const secondPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    secondPath.setAttribute("d", "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z");
    secondSvg.appendChild(secondPath);

    // Append both SVG icons to the DOM (e.g., body or specific container)

    botButton.appendChild(svgIcon);
    botButtonContainer.appendChild(botButton);

    // Add click event to show the mini page
    botButtonContainer.addEventListener("click", () => {
        showMiniPage(); // Call the function to show the mini page
    });

    // Insert the button into the DOM
    const askDoubtButton = document.querySelector(".Header_resource_heading__cpRp1");
    if (askDoubtButton) {
        askDoubtButton.parentNode.insertAdjacentElement("afterend", botButtonContainer);
    } else {
        console.warn("The element 'coding_ask_doubt_button__FjwXJ' was not found.");
    }
}




function createMiniPageContainer() {
    const miniPage = document.createElement('div');
    miniPage.id = "mini-page";
    miniPage.style.position = "fixed";
    miniPage.style.top = "50%";
    miniPage.style.left = "50%";
    miniPage.style.transform = "translate(-50%, -50%)";
    miniPage.style.width = "90%";
    miniPage.style.height = "87%";
    miniPage.style.backgroundColor = "#1E1E2E";
    miniPage.style.border = "1px solid #ccc";
    miniPage.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    miniPage.style.borderRadius = "10px";
    miniPage.style.padding = "20px";
    miniPage.style.zIndex = "1000";
    miniPage.style.color = "white";
    miniPage.style.fontFamily = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    miniPage.style.display = "flex";
    miniPage.style.flexDirection = "column";
    return miniPage;
}


function createHeader(miniPage) {
    const header = document.createElement('div');
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.borderBottom = "1px solid #444";
    header.style.paddingBottom = "10px";

    const title = document.createElement('h2');
    title.textContent = "Ask AI";
    title.style.margin = "0";

    const closeButton = createCloseButton(miniPage);
    header.appendChild(title);
    header.appendChild(closeButton);

    return header;
}


function createCloseButton(miniPage) {
    const closeButton = document.createElement('button');
    const closeImage = document.createElement('img');
    closeImage.src = cancelImgUrl; // Replace with the path to your close icon image
    closeImage.alt = "Close";
    closeImage.style.width = "30px";
    closeImage.style.height = "30px";
    closeImage.style.cursor = "pointer";

    closeButton.appendChild(closeImage);
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.padding = "0";
    closeButton.addEventListener("click", () => {
        miniPage.remove();
        miniPageReference = false;
        // document.removeEventListener("click", handleClickOutside); // Remove the event listener
    });

    return closeButton;
}


function createChatArea() {
    const chatArea = document.createElement('div');
    chatArea.style.flex = "1";
    chatArea.style.overflowY = "auto";
    chatArea.style.marginTop = "20px";
    chatArea.style.padding = "15px";
    chatArea.style.backgroundColor = "#1E1E1E";
    chatArea.style.borderRadius = "15px";
    chatArea.style.marginBottom = "10px";
    chatArea.style.border = "1px solid #444";
    return chatArea;
}


function createInputArea(chatArea) {
    const inputArea = document.createElement('div');
    inputArea.style.display = 'flex';
    inputArea.style.flexDirection = 'column';
    inputArea.style.alignItems = 'flex-start';
    inputArea.style.width = '100%';

    const inputField = createInputField(chatArea);
    const buttonsContainer = createButtonsContainer(inputField, chatArea);

    inputArea.appendChild(inputField);
    inputArea.appendChild(buttonsContainer);
    return inputArea;
}


//message az ai wala box
function createInputField(chatArea) {
    // Create a textarea element
    const inputField = document.createElement('textarea');
    
    // Set placeholder and styles for the textarea
    inputField.placeholder = "Message AZ AI  .....";
    inputField.style.padding = "10px";
    inputField.style.border = "2px solid #444";
    inputField.style.borderRadius = "15px";
    inputField.style.backgroundColor = "#1e1e2e";
    inputField.style.color = "white";
    inputField.style.resize = "none";  // Prevents resizing the textarea
    inputField.style.minHeight = "30px";  // Minimum height to ensure it starts off visible
    inputField.style.maxHeight = "200px";  // Maximum height to control textarea size
    inputField.style.overflowY = "auto";  // Enables vertical scrolling when content exceeds visible area
    inputField.style.width = "100%"; // Adjust width to fit container

    // Function to adjust the height based on content
    inputField.addEventListener('input', function () {
        this.style.height = 'auto';  // Reset height so it can shrink
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';  // Set height based on content, but max 200px
        
        // Ensure the textarea doesn't shrink smaller than the minHeight
        if (this.scrollHeight < 40) {
            this.style.height = '40px';
        }
    });

    // Submit on pressing Enter
    inputField.addEventListener('keydown', function (event) {
        if (event.key === "Enter" && !event.shiftKey) { // Check if Enter is pressed without Shift
            event.preventDefault(); // Prevent default newline behavior
            submitMessage(inputField, chatArea); // Call the submit function
        }
    });

    return inputField; // Return the created input field
}


function createButtonsContainer(inputField, chatArea) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.alignItems = 'center';
    buttonsContainer.style.justifyContent = 'space-between';
    buttonsContainer.style.width = '100%';
    buttonsContainer.style.marginTop = "10px";

    // Create buttons
    const copyCodeButton = createCopyCodeButton(chatArea);
    const clearHistoryButton = createClearHistoryButton(chatArea);
    const sendButton = createSendButton(inputField, chatArea);

    // Style the buttons
    copyCodeButton.style.marginRight = "10px"; // Add a little gap between Copy Code and Clear History

    // Append buttons in the specified order
    buttonsContainer.appendChild(copyCodeButton);
    buttonsContainer.appendChild(clearHistoryButton);
    buttonsContainer.appendChild(sendButton);

    return buttonsContainer;
}


function createSendButton(inputField, chatArea) {
    const sendButton = document.createElement('button');
sendButton.style.padding = "10px 20px";
sendButton.style.backgroundColor = "rgba(69, 86, 103, 0.02)";
sendButton.style.backdropFilter = "blur(10px)";
sendButton.style.borderRadius = "8px";
sendButton.style.border = "none";
sendButton.style.cursor = "pointer";
sendButton.style.display = "flex"; // Use flex to center the image
sendButton.style.alignItems = "center"; // Center the image vertically
sendButton.style.justifyContent = "center"; // Center the image horizontally
sendButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)"; // Add shadow
sendButton.style.transition = "background 0.3s, transform 0.2s, box-shadow 0.3s"; // Transition for hover effects
sendButton.setAttribute('aria-label', 'Send message'); // Accessibility

// Create the SVG image element
const sendSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
sendSvg.setAttribute('viewBox', '0 0 524 511.64');
sendSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
sendSvg.setAttribute('width', '32px');
sendSvg.setAttribute('height', '32px');
sendSvg.setAttribute('aria-hidden', 'true');

// Create the path for the SVG image
const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
path.setAttribute('class', 'cls-1');
path.setAttribute('d', 'M132.63 151.86c-4.48 4.29-11.57 4.12-15.83-.4-4.26-4.53-4.08-11.69.39-15.99L253.24 4.13C255.32 1.6 258.47 0 262 0c3.62 0 6.84 1.7 8.92 4.34l131.74 131.27c4.4 4.37 4.45 11.53.12 15.98a11.121 11.121 0 0 1-15.82.13L273.32 38.49v370.92c0 6.25-5.07 11.32-11.32 11.32-6.26 0-11.33-5.07-11.33-11.32V37.91L132.63 151.86zm368.72 246.7c0-6.25 5.07-11.33 11.32-11.33 6.26 0 11.33 5.08 11.33 11.33v101.76c0 6.25-5.07 11.32-11.33 11.32H11.33C5.07 511.64 0 506.57 0 500.32V398.56c0-6.25 5.07-11.33 11.33-11.33 6.25 0 11.32 5.08 11.32 11.33v90.43h478.7v-90.43z');

// Append the path to the SVG
sendSvg.appendChild(path);

// Append the SVG to the button
sendButton.appendChild(sendSvg);


    // Add hover effects
    sendButton.addEventListener('mouseover', () => {
        sendButton.style.transform = "scale(1.05)"; // Slightly enlarge the button
        sendButton.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)"; // Increase shadow on hover
    });

    sendButton.addEventListener('mouseout', () => {
        sendButton.style.transform = "scale(1)"; // Reset size
        sendButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)"; // Reset shadow
    });

    // Add active state
    sendButton.addEventListener('mousedown', () => {
        sendButton.style.transform = "scale(0.95)"; // Slightly shrink the button
        sendButton.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.2)"; // Reduce shadow
    });

    sendButton.addEventListener('mouseup', () => {
        sendButton.style.transform = "scale(1)"; // Reset size
        sendButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)"; // Reset shadow
    });

    sendButton.addEventListener("click", () => {
        inputField.style.height = "65px";
        submitMessage(inputField, chatArea); // Call the submit function
    });

    return sendButton;
}


function submitMessage(inputField, chatArea) {
    const userMessage = inputField.value.trim();
    if (userMessage) {
        addChatMessage("You", userMessage,chatArea); // Add user message to chat
        askAI(userMessage, addChatMessage,chatArea); // Call the AI function
        inputField.value = ""; // Clear input
        inputField.style.height = "65px"; // Reset to minimum height
    } else {
        alert("Please type a message.");
    }
}


function createClearHistoryButton(chatArea) {
    const clearHistoryButton = document.createElement('button');
    clearHistoryButton.style.backgroundColor = "rgba(141, 103, 103, 0.02)";
    clearHistoryButton.style.backdropFilter = "blur(10px)";
clearHistoryButton.style.padding = "10px 20px";
clearHistoryButton.style.borderRadius = "12px";
clearHistoryButton.style.border = "none";
clearHistoryButton.style.cursor = "pointer";
clearHistoryButton.style.display = "flex"; // Use flex to center the image
clearHistoryButton.style.alignItems = "center"; // Center the image vertically
clearHistoryButton.style.justifyContent = "center"; // Center the image horizontally
clearHistoryButton.style.transition = "background-color 0.3s, transform 0.2s"; // Smooth hover effect

// Create the tooltip
clearHistoryButton.title = "Clear Conversation History";

// Create the SVG element
const clearSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
clearSvg.setAttribute("width", "32px");
clearSvg.setAttribute("height", "32px");
clearSvg.setAttribute("viewBox", "0 0 109.484 122.88");
clearSvg.setAttribute("enable-background", "new 0 0 109.484 122.88");
clearSvg.innerHTML = `<g><path fill-rule="evenodd" clip-rule="evenodd" d="M2.347,9.633h38.297V3.76c0-2.068,1.689-3.76,3.76-3.76h21.144 c2.07,0,3.76,1.691,3.76,3.76v5.874h37.83c1.293,0,2.347,1.057,2.347,2.349v11.514H0V11.982C0,10.69,1.055,9.633,2.347,9.633 L2.347,9.633z M8.69,29.605h92.921c1.937,0,3.696,1.599,3.521,3.524l-7.864,86.229c-0.174,1.926-1.59,3.521-3.523,3.521h-77.3 c-1.934,0-3.352-1.592-3.524-3.521L5.166,33.129C4.994,31.197,6.751,29.605,8.69,29.605L8.69,29.605z M69.077,42.998h9.866v65.314 h-9.866V42.998L69.077,42.998z M30.072,42.998h9.867v65.314h-9.867V42.998L30.072,42.998z M49.572,42.998h9.869v65.314h-9.869 V42.998L49.572,42.998z"/></g>`;

// Create the text element

// Append the SVG and text to the button
clearHistoryButton.appendChild(clearSvg);


    // Add hover effect
    clearHistoryButton.addEventListener("mouseover", () => {
        // Slightly darker red
        clearHistoryButton.style.transform = "scale(1.05)"; // Slightly enlarge the button
    });

    clearHistoryButton.addEventListener("mouseout", () => {
    
        clearHistoryButton.style.transform = "scale(1)"; // Reset scale
    });

    clearHistoryButton.addEventListener("click", () => {
        chatArea.innerHTML = ""; // Clear chat display
        localStorage.removeItem(currentProblemId); // Remove conversation history from localStorage
        addChatMessage("System", "Conversation history cleared.", chatArea);
    });

    return clearHistoryButton;
}


function createCopyCodeButton(chatArea) {
    const copyCodeButton = document.createElement('button'); 
    copyCodeButton.style.padding = "10px 20px";
    
    copyCodeButton.style.backgroundColor = "rgba(81, 53, 53, 0.02)";
    copyCodeButton.style.backdropFilter = "blur(10px)";
    copyCodeButton.style.borderRadius = "8px";
    copyCodeButton.style.border = "none";
    copyCodeButton.style.cursor = "pointer";
    copyCodeButton.style.display = "flex"; 
    copyCodeButton.style.alignItems = "center"; 
    copyCodeButton.style.justifyContent = "center"; 
    copyCodeButton.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)"; // Enhanced shadow
    copyCodeButton.style.transition = "background 0.3s, transform 0.2s, box-shadow 0.3s"; // Transition for hover effects
    copyCodeButton.setAttribute('aria-label', 'Copy your code'); // Accessibility

    // Create the image element
   const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svgIcon.setAttribute("version", "1.1");
svgIcon.setAttribute("id", "Layer_1");
svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
svgIcon.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
svgIcon.setAttribute("x", "0px");
svgIcon.setAttribute("y", "0px");
svgIcon.setAttribute("viewBox", "0 0 115.77 122.88");
svgIcon.setAttribute("style", "enable-background:new 0 0 115.77 122.88");
svgIcon.setAttribute("width", "32px"); // Adjust the size of the SVG
svgIcon.setAttribute("height", "32px"); // Adjust the size of the SVG
svgIcon.innerHTML = `<g><path class="st0" d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"/></g>`;




    // Optionally, add a text label
    // const copyText = document.createElement('span');
    // copyText.textContent = "Copy Your Code";
    // copyText.style.fontSize = "16px"; // Font size for the text
    // copyText.style.color = "white"; // Text color
    // copyText.style.margin = "0"; // Remove any margin
    // copyText.style.fontFamily = "Arial, sans-serif"; // Modern font

    // Append the image and text to the button
    copyCodeButton.appendChild(svgIcon);
    // copyCodeButton.appendChild(copyText);

    // Add hover effects
    copyCodeButton.addEventListener('mouseover', () => {
        // copyCodeButton.style.background = "linear-gradient(135deg, #0056b3, #004085)"; // Darker gradient on hover
        copyCodeButton.style.transform = "scale(1.05)"; // Slightly enlarge the button
        copyCodeButton.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)"; // Increase shadow on hover
    });

    copyCodeButton.addEventListener('mouseout', () => {
        // copyCodeButton.style.background = "linear-gradient(135deg, #007BFF, #0056b3)"; // Original gradient
        copyCodeButton.style.transform = "scale(1)"; // Reset size
        copyCodeButton.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)"; // Reset shadow
    });

    // Add active state
    copyCodeButton.addEventListener('mousedown', () => {
        copyCodeButton.style.transform = "scale(0.95)"; // Slightly shrink the button
        copyCodeButton.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)"; // Reduce shadow
    });

    copyCodeButton.addEventListener('mouseup', () => {
        copyCodeButton.style.transform = "scale(1)"; // Reset size
        copyCodeButton.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)"; // Reset shadow
    });

    copyCodeButton.addEventListener('click', () => {
        addChatMessage("System", 
            "⚠️ Important: Only that code will be copied which is either submitted or compiled last.", 
            chatArea);
        
        
        copyCode();
    });

    return copyCodeButton;
}

function addChatMessage(sender, message, chatArea) {
    const messageContainer = document.createElement('div');
    messageContainer.style.marginBottom = "15px";
    messageContainer.style.display = "flex";
    messageContainer.style.flexDirection = "column";
    messageContainer.style.alignItems = sender === "You" ? "flex-end" : "flex-start";

    // Sender label container
    const senderLabelContainer = document.createElement('div');
    senderLabelContainer.style.display = "flex";
    senderLabelContainer.style.alignItems = "center";
    senderLabelContainer.style.marginBottom = "5px";

    const senderLabel = document.createElement('strong');
    senderLabel.textContent = sender;
    senderLabel.style.color = sender === "You" ? "#4CAF50" : "#FFD700";
    senderLabel.style.fontSize = "14px";

    const profileImage = document.createElement('img');
    profileImage.src = sender === "You" 
        ? "https://d3pdqc0wehtytt.cloudfront.net/profile-photos/1280ad10-1309-4ca7-8d9a-6bca51210b5c.jpg" 
        : botImgURL; // Replace with your bot image URL

    profileImage.style.width = "20px";
    profileImage.style.height = "20px";
    profileImage.style.borderRadius = "50%";
    profileImage.style.marginLeft = sender === "You" ? "5px" : "0";
    profileImage.style.marginRight = sender === "AI bot" ? "5px" : "0";

    // Append sender label and profile image
    if (sender === "You") {
        senderLabelContainer.appendChild(senderLabel);
        senderLabelContainer.appendChild(profileImage); // Image on the right
    } else {
        senderLabelContainer.appendChild(profileImage); // Image on the left
        senderLabelContainer.appendChild(senderLabel);
    }

    // Message bubble
    const messageText = document.createElement('div');
    messageText.textContent = message;
    messageText.style.whiteSpace = "pre-wrap";
    messageText.style.padding = "10px";
    messageText.style.borderRadius = "10px";
    messageText.style.maxWidth = "60%";
    messageText.style.backgroundColor = sender === "You" ? "#E8F5E9" : "#FFF8DC";
    messageText.style.color = "#333";
    messageText.style.textAlign = "left";
    messageText.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";

    // Append everything to the message container
    messageContainer.appendChild(senderLabelContainer); // Add name + photo
    messageContainer.appendChild(messageText); // Add the message bubble

    chatArea.appendChild(messageContainer);

    // Auto-scroll to the latest message
    chatArea.scrollTop = chatArea.scrollHeight;

    // Retrieve the current problem's conversation history from localStorage
    let conversationHistory = JSON.parse(localStorage.getItem(currentProblemId)) || [];

    // Add the new message to the history
    conversationHistory.push({ role: sender.toLowerCase(), content: message });

    // Save the updated conversation history for this specific problem
    localStorage.setItem(currentProblemId, JSON.stringify(conversationHistory));
}


function loadPreviousConversation(chatArea) {
    const conversationHistory = JSON.parse(localStorage.getItem(currentProblemId)) || [];
    if (conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
            if (msg.role === "user") {
                addChatMessage("You", msg.content, chatArea);
            } else if (msg.role === "assistant") {
                addChatMessage("AI bot", msg.content, chatArea);
            }
        });
    }
}


function addNavigationListeners(miniPage, currentUrl) {
    // Listener to detect navigation away from the current page
    window.addEventListener('beforeunload', () => {
        miniPage.remove();
    });

    // Listener to detect URL changes (using `popstate` for single-page apps)
    window.addEventListener('popstate', () => {
        if (window.location.href !== currentUrl) {
            miniPage.remove();
        }
    });
}



function showMiniPage(currentUrl) {

    if( miniPageReference=== true) return;

    miniPageReference = true;
    const miniPage = createMiniPageContainer();
    const header = createHeader(miniPage);
    const chatArea = createChatArea();
    const inputArea = createInputArea(chatArea);

    miniPage.appendChild(header);
    miniPage.appendChild(chatArea);
    miniPage.appendChild(inputArea);
    document.body.appendChild(miniPage);

    miniPage.style.backgroundColor = "rgba(27, 33, 59, 0.27)";
    miniPage.style.backdropFilter = "blur(5px)";

    const button = document.getElementById('add-bot-button'); // Replace with your button's actual ID or selector

    document.addEventListener('click', (event) => {
        if (!miniPage.contains(event.target) && !button.contains(event.target)) {
            miniPageReference = false;
            miniPage.remove();
           
        }
    } , {capture : true});

    addNavigationListeners(miniPage, currentUrl);
    loadPreviousConversation(chatArea);

}


async function askAI(text, addChatMessage,chatArea) {
    let apiKey = "";  // Declare apiKey outside the callback

    // Function to retrieve the aiKey from chrome storage
    const getApiKey = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['aiKey'], function(result) {
                if (chrome.runtime.lastError) {
                    reject("Error fetching API key.");
                } else {
                    resolve(result.aiKey);  // Return the stored aiKey
                }
            });
        });
    };

    try {
        apiKey = await getApiKey();  // Wait for the API key to be retrieved from storage
    } catch (error) {
        addChatMessage("System", "Error fetching AI key from storage: " + error , chatArea);
        return;
    }

    if (!apiKey) {
        addChatMessage("System", "AI key is missing or invalid! Please enter it again through the Chrome extension button." , chatArea);
        return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const problemStatement = document.querySelector('.coding_desc__pltWY')?.innerText || "No problem statement found.";
    const inputElements = document.querySelectorAll(".coding_input_format__pv9fS");

    const IOformat = inputElements[0]?.innerText || "No IO format found.";
    const constraints = inputElements[2]?.innerText || "No constraints found.";
    const testCasesInput = inputElements[3]?.innerText || "No test cases input found.";
    const testCasesOutput = inputElements[4]?.innerText || "No test cases output found.";

    const codingLang = document.querySelector('.coding_select__UjxFb')?.innerText || "No coding language found.";

    // Construct instructions for the AI
    const instructions = `
    Please focus on providing **hints or guidance** to help the user solve the following problem. 
    - Offer helpful steps, algorithms, or ideas, guiding the user through problem-solving.
    - If the user hasn't yet requested code, give concise hints related to the problem, but avoid overwhelming them with too many at once.
    - Let the user lead the conversation. Only provide more hints when necessary.
    - Do not entertain off-topic or irrelevant input. Politely ask for clarification or guide the user back to the problem.
    - If the user indicates they understand the problem but are unable to write code, confirm that they truly need help before providing the solution.
    - Provide code **only after the user explicitly requests it**, and only if they’ve taken hints and asked for it.
    - Keep feedback short, friendly, and easy to understand.
    - Snippets should always be code-only and optional, provided only when requested.
    `;

    let conversationHistory = JSON.parse(localStorage.getItem(currentProblemId)) || [];
    conversationHistory.push({ role: "user", content: text });

    let conversationHistoryText = conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n");

    const prompt = `
    ${instructions}

    Problem: ${problemStatement}
    IOFormat: ${IOformat}
    Constraints: ${constraints}
    TestCases Input: ${testCasesInput}
    TestCases Output: ${testCasesOutput}
    Coding Language: ${codingLang}

    Conversation History: ${conversationHistoryText}

    User Input: ${text}

    Please respond accordingly, keeping the problem in mind.
    `;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ]
    };

    console.log("Sending your request to AI...");

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const result = await response.json();

        if (response.ok) {
            const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            console.log("AI Response:", aiResponse);
            conversationHistory.push({ role: "assistant", content: aiResponse });
            localStorage.setItem(currentProblemId, JSON.stringify(conversationHistory)); // Save updated conversation history
            addChatMessage("AI bot", aiResponse,chatArea);
        } else {
            console.error("API Error:", result);
            addChatMessage("System", "Error contacting the AI: " + (result.error?.message || "Unknown error") , chatArea);
        }
    } catch (error) {
        console.error("Fetch Error:", error); addChatMessage("System", "An error occurred while contacting the AI: " + error.message , chatArea);
    }
}


function copyCode() {
    // Retrieve the code from localStorage
    const code_written_by_user = localStorage.getItem('editorialCode');
    
    // Check if the code exists
    if (code_written_by_user) {
        // Create a temporary textarea element to copy the code to clipboard
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = code_written_by_user;
        document.body.appendChild(tempTextArea);
        
        // Select and copy the code to clipboard
        tempTextArea.select();
        document.execCommand('copy');
        
        // Remove the temporary textarea element
        document.body.removeChild(tempTextArea);
        
        // Send an appropriate message
        alert("Code copied to clipboard!");
    } else {
        alert("No code found in localStorage to copy.");
    }
}