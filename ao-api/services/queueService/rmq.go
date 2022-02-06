package queueService

import (
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/streadway/amqp"
	"github.com/utopiops/automated-ops/ao-api/config"
)

type QueueService interface {
	AddUser(string) error
	QueueTasks(string, string, ...interface{}) error
	DequeueTask(string, string) (interface{}, error)
}

type rmq struct {
	conn     *amqp.Connection
	chanPool sync.Pool
}

func NewRmq() (*rmq, error) {
	rmq := &rmq{}
	conn, err := amqp.Dial(config.Configs.Queue.URL)
	if err != nil {
		return nil, err
	}
	rmq.conn = conn
	closeChan := make(chan *amqp.Error)
	closeChan = conn.NotifyClose(closeChan)
	go func() {
		for {
			select {
			case _, ok := <-closeChan:
				if !ok {
					//todo handle error
				}
				//todo handle error
				conn, _ = amqp.Dial(config.Configs.Queue.URL)
				closeChan = conn.NotifyClose(make(chan *amqp.Error))
				rmq.conn = conn
			case <-time.After(time.Duration(10) * time.Millisecond):
			}
		}
	}()
	rmq.chanPool = sync.Pool{
		New: func() interface{} {
			channel, err := rmq.conn.Channel()
			if err != nil {
				log.Println(err.Error())
				return nil
			}
			return channel
		},
	}
	return rmq, nil
}

func (r *rmq) AddUser(accountId string) error {
	channel := r.chanPool.Get().(*amqp.Channel)
	if channel == nil {
		return &NilChanErr{}
	}
	exchange, err := declareExchange(channel, accountId, "topic")
	if err != nil {
		return err
	}
	defaultQueue, err := declareQueue(channel, accountId, "default")
	if err != nil {
		return err
	}
	err = bindQueueToExchange(channel, defaultQueue, "default", exchange)
	if err != nil {
		return err
	}
	r.chanPool.Put(channel)
	return nil
}

func (r *rmq) QueueTasks(accountId, priority string, tasks ...interface{}) error {
	channel := r.chanPool.Get().(*amqp.Channel)
	if channel == nil {
		return &NilChanErr{}
	}
	switch priority {
	case "default":
	//todo add more priorities
	default:
		return fmt.Errorf("priority %s not supported", priority)
	}
	exchange := getExchangeName(accountId)
	for _, task := range tasks {
		err := publishMessage(channel, exchange, priority, task)
		if err != nil {
			return err
		}
	}
	r.chanPool.Put(channel)
	return nil
}

func (r *rmq) DequeueTask(accountId, priority string) (interface{}, error) {
	channel := r.chanPool.Get().(*amqp.Channel)
	if channel == nil {
		return nil, &NilChanErr{}
	}
	switch priority {
	case "default":
	//todo add more priorities
	default:
		return nil, fmt.Errorf("priority %s not supported", priority)
	}
	qName := getQueueName(accountId, priority)
	task, err := consumeMessage(channel, qName)
	r.chanPool.Put(channel)
	return task, err
}
