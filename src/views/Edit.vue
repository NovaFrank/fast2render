<template>
  <detail :is-edit="true" />
</template>

<script>
import Detail from '@/views/Detail';
export default {
  name: 'Edit',
  components: { Detail }
};
</script>
