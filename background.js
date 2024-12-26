// background.js
chrome.runtime.onInstalled.addListener(() => {
    const AZ_AI_KEY = process.env.AZ_AI_KEY; // This is now pulled from the .env file
    console.log(AZ_AI_KEY);
    // Store API key securely in chrome.storage.local
    chrome.storage.local.set({ 'AZ_AI_KEY': AZ_AI_KEY }, function() {
        console.log("API Key stored securely.");
    });
});

// Listen for incoming messages and handle them
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "api-code-extracted") {
        console.log("Received extracted code:", message.editorialCode);

        // Fetch the API key from storage when needed
        chrome.storage.local.get('AZ_AI_KEY', function(result) {
            const apiKey = result.AZ_AI_KEY;
            if (apiKey) {
                // Use the API key securely (e.g., make API requests)
                console.log("API Key fetched:", apiKey);
            } else {
                console.error("API Key not found.");
            }
        });

        // Process or store the editorialCode as needed
    }
});

