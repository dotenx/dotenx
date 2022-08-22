package executionService

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"math"
	"reflect"
	"strconv"
	"strings"
	"unicode"

	"github.com/dotenx/dotenx/ao-api/models"
	"github.com/dotenx/dotenx/ao-api/pkg/utils"
	"github.com/sirupsen/logrus"
)

type sourceData map[string]map[string]interface{}

// sourceData map["source"] ==> map["key"] ==> value

type returnValues []map[string]interface{}

// returnvalue[i] ==> map["key"] ==> value

// return array of source datas from return values needed for different fields of task
func getSourceDataArray(returnValuesMap map[string]returnValues) ([]sourceData, error) {
	lens := make(map[string]int)
	for sourceName, arr := range returnValuesMap {
		lens[sourceName] = len(arr)
	}
	lensPrime := make(map[string]int)
	counter := 0
	for sourceName, _ := range lens {
		temp := 1
		for j := counter + 1; j < len(lens); j++ {
			key := getKey(j, lens)
			temp *= lens[key]
		}
		lensPrime[sourceName] = temp
		counter += 1
	}
	totalLength := 1
	for _, sourceMap := range returnValuesMap {
		totalLength *= len(sourceMap)
	}
	sourceDataArr := make([]sourceData, 0)
	for i := 0; i < totalLength; i++ {
		sd := sourceData{}
		for sourceName, lenOuts := range lens {
			currentIndex := (i / lensPrime[sourceName]) % lenOuts
			sd[sourceName] = returnValuesMap[sourceName][currentIndex]
		}
		sourceDataArr = append(sourceDataArr, sd)
	}
	return sourceDataArr, nil
}

// check if return values are available for a task and then creates a map from them
func (manager *executionManager) getReturnValuesMap(execId int, accountId, taskName string, taskBody map[string]interface{}) (returnValuesMap map[string]returnValues, err error) {
	returnValuesMap = make(map[string]returnValues)
	for _, value := range taskBody {
		var insertDt models.TaskFieldDetailes
		b, _ := json.Marshal(value)
		err := json.Unmarshal(b, &insertDt)
		if err == nil {
			if insertDt.Type == models.FormattedFieldType {
				args := insertDt.Formatter.GetArgs()
				for _, arg := range args {
					if arg.Type == models.NestedFieldType {
						keys := strings.Split(arg.NestedKey, ".")
						source, _, sourceType := getSourceType(keys[0], len(keys))
						if len(keys) <= 1 && sourceType != models.FullObjectSourceType && sourceType != models.SpeceficFullObjectSourceType {
							return nil, errors.New("nested key is not in correct format1")
						}
						//source = strings.Split(arg.NestedKey, ".")[0]
						returnValueArr, err := manager.getReturnArrayForSeource(execId, accountId, source, taskName)
						if err != nil {
							logrus.Println(err)
							return nil, err
						}
						if _, ok := returnValuesMap[source]; !ok && sourceType == models.ForeachSourceType {
							returnValuesMap[source] = returnValueArr
						}
					}
				}
			} else if insertDt.Type == models.NestedFieldType {
				keys := strings.Split(insertDt.NestedKey, ".")
				sourceName, _, sourceType := getSourceType(keys[0], len(keys))
				if len(keys) <= 1 && sourceType != models.FullObjectSourceType && sourceType != models.SpeceficFullObjectSourceType {
					return nil, errors.New("nested key is not in correct format1")
				}
				returnValueArr, err := manager.getReturnArrayForSeource(execId, accountId, sourceName, taskName)
				if err != nil {
					logrus.Println(err)
					return nil, err
				}
				if _, ok := returnValuesMap[sourceName]; !ok && sourceType == models.ForeachSourceType {
					returnValuesMap[sourceName] = returnValueArr
				}
			} else if insertDt.Type == models.JsonFieldType || insertDt.Type == models.JsonArrayFieldType {
				jsonReturnValuesMap, err := manager.getReturnValuesMap(execId, accountId, taskName, insertDt.Value.(map[string]interface{}))
				if err != nil {
					logrus.Println(err)
					return nil, err
				}
				for jsonSourceName, jsonReturnValueArr := range jsonReturnValuesMap {
					if _, ok := returnValuesMap[jsonSourceName]; !ok {
						returnValuesMap[jsonSourceName] = jsonReturnValueArr
					}
				}
			}
		} else {
			return nil, errors.New("error while parsing task body " + err.Error())
		}
	}
	logrus.Println(returnValuesMap)
	return
}

// getReturnValuesArray returns an array of body outputs
func getReturnValuesArray(body map[string]interface{}) (returnValues []map[string]interface{}, err error) {
	returnValues = make([]map[string]interface{}, 0)
	lenMap := len(body)
	for i := 0; i < lenMap; i++ {
		value := body[fmt.Sprintf("%d", i)]
		var returnValue map[string]interface{}
		b, _ := json.Marshal(value)
		err := json.Unmarshal(b, &returnValue)
		if err != nil {
			logrus.Println(value)
			return nil, err
		}
		returnValues = append(returnValues, returnValue)
	}
	return
}

