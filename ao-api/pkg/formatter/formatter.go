package formatter

import (
	"fmt"
	"log"
	"strings"
)

const DirectValue = "direct_value"

var ErrFuncNotFound = fmt.Errorf("function not found")

type Arg struct {
	Source string  `json:"source"`
	Key    string  `json:"key"`
	Value  *string `json:"value"`
}

type FuncCall struct {
	FuncName string `json:"func_name"`
	Args     []Arg  `json:"args"`
	Result   string `json:"result"`
}

type Formatter struct {
	FormatStr string              `json:"format_str"`
	FuncCalls map[string]FuncCall `json:"func_calls"`
}

func (f *Formatter) Format(values map[string]interface{}) (string, error) {
	var resultStr = f.FormatStr
	for k, v := range f.FuncCalls {
		if v.FuncName == DirectValue {
			key := fmt.Sprintf("%s.%s", v.Args[0].Source, v.Args[0].Key)
			output := fmt.Sprintf("%s", values[key])
			v.Result = output
			f.FuncCalls[k] = v
			identifier := fmt.Sprintf("$%v", k)
			resultStr = strings.Replace(resultStr, identifier, output, -1)
			continue
		}
		fn, ok := formatFuncs[v.FuncName]
		if !ok {
			log.Printf("function %s not found", v.FuncName)
			return "", ErrFuncNotFound
		}
		args := make([]interface{}, 0)
		for _, arg := range v.Args {
			if arg.Value != nil {
				args = append(args, arg.Value)
				continue
			}
			key := fmt.Sprintf("%s.%s", arg.Source, arg.Key)
			args = append(args, values[key])
		}
		output, err := fn.function(args...)
		if err != nil {
			log.Printf("func %s error: %v\n", v.FuncName, err.Error())
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
	for _, v := range f.FuncCalls {
		args = append(args, v.Args...)
	}
	return args
}
