<template>
  <div class="main-container">
    <el-row :gutter="5">
      <el-col
        v-for="(item, index) of dataList"
        :key="index"
        :xs="24"
        :sm="12"
        :md="6"
        class="item-wrapper"
      >
        <!-- 其他内容 -->
      </el-col>
    </el-row>
    <Calendar /> <!-- 引用 Calendar 组件 -->
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  watch,
} from "vue";
import { useLayoutStore } from "@/layouts/hooks";
import Calendar from "@/views/index/components/calendar.vue"; // 导入 Calendar 组件

export default defineComponent({
  name: "Home",
  components: {
    Calendar, // 注册 Calendar 组件
  },
  setup() {
    const layoutStore = useLayoutStore();
    const collapse = computed(() => {
      return layoutStore.state.isCollapse;
    });

    watch(collapse, (newVal: boolean) => {
      // 处理逻辑
    });

    return {
      collapse,
      dataList: [
        // 数据列表
      ],
    };
  },
});
</script>

<style lang="scss" scoped>

</style>