// get key from a given index and a map of keys
func getKey(i int, m map[string]int) string {
	counter := 0
	for key, _ := range m {
		if counter == i {
			return key
		}
		counter += 1
	}
	return ""
}

// get return value array for certain key from certain source of an a task or trigger (task name could be task or trigger name)

func (manager *executionManager) getReturnArrayForSeource(execId int, accountId, source, taskName string) ([]map[string]interface{}, error) {
	body, err := manager.CheckExecutionInitialData(execId, accountId, source, taskName)
	if err != nil {
		logrus.Println(err)
		body, err = manager.CheckReturnValues(execId, accountId, source)
		if err != nil {
			logrus.Println(err)
			return nil, errors.New("no value for this field" + source + " in initial data or return values")
		}
	}
	returnValueArr, err := getReturnValuesArray(body)
	if err != nil {
		return nil, err
	}
	return returnValueArr, nil
}

// first key in nested key is our source then we need to use getfromNestedJson utils to get array of values
func (manager *executionManager) getFromNestedJson(keys []string, currentSourceData map[string]interface{}) ([]interface{}, error) {
	jsonBytes, err := json.Marshal(currentSourceData)
	if err != nil {
		return nil, err
	}
	return utils.GetFromNestedJson(jsonBytes, keys, 0)
}

func (manager *executionManager) getBodyFromSourceData(execId int, accountId string, taskName string, taskBody map[string]interface{}, currentSourceData sourceData) (map[string]interface{}, error) {
	finalTaskBody := make(map[string]interface{})
	for key, value := range taskBody {
		var insertDt models.TaskFieldDetailes
		b, _ := json.Marshal(value)
		err := json.Unmarshal(b, &insertDt)
		if err == nil {
			if insertDt.Type == models.FormattedFieldType {
				values := make(map[string]interface{})
				args := insertDt.Formatter.GetArgs()
				for _, arg := range args {
					argKey := fmt.Sprintf("%s.%s", arg.FuncName, arg.Name)
					if arg.Type == models.NestedFieldType {
						keys := strings.Split(arg.NestedKey, ".")
						source, index, sourceType := getSourceType(keys[0], len(keys))
						var val []interface{}
						var err error
						if sourceType == models.FullObjectSourceType || sourceType == models.SpeceficFullObjectSourceType {
							return nil, errors.New("can't use source. in formatter")
						} else if sourceType == models.ForeachSourceType {
							selectedSourceData, ok := currentSourceData[source]
							if !ok {
								logrus.Println(source)
								return nil, errors.New("no value for this field " + source + " in initial data or return values")
							}
							val, err = manager.getFromNestedJson(keys[1:], selectedSourceData)
						} else if sourceType == models.GetAllSourceType {
							return nil, errors.New("can't use source[*] in formatter")
						} else { // sourceType == specificIndex
							values, err := manager.getReturnArrayForSeource(execId, accountId, source, taskName)
							if err != nil {
								return nil, err
							}
							if index >= len(values) {
								logrus.Println(source)
								return nil, errors.New("no value for this field " + source + " in return values with index " + fmt.Sprintf("%d", index))
							}
							val, err = manager.getFromNestedJson(keys[1:], values[index])
							if err != nil {
								return nil, err
							}
						}
						if err != nil {
							return nil, err
						}
						if len(val) == 1 {
							values[argKey] = val[0]
						} else {
							values[argKey] = val
						}
					} else {
						values[argKey] = arg.Value
					}
				}
				result, err := insertDt.Formatter.Format(values)
				if err != nil {
					logrus.Println(err)
					return nil, err
				}
				finalTaskBody[key] = result
			} else if insertDt.Type == models.NestedFieldType {
				var speceficFullObject bool
				keys := strings.Split(insertDt.NestedKey, ".")
				// if we dont have any [*] in our nested key, we will get only one value
				itsArray := strings.Contains(insertDt.NestedKey, "[*]")
				source, index, sourceType := getSourceType(keys[0], len(keys))
				var val []interface{}
				var err error
				if sourceType == models.FullObjectSourceType { // source
					values, err := manager.getReturnArrayForSeource(execId, accountId, source, taskName)
					if err != nil {
						return nil, err
					}
					val = make([]interface{}, 0)
					for _, v := range values {
						val = append(val, v)
					}
				} else if sourceType == models.ForeachSourceType { // source(foreach).
					selectedSourceData, ok := currentSourceData[source]
					if !ok {
						logrus.Println(source)
						return nil, errors.New("no value for this field " + source + " in initial data or return values")
					}
					val, err = manager.getFromNestedJson(keys[1:], selectedSourceData)
					if err != nil {
						return nil, err
					}
				} else if sourceType == models.GetAllSourceType { // source[*].
					values, err := manager.getReturnArrayForSeource(execId, accountId, source, taskName)
					if err != nil {
						return nil, err
					}
					val = make([]interface{}, 0)
					for _, selectedSource := range values {
						newVal, err := manager.getFromNestedJson(keys[1:], selectedSource)
						if err != nil {
							return nil, err
						}
						val = append(val, newVal...)
					}
				} else if sourceType == models.SpecificIndexSourceType { // source[index].
					values, err := manager.getReturnArrayForSeource(execId, accountId, source, taskName)
					if err != nil {
						return nil, err
					}
					if index >= len(values) {
						logrus.Println(source)
						return nil, errors.New("no value for this field " + source + " in return values with index " + fmt.Sprintf("%d", index))
					}
					val, err = manager.getFromNestedJson(keys[1:], values[index])
					if err != nil {
						return nil, err
					}
				} else { // models.SpeceficFullObjectSourceType
					values, err := manager.getReturnArrayForSeource(execId, accountId, source, taskName)
					if err != nil {
						return nil, err
					}
					if index >= len(values) {
						logrus.Println(source)
						return nil, errors.New("no value for this field " + source + " in return values with index " + fmt.Sprintf("%d", index))
					}
					val = make([]interface{}, 0)
					val = append(val, values[index])
				}
				if sourceType == models.SpeceficFullObjectSourceType {
					finalTaskBody[key] = val[0]
				} else if itsArray || sourceType == models.FullObjectSourceType {
					finalTaskBody[key] = val
				} else {
					finalTaskBody[key] = val[0]
				}
			} else if insertDt.Type == models.JsonFieldType || insertDt.Type == models.JsonArrayFieldType {
				jBody, err := manager.getBodyFromSourceData(execId, accountId, taskName, insertDt.Value.(map[string]interface{}), currentSourceData)
				if err != nil {
					logrus.Println(err)
					return nil, err
				}
				if insertDt.Type == models.JsonFieldType {
					finalTaskBody[key] = jBody
				} else {
					newJArray, err := createJsonArr(jBody)
					if err != nil {
						logrus.Println(err)
						return nil, err
					}
					finalTaskBody[key] = newJArray
				}
			} else { // value is direct value
				finalTaskBody[key] = insertDt.Value
			}
		} else {
			return nil, err
		}
	}
	return finalTaskBody, nil
}

