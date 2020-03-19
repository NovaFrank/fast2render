export default {
  title: {
    text: '2019年xx物料比价 - 折线图',
    left: 10,
    textStyle: {
      fontSize: 14
    }
  },
  tooltip: {
    show: true,
    trigger: 'axis'
  },
  grid: {
    left: '10px',
    containLabel: true
  },
  xAxis: {
    boundaryGap: false,
    data: [
      '2019-1',
      '2019-2',
      '2019-3',
      '2019-4',
      '2019-5',
      '2019-6',
      '2019-7',
      '2019-8',
      '2019-9',
      '2019-10',
      '2019-11',
      '2019-12'
    ]
  },
  yAxis: {},
  series: [
    {
      name: '平均成交价格',
      type: 'line',
      data: [1020, 2890, 850, 1880, 670, 2510, 1130, 220, 350, 1658, 350, 1658],
      itemStyle: {
        color: 'rgba(255, 128, 128, 1)'
      }
    }
  ]
};
