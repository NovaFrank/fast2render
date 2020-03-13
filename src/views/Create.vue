<template>
  <detail :is-edit="false" />
</template>

<script>
import Detail from '@/views/Detail';
export default {
  name: 'Create',
  components: { Detail }
};
</script>
