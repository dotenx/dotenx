package pipelineStore

import (
	"log"

	"github.com/lib/pq"
)

const (
	ForeignKeyViolationErrorCode = pq.ErrorCode("23503")
)

func logError(err error) {
	log.Printf("%s", err.Error())
}
