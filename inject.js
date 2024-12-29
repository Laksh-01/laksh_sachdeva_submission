(function() {
    console.log("inject.js script loaded");
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        // console.log("Intercepted fetch request:", { url, options });
        if (url === "https://api2.maang.in/users/profile/private") {
            return originalFetch.apply(this, arguments)
                .then((response) => {
                    try {
                        // Clone the response
                        const clonedResponse = response.clone();
                        clonedResponse.json()
                            .then(data => {
                                if (data && data.data) {
                                    // Extract user ID and profile photo from the API response
                                    const userId = data.data.id;  // Assuming 'id' is the user ID field
                                    const profilePhoto = data.data.profile_photo;  // Assuming 'profile_photo' is the profile photo URL
                                    
                                    console.log("Extracted User ID:", userId);
                                    console.log("Extracted Profile Photo URL:", profilePhoto);

                                    // Validate the extracted user ID to ensure it's the expected value
                                    if (typeof userId === "number" && userId > 0) {
                                        // Store user ID and profile photo only from this URL
                                        localStorage.setItem('userId', userId);
                                        localStorage.setItem('profilePhoto', profilePhoto);
                                        console.log("User ID and profile photo stored.");

                                        // Dispatch event with extracted data
                                        window.dispatchEvent(new CustomEvent('apiDataExtracted', {
                                            detail: { userId, profilePhoto }
                                        }));
                                    } else {
                                        console.warn("Invalid user ID extracted:", userId);
                                    }
                                } else {
                                    console.log("Data not found in response:", data);
                                }
                            })
                            .catch(err => {
                                console.error("Error parsing fetch response JSON:", err);
                            });
                    } catch (err) {
                        console.error("Error handling fetch response:", err);
                    }
                    return response;
                })
                .catch(error => {
                    console.error("Fetch error:", error);
                });
        }

        // If the URL is not the target one, continue with the original fetch
        return originalFetch.apply(this, arguments);
    };

    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const _open = xhr.open;

        xhr.open = function(method, url, async, user, password) {
            // console.log("Intercepted XHR request:", { method, url });

            // Intercept request to the specific URL for user ID and profile photo
            if (url === "https://api2.maang.in/users/profile/private") {
                xhr.onload = function() {
                    try {
                        const data = JSON.parse(xhr.responseText);
                        if (data && data.data) {
                            const userId = data.data.id;
                            const profilePhoto = data.data.profile_photo;

                            // console.log("Extracted User ID from XHR:", userId);
                            // console.log("Extracted Profile Photo URL from XHR:", profilePhoto);

                            // Store user ID and profile photo only from this URL
                            localStorage.setItem('userId', userId);
                            localStorage.setItem('profilePhoto', profilePhoto);
                            console.log("User ID and profile photo stored.");

                            window.dispatchEvent(new CustomEvent('apiDataExtracted', {
                                detail: { userId, profilePhoto }
                            }));
                        } else {
                            console.warn("Unexpected data format in XHR response:", data);
                        }
                    } catch (error) {
                        console.error("Error parsing XHR response JSON:", error);
                    }
                };

                xhr.onerror = function() {
                    console.error("XHR error:", { status: xhr.status, statusText: xhr.statusText });
                };
            }

            _open.apply(this, arguments);
        };

        return xhr;
    };
})();
