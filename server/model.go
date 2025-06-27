package main

import "time"

type ListenRecord struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	ListenUrl      string    `json:"listen_url"`
	Interval       int       `json:"interval"`
	TaskID         string    `json:"task_id"`
	LastListenTime time.Time `json:"last_listen_time"`
}

type RequestHeader struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	Url            string    `json:"url"`
	Headers        string    `json:"headers"`
	LastListenTime time.Time `json:"last_listen_time"`
}
