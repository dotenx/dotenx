package shared

import (
	"fmt"
	"runtime/debug"
)

type FormattedError struct {
	Inner      error
	Message    string
	StackTrace string
	Misc       map[string]interface{}
}

func (fe *FormattedError) WrapError(err error, msgFormat string, msgArgs ...interface{}) {
	fe = &FormattedError{
		Inner:      err,
		Message:    fmt.Sprintf(msgFormat, msgArgs...),
		StackTrace: string(debug.Stack()),
		Misc:       make(map[string]interface{}),
	}
}
