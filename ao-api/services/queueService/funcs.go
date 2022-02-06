package queueService

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/streadway/amqp"
)

func declareExchange(channel *amqp.Channel, name, kind string) (string, error) {
	if channel == nil {
		return "", &NilChanErr{}
	}
	switch kind {
	case "topic":
	case "direct":
	case "fanout":
	case "headers":
	default:
		return "", fmt.Errorf("channel kind %s not supported", kind)
	}
	Exname := getExchangeName(name)
	err := channel.ExchangeDeclare(
		Exname, //exchange name
		kind,   //exchange kind should be [topic, direct, fanout]
		true,   // exchange durable
		false,  // exchange autoDelete
		false,
		false,
		nil,
	)
	return Exname, err
}

func declareQueue(channel *amqp.Channel, identifier, kind string) (string, error) {
	if channel == nil {
		return "", &NilChanErr{}
	}
	switch kind {
	case "default":
	// todo add more kinds
	default:
		return "", fmt.Errorf("queue kind %s not supported", kind)
	}
	qName := getQueueName(identifier, kind)
	_, err := channel.QueueDeclare(
		qName,
		true,
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return "", err
	}
	return qName, nil
}

func bindQueueToExchange(channel *amqp.Channel, qName, qKind, exchange string) error {
	return channel.QueueBind(
		qName, // in format accountId::qKind
		qKind, // [defult, priority1, ...]
		exchange,
		false,
		nil,
	)
}

func publishMessage(channel *amqp.Channel, exchange, routingKey string, message interface{}) error {
	if channel == nil {
		return &NilChanErr{}
	}
	body, err := json.Marshal(message)
	if err != nil {
		return err
	}
	err = channel.Publish(
		exchange,
		routingKey,
		false,
		false,
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        body,
		},
	)
	return nil
}

func consumeMessage(channel *amqp.Channel, qName string) (interface{}, error) {
	msgs, err := channel.Consume(
		qName,
		"",
		true, //todo handle acknowledgment
		false,
		false,
		false,
		nil,
	)
	if err != nil {
		return nil, err
	}
	select {
	case msg := <-msgs:
		return msg.Body, nil
	case <-time.After(time.Second):
		return nil, &EmptyQueueErr{}
	}
}

func getExchangeName(accountId string) string {
	return fmt.Sprintf("%s::exchange", accountId)
}
func getQueueName(accountId, priority string) string {
	return fmt.Sprintf("%s::%s", accountId, priority)
}
