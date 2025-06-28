function httpBuildQuery(obj, prefix = '') {
    return Object.keys(obj).map(key => {
        const value = obj[key];
        const fullKey = prefix ? `${prefix}[${key}]` : key;
        return typeof value === 'object'
            ? httpBuildQuery(value, fullKey)
            : `${encodeURIComponent(fullKey)}=${encodeURIComponent(value)}`;
    }).join('&');
}

async function send_data(data) {
    const storage = await chrome.storage.local.get(["oaUrl", "cookiePath"]);
    data['cookiePath'] = storage.cookiePath
    const url = storage.oaUrl + "/request_header"

    fetch(url, {
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


let isListening = false;

// 监听函数定义
function handleSendHeaders(details) {
    console.log("URL:", details.url);
    send_data(details)
    console.log("🚀 请求发送头信息：", details);
}

// 开启监听
function startListening(urls) {
    if (!isListening) {
        chrome.webRequest.onSendHeaders.addListener(
            handleSendHeaders,
            {urls: urls}, // 可以按需指定 URL 模式
            ["requestHeaders", "extraHeaders"] // 必须包含该权限字段
        );
    }
    isListening = true;
    console.log("✅ 已开始监听请求头");
}

// 停止监听
function stopListening() {
    if (isListening) {
        chrome.webRequest.onSendHeaders.removeListener(handleSendHeaders);
    }
    isListening = false;
    console.log("⛔️ 已停止监听请求头");
}


// 消息处理函数
async function handleMessage(message) {
    const result = {
        status: "stopped",
        isListening,
        rules: []
    };

    try {
        const {listenRules} = await chrome.storage.local.get(["listenRules"]);
        let urls = [];
        let rules = [];

        if (listenRules) {
            rules = JSON.parse(listenRules);
            urls = rules.map(item => item.listen_url);
        }

        result.rules = rules;

        switch (message.type) {
            case "setFilter":
                if (message.action === "startTask") {
                    if (urls.length > 0) {
                        startListening(urls);
                        result.status = "listening";
                    } else {
                        result.msg = "无监听地址";
                    }
                } else if (message.action === "pauseTask") {
                    stopListening();
                    result.status = "stopped";
                } else {
                    result.status = isListening ? "listening" : "stopped";
                }
                break

            case "GET_LISTENING_STATE":
                result.status = isListening ? "listening" : "stopped";
                break

            default:
                result.msg = "未知消息类型";
                break;


        }


    } catch (error) {
        console.error("处理消息时出错：", error);
        result.error = error.message || String(error);
    }

    return result;
}

// 注册监听器
function run() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        handleMessage(message).then(sendResponse);
        return true; // 告诉 Chrome 会异步调用 sendResponse
    });
}

// 导出 run
run();





