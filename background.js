// background.js
chrome.runtime.onInstalled.addListener(() => {
    const AZ_AI_KEY = "AIzaSyCzGpkec-5mmpmDWVkB-LzNgqonXe2Kr_g"; // This is now pulled from the .env file
    console.log(AZ_AI_KEY);
    // Store API key securely in chrome.storage.local
    chrome.storage.local.set({ 'AZ_AI_KEY': AZ_AI_KEY }, function() {
        console.log("API Key stored securely.");
    });
});

// Listen for incoming messages and handle them
// Listen for messages from the content script
// Listen for messages from content scripts or other parts of the extension
// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "API_DATA") {
        console.log("Received intercepted data:", message.payload);
        
        // Store the received data in Chrome's local storage
        chrome.storage.local.set({ interceptedData: message.payload }, () => {
            console.log("Data successfully stored in Chrome storage:", message.payload);
        });
        
        // Send a response back to the sender to confirm data has been received and stored
        sendResponse({ status: "success", message: "Data received and stored." });
    }
});

// Retrieve data from Chrome storage when the extension icon is clicked
chrome.action.onClicked.addListener((tab) => {
    chrome.storage.local.get("interceptedData", (result) => {
        if (result.interceptedData) {
            // Log the retrieved data in the console
            console.log("Retrieved intercepted data:", result.interceptedData);

            // Example: Display the data in an alert popup
            alert(`Intercepted Data: ${JSON.stringify(result.interceptedData, null, 2)}`);
        } else {
            console.log("No data found in Chrome storage.");
        }
    });
});
