# Do10X
DoTenX, extremely simple and most flexible way to build any automation with no-code.


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

![Screen Shot 2022-04-12 at 11 24 52 am](https://user-images.githubusercontent.com/15846333/162859972-3277c086-4d3d-40bc-aec3-2e0d6ba5b834.png)


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
# integration field is not necessary
integration: integration type wich is needed to run your task
author: your github username 
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
# integration field is not necessary
integration: integration type wich is needed to run your trigger
author: your github username 
```

# License 
DoTenX is licensed in a way that it lets you use it for free but it doesn't give permission of sale.
The exact details that must be followed are provided in the License of this repository.
