package shared

import (
	"context"
	"io"
	"io/ioutil"
	"net/http"
	"time"
)

func NewHttpHelper(client HttpClient) HttpHelper {
	return &httpHelper{
		client: client,
	}
}

func NewHttpClient() HttpClient {
	return &httpClient{}
}

type HttpHelper interface {
	HttpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, err error, statusCode int)
}

type HttpClient interface {
	Do(req *http.Request) (resp *http.Response, err error)
}

type httpClient struct{}

func (h *httpClient) Do(req *http.Request) (res *http.Response, err error) {
	c := &http.Client{} //everytime a new client, is it necessary tho?
	return c.Do(req)
}

type httpHelper struct {
	client HttpClient
}

func (h *httpHelper) HttpRequest(method string, url string, body io.Reader, headers []Header, timeout time.Duration) (out []byte, err error, statusCode int) {

	var req *http.Request
	if timeout > 0 {
		ctx, cancel := context.WithTimeout(context.Background(), timeout)
		defer cancel()
		req, err = http.NewRequestWithContext(ctx, method, url, body)
	} else {
		req, err = http.NewRequest(method, url, body)
	}
	if err != nil {
		return
	}

	for _, header := range headers {
		req.Header.Add(header.Key, header.Value)
	}

	c := &http.Client{}
	res, err := c.Do(req)
	if err != nil {
		return
	}
	defer res.Body.Close()

	statusCode = res.StatusCode
	out, err = ioutil.ReadAll(res.Body)
	return
}

type Header struct {
	Key   string
	Value string
}
