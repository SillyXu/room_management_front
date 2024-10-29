<template>
  <div class="main-container">
    <TableBody>
      <template #tableConfig>
        <TableConfig v-model:border="tableConfig.border" v-model:stripe="tableConfig.stripe" @refresh="doRefresh">
        </TableConfig>
      </template>
      <template #default>
        <el-table v-loading="tableLoading" :data="dataList" :header-cell-style="tableConfig.headerCellStyle"
          :size="tableConfig.size" :stripe="tableConfig.stripe" :border="tableConfig.border" row-key="id"
          :tree-props="{ children: 'children' }">
          <el-table-column align="center" label="序号" fixed="left" width="80">
            <template v-slot="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column v-for="item of tableColumns" :key="item.prop" :label="item.label" :prop="item.prop"
            align="center">
            <template v-if="item.prop === 'actions'" #default="scope">
              <el-button plain type="primary" size="small" @click="onUpdateItem(scope.row)">编辑</el-button>
              <el-button plain type="danger" size="small" @click="onCheckoutItem(scope.row)">退房</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </TableBody>
    <Dialog ref="dialog" :title="dialogTitle">
      <template #content>
        <BaseForm class="padding-left padding-right" ref="baseForm" :form-items="formItems">
        </BaseForm>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { get, post, Response } from "@/api/http";
import { getCheckinInfo, checkoutCheckin, updateCheckinInfo } from "@/api/url";
import { formatDate } from '@/utils/formatTime';
import type { BaseFormType, DialogType } from "@/components/types";
import { computed, h, onMounted, reactive, ref } from "vue";
import { ElInput, ElMessage, ElMessageBox } from "element-plus";
import _ from "lodash";
import { useDataTable } from "@/hooks";
import { FormRenderItem } from "@/components/common/FormRender";
const DP_CODE_FLAG = "dp_code_";

// 定义入住信息的类型
interface CheckinInfo {
  checkin_id: number;
  occupant_name: string;
  employee_id: string;
  room_number: string;
  checkin_date: string;
  checkout_date: string;
}

const tableColumns = reactive([
  {
    label: "人员名",
    prop: "occupant_name",
  },
  {
    label: "一体化账号",
    prop: "employee_id",
  },
  {
    label: "房间号",
    prop: "room_number",
  },
  {
    label: "入住时间",
    prop: "checkin_date",
  },
  {
    label: "离店时间",
    prop: "checkout_date",
  },
  {
    label: "出差原因",
    prop: "reason",
  },
  {
    label: "操作",
    prop: "actions",
  },
]);

// 在setup函数中添加或修改fetchApartmentInfo方法
const fetchApartmentInfo = async () => {
  try {
    const response = await get<[]>({
      url: getCheckinInfo,
      data: { is_historical:0 } 
    });
    dataList.value = response.data;
  } catch (error) {
    console.error('Failed to fetch apartment info:', error);
  }
};
const dialog = ref<DialogType>();
const baseForm = ref();
const dialogTitle = ref("添加房间");
const { tableConfig, tableLoading, dataList, handleSuccess } =
  useDataTable<ApartmentModelType>();
