# automated-ops
AutomatedOps, extremely simple and flexible way to run any workflow.

Automated ops is licensed in a way that it lets you use it for free but it doesn't give permission of sale.
The exact details that must be followed are provided in the License of this repository.


# Running

``` bash
docker network create -d bridge local --attachable
docker compose up
```

# Adding new task

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
