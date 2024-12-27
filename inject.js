(function() {
    console.log("inject.js script loaded");

    // Intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        console.log("Intercepted fetch request:", { url, options });

        // Dispatch a custom event with the fetch details
        const fetchEvent = new CustomEvent('xhrDataFetched', {
            detail: { url, options }
        });
        window.dispatchEvent(fetchEvent);

        // Capture the response as well
        return originalFetch.apply(this, arguments)
            .then((response) => {
                console.log("Fetch Response:", response);

                // Clone the response so we can read it without affecting the stream
                const clonedResponse = response.clone();

                clonedResponse.json().then(data => {
                    console.log("API Response Data:", data);  // Log the full response data for debugging
                    
                    // Check if the response contains the 'data' and 'source_code'
                    if (data && data.data && data.data.source_code) {
                        const sourceCode = data.data.source_code;  // Accessing the source_code field
                        console.log("Extracted Source Code:", sourceCode);
                        
                        // Send the extracted source code to the content script or background
                        window.dispatchEvent(new CustomEvent('apiCodeExtracted', {
                            detail: { sourceCode }
                        }));
                    } else {
                        console.log("Source code not found in response data:", data);
                    }
                }).catch(err => {
                    console.error("Error parsing JSON response:", err);
                });

                return response;
            })
            .catch(error => {
                console.error("Fetch Error:", error);
            });
    };

    // Intercept XMLHttpRequests
    const originalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();
        const _open = xhr.open;

        xhr.open = function(method, url, async, user, password) {
            console.log("Intercepted XHR request:", { method, url });

            // Dispatch the custom event with XHR details
            const xhrEvent = new CustomEvent('xhrDataFetched', {
                detail: { method, url }
            });
            window.dispatchEvent(xhrEvent);

            xhr.onload = function() {
                console.log("XHR Response:", xhr.responseText);

                try {
                    const data = JSON.parse(xhr.responseText);
                    console.log("XHR API Response Data:", data);  // Log the full response data for debugging

                    // Check if the response contains the 'data' and 'source_code'
                    if (data && data.data && data.data.source_code) {
                        const sourceCode = data.data.source_code;  // Accessing the source_code field
                        console.log("Extracted Source Code from XHR:", sourceCode);

                        // Send the extracted source code to the content script or background
                        window.dispatchEvent(new CustomEvent('apiCodeExtracted', {
                            detail: { sourceCode }
                        }));
                    } else {
                        console.log("Source code not found in XHR response:", data);
                    }
                } catch (error) {
                    console.error("Error parsing XHR response:", error);
                }
            };

            xhr.onerror = function() {
                console.error("XHR Error:", xhr.statusText);
            };

            _open.apply(this, arguments);
        };

        return xhr;
    };
})();




// Inside inject.js or similar script:
window.dispatchEvent(new CustomEvent('apiCodeExtracted', {
    detail: { sourceCode }  // Pass the source code properly
}));
