const botImgURL = chrome.runtime.getURL("assets/chatbot.png");

const bot1ImgURL = chrome.runtime.getURL("assets/chatbot1.png");

const profileImgUrl = chrome.runtime.getURL("assets/profile.png");

const sendImgUrl = chrome.runtime.getURL("assets/send.png");

const cancelImgUrl = chrome.runtime.getURL("assets/cancel.png");

const binImgUrl = chrome.runtime.getURL("assets/bin.png");

const copyImgUrl = chrome.runtime.getURL("assets/cpy.png");


const systemImgUrl = chrome.runtime.getURL("assets/system.png");

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


window.addEventListener('apiDataExtracted', (event) => {
    const userId = event.detail.userId;
    const profilePhoto = event.detail.profilePhoto;
    const hints = event.detail.hints;  // Assuming 'hints' is part of the event's detail
    const solutionApproach = event.detail.solutionApproach;  // Assuming 'solutionApproach' is part of the event's detail
    const editorialCode = event.detail.editorialCode;  // Assuming 'editorialCode' is part of the event's detail

    // Handle the fetched user ID and profile photo
    if (userId && profilePhoto) {
        console.log("User ID:", userId);
        console.log("Profile Photo URL:", profilePhoto);

        try {
            // Store the extracted values (userId and profilePhoto) in localStorage
            localStorage.setItem('userId', userId);
            localStorage.setItem('profilePhoto', profilePhoto);
            console.log("User data successfully stored in localStorage.");
        } catch (error) {
            console.error("Error storing user data in localStorage:", error);
        }

        // Store additional data (hints, solution approach, editorial code) if available
        try {
            if (hints) {
                localStorage.setItem('hints', JSON.stringify(hints));  // Store hints
                console.log("Hints successfully stored.");
            }
            if (solutionApproach) {
                localStorage.setItem('solutionApproach', solutionApproach);  // Store solution approach
                console.log("Solution approach successfully stored.");
            }
            if (editorialCode) {
                localStorage.setItem('editorialCode', JSON.stringify(editorialCode));  // Store editorial code
                console.log("Editorial code successfully stored.");
            }
        } catch (error) {
            console.error("Error storing additional data:", error);
        }

        // Send the data to the background script
        chrome.runtime.sendMessage({
            type: 'API_DATA',
            payload: {
                userId,
                profilePhoto,
                hints,
                solutionApproach,
                editorialCode
            }
        }, (response) => {
            if (response?.status === "success") {
                console.log("Data successfully sent to the background script.");
            } else {
                console.error("Failed to send data to the background script.");
            }
        });
    } else {
        console.log("No user ID or profile photo to store.");
    }
});







const observer = new MutationObserver(() => {
    addBotButton(); 
    updateProblemIdOnUrlChange(); 
});

observer.observe(document.body, { childList: true, subtree: true });


function onProblemsPage() {
    return window.location.pathname.startsWith('/problems/');
}

function updateProblemIdOnUrlChange() {
    const azProblemUrl = window.location.href;
    const problemId = extractProblemNameFromURL(azProblemUrl);
    currentProblemId = problemId;
    // console.log(currentProblemId);
}


function extractProblemNameFromURL(url) {
   
    const problemNameMatch = url.match(/\/problems\/([^?]+)/);
    if (!problemNameMatch || !problemNameMatch[1]) {
        console.error("Problem name not found in URL.");
        return "UnknownProblem";
    }

    const problemName = problemNameMatch[1];
    const uniqueId = generateUniqueId(problemName);
    return `${problemName}-${uniqueId}`;
}


function generateUniqueId(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        const char = input.charCodeAt(i);
        hash = (hash << 5) - hash + char; 
        hash |= 0; 
    }
    return Math.abs(hash); 
}



