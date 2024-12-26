const botImgURL = chrome.runtime.getURL("assets/bot.png");

const bot1ImgURL = chrome.runtime.getURL("assets/chatbot.png");
const profileImgUrl = chrome.runtime.getURL("assets/profile.png");

const sendImgUrl = chrome.runtime.getURL("assets/send.png");


const cancelImgUrl = chrome.runtime.getURL("assets/cancel.png");

const binImgUrl = chrome.runtime.getURL("assets/bin.png");

const copyImgUrl = chrome.runtime.getURL("assets/cpy.png");

let currentProblemId = null;


let isScriptInjected = false;

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
    const editorialCode = event.detail.editorialCode;

    // Store the editorialCode in localStorage
    localStorage.setItem('editorialCode', editorialCode);

    // Optionally log the stored value
    // console.log("Editorial Code stored in localStorage:", editorialCode);

    // Send the editorial code to the background script
    chrome.runtime.sendMessage({
        type: 'api-code-extracted',
        editorialCode: editorialCode
    });
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

function addBotButton() {
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
        backgroundColor: "#161d29", // Dark blue color
        border: "none", // Borderless for a cleaner look
        borderRadius: "10%", // Circular shape
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
        marginRight: "20px", // Add margin from the right side
    });

    // Create the image element
    const botButtonImage = document.createElement('img');
    botButtonImage.src = bot1ImgURL;
    applyStyles(botButtonImage, {
        height: "50px", // Adjust to fit inside the button
        width: "50px",
    
    });

    // Append the image to the button container
    botButtonContainer.appendChild(botButtonImage);

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
    miniPage.style.width = "75%";
    miniPage.style.height = "85%";
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
    closeImage.src = cancelImgUrl;
    closeImage.alt = "Close";
    closeImage.style.width = "20px";
    closeImage.style.height = "20px";
    closeImage.style.cursor = "pointer";

    closeButton.appendChild(closeImage);
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.padding = "0";
    closeButton.addEventListener("click", () => {
        miniPage.remove();
    });

    return closeButton;
}


function createChatArea() {
    const chatArea = document.createElement('div');
    chatArea.style.flex = "1";
    chatArea.style.overflowY = "auto";
    chatArea.style.marginTop = "20px";
    chatArea.style.padding = "15px";
    chatArea.style.backgroundColor = "#2C2C3C";
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
    const inputField = document.createElement('textarea');
    inputField.placeholder = "Message AZ AI  .....";
    inputField.style.padding = "10px";
    inputField.style.border = "2px solid #444";
    inputField.style.borderRadius = "15px";
    inputField.style.backgroundColor = "#2C2C3C";
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
            submitMessage(inputField , chatArea); // Call the submit function
        }
    });

    return inputField;
}


function createButtonsContainer(inputField, chatArea) {
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.alignItems = 'center';
    buttonsContainer.style.justifyContent = 'space-between';
    buttonsContainer.style.width = '100%';
    buttonsContainer.style.marginTop = "10px";

    // Create buttons
    const copyCodeButton = createCopyCodeButton();
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
    sendButton.style.background = "linear-gradient(135deg, #1E1E2E, #1A1A24)"; // Dark gradient background
    sendButton.style.color = "white";
    sendButton.style.borderRadius = "8px";
    sendButton.style.border = "none";
    sendButton.style.cursor = "pointer";
    sendButton.style.display = "flex"; // Use flex to center the image
    sendButton.style.alignItems = "center"; // Center the image vertically
    sendButton.style.justifyContent = "center"; // Center the image horizontally
    sendButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)"; // Add shadow
    sendButton.style.transition = "background 0.3s, transform 0.2s, box-shadow 0.3s"; // Transition for hover effects
    sendButton.setAttribute('aria-label', 'Send message'); // Accessibility

    // Create the image element
    const sendImage = document.createElement('img');
    sendImage.src = sendImgUrl; // Replace with the path to your send icon image
    sendImage.alt = "Send";
    sendImage.style.width = "30px"; // Set the width of the image
    sendImage.style.height = "30px"; // Set the height of the image
    sendImage.style.margin = "0"; // Remove any margin

    // Append the image to the button
    sendButton.appendChild(sendImage);

    // Add hover effects
    sendButton.addEventListener('mouseover', () => {
        sendButton.style.background = "linear-gradient(135deg, #1A1A24, #16161E)"; // Darker gradient on hover
        sendButton.style.transform = "scale(1.05)"; // Slightly enlarge the button
        sendButton.style.boxShadow = "0 6px 12px rgba(0, 0, 0, 0.3)"; // Increase shadow on hover
    });

    sendButton.addEventListener('mouseout', () => {
        sendButton.style.background = "linear-gradient(135deg, #1E1E2E, #1A1A24)"; // Original gradient
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
        inputField.style.height = "40px"; // Reset to minimum height
    } else {
        alert("Please type a message.");
    }
}


