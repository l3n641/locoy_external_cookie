export class ApiService {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    // 获取监听规则列表
    fetchListenRuleList() {
        return fetch(`${this.apiUrl}/listen_rule`)
            .then(response => response.json())
            .catch(error => {
                console.error("拉取列表失败：", error);
            });
    }

    // 添加监听规则
    addListenRule(listenUrl, interval, taskId) {
        return fetch(`${this.apiUrl}/listen_rule`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                listen_url: listenUrl,
                interval: parseInt(interval),
                task_id: taskId
            })
        })
            .then(response => response.json())
            .catch(error => {
                console.error("添加失败：", error);
            });
    }

}
