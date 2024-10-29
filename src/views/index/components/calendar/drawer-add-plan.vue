<template>
  <el-drawer v-model="showDrawer" :title="titleJSON" direction="rtl" :before-close="handleClose" :size="744"
    destroy-on-close :close-on-click-modal="false" custom-class="page-drawer" @opened="handleOpened">
    <div v-loading="drawerLoading">
      <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="form-height-auto">
        <el-row :gutter="5">
          <el-col :span="18">
            <el-form-item label="房号：" prop="room_number">
              <el-input ref="inputRef" v-model="formData.room_number" v-trim maxlength="100" placeholder="请输入房号"
                @change="handleModify" />
            </el-form-item>
          </el-col>
          <el-col :span="6" class="padding_form">
            <el-form-item prop="reason">
              <el-select v-model="formData.reason" placeholder="请选择出差类型" style="width: 100%" @change="handleModify">
                <el-option v-for="option in ['因公', '因私']" :key="option" :label="option" :value="option" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="18">
            <el-form-item label="时间：" prop="dateArray">
              <el-date-picker v-model="formData.dateArray" type="daterange" range-separator="至" start-placeholder="开始时间"
                end-placeholder="结束时间" :shortcuts="shortcuts" size="small" style="width: 100%"
                @change="handleChangeDate" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="入住人：" prop="occupant_name">
              <el-input v-model="formData.occupant_name" multiple placeholder="请输入入住人" style="width: 100%" size="small"
                @change="handleModify" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="工号：" prop="employee_id">
              <el-input v-model="formData.employee_id" multiple placeholder="请输入工号" style="width: 100%" size="small"
                @change="handleModify" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="drawer-footer">
        <el-button type="primary" :loading="drawerLoading" @click="onSubmit">保存</el-button>
        <el-button :loading="drawerLoading" @click="handleClose">取消</el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import { ref, watch, reactive, getCurrentInstance, toRefs } from 'vue';
import { formatDate } from '@/utils/formatTime';
import { post, Response } from "@/api/http";
import { addCheckinInfo } from "@/api/url";

