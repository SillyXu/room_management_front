import { baseAddress } from "@/api/url";
import Mock from "mockjs";
import { baseData } from "../base.ts";

export const adminRoutes = [
  {
    menuUrl: "/roomManagement",
    menuName: "房间管理",
    icon: "SettingIcon",
    tip: "new",
    parentPath: '',
    children: [
      {
        parentPath: '/roomManagement',
        menuUrl: "/roomManagement/apartmentList",
        menuName: "房间列表",
      },
      {
        parentPath: '/roomManagement',
        menuUrl: "/roomManagement/apartmentView",
        menuName: "房间概况",
      },
      {
        parentPath: '/roomManagement',
        menuUrl: "/roomManagement/apartmentAdd",
        menuName: "新增房型",
        cacheable: true,
      },
    ],
  },
  {
    menuUrl: "/peopleManagement",
    menuName: "人员管理",
    icon: "SettingIcon",
    tip: "dot",
    parentPath: '',
    children: [
      {
        parentPath: '/peopleManagement',
        menuUrl: "/peopleManagement/peopleAdd",
        menuName: "入住登记",
      },
      {
        parentPath: '/peopleManagement',
        menuUrl: "/peopleManagement/peopleList",
        menuName: "入住信息",
      },
    ],
  },

];

Mock.mock(baseAddress + "getMenuListByRoleId", function () {
  baseData.data = adminRoutes;
  return Mock.mock(baseData);
});
