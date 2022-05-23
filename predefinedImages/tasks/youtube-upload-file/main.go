package main

import (
	"fmt"
	"os"
	"strings"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/youtube/v3"
)

func main() {
	accessToken := os.Getenv("INTEGRATION_ACCESS_TOKEN")
	refreshToken := os.Getenv("INTEGRATION_REFRESH_TOKEN")
	fileName := os.Getenv("fileName")
	title := os.Getenv("title")
	description := os.Getenv("description")
	category := os.Getenv("category")
	keywords := os.Getenv("keywords")
	privacy := os.Getenv("privacy")
	// privacy can be one of this: [unlisted, public, private]
	err := uploadVideo(fileName, title, description, category, keywords, privacy, accessToken, refreshToken)
	if err != nil {
		fmt.Println(err)
		return
	}
	fmt.Println("video uploaded successfully")

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
	file, err := os.Open("/tmp/" + fileName)
	defer file.Close()
	if err != nil {
		fmt.Println("Error opening %v: %v", fileName, err)
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
