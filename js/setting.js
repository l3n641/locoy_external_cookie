import {ApiService} from './api.js';

function renderList(dataList, apiUrl) {
    const listContainer = document.getElementById("listen_record_list");
    const ul = listContainer.querySelector("ul");
    ul.innerHTML = "";

    if (!Array.isArray(dataList) || dataList.length === 0) {
        ul.innerHTML = "<li>暂无监听记录</li>";
    } else {
        dataList.forEach(item => {
            const li = document.createElement("li");

            const info = document.createElement("span");
            info.textContent = `ID: ${item.id}，URL: ${item.listen_url}，间隔: ${item.interval}s，任务ID: ${item.task_id}`;

            const delBtn = document.createElement("button");
            delBtn.textContent = "删除";
            delBtn.className = "delete-btn";
            delBtn.addEventListener("click", () => {
                if (confirm("确定要删除此记录吗？")) {
                    fetch(`${apiUrl}/listen_rule/${item.id}`, {
                        method: "DELETE"
                    })
                        .then(response => response.json())
                        .then(() => {
                            apiServer.fetchListenRuleList().then(data => {
                                renderList(data.data, apiUrl)
                            })
                        })
                        .catch(err => {
                            console.error("删除失败：", err);
                            alert("删除失败！");
                        });
                }
            });

            li.appendChild(info);
            li.appendChild(delBtn);
            ul.appendChild(li);
        });
    }

    listContainer.style.display = "block";
}

function addListenRecord(event) {
    event.preventDefault();

    const listenUrl = document.getElementById("inject_url").value.trim();
    const interval = document.getElementById("submit_data_interval").value.trim();
    const taskId = document.getElementById("locoy_task_id").value.trim();
    const apiUrl = document.getElementById("oa_url").value.trim();

    const apiServer = new ApiService(apiUrl)
    apiServer.addListenRule(listenUrl, interval, taskId).then(data => {
        apiServer.fetchListenRuleList().then(data => {
            // 写入数据
            chrome.storage.local.set({listenRules: JSON.stringify(data.data)}, () => {
                console.log("Value is set");
            });

            renderList(data.data, apiUrl)
        })
    })


}

function saveSetting(event) {
    event.preventDefault();

    const oaUrl = document.getElementById("oa_url").value.trim();
    const cookiePath = document.getElementById("locoy_cookie_path").value.trim();
// 写入数据
    chrome.storage.local.set({oaUrl, cookiePath}, () => {
      alert("保存成功")
    });


}

document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("add_listen_record");
    const saveSettingButton = document.getElementById("save_setting");

    chrome.storage.local.get(["oaUrl", "cookiePath", ], (result) => {
        if (result.oaUrl){
             document.getElementById("oa_url").value=result.oaUrl
        }

        if (result.cookiePath){
            document.getElementById("locoy_cookie_path").value=result.cookiePath
        }

    });

    const apiUrl = document.getElementById("oa_url").value.trim();
    if (!apiUrl) {
        alert("请填写 API 地址");
        return;
    }

    const apiServer = new ApiService(apiUrl)
    apiServer.fetchListenRuleList().then(data => {
        // 写入数据
        chrome.storage.local.set({listen_rules: JSON.stringify(data.data)}, () => {
            console.log("Value is set");
        });

        renderList(data.data, apiUrl)
    })

    addButton.addEventListener("click", addListenRecord);
    saveSettingButton.addEventListener("click", saveSetting);

});