function createClearHistoryButton(chatArea) {
    const clearHistoryButton = document.createElement('button');
    clearHistoryButton.style.padding = "10px 20px";
    clearHistoryButton.style.backgroundColor = "#FF6B6B"; // Subtle red background
    clearHistoryButton.style.color = "white";
    clearHistoryButton.style.borderRadius = "12px";
    clearHistoryButton.style.border = "none";
    clearHistoryButton.style.cursor = "pointer";
    clearHistoryButton.style.display = "flex"; // Use flex to center the image
    clearHistoryButton.style.alignItems = "center"; // Center the image vertically
    clearHistoryButton.style.justifyContent = "center"; // Center the image horizontally
    clearHistoryButton.style.transition = "background-color 0.3s, transform 0.2s"; // Smooth hover effect

    // Create the tooltip
    clearHistoryButton.title = "Clear Conversation History";

    // Create the image element
    const clearImage = document.createElement('img');
    clearImage.src = binImgUrl;
    clearImage.alt = "Clear History";
    clearImage.style.width = "24px"; // Set the width of the image
    clearImage.style.height = "24px"; // Set the height of the image
    clearImage.style.marginRight = "8px"; // Add space between icon and text

    // Create the text element
    const buttonText = document.createElement('span');
    buttonText.innerText = "Clear History";
    buttonText.style.fontSize = "16px";
    buttonText.style.fontWeight = "bold";

    // Append the image and text to the button
    clearHistoryButton.appendChild(clearImage);
    clearHistoryButton.appendChild(buttonText);

    // Add hover effect
    clearHistoryButton.addEventListener("mouseover", () => {
        clearHistoryButton.style.backgroundColor = "#FF4C4C"; // Slightly darker red
        clearHistoryButton.style.transform = "scale(1.05)"; // Slightly enlarge the button
    });

    clearHistoryButton.addEventListener("mouseout", () => {
        clearHistoryButton.style.backgroundColor = "#FF6B6B";
        clearHistoryButton.style.transform = "scale(1)"; // Reset scale
    });

    clearHistoryButton.addEventListener("click", () => {
        chatArea.innerHTML = ""; // Clear chat display
        localStorage.removeItem(currentProblemId); // Remove conversation history from localStorage
        addChatMessage("System", "Conversation history cleared.", chatArea);
    });

    return clearHistoryButton;
}


function createCopyCodeButton(codeToCopy) {
    const copyCodeButton = document.createElement('button');
    copyCodeButton.style.padding = "10px 20px";
    copyCodeButton.style.background = "linear-gradient(135deg, #007BFF, #0056b3)"; // Bright blue gradient
    copyCodeButton.style.color = "white";
    copyCodeButton.style.borderRadius = "8px";
    copyCodeButton.style.border = "none";
    copyCodeButton.style.cursor = "pointer";
    copyCodeButton.style.display = "flex"; // Use flex to center the image
    copyCodeButton.style.alignItems = "center"; // Center the image vertically
    copyCodeButton.style.justifyContent = "center"; // Center the image horizontally
    copyCodeButton.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)"; // Enhanced shadow
    copyCodeButton.style.transition = "background 0.3s, transform 0.2s, box-shadow 0.3s"; // Transition for hover effects
    copyCodeButton.setAttribute('aria-label', 'Copy your code'); // Accessibility

    // Create the image element
    const copyImage = document.createElement('img');
    copyImage.src = copyImgUrl; // Replace with the path to your copy icon image
    copyImage.alt = "Copy Code";
    copyImage.style.width = "24px"; 
    copyImage.style.height = "24px"; 
    copyImage.style.marginRight = "8px"; 
    // Optionally, add a text label
    const copyText = document.createElement('span');
    copyText.textContent = "Copy Your Code";
    copyText.style.fontSize = "16px"; // Font size for the text
    copyText.style.color = "white"; // Text color
    copyText.style.margin = "0"; // Remove any margin
    copyText.style.fontFamily = "Arial, sans-serif"; // Modern font

    // Append the image and text to the button
    copyCodeButton.appendChild(copyImage);
    copyCodeButton.appendChild(copyText);

    // Add hover effects
    copyCodeButton.addEventListener('mouseover', () => {
        copyCodeButton.style.background = "linear-gradient(135deg, #0056b3, #004085)"; // Darker gradient on hover
        copyCodeButton.style.transform = "scale(1.05)"; // Slightly enlarge the button
        copyCodeButton.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.4)"; // Increase shadow on hover
    });

    copyCodeButton.addEventListener('mouseout', () => {
        copyCodeButton.style.background = "linear-gradient(135deg, #007BFF, #0056b3)"; // Original gradient
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
        navigator.clipboard.writeText(codeToCopy).then(() => {
            alert("Code copied to clipboard!");
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
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
    const miniPage = createMiniPageContainer();
    const header = createHeader(miniPage);
    const chatArea = createChatArea();
    const inputArea = createInputArea(chatArea);

    miniPage.appendChild(header);
    miniPage.appendChild(chatArea);
    miniPage.appendChild(inputArea);
    document.body.appendChild(miniPage);

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