// createJsonArr creates json array from map, how?
/*  for example if we have a map like:

{
	"key1": ["value1", "value2"],
	"key2": ["value3", "value4"]
}

we will create a json array like:
[
	{
		"key1": "value1",
		"key2": "value3"
	},
	{
		"key1": "value2",
		"key2": "value4"
	}
]
*/

func createJsonArr(jBody map[string]interface{}) ([]map[string]interface{}, error) {
	logrus.Println(jBody)
	newJArray := make([]map[string]interface{}, 0)
	maxLength := 0
	minLength := math.MaxInt64
	for _, jValue := range jBody {
		switch reflect.TypeOf(jValue).Kind() {
		case reflect.Slice:
			s := reflect.ValueOf(jValue)
			if s.Len() > maxLength {
				maxLength = s.Len()
			}
			if s.Len() < minLength {
				minLength = s.Len()
			}
		default:
			minLength = 1
		}
	}
	for ind := 0; ind < minLength; ind++ {
		newJson := make(map[string]interface{})
		for jKey, jValue := range jBody {
			switch reflect.TypeOf(jValue).Kind() {
			case reflect.Slice:
				jValues := reflect.ValueOf(jValue)
				log.Println(jValues.Index(ind).Interface())
				newJson[jKey] = jValues.Index(ind).Interface()
			default:
				newJson[jKey] = jValue
			}
		}
		newJArray = append(newJArray, newJson)
	}
	return newJArray, nil
}

func getSourceType(source string, lenKeys int) (realSource string, index int, sourceType string) {
	if strings.Contains(source, "(foreach)") { // we must use current source
		return strings.ReplaceAll(source, "(foreach)", ""), -1, models.ForeachSourceType
	} else if strings.Contains(source, "[*]") { // we should return all objects from source
		return strings.ReplaceAll(source, "[*]", ""), -1, models.GetAllSourceType
	} else if strings.Contains(source, "[") && strings.Contains(source, "]") { // we should return object from specific source index
		index = extractIndex(source)
		indextr := fmt.Sprintf("[%d]", index)
		if lenKeys == 1 {
			return strings.ReplaceAll(source, indextr, ""), index, models.SpeceficFullObjectSourceType
		} else {
			return strings.ReplaceAll(source, indextr, ""), index, models.SpecificIndexSourceType
		}
	} else {
		return source, -1, models.FullObjectSourceType
	}
}

func extractIndex(source string) (index int) {
	indexStr := ""
	prevChar := ""
	for _, char := range source {
		if unicode.IsDigit(char) && prevChar == "[" {
			indexStr += string(char)
		} else {
			prevChar = string(char)
			continue
		}
	}
	index, err := strconv.Atoi(indexStr)
	if err != nil {
		logrus.Println(err)
	}
	return
}
