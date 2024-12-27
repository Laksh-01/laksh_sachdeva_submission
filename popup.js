// Function to check if an API key is stored in Chrome storage
function checkForStoredKey() {
  chrome.storage.local.get(['aiKey'], (result) => {
    if (result.aiKey) {
      document.getElementById('responseOutput').textContent = "✅ API Key is correct and saved! You’re all set to use the AI features! 🚀";
    } else {
      document.getElementById('responseOutput').textContent = " ❌ No API Key found. Please enter and save your key.";
    }
  });
}



// Function to get AZ_AI_KEY from Chrome's local storage
function getChromeStoredKey() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(['AZ_AI_KEY'], (result) => {
      if (chrome.runtime.lastError) {
        reject('Failed to fetch AZ_AI_KEY from chrome storage.');
      } else {
        resolve(result.AZ_AI_KEY); // Return the AZ_AI_KEY
      }
    });
  });
}

// Function to save the API key in Chrome's local storage and verify it
async function saveApiKey() {
  const apiKey = document.getElementById('apiKeyInput').value.trim();

  if (apiKey) {
    try {
      // Get the AZ_AI_KEY from Chrome storage
      const storedKey = await getChromeStoredKey();

      // Compare the entered key with the stored AZ_AI_KEY
      if (apiKey === storedKey) {
        // Save the key to Chrome's local storage if it matches
        chrome.storage.local.set({ aiKey: apiKey }, () => {
          document.getElementById('responseOutput').textContent = "API Key verified and saved successfully!";
        });

        // Refresh the page immediately to update UI
        window.location.reload();
      } else {
        document.getElementById('responseOutput').textContent = "❗API Key does not match. Please check the key.";
      }
    } catch (error) {
      document.getElementById('responseOutput').textContent = `⚠️ Error: ${error}`;
    }
  } else {
    document.getElementById('responseOutput').textContent = "❗ Please enter a valid API Key.";
  }
}

// Function to remove the API key from Chrome's local storage
function removeApiKey() {
  chrome.storage.local.remove('aiKey', () => {
    document.getElementById('responseOutput').textContent = "✅ API Key has been removed successfully.";
  });

  // Refresh the page immediately to update UI
  window.location.reload();
}

// Set up event listeners
document.getElementById('saveKeyButton').addEventListener('click', saveApiKey);
document.getElementById('removeKeyButton').addEventListener('click', removeApiKey);

// Check if key is already stored in Chrome storage when popup is opened



checkForStoredKey();