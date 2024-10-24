<template>
    <el-dialog
      v-model="dialogVisiable"
      title="查看计划"
      :modal="false"
      :close-on-click-modal="true"
      :width="500"
      custom-class="calendar_plan_dialog"
      @close="handleClose"
    >
      <div v-if="dialogVisiable" v-loading="dialogLoading">
        <div :class="`fc-event dialog_header ${categoryJson[formData.planCategoryId]?.color}`">
          <div class="dialog_title">
            {{ formData.title || '--' }}
            <div class="dialog_icon">
              <i v-if="isCanEdit" class="el-icon-edit" @click="handleEdit()" />
              <i class="el-icon-delete" @click="handleDelete()" />
            </div>
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
              <el-form-item prop="managerId" label="负责人/协作者：">
                <span>{{ formData.managerId}}</span>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="planCategoryName" label="类型：">
                <span>{{ formData.planCategoryName }}</span>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item prop="title" label="计划时间：">
                <span
                  >{{ formData.startDate }} {{ formData.startDateMinute }} ~ {{ formData.endDate }}
                  {{ formData.endDateMinute }}</span
                >
              </el-form-item>
            </el-col>
            <el-divider />
            <el-col :span="24">
              <div class="form_item_header">
                <div class="label">描述：</div>
                <span v-if="formData.description" class="font-sm" @click="isShowAll = !isShowAll">{{
                  isShowAll ? '收起详情' : '展开详情'
                }}</span>
              </div>
              <div
                :class="`form_item_content ${isShowAll ? 'packDown' : 'packUp'} ${formData.description ? '' : 'empty'} ${
                  formData.attachmentVoList.length ? 'margin_Bot' : ''
                }`"
                v-html="formData.description ? formData.description : '暂无描述'"
              />
              <div v-for="item in formData.attachmentVoList" :key="item.fileId" class="fileItem" @click="downLoad(item)">
                {{ item.fileName }}
              </div>
            </el-col>
            <el-divider />
            <el-col :span="24">
              <div class="form-item_flex">
                <el-form-item prop="createTime" label="创建时间：" label-width="70px">
                  <span>{{ formatDate(formData.createTime) }}</span>
                </el-form-item>
                <el-form-item prop="createBy" label="创建人：" label-width="60px">
                  {{ formData.createBy }}
                </el-form-item>
              </div>
            </el-col>
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
      categoryJson: {
        type: Object,
        default: () => {}
      }
    },
    emits: ['closeDialog'],
    setup(props, context) {
      const { proxy } = getCurrentInstance();
      const state = reactive({
        formData: {
          attachmentVoList: []
        },
        formRef: ref(),
        dialogTitle: '新增日程',
        isShowAll: false,
        type: '',
        isAllDay: false, // 是否是全天
        colorJSON: {
          绿色: 'green',
          红色: 'red',
          橙色: 'orange',
          黄色: 'yellow',
          青色: 'cyan',
          蓝色: 'blue',
          紫色: 'purple',
          品红色: 'magenta'
        },
        categoryJson: {},
        nameList: [],
        dialogLoading: false,
        ruleInfo: {},
        isCanEdit: false, // 是否可以编辑
        differences: 0, // 开始时间结束时间相差天数
        isEdit: false,
        dialogVisiable: false,
        ruleForm: ref(),
        inputRef: ref(),
        loading: false
      });
      watch(props, newValue => {
        state.dialogVisiable = newValue.dialogShow;
        if (state.dialogVisiable) {
          state.categoryJson = props.categoryJson;
          state.isCanEdit = Object.values(state.categoryJson).some(item => {
            return item.status === 1;
          });
          state.formData = props.detailInfo;
        }
      });
      // 下载附件
      const downLoad = fileItem => {
        window.open(fileItem.fileUrl);
      };
      // 删除计划
      const handleDelete = () => {
        proxy
          .$confirm('是否确认删除', '删除确认', {
            confirmButtonText: '确认删除',
            cancelButtonText: '取消',
            showCancelButton: true,
            closeOnClickModal: false,
            type: 'warning'
          })
          .then(() => {
            state.dialogLoading = true;
            deletePlanDetail(state.formData.id).then(function (res) {
              state.dialogLoading = false;
              if (res) {
                proxy.$message.success('删除成功！');
                state.dialogVisiable = false;
                context.emit('closeDialog', { isRefresh: true });
              }
            });
          })
          .catch(() => {});
      };
      // 编辑计划
      const handleEdit = () => {
        state.dialogVisiable = false;
        context.emit('closeDialog', { isRefresh: false, isEdit: true, info: state.formData });
      };
      // 关闭弹出窗
      const handleClose = () => {
        context.emit('closeDialog');
      };
      return {
        ...toRefs(state),
        downLoad,
        handleDelete,
        handleEdit,
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
  
  