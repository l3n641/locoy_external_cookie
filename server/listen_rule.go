package main

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"log"
	"net/http"
)

type AddListenRecordReq struct {
	ListenUrl string `json:"listen_url"  binding:"required"`
	Interval  int    `json:"interval"  binding:"required"`
	TaskID    string `json:"task_id"`
}

func AddListenRule(c *gin.Context) {

	var req AddListenRecordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误"})
		return
	}

	var data ListenRecord
	if err := DB.Where("listen_url = ?", req.ListenUrl).First(&data).Error; err == nil {
		// 存在，更新
		DB.Model(&data).Updates(ListenRecord{
			Interval: req.Interval,
			TaskID:   req.TaskID,
		})
	} else if errors.Is(err, gorm.ErrRecordNotFound) {
		// 不存在，创建新记录

		data = ListenRecord{
			ListenUrl: req.ListenUrl,
			Interval:  req.Interval,
			TaskID:    req.TaskID,
		}
		DB.Create(&data)

	}
	c.JSON(http.StatusOK, gin.H{"message": "创建成功", "id": data.ID})
}

func GetListenRules(c *gin.Context) {
	var data []ListenRecord
	err := DB.Find(&data).Error
	if err != nil {
		log.Fatal(err)
	}
	c.JSON(http.StatusOK, gin.H{"message": "创建成功", "data": data})

}

func DelListenRule(c *gin.Context) {
	id := c.Param("id")

	// 数据库中查找并删除对应 ID 的记录
	if err := DB.Delete(&ListenRecord{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
