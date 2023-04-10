const BASE_URL = "https://github.com/login";

const USER_CODE_ENDPOINT = "/device/code";
const USER_AUTH_ENDPOINT = "/oauth/access_token";

const CLIENT_ID = "84b546d89e7ba03527d2";

export const getVerificationCode = async () => {
    const response = await fetch(BASE_URL + USER_CODE_ENDPOINT, {
        method: "POST",
        body: JSON.stringify({
            client_id: CLIENT_ID,
            scope: "gist",
        }),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    });

    const data = await response.json();
    return data;
};

export const pollAuthorization = async (deviceCode, interval) => {
    let data;

    while (!data?.access_token) {
        const response = await fetch(BASE_URL + USER_AUTH_ENDPOINT, {
            method: "POST",
            body: JSON.stringify({
                client_id: CLIENT_ID,
                device_code: deviceCode,
                grant_type: "urn:ietf:params:oauth:grant-type:device_code",
            }),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        data = await response.json();
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
    }

    return data.access_token;
};


chrome.runtime.onMessage.addListener(async ({ type }) => {
    switch (type) {
        case "AUTH_REQUEST":
            const verification = await getVerificationCode();

            console.log("Open %s", verification.verification_uri);
            console.log("Enter code: %s", verification.user_code);

            // Sends code to display to browser
            chrome.runtime.sendMessage({
                type: "AUTH_RESPONSE",
                payload: {
                    code: verification.user_code,
                    uri: verification.verification_uri,
                },
            });

            // Waits for user authorization
            const accessToken = await pollAuthorization(
                verification.device_code,
                verification.interval
            );

            chrome.storage.sync.set({
                accessToken,
            });
    }
});