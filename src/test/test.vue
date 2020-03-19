<template>
  <div>
    <el-button type="primary" @click="test">测试</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    async test() {
      let aa = 1;
      let data = await this.other(aa);
      console.log(data);
    },
    other(aa) {
      return new Promise((resolve, reject) => {
        for (let i of [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 11, 1, 1, 1, 1]) {
        }
        resolve(2);
      });
    }
  }
};
</script>

<style scoped></style>
