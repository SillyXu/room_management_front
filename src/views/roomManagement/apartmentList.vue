<template>
  <div class="main-container">
    <TableBody>
      <template #tableConfig>
        <TableConfig
          v-model:border="tableConfig.border"
          v-model:stripe="tableConfig.stripe"
          @refresh="doRefresh"
        >
          <template #actions>
            <el-button
              type="primary"
              size="small"
              icon="PlusIcon"
              @click="onAddItem"
            >添加
            </el-button>
          </template>
        </TableConfig>
      </template>
      <template #default>
        <el-table
          v-loading="tableLoading"
          :data="dataList"
          :header-cell-style="tableConfig.headerCellStyle"
          :size="tableConfig.size"
          :stripe="tableConfig.stripe"
          :border="tableConfig.border"
          row-key="id"
          :tree-props="{ children: 'children' }"
        >
          <el-table-column
            align="center"
            label="序号"
            fixed="left"
            width="80"
          >
            <template v-slot="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column
            v-for="item of tableColumns"
            :key="item.prop"
            :label="item.label"
            :prop="item.prop"
            align="center"
          >
            <template
              v-if="item.prop === 'actions'"
              #default="scope"
            >
              <el-button
                plain
                type="primary"
                size="small"
                @click="onUpdateItem(scope.row)"
              >编辑</el-button>
              <el-button
                plain
                type="danger"
                size="small"
                @click="onDeleteItem(scope.row)"
              >删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </TableBody>
    <Dialog
      ref="dialog"
      :title="dialogTitle"
    >
      <template #content>
        <BaseForm
          class="padding-left padding-right"
          ref="baseForm"
          :form-items="formItems"
        >
        </BaseForm>
      </template>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { post } from "@/api/http";
import { getApartmentInfo } from "@/api/url";
import type { BaseFormType, DialogType } from "@/components/types";
import { computed, h, onMounted, reactive, ref } from "vue";
import { ElInput, ElMessage, ElMessageBox } from "element-plus";
import _ from "lodash";
import { useDataTable } from "@/hooks";
import { FormRenderItem } from "@/components/common/FormRender";
const DP_CODE_FLAG = "dp_code_";

// 定义Apartment的类型或接口
interface Apartment {
  id: number;
  roomName: string;
  roomCode: number;
  floor: string;
  spareInfo: string;
  occupant: string;
}

const tableColumns = reactive([
  {
    label: "房间名",
    prop: "roomName",
  },
  {
    label: "房间号",
    prop: "roomCode",
  },
  {
    label: "楼层",
    prop: "floor",
  },
  {
    label: "备品信息",
    prop: "spareInfo",
  },
  {
    label: "入住人",
    prop: "occupant",
  },
  {
    label: "操作",
    prop: "actions",
  },
]);

// 在setup函数中添加或修改fetchApartmentInfo方法
const fetchApartmentInfo = async () => {
  try {
    const response = await post<Apartment[]>({
      url: getApartmentInfo,
      data: {} // 如果不需要传递数据，可以这样写
      // 或者如果你需要传递数据，例如一个id:
      // data: { id: 123 }
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
    label: "房间名",
    type: "input",
    name: "roomName",
    value: ref(""),
    maxLength: 50,
    inputType: "text",
    placeholder: "请输入房间名",
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
  },
  {
    label: "楼层",
    type: "input",
    name: "floor",
    value: ref(""),
    maxLength: 50,
    inputType: "text",
    placeholder: "请输入楼层",
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
    label: "备品信息",
    type: "input",
    name: "spareInfo",
    value: ref(""),
    maxLength: 200,
    placeholder: "请输入备品信息",
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
    label: "入住人",
    type: "input",
    name: "occupant",
    value: ref(""),
    maxLength: 50,
    inputType: "text",
    placeholder: "请输入入住人",
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
]);

const onUpdateItem = (item: any) => {
  dialogTitle.value = "编辑房间";
  formItems.forEach((it) => {
    const propName = (item as any)[it.name];
    if (propName) {
      it.value = propName;
    }
  });

  dialog.value?.show(() => {
    if (!baseForm.value?.checkParams()) {
      return;
    }
    (dialog.value as any).loading = true;
    setTimeout(() => {
      ElMessage.success(
        "模拟修改成功，添加参数为：" + JSON.stringify(baseForm.value?.generatorParams())
      );
      dialog.value?.close();
    }, 3000);
  });
};
const doRefresh = () => {
  post({
    url: getApartmentInfo,
  }).then(handleSuccess);
};
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
const onDeleteItem = (item: any) => {
  ElMessageBox.confirm("确定要删除此信息，删除后不可恢复？", "提示")
    .then(() => {
      if (dataList.value) {
        filterItems(dataList.value, item);
      }
    })
    .catch(console.log);
};
const onAddItem = () => {
  dialogTitle.value = "添加部门";
  formItems.forEach((it: any) => it.reset());
  dialog.value?.show(() => {
    if (!baseForm.value?.checkParams()) {
      return;
    }
    (dialog.value as any).loading = true;
    const formParams = baseForm.value?.generatorParams();
    setTimeout(() => {
      ElMessage.success(
        "模拟添加成功，添加参数为：" + JSON.stringify(formParams)
      );
      dialog.value?.close();
    }, 1000);
  });
};
onMounted(doRefresh);
</script>