function addBotButton() {
    let mode = true;
    if (!onProblemsPage() || document.getElementById("add-bot-button")) return; 

    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");


    
    const changeButtonColor = (button) => {
        
        if (button.getAttribute('aria-checked') === 'true') {
            svgIcon.style.filter = 'invert(0)';
        } else {
            svgIcon.style.filter = 'invert(1)';
        }
    };
    const observeButton = () => {
        const button = document.querySelector('button[role="switch"]');
        changeButtonColor(button);
        const observer = new MutationObserver(() => {
            changeButtonColor(button);
        });
        observer.observe(button, {
            attributes: true,         
            attributeFilter: ['aria-checked'] 
        });
    };
    observeButton();


    const applyStyles = (element, styles) => {
        Object.assign(element.style, styles);
    };

    const botButtonContainer = document.createElement('div');
    botButtonContainer.style.background = "inherit";

    botButtonContainer.id = "add-bot-button";
    applyStyles(botButtonContainer, {
        display: "flex",
        alignItems: "center", 
        justifyContent: "center", 
        height: "40px",
        width: "40px",
        cursor: "pointer",
       
        border: "none", 
        borderRadius: "10%",
        marginRight: "20px", 
    });
    const botButton = document.createElement('button');
    botButton.style.background = "inherit";
    


    Object.assign(botButton.style, {
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


    // Create the SVG icon
    
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

    botButton.appendChild(svgIcon);
    botButtonContainer.appendChild(botButton);

    
    botButtonContainer.addEventListener("click", () => {
        showMiniPage();
    });

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
    closeImage.src = cancelImgUrl;
    closeImage.alt = "Close";
    closeImage.style.width = "45px";
    closeImage.style.height = "45px";
    closeImage.style.cursor = "pointer";

    // Append the image to the button
    closeButton.appendChild(closeImage);

    // Style the button
    closeButton.style.backgroundColor = "transparent";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.padding = "0";

    // Optional: Add hover effect for better user interaction
    closeButton.addEventListener('mouseover', () => {
    closeButton.style.opacity = "0.7";
    });
    closeButton.addEventListener('mouseout', () => {
    closeButton.style.opacity = "1";
    });
    closeButton.addEventListener("click", () => {
        miniPage.remove();
        miniPageReference = false;
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

    const sendSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');


    const changeButtonColor = (button) => {
        
        if (button.getAttribute('aria-checked') === 'true') {
           sendSvg.style.filter = 'invert(1)';
        } else {
            sendSvg.style.filter = 'invert(0)';
        }
    };
    const observeButton = () => {
        const button = document.querySelector('button[role="switch"]');
        changeButtonColor(button);
        const observer = new MutationObserver(() => {
            changeButtonColor(button);
        });
        observer.observe(button, {
            attributes: true,         
            attributeFilter: ['aria-checked'] 
        });
    };
    observeButton();


    const sendButton = document.createElement('button');
    sendButton.style.padding = "10px 20px";
    sendButton.style.backgroundColor = "rgba(114, 128, 178, 0.21)";
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

    sendButton.title = "send Message";

    // Create the SVG image element
    
    sendSvg.setAttribute('viewBox', '0 0 122.883 122.882');
    sendSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    sendSvg.setAttribute('width', '32px');
    sendSvg.setAttribute('height', '32px');
    sendSvg.setAttribute('aria-hidden', 'true');
    // sendSvg.style.filter = "invert(1)"

    // Create the path for the SVG image
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('class', 'cls-1');
    path.setAttribute('d', 'M122.883,61.441c0,16.966-6.877,32.326-17.996,43.445c-11.119,11.118-26.479,17.995-43.446,17.995 c-16.966,0-32.326-6.877-43.445-17.995C6.877,93.768,0,78.407,0,61.441c0-16.967,6.877-32.327,17.996-43.445 C29.115,6.877,44.475,0,61.441,0c16.967,0,32.327,6.877,43.446,17.996C116.006,29.115,122.883,44.475,122.883,61.441 L122.883,61.441z M80.717,71.377c1.783,1.735,4.637,1.695,6.373-0.088c1.734-1.784,1.695-4.637-0.09-6.372L64.48,43.078 l-3.142,3.23l3.146-3.244c-1.791-1.737-4.653-1.693-6.39,0.098c-0.05,0.052-0.099,0.104-0.146,0.158L35.866,64.917 c-1.784,1.735-1.823,4.588-0.088,6.372c1.735,1.783,4.588,1.823,6.372,0.088l19.202-18.779L80.717,71.377L80.717,71.377z M98.496,98.496c9.484-9.482,15.35-22.584,15.35-37.055c0-14.472-5.865-27.573-15.35-37.056 C89.014,14.903,75.912,9.038,61.441,9.038c-14.471,0-27.572,5.865-37.055,15.348C14.903,33.869,9.038,46.97,9.038,61.441 c0,14.471,5.865,27.572,15.349,37.055c9.482,9.483,22.584,15.349,37.055,15.349C75.912,113.845,89.014,107.979,98.496,98.496 L98.496,98.496z');


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

    const clearSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");


    
    const changeButtonColor = (button) => {
        
        if (button.getAttribute('aria-checked') === 'true') {
           clearSvg.style.filter = 'invert(1)';
        } else {
            clearSvg.style.filter = 'invert(0)';
        }
    };
    const observeButton = () => {
        const button = document.querySelector('button[role="switch"]');
        changeButtonColor(button);
        const observer = new MutationObserver(() => {
            changeButtonColor(button);
        });
        observer.observe(button, {
            attributes: true,         
            attributeFilter: ['aria-checked'] 
        });
    };
    observeButton();



    const clearHistoryButton = document.createElement('button');
    clearHistoryButton.style.backgroundColor = "rgba(114, 128, 178, 0.21)";
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
    clearSvg.setAttribute("width", "32px");
    clearSvg.setAttribute("height", "32px");
    clearSvg.setAttribute("viewBox", "0 0 109.484 122.88");
    clearSvg.setAttribute("enable-background", "new 0 0 109.484 122.88");
    clearSvg.innerHTML = `<g><path fill-rule="evenodd" clip-rule="evenodd" d="M2.347,9.633h38.297V3.76c0-2.068,1.689-3.76,3.76-3.76h21.144 c2.07,0,3.76,1.691,3.76,3.76v5.874h37.83c1.293,0,2.347,1.057,2.347,2.349v11.514H0V11.982C0,10.69,1.055,9.633,2.347,9.633 L2.347,9.633z M8.69,29.605h92.921c1.937,0,3.696,1.599,3.521,3.524l-7.864,86.229c-0.174,1.926-1.59,3.521-3.523,3.521h-77.3 c-1.934,0-3.352-1.592-3.524-3.521L5.166,33.129C4.994,31.197,6.751,29.605,8.69,29.605L8.69,29.605z M69.077,42.998h9.866v65.314 h-9.866V42.998L69.077,42.998z M30.072,42.998h9.867v65.314h-9.867V42.998L30.072,42.998z M49.572,42.998h9.869v65.314h-9.869 V42.998L49.572,42.998z"/></g>`;


    
    clearHistoryButton.appendChild(clearSvg);


    // Add hover effect
    clearHistoryButton.addEventListener("mouseover", () => {
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

    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");

    svgIcon.setAttribute("version", "1.1");
    svgIcon.setAttribute("id", "Layer_1");
    svgIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgIcon.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    svgIcon.setAttribute("x", "0px");
    svgIcon.setAttribute("y", "0px");
    svgIcon.setAttribute("viewBox", "0 0 115.77 122.88");
    svgIcon.setAttribute("style", "enable-background:new 0 0 115.77 122.88");
    svgIcon.setAttribute("width", "32px"); 
    svgIcon.setAttribute("height", "32px"); 

    svgIcon.innerHTML = `<g><path class="st0" d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"/></g>`;

    


    const changeButtonColor = (button) => {
        
        if (button.getAttribute('aria-checked') === 'true') {
           svgIcon.style.filter = 'invert(1)';
        } else {
            svgIcon.style.filter = 'invert(0)';
        }
    };
    const observeButton = () => {
        const button = document.querySelector('button[role="switch"]');
        changeButtonColor(button);
        const observer = new MutationObserver(() => {
            changeButtonColor(button);
        });
        observer.observe(button, {
            attributes: true,         
            attributeFilter: ['aria-checked'] 
        });
    };
    observeButton();




    const copyCodeButton = document.createElement('button'); 
    copyCodeButton.style.padding = "10px 20px";
    copyCodeButton.style.backgroundColor = "rgba(114, 128, 178, 0.21)";
    copyCodeButton.style.backdropFilter = "blur(10px)";
    copyCodeButton.style.borderRadius = "8px";
    copyCodeButton.style.border = "none";
    copyCodeButton.style.cursor = "pointer";
    copyCodeButton.style.display = "flex"; 
    copyCodeButton.style.alignItems = "center"; 
    copyCodeButton.style.justifyContent = "center"; 
    copyCodeButton.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.3)"; // Enhanced shadow
    copyCodeButton.style.transition = "background 0.3s, transform 0.2s, box-shadow 0.3s";
    copyCodeButton.setAttribute('aria-label', 'Copy your code');
    copyCodeButton.title = "Copy your code";

   
    

    


    copyCodeButton.appendChild(svgIcon);



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
            "⚠️ Important: Code copied to clipboard!", 
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
    senderLabel.style.color = sender === "You" ? "##3CC7B7" : "#FFD8A8)";
    senderLabel.style.fontSize = "14px";

    const profileImage = document.createElement('img');

    if(sender === "You"){
        profileImage.src = profileImgUrl;
    }else if(sender === "AI bot"){
        profileImage.src = botImgURL;
    }else{
        profileImage.src = systemImgUrl;
    }
   

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
    messageText.style.backgroundColor = sender === "You" ? " #B388EB" : "#FFD8A8";
    messageText.style.color = "#333";
    messageText.style.textAlign = "left";
    messageText.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.1)";


    messageContainer.appendChild(senderLabelContainer);
    messageContainer.appendChild(messageText);

    if (sender === "System") {
        // Full row for system messages
        messageContainer.style.width = "100%";
        messageContainer.style.height = "20%";

        messageContainer.style.alignItems = "center";
    } else {
        messageContainer.style.alignItems = sender === "You" ? "flex-end" : "flex-start";
    }



    if (sender === "AI bot") {
        const copyButtonContainer = document.createElement('div');
    
        copyButtonContainer.style.display = "flex";
        copyButtonContainer.style.justifyContent = "center";

        const copyButton = document.createElement('button');
        copyButtonContainer.style.justifyContent = "flex-end"


        copyButton.style.backgroundColor = "rgba(81, 53, 53, 0.02)";
        copyButton.style.backdropFilter = "blur(10px)";


        copyButton.textContent = "Copy Text  ";
        copyButton.style.marginTop = "10px";
        copyButton.style.padding = "8px 15px";
        copyButton.style.fontSize = "14px";
        copyButton.style.border = "none";
        copyButton.style.borderRadius = "5px";
        copyButton.style.cursor = "pointer";
        copyButton.style.transition = "all 0.3s ease";


        
        copyButton.addEventListener('click', () => {
            navigator.clipboard.writeText(message)
                .then(() => {
                    console.log("ok");
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        });

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

    
        copyButton.appendChild(svgIcon);
        copyButtonContainer.appendChild(copyButton);
        

        messageText.appendChild(copyButtonContainer);
        messageContainer.appendChild(senderLabelContainer);
        messageContainer.appendChild(messageText);
    }

    chatArea.appendChild(messageContainer);

    
    const latestMessage = chatArea.lastElementChild;
    if (latestMessage) {
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    // Retrieve the current problem's conversation history from localStorage
    let conversationHistory = JSON.parse(localStorage.getItem(currentProblemId)) || [];

    if(sender !== 'System'){
    conversationHistory.push({ role: sender.toLowerCase(), content: message });
    localStorage.setItem(currentProblemId, JSON.stringify(conversationHistory));
    }

    
}


async function loadPreviousConversation(chatArea) {
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

    
    apiKey = await getApiKey(); 

    if(!apiKey){
        alert("Please enter the correct Api Key from the chrome extension");
        return ;
    }
    

    const conversationHistory = JSON.parse(localStorage.getItem(currentProblemId)) || [];

    console.log(conversationHistory.length);

    if (conversationHistory.length > 0) {
        conversationHistory.forEach(msg => {
            if (msg.role === "user") {
                addChatMessage("You", msg.content, chatArea);
            } else if (msg.role === "assistant") {
                addChatMessage("AI bot", msg.content, chatArea);
            }
        });
    }
    
    if(conversationHistory.length === 0){
        addChatMessage("System", "You haven't started the conversation yet.", chatArea);
    }
}


function addNavigationListeners(miniPage, currentUrl) {
    window.addEventListener('beforeunload', () => {
        miniPage.remove();
    });

    window.addEventListener('popstate', () => {
        if (window.location.href !== currentUrl) {
            miniPage.remove();
        }
    });
}





async function showMiniPage(currentUrl) {

    if( miniPageReference=== true) return;

    let apiKey = ""; 
    const getApiKey = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['aiKey'], function(result) {
                if (chrome.runtime.lastError) {
                    reject("Error fetching API key.");
                } else {
                    resolve(result.aiKey);
                }
            });
        });
    };

    
    apiKey = await getApiKey(); 

    if(!apiKey){
        alert("Please enter the correct Api Key from the chrome extension");
        return ;
    }



    

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

    const button = document.getElementById('add-bot-button'); 

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
    let apiKey = ""; 
    const getApiKey = () => {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(['aiKey'], function(result) {
                if (chrome.runtime.lastError) {
                    reject("Error fetching API key.");
                } else {
                    resolve(result.aiKey); 
                }
            });
        });
    };

    try {
        apiKey = await getApiKey(); 
    } catch (error) {
        addChatMessage("System", "Error fetching AI key from storage: " + error , chatArea);
        return;
    }

    if (!apiKey) {
        addChatMessage("System", "AI key is missing or invalid! Please enter it again through the Chrome extension button." , chatArea);
        return;
    }


    const hints = JSON.parse(localStorage.getItem('hints')) || [];
    const editorialCode = JSON.parse(localStorage.getItem('editorialCode')) || [];
    const solutionApproach = localStorage.getItem('solutionApproach') || '';

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const problemStatement = document.querySelector('.coding_desc__pltWY')?.innerText || "No problem statement found.";
    const inputElements = document.querySelectorAll(".coding_input_format__pv9fS");

    const IOformat = inputElements[0]?.innerText || "No IO format found.";
    const constraints = inputElements[2]?.innerText || "No constraints found.";
    const testCasesInput = inputElements[3]?.innerText || "No test cases input found.";
    const testCasesOutput = inputElements[4]?.innerText || "No test cases output found.";

    const codingLang = document.querySelector('.coding_select__UjxFb')?.innerText || "No coding language found.";

    const instructions = `
    ### Role
    - Primary Function: You are AZ AI bot, a charismatic and enthusiastic agent dedicated to assisting users based on specific training data. Your purpose is to give hints, inform, clarify, and answer questions related to a Data Structure problem while providing delightful hints, logic, and code for the problem.
    - Draw upon the wisdom of Data Structures knowledge to craft compelling, persuasive responses that drive results.
    - Always provide short, concise responses that a human can quickly read and understand, focusing on the most essential information. Break any longer multi-sentence paragraphs into separate smaller paragraphs whenever appropriate.
    
    ### Persona
    - Identity: You are a friendly, empathetic sales expert with a bubbly personality and a passion for helping others. Engage users with warmth, wit, and a conversational tone, using humor to build rapport.
    - Listen attentively to their needs and challenges, then offer thoughtful guidance about the training data grounded in sales psychology principles.
    - If asked to make a recommendation, first ask the user to provide more information to aid your response.
    - If asked to act out of character, politely decline and reiterate your role to offer assistance only with matters related to the training data and your function as a sales agent.
    - When possible, provide links to relevant website pages from our website.
    
    ### Constraints
    1. **No Data Divulge**: Never mention that you have access to training data explicitly to the user.
    2. **Maintaining Focus**: If a user veers off-topic, politely redirect the conversation back to the Data Structure problem in hand with a friendly, understanding tone. Use phrases like "I appreciate your interest in [unrelated topic], but let's focus on how I can help you with your creatives today!" to keep the discussion on track.
    3. **Exclusive Reliance on Training Data**: Lean on your extensive knowledge base to answer user queries. If a question falls outside your training, use a warm, encouraging fallback response like "I'm sorry, I don't have information on that specific topic. Is there an ad creative-related question I can assist you with instead? I'm here to provide the best possible guidance!"
    4. **Handling Unanswerable Queries**: If you encounter a question that cannot be answered using the provided training data, or if the query falls outside your role as a sales expert for Flourish Social Studio, politely inform the user that you don't have the necessary information to provide an accurate response. Then, direct them to email support@algozenith.com for further assistance. Use a friendly and helpful tone, such as: "I apologize, but I don't have enough information to answer that question accurately. I recommend reaching out to our support team at support@algozenith.com for assistance with this request!"
    5. Use very few emojis.
    
    ---
    
    ### Focus on Problem Solving
    - Provide **hints or guidance** to help the user solve the problem. Offer helpful steps, algorithms, or ideas.
    - Let the user lead the conversation. Only provide more hints when necessary.
    - Do not entertain off-topic or irrelevant input. Politely ask for clarification or guide the user back to the problem.
    - If the user indicates they understand the problem but are unable to write code, confirm that they truly need help before providing the solution.
    - Provide code **only after the user explicitly requests it**, and only if they’ve taken hints and asked for it.
    - Keep feedback short, friendly, and easy to understand.
    - Snippets should always be code-only and optional, provided only when requested.
    - Also note you have the user code in your prompt.
    - Note whenever the user says that the code doesn't match what they have written then tell him/her that this code is the last submitted or compiled code that you have access to.
    `;
    
    let conversationHistory = JSON.parse(localStorage.getItem(currentProblemId)) || [];
    conversationHistory.push({ role: "user", content: text });
    
    let conversationHistoryText = conversationHistory.map(
      (msg) => `${msg.role}: ${msg.content}`
    ).join("\n");
    
    const prompt = `
    ${instructions}
    
    Problem: ${problemStatement}
    IOFormat: ${IOformat}
    Constraints: ${constraints}
    TestCases Input: ${testCasesInput}
    TestCases Output: ${testCasesOutput}
    Coding Language: ${codingLang}
    
    Actual Code: ${editorialCode}
    Hints : ${hints}
    Solution Approach : ${solutionApproach}
    
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
            console.log("AI Response:", result);
            const aiResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
            
            conversationHistory.push({ role: "assistant", content: aiResponse });
            localStorage.setItem(currentProblemId, JSON.stringify(conversationHistory));
            addChatMessage("AI bot", aiResponse,chatArea);
        } else {
            console.error("API Error:", result);
            addChatMessage("System", "Error contacting the AI: " + (result.error?.message || "Unknown error") , chatArea);
        }
    } catch (error) {
        console.error("Fetch Error:", error); addChatMessage("System", "An error occurred while contacting the AI: " + error.message , chatArea);
    }
}


function getCurrentProblemId(){
    const idMatch = window.location.pathname.match(/-(\d+)$/);

    return idMatch ? idMatch[1]:null;
}




function getIdFromLocalStorage() {
    // Iterate over all the keys in localStorage
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        
        // Use regex to extract the numeric part after 'course_'
        const match = key.match(/^course_(\d+)_/);  // Match the first numeric part after 'course_'

        if (match && match[1]) {
            const extractedId = match[1];  // The first numeric part
            console.log(`Found ID: ${extractedId}`);
            return extractedId;  // Return the ID as soon as it's found
        }
    }

    console.log('No matching key found.');
    return null;  // Return null if no matching key is found
}




function getLocalStorageValueById(id) {
    const user_id = getIdFromLocalStorage();
    const codingLang = document.querySelector('.coding_select__UjxFb')?.innerText || "C++14";
    const key = `course_${user_id}_${id}_${codingLang}`;
   
    console.log(codingLang);

    // Extract the number after 'course_' and before the first '_'
    const numberMatch = key.match(/course_(\d+)_/);
    
    if (numberMatch) {
        const extractedNumber = numberMatch[1]; // This gets the number after 'course_' and before the first '_'
        console.log(`Extracted number from key: ${extractedNumber}`);
    } else {
        console.log('No number found in the key');
    }

    // Get the value from localStorage
    const value = localStorage.getItem(key);

    if (value !== null) {
        // Format the value by replacing line breaks and handling \r\n
        const formattedValue = value
            .replace(/\\r\\n/g, '\n')  // Replace literal \r\n with actual newlines
            .replace(/[\r\n]+/g, '\n');  // Replace any newline sequence with a single newline

        console.log(`Value for key ${key}:\n${formattedValue}`);
        return formattedValue;
    } else {
        console.log(`Key ${key} not found`);
        return null;
    }
}



function copyCode() {

    const id = getCurrentProblemId();

    const code_written_by_user = getLocalStorageValueById(id);

    if (code_written_by_user) {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = code_written_by_user;
        document.body.appendChild(tempTextArea);

        tempTextArea.select();
        document.execCommand('copy');
        
        document.body.removeChild(tempTextArea);

        // alert("Code copied to clipboard!");
    } else {
        alert("No code found in localStorage to copy.");
    }
}