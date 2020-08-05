const materialsColumn = [
  {
    prop: 'materialNumber',
    span: 8,
    label: '物料编号',
    component: 'fast2-select-material',
    datatype: 'popup',
    width: '160px'
  },
  {
    prop: 'materialDesc',
    span: 8,
    label: '物料描述',
    datatype: 'popupName',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '160px'
  },
  {
    prop: 'materialName',
    span: 8,
    label: '物料名称',
    datatype: 'popupName',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'cateLevelCode',
    span: 8,
    label: '物料分类级别编码',
    datatype: 'popup',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'materialSpecifications',
    span: 8,
    label: '物料规格',
    datatype: 'input',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'materialType',
    span: 8,
    label: '物料类型编码',
    datatype: 'popup',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'materialTypeName',
    span: 8,
    label: '物料类型名称',
    datatype: 'popupName',
    ref: 'materialNumber,materialType',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'materialBrand',
    span: 8,
    label: '物料品牌',
    datatype: 'varchart',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'materialGroup',
    span: 8,
    label: '物料组编码',
    datatype: 'popup',
    component: 'fast2-select-purchase-group',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'materialGroupName',
    span: 8,
    label: '物料组名称',
    datatype: 'popupName',
    ref: 'materialNumber,materialGroup',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'factory',
    span: 8,
    label: '工厂编码',
    datatype: 'popup',
    component: 'fast2-select-factory',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'factoryName',
    span: 8,
    label: '工厂名称',
    datatype: 'popupName',
    ref: 'materialNumber,factory',
    disabled: 'disabled',
    width: '120px'
  },
  {
    prop: 'grossWeight',
    span: 8,
    label: '毛重',
    datatype: 'number',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '100px'
  },
  {
    prop: 'netWeight',
    span: 8,
    label: '净重',
    datatype: 'number',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '100px'
  },
  {
    prop: 'purchaseUnit',
    span: 8,
    label: '采购单位',
    bizDic: 'purchaseUnit',
    ref: 'materialNumber',
    disabled: 'disabled',
    width: '100px'
  },
  {
    prop: 'weightUnit',
    span: 8,
    label: '重量单位',
    type: 'select',
    bizDic: 'weightUnit',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'materialModel',
    span: 8,
    label: '物料型号',
    datatype: 'popup',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'picture',
    span: 8,
    label: '图片',
    datatype: 'image',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'materialLength',
    span: 8,
    label: '长',
    datatype: 'number',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'materialWide',
    span: 8,
    label: '宽',
    datatype: 'number',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'materialHigh',
    span: 8,
    label: '高',
    datatype: 'number',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'minOrderQuantity',
    span: 8,
    label: '最小订单量',
    datatype: 'number',
    ref: 'materialNumber',
    value: 0,
    width: '100px'
  },
  {
    prop: 'minPackingQuantity',
    span: 8,
    label: '最小包装量',
    disabled: 'disabled',
    ref: 'materialNumber',
    datatype: 'number'
  },
  {
    prop: 'temperatureCondition',
    span: 8,
    label: '温度条件',
    datatype: 'varchart',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'storageCondition',
    span: 8,
    label: '存储条件',
    disabled: 'disabled',
    datatype: 'varchart',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'purchaseOrganization',
    span: 8,
    label: '采购组织编码',
    datatype: 'readonly',
    disabled: 'disabled',
    ref: 'materialNumber'
  },
  {
    prop: 'purchaseOrganizationDesc',
    span: 8,
    label: '采购组织描述',
    datatype: 'popupName',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'purchaseGroup',
    span: 8,
    label: '采购组编码',
    datatype: 'readonly',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'purchaseGroupDesc',
    span: 8,
    label: '采购组描述',
    datatype: 'popupName',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'orderUnit',
    span: 8,
    label: '订单单位',
    bizDic: 'orderUnit',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'baseUnit',
    span: 8,
    label: '基本计量单位',
    datatype: 'bizDic',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'lackTolerance',
    span: 8,
    label: '不足容差率',
    placeholder: '如5%;则此处填5:',
    suffix: '%',
    datatype: 'number',
    disabled: 'disabled',
    ref: 'materialNumber'
  },
  {
    prop: 'overTolerance',
    span: 8,
    label: '超量容差率',
    suffix: '%',
    datatype: 'number',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  },
  {
    prop: 'texture',
    span: 8,
    label: '材质',
    datatype: 'varchart',
    disabled: 'disabled',
    ref: 'materialNumber'
  },
  {
    prop: 'isCheckQuality',
    span: 8,
    label: '是否质检',
    datatype: 'boolen',
    disabled: 'disabled',
    ref: 'materialNumber'
  },
  {
    prop: 'checkWay',
    span: 8,
    label: '检验方式',
    datatype: 'bizDic',
    disabled: 'disabled',
    ref: 'materialNumber',
    width: '100px'
  }
];

export default materialsColumn;
