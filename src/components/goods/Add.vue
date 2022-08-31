<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/goods' }">商品列表</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 文本提示 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      ></el-alert>
      <el-steps
        :space="200"
        :active="activeIndex"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="基本图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- tabs栏,显示商品需要添加的信息的名称 -->
      <el-tabs :tab-position="'left'" style="height: 200px">
        <el-tab-pane label="基本信息"></el-tab-pane>
        <el-tab-pane label="商品参数"></el-tab-pane>
        <el-tab-pane label="商品属性"></el-tab-pane>
        <el-tab-pane label="基本图片"></el-tab-pane>
        <el-tab-pane label="商品内容"></el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'Add',
  data() {
    return {
      // 控制步骤条走到哪一步
      activeIndex: 0,
    }
  },
  created() {},
  methods: {},
}
</script>

<style lang="less" scoped>
</style>