package publishutils

import "strings"

func renderChart(chartType string) string {
	switch chartType {
	case "Bar":
		return barChart
	case "Area":
		return areaChart
	case "Line":
		return lineChart
	case "Pie":
		return pieChart
	case "Doughnut":
		return doughnutChart
	case "Polar Area":
		return polarAreaChart
	case "Radar":
		return radarChart
	case "Scatter":
		return scatterChart
	case "Bubble":
		return bubbleChart
	default:
		return ""
	}
}

func renderCharts(chartTypes map[string]bool) string {
	var out strings.Builder
	for chartType := range chartTypes {
		out.WriteString(renderChart(chartType))
	}
	return out.String()
}

const barChart = `
let barChart = function () {
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel, borderColor, pointBackgroundColor }) {
      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "bar",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          labels: data.map(r => r[xlabel]),
          datasets: [
            {
              borderColor: borderColor,
              pointBackgroundColor: pointBackgroundColor,
              data: data.map(r => r[ylabel]),
            }
          ],
        },
      });
    }
  }
}
`

const areaChart = `
let areaChart = function () {
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel, borderColor, pointBackgroundColor, backgroundColor }) {
      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "line",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          labels: data.map(r => r[xlabel]),
          datasets: [
            {
              borderColor: borderColor,
              pointBackgroundColor: pointBackgroundColor,
              data: data.map(r => r[ylabel]),
              fill: {
                target: 'origin',
                above: backgroundColor
              }
            }
          ],
        },
      });
    }
  }
}
`

const lineChart = `
let lineChart = function () {
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel, borderColor, pointBackgroundColor, backgroundColor }) {
      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "line",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          labels: data.map(r => r[xlabel]),
          datasets: [
            {
              borderColor: borderColor,
              pointBackgroundColor: pointBackgroundColor,
              data: data.map(r => r[ylabel]),
              fill: false
            }
          ],
        },
      });
    }
  }
}
`

const pieChart = `
let pieChart = function (a) {
  
  function random_rgb_pair(a) {
    var o = Math.round, r = Math.random, s = 255;
    return {full: 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + a + ')', partial: 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + 1 + ')'}
  }
  
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel }) {

      const colors = data.map(r => random_rgb_pair(0.2))
      const backgroundColor = colors.map(r => r.partial)
      const borderColor = colors.map(r => r.full)

      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "pie",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          labels: data.map(r => r[xlabel]),
          datasets: [
            {
              data: data.map(r => r[ylabel]),
              backgroundColor,
              borderColor,
              borderWidth: 1
            }
          ],
        },
      });
    }
  }
}
`

const doughnutChart = `
let doughnutChart = function () {
  
  function random_rgb_pair(a) {
    var o = Math.round, r = Math.random, s = 255;
    return {full: 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + a + ')', partial: 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + 1 + ')'}
  }
  
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel }) {

      const colors = data.map(r => random_rgb_pair(0.2))
      const backgroundColor = colors.map(r => r.partial)
      const borderColor = colors.map(r => r.full)

      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "doughnut",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          labels: data.map(r => r[xlabel]),
          datasets: [
            {
              data: data.map(r => r[ylabel]),
              backgroundColor,
              borderColor,
              borderWidth: 1
            }
          ],
        },
      });
    }
  }
}
`

const polarAreaChart = `
let polarAreaChart = function () {
  
    function random_rgb_pair(a) {
      var o = Math.round, r = Math.random, s = 255;
      return {full: 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + a + ')', partial: 'rgba(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ',' + 1 + ')'}
    }
  
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel }) {

      const colors = data.map(r => random_rgb_pair(0.2))
      const backgroundColor = colors.map(r => r.partial)
      const borderColor = colors.map(r => r.full)

      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "polarArea",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          labels: data.map(r => r[xlabel]),
          datasets: [
            {
              data: data.map(r => r[ylabel]),
              backgroundColor,
              borderColor,
              borderWidth: 1
            }
          ],
        },
      });
    }
  }
}
`

const radarChart = `
let radarChart = function () {
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel, borderColor, pointBackgroundColor, backgroundColor }) {
      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "radar",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          labels: data.map(r => r[xlabel]),
          datasets: [
            {
              borderColor: borderColor,
              pointBackgroundColor: pointBackgroundColor,
              data: data.map(r => r[ylabel]),
              fill: true,
              backgroundColor
            }
          ],
        },
      });
    }
  }
}
`

const scatterChart = `
let scatterChart = function () {
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel, borderColor, pointBackgroundColor, backgroundColor }) {
      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "scatter",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          datasets: [
            {
              borderColor: borderColor,
              pointBackgroundColor: pointBackgroundColor,
              data: data.map(r => ({x: r[xlabel], y: r[ylabel]})),
              fill: false,
              backgroundColor
            }
          ],
        },
      });
    }
  }
}
`

const bubbleChart = `
let bubbleChart = function () {
  return {
    renderChart: function ({ data, title, chartId, xlabel, ylabel, borderColor, pointBackgroundColor, backgroundColor }) {
      let ctx = document.getElementById(chartId).getContext('2d');
      new Chart(ctx, {
        type: "bubble",
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            title: {
              display: true,
              text: title
            }
          }
        },
        data: {
          datasets: [
            {
              borderColor: borderColor,
              pointBackgroundColor: pointBackgroundColor,
              data: data.map(r => ({x: r[xlabel], y: r[ylabel], r: 5})),
              fill: false,
              backgroundColor
            }
          ],
        },
      });
    }
  }
}
`
