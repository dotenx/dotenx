package kubernetes

/*import (
	"bytes"
	"io"
	"time"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
)

type kubernetesExecutor struct {
	clientset *kubernetes.Clientset
}

var KubernetesExecutor kubernetesExecutor

func (executor *kubernetesExecutor) Execute() {

}

func (executor *kubernetesExecutor) CheckResult(nameSpace, jobName string) int {
	batchClient := executor.clientset.BatchV1()
	jobClient := batchClient.Jobs(nameSpace)

	job, _ := jobClient.Get(jobName, metav1.GetOptions{})

	if job.Status.Active > 0 {
		return 0

	} else {
		if job.Status.Succeeded > 0 {
			return 1
		}
		return -1
	}

}
func (executor *kubernetesExecutor) CheckTimeout(timeout int, taskName string) int {
	time.Sleep(time.Duration(timeout))
	return 0
}

// pod corev1.Pod must be input
func (executor *kubernetesExecutor) GetLogs(taskName string) (string, error) {
	podLogOpts := corev1.PodLogOptions{}
	req := executor.clientset.CoreV1().Pods(pod.Namespace).GetLogs(pod.Name, &podLogOpts)
	podLogs, err := req.Stream()
	if err != nil {
		return "error in opening stream"
	}
	defer podLogs.Close()

	buf := new(bytes.Buffer)
	_, err = io.Copy(buf, podLogs)
	if err != nil {
		return "error in copy information from podLogs to buf"
	}
	str := buf.String()

	return str
}*/
