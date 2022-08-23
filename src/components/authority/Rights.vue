<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card> </el-card>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data() {
    return {
      rigthsList: [],
    }
  },
  created() {
    // 获取所有的权限
    this.getRightList()
  },
  methods: {
    // 获取权限列表
    async getRightList() {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) {
        this.$message.error('获取权限列表失败')
      } else {
        this.rigthsList = res.data
      }
    },
  },
}
</script>

<style lang="less" scoped>
</style>