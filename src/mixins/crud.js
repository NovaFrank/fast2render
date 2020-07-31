export default (app, option = {}) => {
  const mixins = {
    data() {
      return {
        userInfo: {},
        data: [],
        form: {},
        queryCondition: {
          elsAccount: '307000'
        },
        searchCondition: {},
        api: require(`@/api/${option.name}`),
        loading: false,
        page: {},
        title: '',
        currentRow: null,
        rowBtns: [
          {
            label: '编辑选中',
            icon: 'el-icon-edit',
            type: 'rowAction',
            action: 'rowEdit'
          },
          {
            label: '删除选中',
            icon: 'el-icon-remove',
            type: 'rowAction',
            action: 'topRowDel'
          },
          {
            label: '提交审批',
            icon: 'el-icon-remove',
            type: 'rowAction',
            action: 'topRowDel'
          }
        ]
      };
    },
    computed: {
      option() {
        console.log('option.name', option);
        return require(`@/config/${option.configName}`).default(this);
      },
      bindVal() {
        return {
          ref: 'crud',
          option: this.option,
          data: this.data,
          tableLoading: this.loading
        };
      },
      onEvent() {
        return {
          'on-load': this.getList,
          'row-save': this.rowSave,
          'row-update': this.rowUpdate,
          'row-del': this.rowDel,
          'refresh-change': this.refreshChange,
          'search-reset': this.searchChange,
          'search-change': this.searchChange
        };
      },
      rowKey() {
        return option.rowKey || 'uuid';
      }
    },
    methods: {
      getList() {
        const callback = () => {
          this.loading = true;

          const params = {};
          params[option.pageNumber || 'pageNumber'] = this.page.currentPage;
          params[option.pageSize || 'pageSize'] = this.page.pageSize;

          Object.assign(params, this.queryCondition);
          Object.assign(params, this.searchCondition);

          this.data = [];

          const moduleApi = this.api[option.serverName] || {};
          const listApiFn = moduleApi.list || this.api[option.list || 'list'];

          listApiFn(params, option.serverName)
            .then((res) => {
              this.loading = false;

              if (res.data && res.data.statusCode === '200' && res.data.message === 'response OK') {
                let data;

                if (option.res) {
                  data = option.res(res.data.pageData);
                } else {
                  data = res.data.pageData.rows;
                }

                this.page.total = data[option.total || 'total'];
                const result = data[option.data || 'data'];
                this.data = result;

                if (this.listAfter) {
                  this.listAfter(data);
                } else {
                  this.$message.success('获取成功');
                }
              } else {
                console.log(`${option.serverName}: list fail`, res.data || res.statusText);
                this.$message.error('查找数据失败, ' + res.data.message || res.statusText || '');
              }
            })
            .catch((err) => {
              console.log(`${option.serverName}: list error`, err);
              this.$message.error('查找数据失败, ' + err.message || '');
            });
        };

        if (this.listBefore) {
          this.listBefore();
        }
        callback();
      },

      rowSave(row, done, loading) {
        const callback = () => {
          delete this.form.params;
          this.api[option.add || 'add'](this.form)
            .then((data) => {
              this.getList();
              if (this.addAfter) {
                this.addAfter(data);
              } else {
                this.$message.success('新增成功');
              }
              done();
            })
            .catch(() => {
              loading();
            });
        };
        if (this.addBefore) {
          this.addBefore();
        }
        callback();
      },

      rowUpdate(row, index, done, loading) {
        const callback = () => {
          delete this.form.params;
          this.api[option.update || 'update'](row[this.rowKey], this.form, index)
            .then((data) => {
              this.getList();
              if (this.updateAfter) {
                this.updateAfter(data);
              } else {
                this.$message.success('更新成功');
              }
              done();
            })
            .catch(() => {
              loading();
            });
        };
        if (this.updateBefore) {
          this.updateBefore();
        }
        callback();
      },

      selectRowChange(currentRow) {
        console.log('行选中切换');
        this.currentRow = currentRow;
        this.$forceUpdate();
      },

      topRowDel() {
        const callback = () => {
          if (!this.currentRow) {
            console.log('无选中行，返回');
            return false;
          }

          const row = this.currentRow;
          const index = row.$index;

          this.api[option.del || 'del']({ uuid: row.rowKey }).then((data) => {
            this.getList();
            if (this.delAfter) {
              this.delAfter(data, row, index);
            } else {
              this.$message.success('删除成功');
            }
          });
        };

        if (this.delBefore) {
          this.delBefore();
          callback();
        } else {
          this.$confirm(`此操作将永久删除选中的数据, 是否继续？`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            callback();
          });
        }
      },

      rowDel(row, index) {
        const callback = () => {
          this.api[option.del || 'del'](row[this.rowKey], row).then((data) => {
            this.getList();
            if (this.delAfter) {
              this.delAfter(data, row, index);
            } else {
              this.$message.success('删除成功');
            }
          });
        };
        if (this.delBefore) {
          this.delBefore();
          callback();
        } else {
          this.$confirm(`此操作将永久删除序号【${index}】的数据, 是否继续?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }).then(() => {
            callback();
          });
        }
      },

      searchChange(params, done) {
        if (done) {
          done();
        }

        this.searchCondition = params;
        this.page.currentPage = 1;

        this.getList();
      },
      refreshChange() {
        this.getList();
      }
    }
  };
  app.mixins = app.mixins || [];
  app.mixins.push(mixins);
  return app;
};
