<template>
  <div id="main-layout">
    <!-- 顶部导航 -->
    <el-header class="header">
    <div class="logo">公寓管理系统</div>
    <div class="header-right">
      <el-dropdown trigger="hover" popper-append-to-body="false" @command="handleCommand">
        <span class="el-dropdown-link">
          <img :src="avatarUrl" alt="Avatar" class="avatar" />
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="profile">个人设置</el-dropdown-item>
          <el-dropdown-item command="logout" divided>登出</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-header>

    <!-- 主体布局 -->
    <el-container class="main-content">
      <el-aside width="15%" class="sidebar">
        <el-menu :default-active="activeIndex" @select="handleSelect" :unique-opened="true" :collapse-transition="false">
          <el-submenu index="1">
            <template slot="title"><i class="el-icon-menu"></i>菜单1</template>
            <el-menu-item index="1-1">选项1</el-menu-item>
            <el-menu-item index="1-2">选项2</el-menu-item>
          </el-submenu>
          <!-- 更多菜单项... -->
          <el-submenu index="8">
            <template slot="title"><i class="el-icon-menu"></i>菜单8</template>
            <el-menu-item index="8-1">选项1</el-menu-item>
            <el-menu-item index="8-2">选项2</el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <el-main class="main-area">
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      activeIndex: '1',
      avatarUrl: require('@/assets/images/logo.jpg'),
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.fetchUserInformation();
    });
  },
  methods: {
    fetchUserInformation() {
      axios.get('/api/user')
        .then(response => {
          this.avatarUrl = response.data.avatarUrl;
        })
        .catch(error => {
          console.error('Error fetching user information:', error);
        });
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath);
    },
    handleCommand(command) {
      if (command === 'logout') {
        this.logout();
      } else if (command === 'profile') {
        this.$router.push('/profile');
      }
    },
    logout() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
#main-layout {
  min-height: 100vh;
  background: linear-gradient(to bottom, #65a4f7 0%, white 100%);
  border: 1px solid #ddd; /* 添加全局边框 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 边框凸显效果 */
}

.header {
  height: 60px;
  line-height: 60px;
  background: linear-gradient(to bottom, #65a4f7 0%, white 100%);
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  border-bottom: 1px solid #ddd; /* 底部边框 */
  display: flex;
  justify-content: space-between;
}

.header-right {
  display: flex;
  align-items: center;
  margin-right: 20px;
}

.sidebar {
  position: relative;
  height: calc(100vh - 60px);
  overflow-y: auto;
  background: linear-gradient(to bottom, #b3c0d1, #ffffff);
  color: #333;
  border-right: 1px solid #ddd; /* 右侧边框 */
}

.sidebar .el-menu {
  border-right: none;
  background-color: transparent; /* 去除背景色 */
}

.sidebar .el-menu-item,
.sidebar .el-submenu__title {
  height: 50px;
  line-height: 50px;
  color: #999; /* 默认灰色文字 */
  transition: all 0.3s ease; /* 平滑过渡效果 */
}

.sidebar .el-menu-item.is-active,
.sidebar .el-submenu__title.is-active {
  color: #409EFF; /* 激活时的颜色 */
  background-color: transparent; /* 保持背景透明 */
}

.sidebar .el-menu-item:hover,
.sidebar .el-submenu__title:hover {
  color: #409EFF; /* 鼠标悬停时的颜色 */
  background-color: #f5f7fa; /* 鼠标悬停时的背景色 */
}

/* 隐藏默认的展开箭头 */
.sidebar .el-submenu__title .el-submenu__icon-arrow {
  display: none;
}

/* 隐藏默认的子菜单箭头 */
.sidebar .el-menu-item-group__title .el-icon-caret-bottom {
  display: none;
}

/* 当鼠标悬停在子菜单标题上时显示子菜单 */
.sidebar .el-submenu.is-hover-trigger .el-submenu__title {
  color: #409EFF; /* 鼠标悬停时的颜色 */
}

.sidebar .el-submenu.is-hover-trigger .el-menu {
  display: block !important; /* 强制显示子菜单 */
}

/* 子菜单样式 */
.sidebar .el-menu--popup {
  background-color: #fff; /* 子菜单背景色 */
  border: 1px solid #ebeef5; /* 子菜单边框 */
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1); /* 子菜单阴影 */
}

/* 子菜单项样式 */
.sidebar .el-menu--popup .el-menu-item {
  color: #606266; /* 子菜单项文字颜色 */
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 20px;
  font-size: 24px;
  font-weight: bold;
  width: 100%;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  border: 1px solid #ddd; /* 图片边框 */
}

.main-content {
  flex: 1;
  border: 1px solid #ddd; /* 主体边框 */
}

.main-area {
  background-color: white;
  border: 1px solid #ddd; /* 内容区域边框 */
}

/* 添加额外的边框样式以覆盖 Element UI 组件默认的无边框设计 */
.el-header,
.el-footer,
.el-aside,
.el-main {
  border: 1px solid #ddd;
}

/* 对于 Element UI 的菜单项和子菜单标题 */
.sidebar .el-menu-item,
.sidebar .el-submenu__title {
  border-top: 1px solid transparent; /* 顶部透明边框 */
  border-bottom: 1px solid #ddd; /* 底部边框 */
}

/* 针对 Element UI 的子菜单项添加边框 */
.sidebar .el-menu-item.is-opened > .el-submenu__title {
  border-bottom: none; /* 移除底部边框 */
}

/* 针对 Element UI 的子菜单添加边框 */
.sidebar .el-menu-item.is-opened > .el-menu {
  border-top: 1px solid #ddd; /* 顶部边框 */
}
</style>