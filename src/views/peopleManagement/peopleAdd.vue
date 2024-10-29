<template>
  <div class="main-container flex flex-direction">
    <el-card :body-style="{ padding: '15px' }" shadow="hover">
      <el-link :underline="false">请填写入住基本信息</el-link>
    </el-card>
    <el-card :body-style="{ padding: '10px' }" shadow="nerve" class="margin-top-xs flex-sub">
      <div class="form-wrapper padding-top">
        <BaseForm ref="baseForm" :form-items="formItems" :config="formConfig">
          <template #extra>
            <el-form-item label="入住原因：" class="form-item">
              <el-select v-model="reason.value" placeholder="请选择入住原因" style="width: 100%">
                <el-option v-for="item in reason.options" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <div class="text-center">
                <el-button type="primary" size="small" :loading="submitLoading" @click="submit">提交</el-button>
              </div>
            </el-form-item>
          </template>
        </BaseForm>
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
import { ElMessage } from "element-plus";
import { reactive, ref, onMounted ,shallowReactive } from "vue";
import { formatDate } from '@/utils/formatTime';
import { post, Response } from "@/api/http";
import { addCheckinInfo } from "@/api/url";

// Form configuration
const formConfig = {
  labelWidth: 100,
  size: "default",
  labelPosition: "right",
};

// Form items
const formItems = reactive([
  {
    label: "入住姓名：",
    type: "input",
    name: "occupant_name",
    value: "",
    maxLength: 100,
    inputType: "text",
    placeholder: "请输入入住人姓名",
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
  {
    label: "员工工号：",
    type: "input",
    name: "employee_id",
    value: "",
    maxLength: 100,
    inputType: "text",
    placeholder: "请输入员工ID",
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
  {
    label: "房间号：",
    type: "input",
    name: "room_number",
    value: "",
    maxLength: 100,
    inputType: "text",
    placeholder: "请输入房间号",
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
  {
    label: "入住日期：",
    type: "date",
    name: "checkin_date",
    placeholder: "请选择入住日期",
    value: "",
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
  {
    label: "退房日期：",
    type: "date",
    name: "checkout_date",
    placeholder: "请选择预计退房日期",
    value: "",
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
]);

// Reason select options
const reason = shallowReactive({
  value: "",
  options: [
    {
      label: "因公",
      value: "因公",
    },
    {
      label: "因私",
      value: "因私",
    },
  ],
});

// Remark
const remark = ref("");

// Submit loading state
const submitLoading = ref(false);

// Base form reference
const baseForm = ref();

// Refresh page method
function refreshPage() {
  location.reload();
}

// Submit method
function submit() {
  if (baseForm.value?.checkParams()) {
    if (!reason.value) {
      ElMessage.error("请选择入住原因");
      return false;
    }
    submitLoading.value = true;
    const formData = {
      occupant_name: formItems[0].value,
      employee_id: formItems[1].value,
      room_number: formItems[2].value,
      checkin_date: formatDate(formItems[3].value),
      checkout_date: formatDate(formItems[4].value),
      reason: reason.value,
    };
    console.log(formData);

    post({
      url: addCheckinInfo,
      data: formData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response: Response) => {
        // 检查响应中的状态码或特定字段来判断是否成功
        if (response.code === 200 || response.code === 0) { // 假设200或code为0表示成功
          ElMessage.success("保存成功");
          setTimeout(refreshPage, 1000);
        } else {
          ElMessage.error("保存失败，请检查输入信息");
        }
        submitLoading.value = false;
      })
      .catch(error => {
        ElMessage.error("保存失败，请检查网络或稍后再试");
        console.error("Error:", error);
        submitLoading.value = false;
      });
  }
}
</script>

<style lang="scss" scoped>
.form-item {
  width: 100%;
  margin-bottom: 10px;
  display: flex;
  align-items: center;

  .el-form-item__label {
    width: 100px;
    /* 统一标签宽度 */
  }

  .el-input,
  .el-date-editor {
    width: calc(100% - 100px);
    /* 减去标签宽度 */
  }
}

@media screen and (max-width: 768px) {
  .form-wrapper {
    width: 100%;
    margin: 0 auto;
  }
}

@media screen and (min-width: 768px) {
  .form-wrapper {
    width: 60%;
    margin: 0 auto;
  }
}
</style>