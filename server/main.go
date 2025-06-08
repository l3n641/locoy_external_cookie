package main

import (
	"encoding/json"
	"net/http"
	"net/url"
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

type DataItem struct {
	Name  string `json:"name" binding:"required"`
	Value string `json:"value" binding:"required"`
}

type RequestBody struct {
	URL     string     `json:"url" binding:"required"`
	Headers []DataItem `json:"headers" binding:"required"`
}

func main() {
	r := gin.Default()

	r.POST("/request_header", func(c *gin.Context) {
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
	})

	r.Run(":8080")
}

func InitDB() {
	// 创建 data 目录（如果不存在）
	dataDir := "data"
	if _, err := os.Stat(dataDir); os.IsNotExist(err) {
		err = os.Mkdir(dataDir, 0755)
		if err != nil {
			panic("无法创建 data 目录: " + err.Error())
		}
	}

	// 数据库路径
	dbPath := filepath.Join(dataDir, "listen.db")

	// 连接数据库
	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		panic("无法连接数据库: " + err.Error())
	}

	// 自动迁移表结构
	err = DB.AutoMigrate(&ListenRecord{})
	if err != nil {
		panic("数据库迁移失败: " + err.Error())
	}
}
