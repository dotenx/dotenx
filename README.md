# Do10X
DoTenX, allows you to automate everything for yourself or offer it as a service with no-code.


Discord:

https://discord.gg/kpCmHtKYHd



# Installation

You can run DoTenX easily on your machine and the only requirement is to have Docker engine installed on the machine.

The following commands run all the components of DoTenX on your machine:

``` bash
docker network create -d bridge local --attachable
docker compose up
```

# ⭐️ `Star us`

If you want to support our work - please star this project, every star makes us very happy!

![Screen Shot 2022-04-19 at 8 06 49 pm](https://user-images.githubusercontent.com/15846333/163980940-dd63f362-dfdc-45e5-9d4c-68a144434905.png)



# Introduction
DoTenX is a no-code/low-code automation tool that can be used in scenarios from automating the most complicated business automation activites, to a CI/CD pipeline to automate the software delivery with custom steps. 

Each `Automation` is comprised of three main building blocks:
* Tasks
* Triggers
* Integrations

**Automation**: An `Automation` is a combination of one or more `Tasks` that together automate a scenario/workflow. For example, you can create an automation that sends your emails from certain contacts to your Slack channel or an automation that sends a Tweet from a list that you have stored on Dropbox and updates the list.

**Trigger**: DoTenX supports `Scheduled Triggers` and `Regular Triggers`. A scheduled trigger, as implied by the name, starts the execution of an automation based on a pattern, however, a regular trigger checks a certain condition, every x seconds, and should the condition be true it starts the execution and can pass certain values to the tasks in the automation.

**Task**: Tasks are the actual building blocks of an automation. Each task can execute a certain job. You can choose one of the existing task types, e.g. `Send Tweet`, `Send Slack Message`, etc, or use a user defined task. The user defined tasks can virtually be anything you can think of. All you need to do is to dockerize the code you want to run (that automates a job), add a generic taks to your automation and configure the task with your image name.

**Integration**: In order to be able to connect different third party applications, e.g., Twitter, Airtable, Notion, Shopify, etc, you need to add an integration. Integrations in simple terms allow DoTenX to automate certain activities (tasks to be specific) on your behalf.

# Getting started

After `docker-compose up` open `localhost:3010` in your browser to use ui.

## Create integration 

If you already have credentials to create your integration such as access token, secret or ... click advanced and insert them to create your integration otherwise click connect and give us needed scopes.

<img width="1435" alt="Screen Shot 1401-02-12 at 17 49 37" src="https://user-images.githubusercontent.com/58859939/166241145-84f32235-f358-4595-b97c-955d0f799712.png">


## Create Automation 

You can drag and drop tasks and triggers to add them to your automation and then you must save it and also activate it(inactive automatios won't run irrespective of the triggers or even manually). 
* you can only run an automation manually if there is no dependency between task inputs and trigger outputs.


<img width="1435" alt="Screen Shot 1401-02-12 at 17 51 53" src="https://user-images.githubusercontent.com/58859939/166241353-96ee8401-44c8-4fef-89a6-85257f2c11a4.png">


# Contributing

The most common scenario for contributing to DoTenX is adding new `Tasks`, `Triggers` or `Integrations` which are the main components of `Automations`.

## Adding new integration type

If you want to use a new integration type you only need to add a yaml file 
to integrations directory in this format.
``` yaml
type: type of your integration
secrets: [ACCESS_TOKEN]
```
* If you set an integration type for your task or trigger you have access to integration fields in your container, forexample if your integration has ACCESS_TOKEN you have an environment variable named INTEGRATION_ACCESS_TOKEN in your container

## Adding new task type

If you want to use a new task you only need to add a yaml file 
to tasks directory in this format.
``` yaml
type: type of your task
image: Docker image that implements the task
# every field you define here will be available as an environment variable in container with the same key
fields:
  - key: key of your variable
    type: type of your variable(currently text and JSON are supported)
outputs:
    - key: key of your output variable
      type: type of your output variable(currently text and JSON are supported)
# integration field is not necessary
integration: integration type wich is needed to run your task
author: your github username 
```
* If your task has outputs you need to set them using RESULT_ENDPOINT which is an environment variable that all containers have. suppose you have an output with name as key and armin as value. you must send a post request to RESULT_ENDPOINT to set your output with this body:

``` json
{
    "status": "started",
    "return_value": {
        "name": "armin"
    }
}
```

* If your task creates a file and you want to share that file with other tasks you need to create your file in /tmp directory of your container and your file name must start with workspace_(you can get workspace from environment variable with key WORKSPACE). 
And to pass file name to other tasks you need to set that as an output.
forexample if you want to share your created WORKSPACE_result.json with other tasks you must send a post request to RESULT_ENDPOINT with this body:

``` json
{
    "status": "started",
    "return_value": {
        "file": "WORKSPACE_result.json"
    }
}
```


## Adding new trigger type

If you want to use a new trigger you only need to add a yaml file 
to triggers directory in this format.
``` yaml
type: type of your trigger
image: Docker image that implements the trigger
# every field you define here will be available as an environment variable in container with the same key
credentials:
  - key: key of your variable
    type: type of your variable(currently text is supported)
outputs:
    - key: key of your output variable
      type: type of your output variable(currently text and JSON are supported)
# integration field is not necessary
integration: integration type wich is needed to run your trigger
author: your github username 
``` 
* Your image for trigger must send a post request to PIPELINE_ENDPOINT to trigger an Automation otherwise it won't be usable as an image for trigger.

If your trigger has outputs you must send them with body when you want to trigger your Automation; forexample if you have an output with name as key and armin as value and a created file named WORKSPACE_result.json(like tasks in /tmp directory) you must send this body with your post request:

``` json
{
    "workspace": "WORKSPACE",
    "TRIGGER_NAME": {
        "name": "armin",
        "file": "WORKSPACE_result.json"
    }
}
```
you can get WORKSPACE, TRIGGER_NAME and PIPELINE_ENDPOINT from environment variables

# License 
DoTenX is licensed in a way that it lets you use it for free but it doesn't give permission of sale.
The exact details that must be followed are provided in the License of this repository.
