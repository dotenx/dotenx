const axios = require('axios')

const main = async function () {
  const pipelineEndpoint = process.env.PIPELINE_ENDPOINT
	const accountId = process.env.ACCOUNT_ID
	const triggerName = process.env.TRIGGER_NAME
	const workspace = process.env.WORKSPACE
  const triggerFrequency = process.env.TRIGGER_FREQUENCY || 90

	if (triggerName == "") {
		console.log("your trigger name is not set")
		return
	}
	const accessToken = process.env.INTEGRATION_ACCESS_TOKEN

  try {
    const getAllPostsUrl = "https://graph.instagram.com/me/media?fields=id,timestamp&access_token=" + accessToken
    let instagramResponse = await axios.get(getAllPostsUrl)

    const allPosts = instagramResponse.data.data

    if (allPosts.length == 0) {
      console.log("no post in the page")
      return
    }

    console.log("instagram response (get user media request): ", allPosts)

    const passedTime = triggerFrequency * 1000
    const latestPostTime = new Date(allPosts[0].timestamp).getTime()
    const now = new Date().getTime()

    if (latestPostTime < now - passedTime) {
      console.log("no new post in the page")
      return
    }

    const newPostId = allPosts[0].id
    const getPostUrl = `https://graph.instagram.com/${newPostId}?fields=id,caption,media_type,media_url,permalink,thumbnail_url,username,timestamp&access_token=${accessToken}`
    instagramResponse = await axios.get(getPostUrl)

    const newPost = instagramResponse.data

    console.log("instagram response (get user new post request): ", newPost)

    const body = {
      accountId,
      workspace
    }

    body[triggerName] = {
      id: newPost.id,
      caption: newPost.caption,
      media_type: newPost.media_type,
      media_url: newPost.media_url,
      permalink: newPost.permalink,
      thumbnail_url: newPost.thumbnail_url,
      username: newPost.username,
      created_at: newPost.timestamp
    }

    await axios.post(pipelineEndpoint, body)
    console.log("trigger successfully started")
  } catch (error) {
    console.log("Somthing went wrong: ", error)
  }
}

main()