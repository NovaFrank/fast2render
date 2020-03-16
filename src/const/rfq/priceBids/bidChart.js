export default {
  title: {
    text: '供应商当前报价比价 - 柱状图',
    left: 10,
    textStyle: {
      fontSize: 14
    }
  },
  tooltip: {
    show: false
  },
  grid: {
    left: '10px',
    containLabel: true
  },
  xAxis: {
    boundaryGap: true,
    data: [
      '供应商1',
      '供应商2',
      '供应商3',
      '供应商4',
      '供应商5',
      '供应商6',
      '供应商7',
      '供应商8',
      '供应商9',
      '供应商10'
    ]
  },
  yAxis: {},
  series: [
    {
      type: 'bar',
      data: [1020, 2890, 850, 1880, 670, 2510, 1130, 220, 350, 1658],
      itemStyle: {
        color: 'rgba(255, 128, 128, 1)'
      },
      emphasis: {
        label: {
          width: '100%',
          show: true,
          position: 'top',
          distance: 30,
          color: '#fff',
          backgroundColor: '#333333',
          padding: [8, 16, 8, 16],
          borderRadius: 4,
          fontSize: 16,
          verticalAlign: 'middle'
        },
        itemStyle: {
          color: 'rgba(253, 128, 91, 1)'
        }
      }
    }
  ]
};
