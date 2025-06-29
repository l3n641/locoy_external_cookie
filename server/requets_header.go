package main

import (
	"encoding/json"
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

type DataItem struct {
	Name  string `json:"name" binding:"required"`
	Value string `json:"value" binding:"required"`
}

type RequestBody struct {
	URL        string     `json:"url" binding:"required"`
	CookiePath string     `json:"cookiePath" binding:"required"`
	Headers    []DataItem `json:"requestHeaders" binding:"required"`
}

func AddRequestHeader(c *gin.Context) {
	var req RequestBody

	// 绑定 JSON 请求体
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	headerStr, _ := json.Marshal(req.Headers)
	var data RequestHeader
	if err := DB.Where("url = ?", req.URL).First(&data).Error; err == nil {
		// 存在，更新
		DB.Model(&data).Updates(RequestHeader{
			Url:            req.URL,
			Headers:        string(headerStr),
			LastListenTime: time.Now(),
		})
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		// 不存在，创建新记录

		data = RequestHeader{
			Url:            req.URL,
			Headers:        string(headerStr),
			LastListenTime: time.Now(),
		}
		DB.Create(&data)

	}

	if !dirExists(req.CookiePath) {

		return
	}

	var listenUrl ListenRecord
	if err := DB.Where("listen_url = ?", req.URL).First(&listenUrl).Error; err == nil {
		if listenUrl.TaskID == "" {
			return
		}

		filePath := filepath.Join(req.CookiePath, listenUrl.TaskID+".txt")

		for _, header := range req.Headers {
			if header.Name == "Cookie" {
				// 写入文件
				if err := os.WriteFile(filePath, []byte(header.Value), 0644); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to write file"})
					return
				}

				// 成功响应
				c.JSON(http.StatusOK, gin.H{
					"message": "data saved",
					"path":    filePath,
				})
				return
			}
		}

	}

	// 成功响应
	c.JSON(http.StatusOK, gin.H{
		"message": "data saved",
	})
}
