package shared

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"sync"

	"github.com/dotenx/dotenx/runner/config"
)

func NewLogHelper(authHelper AuthHelper, httpHelper HttpHelper) LogHelper {
	return &logHelper{
		authHelper: authHelper,
		httpHelper: httpHelper,
		lineCount: LineCount{
			Counter: make(map[string]int16),
		},
	}
}

type LogHelper interface {
	Log(line string, isLastLine bool, taskId string) (jobId string, err error)
}

type logHelper struct {
	authHelper AuthHelper
	httpHelper HttpHelper
	lineCount  LineCount
}

func (l *logHelper) Log(line string, isLastLine bool, taskId string) (jobId string, err error) {

	jobId = fmt.Sprintf("pipeline-%s", taskId)
	l.lineCount.Lock.Lock()
	var lineNumber int16
	var ok bool
	if _, ok = l.lineCount.Counter[jobId]; !ok {
		l.lineCount.Counter[jobId] = 1
	} else {
		l.lineCount.Counter[jobId] += 1
	}
	lineNumber = l.lineCount.Counter[jobId]
	l.lineCount.Lock.Unlock()

	method := http.MethodPost
	url := fmt.Sprintf("%s/log/job", config.Configs.Endpoints.LogstreamManager)
	token, err := l.authHelper.GetToken()
	if err != nil {
		return
	}
	headers := []Header{
		{
			Key:   "Authorization",
			Value: fmt.Sprintf("Bearer %s", token),
		},
	}

	msg := LogMessage{
		JobId:      jobId,
		LineNumber: lineNumber,
		Payload:    line,
		IsLastLine: isLastLine,
	}

	payloadBuf := new(bytes.Buffer)
	json.NewEncoder(payloadBuf).Encode(msg)

	_, err, statusCode := l.httpHelper.HttpRequest(method, url, payloadBuf, headers, 0)
	if err != nil {
		fmt.Println("error: ", err.Error())
		return
	}
	if statusCode != http.StatusOK {
		err = fmt.Errorf("request failed: %d", statusCode)
	}
	return
}

type LogMessage struct {
	JobId      string `json:"jobId"`
	LineNumber int16  `json:"lineNumber"`
	Payload    string `json:"payload"`
	IsLastLine bool   `json:"isLastLine"`
}

type LineCount struct {
	Lock    sync.RWMutex
	Counter map[string]int16
}
