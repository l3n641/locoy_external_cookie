import { ApiService } from './api.js';

document.addEventListener("DOMContentLoaded", function () {
    const addButton = document.getElementById("add_listen_record");
    const apiUrl = document.getElementById("oa_url").value.trim();
    if (apiUrl) {
        const apiServer=ApiService(apiUrl)
        apiServer.fetchList()
    }
    addButton.addEventListener("click", function (event) {
        event.preventDefault();

        const apiUrl = document.getElementById("oa_url").value.trim();
        const listenUrl = document.getElementById("inject_url").value.trim();
        const interval = document.getElementById("submit_data_interval").value.trim();
        const taskId = document.getElementById("locoy_task_id").value.trim();

        if (!apiUrl) {
            alert("请填写 API 地址");
            return;
        }
        addListenRuleList(apiUrl)


    });



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
                info.textContent = `ID: ${item.id}，URL: ${item.inject_url}，间隔: ${item.interval}s，任务ID: ${item.task_id}`;

                const delBtn = document.createElement("button");
                delBtn.textContent = "删除";
                delBtn.className = "delete-btn";
                delBtn.addEventListener("click", () => {
                    if (confirm("确定要删除此记录吗？")) {
                        fetch(`${apiUrl}/delete/${item.id}`, {
                            method: "DELETE"
                        })
                            .then(response => response.json())
                            .then(() => fetchList(apiUrl))
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
});
