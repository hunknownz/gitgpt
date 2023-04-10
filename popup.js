chrome.storage.local.get("user", function(items) {
    if (items.accessToken) {
        // user is logged in
        document.querySelector("#session-div").style.display = "flex";
    } else {
        // no session means user not logged in
        document.querySelector("#login-div").style.display = "flex";
        document.querySelector("#login-btn").onclick = onLogin;
    }
})

chrome.runtime.onMessage.addListener(async ({ type, payload }) => {
    switch (type) {
        case "AUTH_RESPONSE":
            console.log(payload.verification_uri)
            chrome.tabs.create({ url: payload.verification_uri });
    }
});

function onLogin() {
    chrome.runtime.sendMessage({type: 'AUTH_REQUEST'}, function(response) {
        console.log('收到来自后台的回复：' + response);
    });
}