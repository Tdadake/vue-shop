<template>
  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/miniLogo.png" alt="" />
        <span>后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 侧边栏展开和折叠 -->
        <div class="toggle-button" @click="toggleCollapse()">|||</div>
        <!-- 侧边栏导航 -->
        <!-- unique-opened 是否保持一个菜单栏打开 ，直接简写成unique-opened时值为true-->
        <!-- collapse 是否折叠侧边栏 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409eff"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
        >
          <!-- 一级菜单 -->
          <!-- 因为index只能接收字符串，所以需要把item.id转化为字符串 -->
          <el-submenu
            :index="item.id.toString()"
            v-for="item in menusList"
            :key="item.id"
          >
            <!-- 一级菜单模版 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconObj[item.id]"></i>
              <!-- 菜单名 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="chilItem.id.toString()"
              v-for="chilItem in item.children"
              :key="chilItem.id"
            >
              <!-- 二级菜单模版 -->
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 菜单名 -->
                <span>{{ chilItem.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      // 左侧菜单数据
      menusList: [],
      // 通过id来对应所需的icon图标
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao',
      },
      // 侧边栏是否折叠 false为不折叠
      isCollapse: false,
    }
  },
  created() {
    this.getMenusList()
  },
  methods: {
    // 退出功能
    logout() {
      // 清除token
      window.sessionStorage.clear()
      // 重定向到登录页
      this.$router.push('/login')
    },
    // 获取左侧的菜单
    async getMenusList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        this.$message.error(res.meta.msg)
      } else {
        this.menusList = res.data
      }
    },
    // 点击按钮，实现侧边栏折叠和展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
  },
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  color: #fff;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 20px;
    }
  }
  // 让miniLogo贴紧左边
  padding-left: 0;
  // 让退出按钮居中
  align-items: center;
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  margin-right: 10px;
}
.toggle-button {
  background-color: #4a5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
