package cmd

import (
	"dotenx-cli/config"
	"fmt"
	"os"
	"os/exec"

	cp "github.com/otiai10/copy"
	"github.com/spf13/cobra"
)

var runCmd = &cobra.Command{
	Use:   "run",
	Short: "run function",
	Long:  `run command runs your function locally and prints outputs`,
	Run: func(cmd *cobra.Command, args []string) {
		language, _ := cmd.Flags().GetString("language")
		path, _ := cmd.Flags().GetString("path")
		functionName, _ := cmd.Flags().GetString("function")
		handler := ""
		templateData := make([]byte, 0)

		fmt.Println("creating temporary directory...")
		newDirPath, err := os.MkdirTemp("", "*")
		if err != nil {
			fmt.Println(err.Error())
			return
		}
		fmt.Println("copy some files...")
		err = cp.Copy(path, newDirPath+"/service", cp.Options{AddPermission: os.FileMode(int(0777))})
		if err != nil {
			fmt.Println(err.Error())
			return
		}

		switch language {
		case "go":
			templateData = []byte(config.GO_SAM_TEMPLATE)
			handler = fmt.Sprintf(`
			package main

			import (
				"github.com/aws/aws-lambda-go/lambda"
			)

			func main() {
				lambda.Start(%s)
			}
			`, functionName)
			err = os.WriteFile(newDirPath+"/service/main.go", []byte(handler), 0777)
			if err != nil {
				fmt.Println(err.Error())
				return
			}
			fmt.Println("running 'go mod tidy' command...")
			goModCmd := exec.Command("go", "mod", "tidy")
			goModCmd.Dir = newDirPath + "/service"
			goModOutput, err := goModCmd.Output()
			fmt.Println(string(goModOutput))
			if err != nil {
				fmt.Println(err.Error())
				return
			}
		}
		os.WriteFile(newDirPath+"/template.yaml", templateData, 0777)
		fmt.Println("Source Code Path:", string(path))
		fmt.Println("Language:", string(language))

		// fmt.Println("sam init...")
		// fmt.Println("new directory path:", newDirPath)
		// initCmd := exec.Command("sam", "init")
		// initCmd.Dir = newDirPath
		// initOutStr, err := initCmd.Output()
		// fmt.Println(string(initOutStr))
		// fmt.Println("err:", err)
		// if err != nil {
		// 	fmt.Println(string(initOutStr))
		// 	return
		// }

		fmt.Println("sam build...")
		buildCmd := exec.Command("sam", "build")
		buildCmd.Dir = newDirPath
		buildOutStr, err := buildCmd.Output()
		if err != nil {
			fmt.Println(string(buildOutStr))
			return
		}

		fmt.Println("sam lcoal invoke...")
		samRunCmd := exec.Command("sam", "local", "invoke", "-e", newDirPath+"/service/input.json")
		samRunCmd.Dir = newDirPath
		samRunOutStr, err := samRunCmd.Output()
		fmt.Println(string(samRunOutStr))
		if err != nil {
			return
		}
	},
}

func init() {
	rootCmd.AddCommand(runCmd)
	runCmd.Flags().StringP("language", "l", "", "language name [go, node]")
	runCmd.Flags().StringP("function", "f", "", "function name")
	runCmd.Flags().StringP("path", "p", "", "the path to a directory where the source codes are stored")
}
