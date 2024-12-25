const botImgURL = chrome.runtime.getURL("assets/bot.png");
const profileImgUrl = chrome.runtime.getURL("assets/profile.png");

const sendImgUrl = chrome.runtime.getURL("assets/send.png");

const copyImgUrl = chrome.runtime.getURL("assets/copy.png");

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
    botButtonImage.src = botImgURL;
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


// Function to show the mini page and interact with AI
function showMiniPage() {
    // Check if the mini page already exists
    if (document.getElementById("mini-page")) return;

    // Get the current page URL to associate the mini page with this page
    const currentUrl = window.location.href;

    // Retrieve the stored AI key from localStorage
    chrome.storage.local.get(['aiKey'], function (result) {
        if (!result.aiKey) {
            alert("Please enter the key through the Chrome extension");
            return;
        }
        console.log('Stored API Key:', result.aiKey);
    });

    // Create the mini page container
    const miniPage = document.createElement('div');
    miniPage.id = "mini-page";
    miniPage.style.position = "fixed";
    miniPage.style.top = "50%";
    miniPage.style.left = "50%";
    miniPage.style.transform = "translate(-50%, -50%)";
    miniPage.style.width = "70%";
    miniPage.style.height = "80%";
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

    // Add header and other content (unchanged from your original code)
    const header = document.createElement('div');
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";
    header.style.borderBottom = "1px solid #444";
    header.style.paddingBottom = "10px";
    const title = document.createElement('h2');
    title.textContent = "Ask AI Chat";
    title.style.margin = "0";
    const closeButton = document.createElement('button');
    closeButton.textContent = "×";
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.color = "white";
    closeButton.style.fontSize = "20px";
    closeButton.style.cursor = "pointer";

    closeButton.addEventListener("click", () => {
        miniPage.remove();
    });

    header.appendChild(title);
    header.appendChild(closeButton);
    miniPage.appendChild(header);
    // document.body.appendChild(miniPage);

    // Add a listener to detect navigation away from the current page
    window.addEventListener('beforeunload', () => {
        miniPage.remove();
    });

    // Add a listener to detect URL changes (using `popstate` for single-page apps)
    window.addEventListener('popstate', () => {
        if (window.location.href !== currentUrl) {
            miniPage.remove();
        }
    });
    
    // Create the clear history button
    const clearHistoryButton = document.createElement('button');
    clearHistoryButton.textContent = "Clear History";
    clearHistoryButton.style.backgroundColor = "red";
    clearHistoryButton.style.color = "white";
    clearHistoryButton.style.padding = "5px 10px";
    clearHistoryButton.style.borderRadius = "5px";
    clearHistoryButton.style.cursor = "pointer";
    clearHistoryButton.addEventListener("click", () => clearConversationHistory());

    header.appendChild(clearHistoryButton);
    
    miniPage.appendChild(header);
    document.body.appendChild(miniPage);

    // Chat display area
    const chatArea = document.createElement('div');
    chatArea.style.flex = "1";
    chatArea.style.overflowY = "auto";
    chatArea.style.marginTop = "20px";
    chatArea.style.padding = "10px";
    chatArea.style.backgroundColor = "#2C2C3C";
    chatArea.style.borderRadius = "5px";
    chatArea.style.border = "1px solid #444";
    miniPage.appendChild(chatArea);

    // Input area
    // Create the container for the input area
const inputArea = document.createElement('div');
inputArea.style.display = 'flex';
inputArea.style.flexDirection = 'column';  // Stack items vertically
inputArea.style.alignItems = 'flex-start';
inputArea.style.width = '100%';

// Create the textarea
const inputField = document.createElement('textarea');
inputField.placeholder = "Type your message...";
inputField.style.padding = "10px";
inputField.style.border = "1px solid #444";
inputField.style.borderRadius = "5px";
inputField.style.backgroundColor = "#2C2C3C";
inputField.style.color = "white";
inputField.style.resize = "none";  // Prevents resizing the textarea
inputField.style.minHeight = "40px";  // Minimum height to ensure it starts off visible
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

// Append the textarea to the inputArea container
inputArea.appendChild(inputField);

// Append the inputArea to the body or any other container in the document
document.body.appendChild(inputArea);








const buttonsContainer = document.createElement('div');
buttonsContainer.style.display = 'flex'; 
buttonsContainer.style.alignItems = 'center';
buttonsContainer.style.justifyContent = 'space-between';  
buttonsContainer.style.width = '100%'; 
buttonsContainer.style.flexDirection = 'row'; 
// Set the image source
    const sendButton = document.createElement('button');
    const sendImage = document.createElement('img');
    sendImage.src = sendImgUrl; 
    sendImage.alt = "Send";
    sendImage.style.width = "30px";  
    sendImage.style.height = "30px";  
    sendImage.style.cursor = "pointer";
    sendButton.style.padding = "5px";
    sendButton.style.border = "none";
    sendButton.style.backgroundColor = "transparent";
    sendButton.style.cursor = "pointer";
    sendButton.appendChild(sendImage);

    sendButton.addEventListener("click", () => {
        const userMessage = inputField.value.trim();
        if (userMessage) {
            addChatMessage("You", userMessage);
            askAI(userMessage, addChatMessage);
            inputField.value = ""; // Clear input
            inputField.style.height = "40px"; // Reset to minimum height
            inputField.setSelectionRange(0, 0); // Set cursor to the top
        } else {
            alert("Please type a message.");
        }
    });
    
    inputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent default newline behavior
            const userMessage = inputField.value.trim();
            if (userMessage) {
                addChatMessage("You", userMessage);
                askAI(userMessage, addChatMessage);
                inputField.value = ""; // Clear input
                inputField.style.height = "40px"; // Reset to minimum height
                inputField.setSelectionRange(0, 0); // Set cursor to the top
            } else {
                alert("Please type a message.");
            }
        }
    });
    
    

    // Add 'Copy Your Code' button
    const copyCodeButton = document.createElement('button');
    copyCodeButton.textContent = "Copy Your Code";
    copyCodeButton.style.marginLeft = "6px";
    copyCodeButton.style.padding = "3px";
    copyCodeButton.style.border = "none";
    copyCodeButton.style.backgroundColor = "#28A745";
    copyCodeButton.style.color = "white";
    copyCodeButton.style.borderRadius = "5px";
    copyCodeButton.style.cursor = "pointer";

    
    
    copyCodeButton.addEventListener('click', copyCode);

    
    buttonsContainer.appendChild(copyCodeButton);
    buttonsContainer.appendChild(sendButton);
    inputArea.appendChild(buttonsContainer);

    miniPage.appendChild(inputArea);



    // Function to clear the conversation history
    function clearConversationHistory() {
        // Clear chat display
        chatArea.innerHTML = "";

        // Remove conversation history from localStorage for the current problem
        localStorage.removeItem(currentProblemId);

        // Optional: Add a message to indicate the history is cleared
        addChatMessage("System", "Conversation history cleared.");
    }

    // Function to add messages to the chat and update conversation history
    function addChatMessage(sender, message) {
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
profileImage.src = 
    sender === "You" 
        ? "https://d3pdqc0wehtytt.cloudfront.net/profile-photos/1280ad10-1309-4ca7-8d9a-6bca51210b5c.jpg" 
        : botImgURL;

        // Fallback to default image if the user image is unavailable
        profileImage.onerror = () => {
            profileImage.src = profileImgUrl; // Assign default image
        };

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

    // Load previous conversation from localStorage and display it for the current problem
    const conversationHistory = JSON.parse(localStorage.getItem(currentProblemId)) || [];
    if (conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
            if (msg.role === "user") {
                addChatMessage("You", msg.content);
            } else if (msg.role === "assistant") {
                addChatMessage("AI bot", msg.content);
            }
        });
    }
}


// AI Interaction (askAI function remains the same)
async function askAI(text, addChatMessage) {
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
        addChatMessage("System", "Error fetching AI key from storage: " + error);
        return;
    }

    if (!apiKey) {
        addChatMessage("System", "AI key is missing or invalid! Please enter it again through the chrome extension button.");
        return;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const problemStatement = document.querySelector('.coding_desc__pltWY')?.innerText;
    const inputElements = document.querySelectorAll(".coding_input_format__pv9fS");

    const IOformat = inputElements[0];
    const constraints = inputElements[2];
    const testCasesInput = inputElements[3];
    const testCasesOutput = inputElements[4];

    const codingLang = document.querySelector('.coding_select__UjxFb').innerText;

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
            addChatMessage("AI bot", aiResponse);
        } else {
            console.error("API Error:", result);
            addChatMessage("System", "Error contacting the AI: AI key is missing or invalid! Please enter it again through the chrome extension button. " + (result.error?.message || "Unknown error"));
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        alert("An error occurred while contacting the AI.");
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