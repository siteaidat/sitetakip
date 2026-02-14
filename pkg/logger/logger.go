package logger

import (
	"encoding/json"
	"log"
	"os"
	"time"
)

type Level string

const (
	LevelInfo  Level = "info"
	LevelWarn  Level = "warn"
	LevelError Level = "error"
)

type LogEntry struct {
	Timestamp string      `json:"timestamp"`
	Level     Level       `json:"level"`
	Message   string      `json:"message"`
	Service   string      `json:"service"`
	Fields    interface{} `json:"fields,omitempty"`
}

var serviceName = "sitetakip-backend"
var jsonLogger = log.New(os.Stdout, "", 0)

func entry(level Level, msg string, fields interface{}) {
	e := LogEntry{
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Level:     level,
		Message:   msg,
		Service:   serviceName,
		Fields:    fields,
	}
	data, _ := json.Marshal(e)
	jsonLogger.Println(string(data))
}

func Info(msg string, fields ...interface{}) {
	var f interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	entry(LevelInfo, msg, f)
}

func Warn(msg string, fields ...interface{}) {
	var f interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	entry(LevelWarn, msg, f)
}

func Error(msg string, fields ...interface{}) {
	var f interface{}
	if len(fields) > 0 {
		f = fields[0]
	}
	entry(LevelError, msg, f)
}
