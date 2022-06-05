package formatter

import (
	"errors"
	"fmt"
	"strings"
)

const (
	String = "string"
	Int    = "int"
	Bool   = "bool"
	Array  = "array"
)

type FormatFunc struct {
	Inputs   []string `json:"inputs"`
	Output   string   `json:"output"`
	function func(args ...interface{}) (string, error)
}

var ErrInvalidInput = errors.New("invalid input error")

var formatFuncs = map[string]FormatFunc{
	"ToUpper": {
		Inputs:   []string{String},
		Output:   String,
		function: ToUpper,
	},
	"String": {
		Inputs:   []string{String},
		Output:   String,
		function: ToString,
	},
}

func ToString(args ...interface{}) (string, error) {
	if len(args) != 1 {
		return "", ErrInvalidInput
	}
	return fmt.Sprintf("%v", args[0]), nil
}

func ToUpper(args ...interface{}) (string, error) {
	var str string
	if len(args) != 1 {
		return "", ErrInvalidInput
	}
	str = args[0].(string)
	return strings.ToUpper(str), nil
}

func GetFuncs() map[string]FormatFunc {
	return formatFuncs
}
