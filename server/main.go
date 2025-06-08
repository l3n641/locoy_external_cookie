package main

import (
	"os"
	"path/filepath"

	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

type DataItem struct {
	Name  string `json:"name" binding:"required"`
	Value string `json:"value" binding:"required"`
}

type RequestBody struct {
	URL     string     `json:"url" binding:"required"`
	Headers []DataItem `json:"headers" binding:"required"`
}

func main() {
	InitDB()
	r := gin.Default()

	r.POST("/listen_rule", AddListenRule)
	r.GET("/listen_rule", GetListenRules)

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