const depCodeFormItem: FormRenderItem = {
  label: "房间号",
  type: "input",
  name: "roomCode",
  value: "",
  maxLength: 10,
  disabled: false,
  inputType: "text",
  placeholder: "请输入房间号",
  validator: (item: any) => {
    if (!item.value) {
      ElMessage.error(item.placeholder);
      return false;
    }
    return true;
  },
  reset() {
    this.value = "";
    this.disabled = false;
  },
  render: (formItem) => {
    return h(
      ElInput,
      {
        modelValue: formItem.value,
        "onUpdate:modelValue": (newVal) => {
          formItem.value = newVal;
        },
        placeholder: formItem.placeholder,
      },
      {
        prepend: () => {
          return h("span", DP_CODE_FLAG);
        },
      }
    );
  },
};
const formItems = reactive<FormItem[]>([
  {
    label: "姓名",
    type: "input",
    name: "occupant_name",
    value: ref(""),
    maxLength: 50,
    inputType: "text",
    placeholder: "请输入人员名",
    validator: (item: any) => {
      if (!item.value) {
        ElMessage.error(item.placeholder);
        return false;
      }
      return true;
    },
    reset() {
      this.value = "";
    },
  },
  {
    label: "工号",
    type: "input",
    name: "employee_id",
    value: ref(""),
    maxLength: 50,
    inputType: "text",
    placeholder: "请输入一体化账号",
    validator: (item: any) => {
      if (!item.value) {
        ElMessage.error(item.placeholder);
        return false;
      }
      return true;
    },
    reset() {
      this.value = "";
    },
  },
  {
    label: "房间号",
    type: "input",
    name: "room_number",
    value: ref(""),
    maxLength: 50,
    inputType: "text",
    placeholder: "请输入房间号",
    validator: (item: any) => {
      if (!item.value) {
        ElMessage.error(item.placeholder);
        return false;
      }
      return true;
    },
    reset() {
      this.value = "";
    },
  },
  {
    label: "到店时间",
    type: "date",
    name: "checkin_date",
    value: ref(""),
    maxLength: 50,
    inputType: "date",
    placeholder: "请选择到店时间",
    validator: (item: any) => {
      if (!item.value) {
        ElMessage.error(item.placeholder);
        return false;
      }
      return true;
    },
    reset() {
      this.value = "";
    },
  },
  {
    label: "离店时间",
    type: "date",
    name: "checkout_date",
    value: ref(""),
    maxLength: 50,
    inputType: "date",
    placeholder: "请选择离店时间",
    validator: (item: any) => {
      if (!item.value) {
        ElMessage.error(item.placeholder);
        return false;
      }
      return true;
    },
    reset() {
      this.value = "";
    },
  },
  {
    label: "出差原因",
    type: "select",
    name: "reason",
    value: ref("因公"),
    selectOptions: [
      { label: "因公", value: "因公" },
      { label: "因私", value: "因私" },
    ],
    placeholder: "请选择出差原因",
    reset() {
      this.value = "因公"; // 默认值
    },
  },
]);

const onUpdateItem = (item: any) => {
  dialogTitle.value = "编辑人员信息";
  formItems.forEach((it) => {
    const propName = (item as any)[it.name];
    if (propName !== undefined) {
      it.value = propName;
    }
  });

  dialog.value?.show(() => {
    if (!baseForm.value?.checkParams()) {
      return;
    }
    (dialog.value as any).loading = true;
    const formData = {
      checkin_id: item.checkin_id,
      occupant_name: formItems[0].value,
      employee_id: formItems[1].value,
      room_number: formItems[2].value,
      checkin_date: formatDate(formItems[3].value),
      checkout_date: formatDate(formItems[4].value),
      reason: formItems[5].value
    }

    post({
      url: updateCheckinInfo,
      data: formData,
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response: Response) => {
        if (response.code === 200 || response.code === 0 || response.code === 201) {
          ElMessage.success("修改成功");
          setTimeout(refreshPage, 1000);
        } else {
          ElMessage.error("修改失败，请检查输入信息");
        }
      })
      .catch(error => {
        ElMessage.error("修改失败，请检查网络或稍后再试");
        console.error("Error:", error);
      });
  });
};
const doRefresh = () => {
  get({
    url: getCheckinInfo,
    data: { is_historical:0 } 
  }).then(handleSuccess);
};

// Refresh page method
function refreshPage() {
  location.reload();
}
function filterItems(
  srcArray: Array<ApartmentModelType>,
  filterItem: ApartmentModelType
) {
  for (let index = 0; index < srcArray.length; index++) {
    const element = srcArray[index];
    if (element.id === filterItem.id) {

      srcArray.splice(index, 1);
      return;
    }
  }
}
const onCheckoutItem = (item: any) => {
  ElMessageBox.confirm("确定要退房吗？？", "提示")
    .then(() => {
      const formData = { checkin_id: item.checkin_id };
      post({
        url: checkoutCheckin,
        data: formData,
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response: Response) => {
          if (response.code === 200 || response.code === 0 || response.code === 201) {
            ElMessage.success("退房成功");
            setTimeout(refreshPage, 1000); // Refresh after 1 seconds
          } else {
            ElMessage.error("退房失败，请检查输入信息");
          }
        })
        .catch(error => {
          ElMessage.error("退房失败，请检查网络或稍后再试");
          console.error("Error:", error);
        });
    })
    .catch(console.log);
};

onMounted(doRefresh);
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