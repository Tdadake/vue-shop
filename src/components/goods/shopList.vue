<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索 & 添加 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- clearable清空搜索框后,重新获取数据 -->
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getGoodSlist()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getGoodSlist()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 点击添加按钮后跳转到添加商品页面 -->
          <el-button type="primary" @click="goAddGoods()">添加</el-button>
        </el-col>
      </el-row>
      <!-- 商品列表区 -->
      <el-table :data="goodsList" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"
          width="95px"
        ></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"
          width="70px"
        ></el-table-column>
        <el-table-column label="创建时间" prop="add_time" width="140px">
          <template slot-scope="scope">
            <!-- | 调用过滤器 -->
            {{ (scope.row.add_time * 1000) | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130px">
          <template slot-scope="scope">
            <el-tooltip
              effect="dark"
              content="编辑商品"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              effect="dark"
              content="删除商品"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeById(scope.row.goods_id)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      >
      </el-pagination>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'shopList',
  data () {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 商品列表
      goodsList: [],
      // 总数据的条数
      total: 0
    }
  },
  created () {
    this.getGoodSlist()
  },
  methods: {
    // 获取商品列表
    async getGoodSlist () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品列表失败')
      } else {
        this.goodsList = res.data.goods
        this.total = res.data.total
      }
    },
    // 监听每页显示多少个商品的事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodSlist()
    },
    // 监听页码的改变
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodSlist()
    },
    // 删除商品功能
    async removeById (id) {
      // 弹窗询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      /*
       * 如果用户确认删除,则返回值是字符串 confirm
       * 如果用户取消删除,返回值是字符串 cancel
       */
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('goods/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      } else {
        this.$message.success('删除成功')
        this.getGoodSlist()
      }
    },
    // 触发该事件后跳转到添加商品页面
    goAddGoods () {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style lang="less" scoped>
</style>
