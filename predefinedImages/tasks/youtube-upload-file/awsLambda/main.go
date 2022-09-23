// image: hojjat12/youtube-upload-file:lambda4
package main

import (
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/aws/aws-sdk-go/service/s3/s3manager"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/youtube/v3"
)

// type Event struct {
// 	AccessToken  string `json:"INTEGRATION_ACCESS_TOKEN"`
// 	RefreshToken string `json:"INTEGRATION_REFRESH_TOKEN"`
// 	FileName     string `json:"fileName"`
// 	Title        string `json:"title"`
// 	Description  string `json:"description"`
// 	Category     string `json:"category"`
// 	Keywords     string `json:"keywords"`
// 	Privacy      string `json:"privacy"`
// }

type Event struct {
	Body map[string]interface{} `json:"body"`
}

type Response struct {
	Successfull bool `json:"successfull"`
}

func HandleLambdaEvent(event Event) (Response, error) {
	fmt.Println("event.Body:", event.Body)
	resp := Response{}
	resp.Successfull = true
	// for _, val := range event.Body {
	singleInput := event.Body
	accessToken := singleInput["INTEGRATION_ACCESS_TOKEN"].(string)
	refreshToken := singleInput["INTEGRATION_REFRESH_TOKEN"].(string)
	fileName := singleInput["fileName"].(string)
	title := singleInput["title"].(string)
	description := singleInput["description"].(string)
	category := singleInput["category"].(string)
	keywords := singleInput["keywords"].(string)
	privacy := singleInput["privacy"].(string)
	// privacy can be one of this: [unlisted, public, private]

	err := uploadVideo(fileName, title, description, category, keywords, privacy, accessToken, refreshToken)
	if err != nil {
		fmt.Println(err)
		resp.Successfull = false
		// continue
	}
	// }
	if resp.Successfull {
		fmt.Println("All video(s) uploaded successfully")
	}
	return resp, nil
}

func main() {
	lambda.Start(HandleLambdaEvent)
}

func uploadVideo(fileName, title, description, category, keywords, privacy, accessToken, refreshToken string) (err error) {

	token := &oauth2.Token{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}

	config, _ := google.ConfigFromJSON([]byte{}, youtube.YoutubeUploadScope)

	// Create the *http.Client using the access token
	client := config.Client(oauth2.NoContext, token)
	// Create a new youtube service using the client
	youtubeService, err := youtube.New(client)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	upload := &youtube.Video{
		Snippet: &youtube.VideoSnippet{
			Title:       title,
			Description: description,
			CategoryId:  category,
		},
		Status: &youtube.VideoStatus{PrivacyStatus: privacy},
	}
	// The API returns a 400 Bad Request response if tags is an empty string.
	if strings.Trim(keywords, "") != "" {
		upload.Snippet.Tags = strings.Split(keywords, ",")
	}

	call := youtubeService.Videos.Insert([]string{"snippet", "status"}, upload)
	// file, err := os.Open("/tmp/" + fileName)
	// defer file.Close()
	// if err != nil {
	// 	fmt.Println("Error opening %v: %v", fileName, err)
	// 	return
	// }
	filePath := "/tmp/s3_files"
	_, err = os.Stat(filePath)
	if os.IsNotExist(err) {
		err = os.MkdirAll(filePath, 0770)
		if err != nil {
			log.Println(err.Error())
			return
		}
	} else if err != nil {
		log.Println(err.Error())
		return
	}
	log.Println(fileName)
	file, err := os.Create(filePath + "/" + fileName)
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	defer file.Close()

	sess, _ := session.NewSession(&aws.Config{
		Region: aws.String("us-east-1")},
	)
	bucketName := "dotenx"
	downloader := s3manager.NewDownloader(sess)
	_, err = downloader.Download(file,
		&s3.GetObjectInput{
			Bucket: aws.String(bucketName),
			Key:    aws.String(fileName),
		})
	if err != nil {
		log.Println(err.Error())
		return
	}

	response, err := call.Media(file).Do()
	if err != nil {
		fmt.Println(err.Error())
		return
	}
	fmt.Printf("Upload successful! Video ID: %v\n", response.Id)

	return
}
