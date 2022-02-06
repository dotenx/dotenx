package queueService

type NilChanErr struct{}

func (n NilChanErr) Error() string {
	return "channel is nil"
}

type EmptyQueueErr struct{}

func (n EmptyQueueErr) Error() string {
	return "queue is empty"
}
