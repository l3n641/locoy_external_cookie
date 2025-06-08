package main

import (
	"encoding/json"
	"github.com/gin-gonic/gin"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
)

func RequestHeader(c *gin.Context) {
	var req RequestBody

	// 绑定 JSON 请求体
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 解析 URL 获取域名
	parsedURL, err := url.Parse(req.URL)
	if err != nil || parsedURL.Host == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid url"})
		return
	}

	// 提取主机名作为文件名（不含端口）
	host := parsedURL.Hostname()
	filename := host + ".json"

	// 确保 data 目录存在
	dirPath := "./data"
	if err := os.MkdirAll(dirPath, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create data directory"})
		return
	}

	// 写入完整路径
	filePath := filepath.Join(dirPath, filename)

	// 序列化为 JSON
	jsonData, err := json.MarshalIndent(req, "", "  ")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to marshal json"})
		return
	}

	// 写入文件
	if err := os.WriteFile(filePath, jsonData, 0644); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to write file"})
		return
	}

	// 成功响应
	c.JSON(http.StatusOK, gin.H{
		"message":  "data saved",
		"filename": filename,
		"path":     filePath,
	})
}
