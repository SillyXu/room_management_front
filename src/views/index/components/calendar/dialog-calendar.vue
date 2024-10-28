<template>
  <el-dialog
    v-model="dialogVisiable"
    title="查看预定信息"
    :modal="false"
    :close-on-click-modal="true"
    :width="500"
    custom-class="calendar_plan_dialog"
    @close="handleClose"
  >
    <div v-if="dialogVisiable" v-loading="dialogLoading">
      <div :class="`fc-event dialog_header ${formData.reason === '因私' ? 'orange' : formData.reason === '因公' ? 'green' : ''}`">
        <div class="dialog_title">
          {{ '房间号: ' + formData.room_number || '--' }}
        </div>
      </div>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="ruleInfo"
        label-position="left"
        size="small"
        label-width="110px"
        class="my-form"
      >
        <el-row>
          <el-col :span="24">
            <el-form-item prop="occupant_name" label="入住人：">
              <span>{{ formData.occupant_name}}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="reason" label="出差类型：">
              <span>{{ formData.reason }}</span>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item prop="title" label="时间：">
              <span
                >{{ formData.startDate }}  ~ {{ formData.endDate }}</span
              >
            </el-form-item>
          </el-col>
          <el-divider />
        </el-row>
      </el-form>
    </div>
  </el-dialog>
</template>
<script>
import { reactive, ref, toRefs, watch, getCurrentInstance } from 'vue';
import { formatDate } from '@/utils/formatTime';
export default {
  name: 'DialogCalendar',
  components: {},
  props: {
    dialogShow: {
      type: Boolean,
      default: false
    },
    detailInfo: {
      type: Object,
      default: () => {}
    },
  },
  emits: ['closeDialog'],
  setup(props, context) {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      formData: {
        employee_id: '',
        endDate: '',
        occupant_name: '',
        reason: '',
        room_number: '',
        startDate: ''
      },
      formRef: ref(),
      type: '',
      dialogLoading: false,
      ruleInfo: {},
      isEdit: false,
      dialogVisiable: false,
      loading: false
    });
    watch(props, newValue => {
      state.dialogVisiable = newValue.dialogShow;
    if (state.dialogVisiable) {
      state.formData = props.detailInfo;
    }
    });

    // 关闭弹出窗
    const handleClose = () => {
      context.emit('closeDialog');
    };
    return {
      ...toRefs(state),
      handleClose,
      formatDate
     };
  }
};
</script>
<style lang="scss" scoped>
.fileItem {
  display: inline-block;
  cursor: pointer;
}
.fc-event {
  background: #fff;
  line-height: 22px;
  font-size: 18px;
  box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  margin: 0 0 20px 0;
}
.form_item_content.packUp {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3; /* Standard property for compatibility */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
.form_item_content.packDown {
  max-height: 15vh;
  overflow-y: auto;
}
.form_item_content.margin_Bot {
  margin-bottom: 16px;
}

.form_item_content.empty {
  text-align: center;
  color: #333;
}

.dialog_title {
  display: flex;
  justify-content: space-between;
  padding: 12px 12px 12px 18px;
  color: #606266;
  align-items: center;
}
.dialog_icon {
  display: flex;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  color: #fff;
  i {
    width: 24px;
    height: 24px;
    font-size: 14px;
    padding: 5px;
    border-radius: 3px;
    &:hover {
      background: #909399;
    }
  }
}
.form_item_header {
  line-height: 32px;
  color: #909399;
  .label {
    display: inline-block;
  }
  span {
    float: right;
    cursor: pointer;
    user-select: none;
    &:hover {
      color: #606266;
    }
  }
}
.form-item_flex {
  display: flex;
  align-items: center;
  gap: 20px;
}

.el-form .el-form-item {
  margin: 0;
}
.el-divider--horizontal {
  margin: 14px 0;
}
.el-dialog .el-dialog__body .el-form-item__label {
  color: #909399;
}
</style>
<style lang="scss">
@import 'fullcalendar.scss';
.calendar_plan_dialog {
  border-radius: 10px;
  border: 1px solid #dcdfe6;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.15);
  .el-dialog__header {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    background: #f0f2f5;
  }
  .el-dialog__body {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    background: linear-gradient(180deg, #f0f2f5 34px, #fff 35px);
    padding: 10px 20px 20px 20px !important;
    .el-form-item__label {
      color: #909399;
    }
  }
  .form_item_content {
    line-height: 20px;
    p,
    ul,
    li {
      margin: 0;
      padding: 0;
    }
  }
}
</style>

