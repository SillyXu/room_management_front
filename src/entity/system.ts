/**
 * 用户列表对象模型
 */
interface UserModelType {
  id: number;
  avatar?: string;
  mobile: string;
  email: string;
  gender: number;
  departmentName?: string;
  departmentId: number | string;
  roleName?: string;
  roleId: number | string;
  status: number;
  nickName: string;
  password: string;
}

/**
 * 角色列表对象模型
 */
interface RoleModelType {
  id: number;
  name: string;
  roleCode: string;
  description: string;
  createTime: string;
}

/**
 * 房间列表对象模型
 */
interface ApartmentModelType {
  id: number;
  roomCode: number;
  roomName: string;
  floor: string;
  spareInfo: string;
  occupant: string;
}

/**
 * 菜单列表对象模型
 */
interface MenuModelType {
  menuUrl: string;
  menuName: string;
  icon: string;
  tip: string | number;
  parentPath: string;
  children: MenuModelType[];
  isSelect: boolean;
}
