(async () => {
    const getConfig = () => {
        return new Promise((resolve) => {
            chrome.runtime.sendMessage({ type: "GET_LISTENING_STATE" }, resolve);
        });
    };

    const config = await getConfig();
    const currentURL = window.location.href;

    if (!config.isListening){
        return false
    }

    for (const rule of config.rules) {
        if (currentURL.startsWith(rule.listen_url)) {
            const delay = rule.interval * 1000;
            console.log(`Matched ${rule.listen_url}, will reload in ${rule.interval} seconds.`);
            setTimeout(() => {
                window.location.reload();
            }, delay);
            break; // 匹配到第一个后退出
        }
    }
})();
