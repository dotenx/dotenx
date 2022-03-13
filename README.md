# automated-ops
AutomatedOps, extremely simple and flexible way to run any workflow.

Automated ops is licensed in a way that it lets you use it for free but it doesn't give permission of sale.
The exact details that must be followed are provided in the License of this repository.


# Running

``` bash
docker network create -d bridge local --attachable
docker compose up
```

# Add new integration type

If you want to use a new integration type you only need to add a yaml file 
to integrations directory in this format.
``` yaml
type: type of your integration
needs_access_token: set true if your integration needs an access token
needs_key: set true if your integration needs a key
needs_secret: set true if your integration needs a secret key
needs_url: set true if your integration needs an url
```
* If you set an integration type for your task or trigger you have access to integration fields in your container, forexample if your integration has access token you have an environment variable named INTEGRATION_ACCESS_TOKEN in your container

# Add new task type

If you want to use a new task you only need to add a yaml file 
to tasks directory in this format.
``` yaml
type: type of your task
image: image wich will be runned if you start your task
# every field you define here will be available as an environment variable in container with the same key
fields:
  - key: key of your variable
    type: type of your variable(currently text and JSON are supported)
# integration field is not necessary
integration: integration type wich is needed to run your task
```

# Add new trigger type

If you want to use a new trigger you only need to add a yaml file 
to triggers directory in this format.
``` yaml
type: type of your trigger
image: image wich will be runned if you want to check your trigger
# every field you define here will be available as an environment variable in container with the same key
credentials:
  - key: key of your variable
    type: type of your variable(currently text is supported)
# integration field is not necessary
integration: integration type wich is needed to run your trigger
```
