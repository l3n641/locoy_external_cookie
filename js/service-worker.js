
function httpBuildQuery(obj, prefix = '') {
    return Object.keys(obj).map(key => {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        return typeof value === 'object'
            ? httpBuildQuery(value, fullKey)
            : `${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`;
    }).join('&');
}

function send_data(data) {

    fetch("http://127.0.0.1:8080/request_header", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // 设置请求头为 JSON 格式
        },
        body: JSON.stringify(data), // 将请求数据转换为 JSON 字符串
        timeout: 30000, // 设置超时时间为 30 秒
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('Error:', error);
        });

}

let currentListener = null;

function run() {

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === "setFilter") {
            const pattern = message.url;

            // 移除旧监听器（如果存在）
            if (currentListener) {
                chrome.webRequest.onSendHeaders.removeListener(currentListener);
                currentListener = null;
            }

            // 创建新监听器
            currentListener = function (details) {
                const data = {
                    url: details.url,
                    headers: details.requestHeaders
                }
                send_data(data)
                console.log("Sending headers to:", data);
            };

            // 添加监听器
            chrome.webRequest.onSendHeaders.addListener(
                currentListener,
                {urls: [pattern]},
                ["requestHeaders"]
            );

            sendResponse({success: true});
        }
    });

}

run()
//setTimeout(run, 1000)

