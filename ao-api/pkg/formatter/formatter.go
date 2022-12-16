package formatter

import (
	"fmt"
	"log"
	"strings"
)

const DirectValue = "direct_value"

var ErrFuncNotFound = fmt.Errorf("function not found")

type Arg struct {
	Name      string      `json:"name"`
	Type      string      `json:"type"`
	Source    string      `json:"source"`
	Key       string      `json:"key"`
	Value     interface{} `json:"value"`
	NestedKey string      `json:"nestedKey"`
	FuncName  string      `json:"funcName"`
}

type FuncCall struct {
	Func   string `json:"function"`
	Args   []Arg  `json:"args"`
	Result string `json:"result"`
}

type Formatter struct {
	FormatStr string              `json:"format_str"`
	FuncCalls map[string]FuncCall `json:"func_calls"`
}

func (f *Formatter) Format(values map[string]interface{}) (string, error) {
	var resultStr = f.FormatStr
	for k, v := range f.FuncCalls {
		if v.Func == DirectValue {
			key := fmt.Sprintf("%s.%s", k, v.Args[0].Name)
			output := fmt.Sprintf("%s", values[key])
			v.Result = output
			f.FuncCalls[k] = v
			identifier := fmt.Sprintf("$%v", k)
			resultStr = strings.Replace(resultStr, identifier, output, -1)
			continue
		}
		fn, ok := formatFuncs[v.Func]
		if !ok {
			log.Printf("function %s not found", v.Func)
			return "", ErrFuncNotFound
		}
		args := make([]interface{}, 0)
		for _, arg := range v.Args {
			if arg.Value != nil {
				args = append(args, arg.Value)
				continue
			}
			key := fmt.Sprintf("%s.%s", k, arg.Name)
			args = append(args, values[key])
		}
		output, err := fn.function(args...)
		if err != nil {
			log.Printf("func %s error: %v\n", v.Func, err.Error())
			return "", err
		}
		v.Result = output
		f.FuncCalls[k] = v
		identifier := fmt.Sprintf("$%v", k)
		resultStr = strings.Replace(resultStr, identifier, output, -1)
	}
	return resultStr, nil
}

func (f *Formatter) GetArgs() []Arg {
	args := make([]Arg, 0)
	for functionName, v := range f.FuncCalls {
		for _, arg := range v.Args {
			arg.FuncName = functionName
			args = append(args, arg)
		}
	}
	return args
}
