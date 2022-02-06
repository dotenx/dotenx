package graphs

type ExecutionGraph struct {
	Root Node
}

type Node struct {
	Name     string
	Children []Node
	Parents  []Node
}

func (e *ExecutionGraph) Initialize() {
	n := Node{
		Name: "$", // We use $ because you're not allowed to use it in the name of any other nodes
	}
	e.Root = n
}

func (e *ExecutionGraph) Validate() {

}

func (e *ExecutionGraph) bfs() {

}

func (e *ExecutionGraph) dfs() {

}

func (e *ExecutionGraph) Sort() {

}

func (n *Node) AddChild(node Node) {
	n.Children = append(n.Children, node)
}

func (n *Node) AddChildren(nodes []Node) {
	n.Children = append(n.Children, nodes...)
}

func (n *Node) AddParent(node Node) {
	n.Parents = append(n.Parents, node)
}

func (n *Node) AddParents(nodes []Node) {
	n.Parents = append(n.Parents, nodes...)
}
