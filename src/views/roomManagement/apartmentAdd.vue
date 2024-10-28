<template>
  <div class="main-container flex flex-direction">
    <el-card :body-style="{ padding: '15px' }" shadow="hover">
      <el-link :underline="false">请填写房间基本信息</el-link>
    </el-card>
    <el-card :body-style="{ padding: '10px' }" shadow="nerve" class="margin-top-xs flex-sub">
      <div class="form-wrapper padding-top">
        <BaseForm ref="baseForm" :form-items="formItems" :config="formConfig">
          <template #extra>
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
import { reactive, ref } from "vue";
import { post, Response } from "@/api/http";
import { setApartmentInfo } from "@/api/url";


// 更新表单配置
const formConfig = {
  labelWidth: 100,
  size: "default",
  labelPosition: "right",
};

// 更新表单项
const formItems = reactive([
  {
    label: "房间名称：",
    type: "input",
    name: "room_name",
    value: "",
    maxLength: 50,
    inputType: "text",
    placeholder: "请输入房间名称",
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
  {
    label: "楼层：",
    type: "input",
    name: "floor",
    value: "",
    inputType: "number",
    placeholder: "请输入楼层",
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
    maxLength: 10,
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
    label: "房间类型：",
    type: "select",
    name: "room_type",
    value: "",
    placeholder: "请选择房间类型",
    selectOptions: [
      { label: "标准间", value: "standard" },
      { label: "豪华间", value: "luxury" },
      { label: "套房", value: "suite" },
    ],
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
  {
    label: "房间容量：",
    type: "input",
    name: "room_capacity",
    value: "",
    inputType: "number",
    placeholder: "请输入房间容量",
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
  {
    label: "房间价格：",
    type: "input",
    name: "room_price",
    value: "",
    inputType: "number",
    placeholder: "请输入房间价格",
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
  {
    label: "房间状态：",
    type: "select",
    name: "room_status",
    value: "",
    placeholder: "请选择房间状态",
    selectOptions: [
      { label: "空闲", value: "空闲" },
      { label: "使用中", value: "使用中" },
      { label: "维修中", value: "维修中" },
      { label: "报废", value: "报废" },
    ],
    validator: ({ value = "", placeholder = "" }) => {
      if (!value) {
        ElMessage.error(placeholder);
        return false;
      }
      return true;
    },
  },
]);


// Submit loading state
const submitLoading = ref(false);



// Base form reference
const baseForm = ref();

// Refresh page method
function refreshPage() {
  location.reload();
}

function submit() {
  if (baseForm.value?.checkParams()) {
    submitLoading.value = true;

    // 构建表单数据
    const formData = {
      room_name: formItems[0].value,
      floor: formItems[1].value,
      room_number: formItems[2].value,
      room_type: formItems[3].value,
      room_capacity: formItems[4].value,
      room_price: formItems[5].value,
      room_status: formItems[6].value,
    };

    post({
      url: setApartmentInfo,
      data: formData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response: Response) => {
        // 检查响应中的状态码或特定字段来判断是否成功
        if (response.code === 200 || response.code === 0 || response.code === 201) { // 假设200或code为0表示成功
          ElMessage.success("保存成功");
          refreshPage(); // 刷新页面
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