package models

type Status string

const (
	StatusCompleted = "completed"
	StatusFailed    = "failed"
	StatusTimedOut  = "timedOut"
)
