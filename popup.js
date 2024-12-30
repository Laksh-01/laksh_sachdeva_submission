function checkForStoredKey() {
  chrome.storage.local.get(['aiKey'], (result) => {
    if (result.aiKey) {
      document.getElementById('responseOutput').textContent = "✅ API Key is correct and saved! You’re all set to use the AI features! 🚀";
    } else {
      document.getElementById('responseOutput').textContent = " ❌ No API Key found. Please enter and save your key.";
    }
  });
}


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


async function saveApiKey() {
  const apiKey = document.getElementById('apiKeyInput').value.trim();

  if (apiKey) {
    try {
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



function removeApiKey() {
  chrome.storage.local.remove('aiKey', () => {
    document.getElementById('responseOutput').textContent = "✅ API Key has been removed successfully.";
  });

  window.location.reload();
}

// Set up event listeners
document.getElementById('saveKeyButton').addEventListener('click', saveApiKey);
document.getElementById('removeKeyButton').addEventListener('click', removeApiKey);


checkForStoredKey();