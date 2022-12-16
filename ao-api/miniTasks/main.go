package miniTasks

// import (
// 	"encoding/json"
// 	"fmt"
// 	"io/ioutil"
// 	"os"
// )

// func main() {

// 	path := "./obj.json"

// 	jsonFile, err := os.Open(path)
// 	if err != nil {
// 		fmt.Println(err)
// 	}
// 	defer jsonFile.Close()
// 	bytes, _ := ioutil.ReadAll(jsonFile)

// 	var parsed map[string]interface{}
// 	json.Unmarshal([]byte(bytes), &parsed)

// 	importStore := NewImportStore()

// 	code, err := convertToCode(parsed["steps"].([]interface{}), &importStore)

// 	if err != nil {
// 		fmt.Println(err)
// 	}

// 	fmt.Println(`**************************************************`)
// 	fmt.Println(code)

// }
