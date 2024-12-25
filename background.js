// Store the API key securely in chrome.storage.local when extension is installed
chrome.runtime.onInstalled.addListener(() => {
    const AZ_AI_KEY = "AIzaSyCzGpkec-5mmpmDWVkB-LzNgqonXe2Kr_g"; // Store your actual secret key securely
    chrome.storage.local.set({ 'AZ_AI_KEY': AZ_AI_KEY }, function() {
        console.log("API Key stored securely.");
    });
});


// background.js
// background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "api-code-extracted") {
        console.log("Received extracted code:", message.editorialCode);

        // Process or store the editorialCode as needed
    }
});


