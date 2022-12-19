# DoTenX CLI

Requirements:

- aws sam (help link)
- zip
- Your language installer or package manager:
  - For Golang: go 1.16 or above
  - For node: npm

Commands:
- `run` -> run command runs your function locally and prints outputs (this is just for your test locally)
  - Flags:
    - `-l`, `--language` -> language name [‘go’ or ‘node’]
    - `-f`, `--function` -> function name of your source code that has main functionality
    - `-p`, `--path` -> the path to a directory where the source codes are stored

Final Run (Test) Command:

    dotenx run -l go -p ./hello_world -f HandleRequest

In my hello_world directory I have this files:

- go.mod
- go.sum
- function.go
- input.json

We use your input.json for your function parameters and in this example my input.json is:

    {
        "name": "James"
    }

All go code should be written in main package and you shouldn’t have main.go file (choose another name for your file(s))

`function.go` code is:

    package main

    import (
            "fmt"
            "context"
    )

    type MyEvent struct {
            Name string `json:"name"`
    }

    func HandleRequest(ctx context.Context, name MyEvent) (string, error) {
            return fmt.Sprintf("Good Bye %s!", name.Name ), nil
    }

- `deploy` -> deploy command deploys your function locally and prints outputs
  - Flags:
    - `-l`, `--language` -> language name [‘go’ or ‘node’]
    - `-f`, `--function` -> function name of your source code that has main functionality
    - `-p`, `--path` -> the path to a directory where the source codes are stored
    - `-d`, `--definition_path` -> the path to a file where the definition of task/trigger stored (in yaml format)
    - `-t`, `--type` -> type of your function ('task' or 'trigger')

Final Deploy Command:

    dotenx deploy -l go -p ./hello_world -f HandleRequest -t task -d ./hello_world_definitions/task_definition.yaml

My `task_definition.yaml` is:

    service: dotenx
    type: Test task
    image: james/example-function:0.0.1
    fields:
        - key: name
          type: text
          description: name 
    outputs:
        - key: name
          type: text
          description: name 
    author: James
    icon: https://cdn4.vectorstock.com/i/1000x1000/81/83/document-file-logo-vector-25068183.jpg
    node_color: A04000
    description: Just a test task for dotenx CLI 



