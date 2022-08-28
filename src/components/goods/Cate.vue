<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog()"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <!-- 表格 -->
      <tree-table
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text=""
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag
            size="mini"
            type="success"
            v-else-if="scope.row.cat_level === 1"
            >二级</el-tag
          >
          <el-tag
            size="mini"
            type="warning"
            v-else-if="scope.row.cat_level === 2"
            >三级</el-tag
          >
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.cat_id)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-search"
            @click="removeUserById(scope.row.cat_id)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCatedialogVisible"
      width="50%"
      @close="addCatedialogClosed()"
    >
      <!-- 添加分类 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类:">
          <!-- option指定数据源 -->
          <!-- props指定配置对象 -->
          <!-- clearable 是否可以清空选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="casecaderProps"
            @change="parentCateChanged()"
            :clearable="true"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCatedialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate()">添 加</el-button>
      </span>
    </el-dialog>
    <!-- 编辑对话框 -->
    <el-dialog
      title="修改分类"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed()"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称:">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editClassifyInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Cate',
  data() {
    return {
      // 发送请求的参数
      queryInfo: {
        tyep: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类的数据列表,默认为null
      cateList: [],
      // 总的数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'isok',
        },
        {
          label: '排序',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'order',
        },
        {
          label: '操作',
          // 表示将当前列定义为模板列
          type: 'template',
          // 当前列使用的模板名称
          template: 'opt',
        },
      ],
      // 控制添加分类对话框的展示与隐藏
      addCatedialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 添加分类的名称
        cat_name: '',
        // 父级分类id
        cat_pid: 0,
        // 要添加的分类默认分类等级
        cat_level: 0,
      },
      // 添加分类的验证规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名', trigger: 'blur' },
        ],
      },
      // 保存获取到的父级分类数据
      parentCateList: [],
      // 指定级联组件的配置对象
      casecaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        // 父子节点不关联,才都可以选中
        checkStrictly: true,
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制编辑对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的分类信息对象
      editForm: {},
      // 编辑分类的验证规则
      editFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名', trigger: 'blur' },
        ],
      },
    }
  },
  created() {
    // 组件创建完成之后发送请求获取数据
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      } else {
        // 保存商品分类信息
        this.cateList = res.data.result
        // 保存分类的总条数
        this.total = res.data.total
      }
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击按钮打开添加分类按钮
    showAddCateDialog() {
      // 获取了父级分类数据后再展开对话框
      this.getParentCateList()
      this.addCatedialogVisible = true
    },
    // 获取父级分类(1/2级)的数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败')
      }
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parentCateChanged() {
      // 如果selectedKeys数组中的length大于0则选中了父级分类
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid =
          this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类等级
        this.addCateForm.cat_level = this.selectedKeys.length
        return
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮后创建新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加分类失败')
        } else {
          this.$message.success('添加分类成功')
          this.getCateList()
          this.addCatedialogVisible = false
        }
      })
    },
    // 监听添加分类对话框关闭的事件
    addCatedialogClosed() {
      // 重置表单
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },
    // 展示编辑分类对话框
    async showEditDialog(id) {
      // 展示修改用户对话框后,获取对应的用户信息
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询分类失败')
      } else {
        // 查询到的数据保存到editform中
        this.editForm = res.data
        // 为true时展开对话框
        this.editDialogVisible = true
      }
    },
    // 监听编辑用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑分类名称后并提交
    editClassifyInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 验证通过后发起修改信息请求
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          {
            cat_name: this.editForm.cat_name,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新分类名称失败')
        } else {
          // 关闭对话框
          this.editDialogVisible = false
          // 更新用户列表
          this.getCateList()
          this.$message.success('更新分类名称成功')
        }
      })
    },
    // 根据id删除对应的分类
    async removeUserById(id) {
      // 弹窗询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该用户, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      /*
       * 如果用户确认删除,则返回值是字符串 confirm
       * 如果用户取消删除,返回值是字符串 cancel
       */
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除分类失败')
      } else {
        this.$message.success('删除分类成功')
        // 删除后重新获取分类列表
        this.getCateList()
      }
    },
  },
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>