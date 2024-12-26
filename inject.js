return originalFetch.apply(this, arguments)
    .then((response) => {
        console.log("Fetch Response:", response);

        // Clone the response to parse without affecting the original stream
        const clonedResponse = response.clone();

        return clonedResponse.text().then(text => {
            try {
                if (text) {
                    const data = JSON.parse(text); // Safely parse JSON
                    console.log("API Response Data:", data);

                    // Check for the structure and extract the editorial code
                    if (data?.data?.editorial_code?.length > 0) {
                        const editorialCode = data.data.editorial_code[0].code;
                        console.log("Extracted Editorial Code:", editorialCode);

                        // Dispatch custom event
                        window.dispatchEvent(new CustomEvent('apiCodeExtracted', {
                            detail: { editorialCode }
                        }));
                    } else {
                        console.log("Editorial code not found in response data.");
                    }
                } else {
                    console.log("Response body is empty.");
                }
            } catch (error) {
                console.error("Error parsing JSON response:", error);
            }
        });
    })
    .catch(error => {
        console.error("Fetch Error:", error);
    });
