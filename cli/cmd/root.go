package cmd

import (
	"fmt"
	"io/fs"
	"io/ioutil"
	"os"
	"runtime"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
	"gopkg.in/yaml.v2"
)

// rootCmd represents the base command when called without any subcommands
var (
	// TagName  = "better-ux"
	// RepoName = "homebrew-utopiops"
	// Owner    = "utopiops"
	// UtopiopsService utopiopsService.UtopiopsService
	// GitService      gitService.GitService
	// AwsService      awsService.AwsService
	cfgFile string
	rootCmd = &cobra.Command{
		Use:   "cli",
		Short: "DoTenX Cli",
		Long:  `Cli Tool For DoTenX Functions`,
		// Uncomment the following line if your bare application
		// has an action associated with it:
		Run: func(cmd *cobra.Command, args []string) {
			fmt.Println("DoTenX is here!")
		},
	}
)

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	// isLatest, err := GitService.CheckVersionIslatest(Owner, RepoName, TagName)
	// if err != nil {
	// 	log.Fatalln(err.Error())
	// }
	// if !isLatest {
	// 	blue := color.New(color.FgBlue).SprintFunc()
	// 	fmt.Println(blue("*there is a newer version of utopiops cli available*"))
	// }
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.
	cobra.OnInitialize(initConfig)
}

func initConfig() {
	//fmt.Println("in init config")
	if cfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(cfgFile)
	} else {
		// Find home directory.
		home, err := os.UserHomeDir()
		cobra.CheckErr(err)

		// Search config in home directory with name ".dotenx" (without extension).
		// todo remove /Desktop which is for test
		viper.AddConfigPath(home)
		viper.SetConfigType("yaml")
		viper.SetConfigName(".dotenx")
		if runtime.GOOS == "windows" {
			cfgFile = home + "\\.dotenx.yml"
		} else {
			cfgFile = home + "/.dotenx.yml"
		}
		//log.Println("file set to be: " + cfgFile)
	}
	_, err := os.Open(cfgFile)
	if os.IsNotExist(err) {
		err = createConfigFile(cfgFile)
		if err != nil {
			fmt.Println(err.Error())
			return
		}
	}

	viper.AutomaticEnv()

	if err := viper.ReadInConfig(); err == nil {
		fmt.Println("Using config file:", viper.ConfigFileUsed())
	} else {
		fmt.Println(err)
	}
	if viper.GetString("DOTENX_ACCESS_TOKEN") == "" {
		err := RegisterCli()
		if err != nil {
			fmt.Println(err.Error())
			os.Exit(1)
		}
	}
}

func RegisterCli() error {
	fmt.Println("registering cli ...")
	var dtxAccessToken string = viper.GetString("DOTENX_ACCESS_TOKEN")
	if dtxAccessToken == "" {
		fmt.Print("Enter your dotenx access token: ")
		fmt.Scanln(&dtxAccessToken)
	}
	var config Config
	config.DotenxAccessToken = dtxAccessToken
	viper.Set("DOTENX_ACCESS_TOKEN", dtxAccessToken)
	marshalledConfig, _ := yaml.Marshal(&config)
	return ioutil.WriteFile(cfgFile, marshalledConfig, fs.ModeAppend)
}

func createConfigFile(path string) error {
	config := Config{}
	marshalledConfig, _ := yaml.Marshal(&config)
	_, err := os.Create(path)
	if err != nil {
		return err
	}
	return ioutil.WriteFile(path, marshalledConfig, fs.ModeAppend)
}