export default {
  name: 'DrawerUnit',
  components: {},
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    drawerType: {
      type: String,
      required: true
    },
    detailData: {
      type: Object,
      default: function () {
        return {};
      }
    },
    categoryList: {
      type: Array,
      default: function () {
        return [];
      }
    }
  },
  emits: ['closeDrawer'],
  setup(props, context) {
    const { proxy } = getCurrentInstance();
    // 抽屉事件
    const showDrawer = ref(props.drawer);
    const state = reactive({
      isModified: false,
      drawerLoading: false,
      inputRef: ref(),
      type: '',
      headerconfig: {},
      titleJSON: '新增入住信息',
      userList: [],
      options: {
        1: '年',
        2: '月'
      },
      shortcuts: [
        {
          text: '近三天',
          value: (() => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 3);
            return [start, end];
          })()
        },
        {
          text: '最近一周',
          value: (() => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            return [start, end];
          })()
        },
        {
          text: '最近一个月',
          value: (() => {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            return [start, end];
          })()
        }
      ],
      detailData: {}, // 详情数据
      formRef: ref(),
      formData: {
        dateArray: []
      },
      categoryProps: {
        expandTrigger: 'hover',
        checkStrictly: true,
        children: 'children',
        label: 'name',
        value: 'id'
      }
    });
    // 开始日期不能大于结束日期
    function durationDate(rule, value, callback) {
      let ruleValue = rule.value;
      if (typeof ruleValue === 'function') {
        ruleValue = rule.value();
      } else if (typeof ruleValue === 'object') {
        ruleValue = rule.value;
      }
      if (ruleValue.startDate && ruleValue.endDate) {
        if (new Date(ruleValue.endDate).getTime() < new Date(ruleValue.startDate).getTime()) {
          callback(new Error(rule.message));
        } else {
          callback();
        }
      } else {
        callback();
      }
    }
    const formRules = {
      room_number: [{ required: true, message: '请输入使用房号', trigger: 'change' }],
      reason: [{ required: true, message: '请选择出差类型', trigger: 'change' }],
      startDate: [
        { required: true, message: '请选择开始日期', trigger: 'change' },
        {
          validator: durationDate,
          value: () => ({
            startDate: state.formData.startDate,
            endDate: state.formData.endDate
          }),
          message: '不能大于结束时间',
          trigger: 'change'
        }
      ],
      endDate: [
        { required: true, message: '请选择结束日期', trigger: 'change' },
        {
          validator: durationDate,
          value: () => ({
            startDate: formatDate(state.formData.startDate),
            endDate: formatDate(state.formData.endDate)
          }),
          message: '不能小于开始日期',
          trigger: 'change'
        }
      ],
    };
    // 关闭抽屉
    const handleClose = () => {
      if (state.isModified) {
        proxy
          .$confirm('确认离开当前页面吗？离开后数据不可恢复', {
            confirmButtonText: '确认',
            cancelButtonText: '取消',
            type: 'warning',
            showClose: false,
            closeOnClickModal: false,
            closeOnPressEscape: false
          })
          .then(() => {
            showDrawer.value = false;
            state.isModified = false;
            context.emit('closeDrawer', false);
          })
          .catch(() => { });
      } else {
        showDrawer.value = false;
        context.emit('closeDrawer', false);
      }
    };
    // 格式化日期
    const handleChangeDate = val => {
      if (val?.length) {
        state.formData.startDate = formatDate(val[0]);
        state.formData.endDate = formatDate(val[1]);
      } else {
        state.formData.startDate = '';
        state.formData.endDate = '';
      }
    };
    watch(props, newValue => {
      showDrawer.value = newValue.drawer;
      initDetail(props.detailData);
    });
    const handleOpened = () => {
      if (state.inputRef) {
        state.inputRef.focus();
      }
    };
    const handleModify = () => {
      state.isModified = true;
    };
    const initDetail = newData => {
      state.formData = {
        ...newData,
        dateArray: [newData.startDate, newData.endDate],
        reason: newData.reason || '因公',
        attachmentVoList: []
      };
    };
    const getDetail = newData => {
      const detailInfo = JSON.parse(JSON.stringify(newData));
      detailInfo.attachmentVoList.forEach(item => {
        item.name = item.fileName;
        item.id = item.fileId;
      });
      detailInfo.fileIdList = detailInfo.attachmentVoList.filter(item => {
        return item.fileId;
      });
      state.formData = {
        ...detailInfo,
        dateArray: [detailInfo.startDate, detailInfo.endDate],
        managerIds: detailInfo.occupant_name.split(',')
      };
    };
    // 新增、编辑
    const onSubmit = () => {
      state.drawerLoading = true;
      const params = {
        room_number: state.formData.room_number,
        reason: state.formData.reason,
        checkin_date: state.formData.startDate,
        checkout_date: state.formData.endDate,
        occupant_name: state.formData.occupant_name,
        employee_id: state.formData.employee_id,
      };

      savePlanDetail(params).then(res => {
        state.drawerLoading = false;
        if (res) {
          state.isModified = false;
          context.emit('closeDrawer', true);
          proxy.$message.success('保存成功');
        }
      });
    };
    const savePlanDetail = (formData) => {
      return post({
        url: addCheckinInfo,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => {
          if (response.code === 200 || response.code === 0) {
            proxy.$message.success("保存成功");
            return true
            // Optionally refresh the page or perform another action
          } else {
            proxy.$message.error("保存失败，请检查输入信息");
            return false
          }
        })
        .catch(error => {
          proxy.$message.error("保存失败，请检查网络或稍后再试");
          console.error("Error:", error);
          return false
        });
    };
    const getContent = value => {
      state.formData.description = value;
    };
    // 格式化日期
    const handleFormat = (val, fieldName) => {
      if (val) {
        state.formData[fieldName] = formatDate(val);
      }
      handleModify();
    };
    return {
      ...toRefs(state),
      getDetail,
      formRules,
      handleOpened,
      handleFormat,
      getContent,
      handleModify,
      handleChangeDate,
      onSubmit,
      handleClose,
      formatDate,
      showDrawer
    };
  }
};
</script>

<style lang="scss" scoped>
:deep(.el-input--medium) {
  line-height: 1;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 10px;

  .tip {
    line-height: 20px;
    font-size: 12px;
    color: #333;
  }
}

.padding_form {
  padding: 32px 0 0 0;
}

.select-time {
  :deep(.el-icon-time) {
    line-height: 31px;
  }
}

:deep(.el-form .el-form-item .el-form-item__label) {
  color: #333;
}

.drawer-footer {
  width: calc(100% - 80px);
  background: #fff;
}

.some-class {
  color: #333;
}
</style>