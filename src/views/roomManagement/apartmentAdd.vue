<template>
  <div class="main-container flex flex-direction">
    <el-card :body-style="{ padding: '15px' }" shadow="hover">
      <el-link :underline="false">请填写房间基本信息</el-link>
    </el-card>
    <el-card :body-style="{ padding: '10px' }" shadow="nerve" class="margin-top-xs flex-sub">
      <div class="form-wrapper padding-top">
        <BaseForm ref="baseForm" :form-items="formItems" :config="formConfig">
          <template #extra>
            <el-form-item label="房间图片：" class="form-item">
              <el-upload action="/uploadRoomImage" list-type="picture-card" :on-preview="handlePictureCardPreview"
                :on-remove="handleRemove" :auto-upload="false" :before-upload="beforeUpload" :on-success="handleSuccess"
                :on-error="handleError">
                <i class="el-icon-plus"></i>
              </el-upload>
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
import { reactive, ref, shallowReactive } from "vue";
import { post } from "@/api/http";
import { setApartmentInfo, uploadRoomImage } from "@/api/url";

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

// 定义一个文件类型的接口
interface File extends Blob {
  name: string;
  type: string;
  size: number;
}

// 处理预览事件
function handlePictureCardPreview(file: File) {
  console.log(file);
}

// 处理移除文件事件
function handleRemove(file: File, fileList: any[]) {
  console.log(file, fileList);
}

// 上传前验证
function beforeUpload(file: File): boolean {
  const isJPG = file.type === 'image/jpeg';
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPG) {
    ElMessage.error('上传图片只能是 JPG 格式!');
  }
  if (!isLt2M) {
    ElMessage.error('上传图片大小不能超过 2MB!');
  }
  return isJPG && isLt2M;
}

// 成功回调
function handleSuccess(response: any, file: File) {
  console.log(response);
  ElMessage.success('上传成功');
}

// 错误回调
function handleError(error: any, file: File) {
  console.error(error);
  ElMessage.error('上传失败');
}

// 提交按钮点击事件
function submit() {
  if (baseForm.value?.checkParams()) {
    if (!file) {
      ElMessage.error("请上传至少一张房间图片");
      return;
    }

    submitLoading.value = true;
    // 上传文件
    uploadFiles().then(() => {
      // 保存房间信息
      saveRoomInfo().then(() => {
        ElMessage.success("保存成功");
        submitLoading.value = false;
      }).catch((error) => {
        ElMessage.error("保存失败：" + error.message);
        submitLoading.value = false;
      });
    }).catch((error) => {
      ElMessage.error("上传失败：" + error.message);
      submitLoading.value = false;
    });
  }
}

// 上传文件的方法
async function uploadFiles() {
  const formData = new FormData();
  if (file) {  // 检查file是否为有效的File对象
    formData.append('image', file as File, file.name);  // 这里file.name用于指定文件名
  }
  else {
    ElMessage.error("请上传至少一张房间图片");
    throw new Error("请上传至少一张房间图片");
  }

  try {
    const response = await post({
      url: uploadRoomImage,
      data: formData
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error('Failed to upload files:', error);
    throw error;
  }
}

// 保存房间信息的方法
async function saveRoomInfo() {
  try {
    const response = await post({
      url: '/addRoomInfo',
      data: baseForm.value?.getFormData()
    });
    console.log(response);
    return response;
  } catch (error) {
    console.error('Failed to save room info:', error);
    throw error;
  }
}

const submitLoading = ref(false);
const baseForm = ref();
let file: File | null = null;
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