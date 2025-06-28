async function getCurrentTab() {
    let queryOptions = {active: true, currentWindow: true};
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}


window.onload = function () {
// 获取初始状态
    chrome.runtime.sendMessage({ type: "GET_LISTENING_STATE" }, (response) => {
        console.log(response)
        if (response.isListening){
            document.getElementById("listen_status").textContent ="正在监听,数量: "+response.rules.length
        }else{
            document.getElementById("listen_status").textContent ="还没监听"
        }
    });
    const menu = document.getElementById("menu");

    menu.onclick = function (event) {
        event = event || window.event // 额...理解不了的话，你当这个是一个DOM对象
        const target = event.target // 获得点击的最底层DOM

        if (target.nodeName === 'LI') {// 判断这个DOM节点名字是不是li，
            const index = target.getAttribute('data-index')

            switch (index) {
                case "setting":
                    window.open('/html/setting.html')
                    break
            }
        }
    }


    document.getElementById('start').addEventListener('click', () => {
        chrome.runtime.sendMessage({type: "setFilter", action: "startTask"},(response)=>{
            console.log(response)
            document.getElementById("listen_status").textContent ="正在监听,数量: "+response.rules.length

        });
    });

    document.getElementById('pause').addEventListener('click', () => {
        chrome.runtime.sendMessage({type: "setFilter", action: "pauseTask"},(response)=>{
            console.log(response)
            document.getElementById("listen_status").textContent ="已经暂停"

        });
    });
}

