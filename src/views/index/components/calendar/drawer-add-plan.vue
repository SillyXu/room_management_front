<template>
    <el-drawer
      v-model="showDrawer"
      :title="titleJSON[type]"
      direction="rtl"
      :before-close="handleClose"
      :size="744"
      destroy-on-close
      :close-on-click-modal="false"
      custom-class="page-drawer"
      @opened="handleOpened"
    >
      <div v-loading="drawerLoading">
        <el-form ref="formRef" :model="formData" :rules="formRules" label-position="top" class="form-height-auto">
          <el-row :gutter="5">
            <el-col :span="18">
              <el-form-item label="标题：" prop="title">
                <el-input
                  ref="inputRef"
                  v-model="formData.title"
                  v-trim
                  maxlength="100"
                  placeholder="请输入标题"
                  @change="handleModify"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" class="padding_form">
              <el-form-item prop="planCategoryId">
                <el-select
                  v-model="formData.planCategoryId"
                  placeholder="请选择计划类型"
                  style="width: 100%"
                  @change="handleModify"
                >
                  <el-option-group v-for="item in categorySelectList" :key="item.label" :label="item.label">
                    <el-option
                      v-for="val in item.group"
                      :key="val.id"
                      :label="val.name"
                      :value="val.id"
                      :disabled="val.status !== 1"
                    >
                      <span style="float: left">{{ val.name }}</span>
                      <span v-if="val.status !== 1" class="fr" style="color: red; font-size: 10px">已停用</span>
                    </el-option>
                  </el-option-group>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col v-if="formData.isAllDay === 1" :span="21">
              <el-form-item label="计划时间：">
                <el-date-picker
                  v-model="formData.dateArray"
                  type="daterange"
                  range-separator="至"
                  start-placeholder="开始时间"
                  end-placeholder="结束时间"
                  :shortcuts="shortcuts"
                  size="small"
                  style="width: 100%"
                  @change="handleChangeDate"
                />
              </el-form-item>
            </el-col>
            <!-- 不勾选全天的显示 -->
            <el-col v-else :span="21">
              <el-row :gutter="4">
                <el-col :span="6">
                  <el-form-item label="计划时间：" prop="startDate">
                    <el-date-picker
                      v-model="formData.startDate"
                      type="date"
                      placeholder="开始日期"
                      size="small"
                      style="width: 100%"
                      @change="
                        val => {
                          return handleFormat(val, 'startDate');
                        }
                      "
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="5" class="padding_form">
                  <el-form-item label="" prop="startDateMinute">
                    <el-time-select
                      v-model="formData.startDateMinute"
                      placeholder="开始"
                      start="00:00"
                      step="00:30"
                      end="23:30"
                      :max-time="formData.startDate === formData.endDate ? formData.endDateMinute : ''"
                      class="select-time"
                      style="width: 100%"
                      @change="handleModify"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="2" class="padding_form text-center">
                  <el-form-item> 至 </el-form-item>
                </el-col>
                <el-col :span="6" class="padding_form">
                  <el-form-item prop="endDate">
                    <el-date-picker
                      v-model="formData.endDate"
                      type="date"
                      placeholder="结束日期"
                      size="small"
                      style="width: 100%"
                      @change="
                        val => {
                          return handleFormat(val, 'endDate');
                        }
                      "
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="5" class="padding_form">
                  <el-form-item prop="endDateMinute">
                    <el-time-select
                      v-model="formData.endDateMinute"
                      placeholder="结束"
                      start="00:00"
                      step="00:30"
                      end="23:30"
                      :min-time="formData.startDate === formData.endDate ? formData.startDateMinute : ''"
                      class="select-time"
                      style="width: 100%"
                      @change="handleModify"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-col>
            <el-col :span="3" class="padding_form">
              <el-form-item prop="isAllDay">
                <el-checkbox
                  v-model="formData.isAllDay"
                  label="全天"
                  size="small"
                  :true-label="1"
                  :false-label="0"
                  style="margin-left: 20px"
                  @change="handleChangeCheckbox"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="负责人/协作者：" props="managerId">
                <el-select
                  v-model="formData.managerIds"
                  multiple
                  placeholder="请选择负责人/协作者"
                  style="width: 100%"
                  size="small"
                  @change="handleModify"
                >
                  <el-option v-for="item in userList" :key="item.id" :label="item.name" :value="item.id" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-upload
                class="upload-demo"
                :file-list="formData.attachmentVoList"
                :action="uploadAction"
                :headers="headerconfig"
                :on-remove="handleRemove"
                :on-success="uploadSuccess"
                :before-upload="beforeUpload"
                :on-preview="handleClickFile"
              >
                <div class="title-group">
                  <el-button size="small" type="primary" @keyup.prevent @keydown.enter.prevent>上传附件</el-button>
                  <span class="tip">支持扩展名: .doc .docx .pdf .jpg ...</span>
                </div>
              </el-upload>
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
        categorySelectList: [
          {
            label: '可选择',
            group: []
          },
          {
            label: '已停用',
            group: []
          }
        ],
        type: '',
        headerconfig: {},
        titleJSON: {
          add: '新增计划',
          edit: '编辑计划'
        },
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
        uploadAction: '/api-document/document/attachment/upload', // 上传附件的接口
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
        title: [{ required: true, message: '请输入使用标题', trigger: 'change' }],
        planCategoryId: [{ required: true, message: '请选择计划类型', trigger: 'change' }],
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
        startDateMinute: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
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
        endDateMinute: [{ required: true, message: '请选择结束时间', trigger: 'change' }]
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
            .catch(() => {});
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
        if (showDrawer.value) {
          state.categorySelectList[0].group = [];
          state.categorySelectList[1].group = [];
          props.categoryList.forEach(item => {
            if (item.status) {
              state.categorySelectList[0].group.push(item);
            } else {
              state.categorySelectList[1].group.push(item);
            }
          });
          state.isModified = false;
          state.type = props.drawerType;
          if (props.drawerType === 'add') {
            initDetail(props.detailData);
          } else {
            getDetail(props.detailData);
          }
        }
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
          planCategoryId: state.categorySelectList[0].group[0]?.id,
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
          managerIds: detailInfo.managerId.split(',')
        };
      };
      // 新增、编辑
      const onSubmit = () => {
        proxy.$refs['formRef'].validate(valid => {
          if (valid) {
            state.drawerLoading = true;
            const params = {
              ...state.formData,
              fileIdList: state.formData.attachmentVoList.map(item => {
                return item.id;
              }),
              managerId: state.formData.managerIds.toString()
            };
            delete params.managerIds;
            delete params.attachmentVoList;
            delete params.dateArray;
            savePlanDetail(params).then(res => {
              state.drawerLoading = false;
              if (res) {
                state.isModified = false;
                context.emit('closeDrawer', true);
                proxy.$message.success('保存成功');
              }
            });
          } else {
            return false;
          }
        });
      };
      const uploadSuccess = (res, file, fileList) => {
        if (res.code === 200) {
          state.formData.attachmentVoList.push({ name: file.name, id: res.data[0] });
        } else {
          proxy.$message.error(res.message);
        }
      };
      const beforeUpload = file => {
        const fileSize = file.size / 1024 / 1024 < 20;
        if (!fileSize) {
          proxy.$message.error('上传附件大小不能超过20M');
          return false;
        } else if (file.size === 0) {
          proxy.$message.error('上传附件大小不能为空');
          return false;
        } else {
          return true;
        }
      };
      const handleRemove = (file, fileList) => {
        const fileId = file.id || file?.response?.data[0];
        if (fileId) {
          state.drawerLoading = true;
          deleteFile(fileId).then(res => {
            state.drawerLoading = false;
            if (res) {
              state.formData.attachmentVoList = state.formData.attachmentVoList.filter(item => {
                return item.id !== fileId;
              });
              proxy.$message.success('附件删除成功！');
              return true;
            } else {
              return false;
            }
          });
        }
      };
      const getContent = value => {
        state.formData.description = value;
      };
      // 切换全天和半天
      const handleChangeCheckbox = val => {
        if (val) {
          if (state.formData.startDate) {
            state.formData.dateArray = [state.formData.startDate, state.formData.endDate];
          } else {
            state.formData.dateArray = [];
          }
          state.formData.startDateMinute = '';
          state.formData.endDateMinute = '';
        } else {
          state.formData.dateArray = [];
        }
        handleModify();
      };
      // 格式化日期
      const handleFormat = (val, fieldName) => {
        if (val) {
          state.formData[fieldName] = formatDate(val);
        }
        handleModify();
      };
      // 点击附件
      const handleClickFile = file => {
        // console.log(file)
      };
      return {
        ...toRefs(state),
        getDetail,
        formRules,
        handleOpened,
        handleClickFile,
        handleFormat,
        handleChangeCheckbox,
        handleRemove,
        beforeUpload,
        uploadSuccess,
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
  
  