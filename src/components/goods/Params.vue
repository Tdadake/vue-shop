<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数!"
        type="warning"
        :closable="false"
      >
      </el-alert>
      <!-- 选择商品分类区 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类: </span>
          <!-- 选择商品分类的级联 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProp"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs页签 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的页面 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染tag标签,显示动态参数的属性 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入新属性的输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的页面 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
            >添加属性</el-button
          >
          <!-- 静态属性表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 渲染tag标签,显示动态参数的属性 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i, scope.row)"
                  >{{ item }}</el-tag
                >
                <!-- 输入新属性的输入框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                  >修改</el-button
                >
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数和属性的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed()"
    >
      <!-- 添加参数的对话框 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改参数或属性的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed()"
    >
      <!-- 修改参数或属性的对话框 -->
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框属性
      cateProp: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
      },
      // 级联选择框数据双向绑定数组
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: 'many',
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制添加对话框的显示与隐藏
      addDialogVisible: false,
      // 保存添加参数表单数据对象
      addForm: {
        attr_name: '',
      },
      // 添加表单验证规则
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: `请输入参数名称`,
            trigger: 'blur',
          },
        ],
      },
      // 控制修改对话框的显示与隐藏
      editDialogVisible: false,
      // 保存修改参数表单数据对象
      editForm: {},
      // 修改表单验证规则
      editFormRules: {
        attr_name: [
          {
            required: true,
            message: `请输入参数名称`,
            trigger: 'blur',
          },
        ],
      },
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 如果按钮需要被禁用,则返回true,否则返回false
    isBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 动态显示添加参数/属性对话框的名称
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
  },
  methods: {
    // 获取所有商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择框中选项变化,会触发此函数
    handleChange() {
      this.getParamsData()
    },
    // tabs页签点击事件的处理函数
    handleTabClick() {
      this.getParamsData()
    },
    // 获取参数的列表数据
    async getParamsData() {
      // 判断是否选择的是三级分类
      // 新版element的级联选择器默认只能选择最后一级
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据所选分类的id和当前所在的tabs页面来发送请求获取相应的参数或者属性
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName },
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      // 将item转化为数组
      res.data.forEach((item) => {
        // 没有属性的时候返回空数组
        item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        // 添加一个布尔值来控制文本框的显示与隐藏
        item.inputVisible = false
        // 文本框找哪个输入的值
        item.inputValue = ''
      })
      // 判断是静态属性还是动态参数,再保存数据
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 监听添加对话框的关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮后提交数据
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) {
          this.$message.error('添加参数失败')
        } else {
          this.$message.success('添加参数成功')
          this.addDialogVisible = false
          this.getParamsData()
        }
      })
    },
    // 点击按钮展示修改对话框
    async showEditDialog(attr_id) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attr_id}`,
        {
          params: { attr_sel: this.activeName },
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听修改对话框关闭的事件
    editDialogClosed() {
      // 关闭表单后初始化
      this.$refs.editFormRef.resetFields()
    },
    // 点击后提交修改的数据
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改失败')
        } else {
          this.$message.success('修改成功')
          this.editDialogVisible = false
          this.getParamsData()
        }
      })
    },
    // 点击后删除参数
    async removeParams(attr_id) {
      // 弹窗询问用户是否删除数据
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
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
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attr_id}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('删除失败')
      } else {
        this.$message.success('删除成功')
        this.getParamsData()
      }
    },
    async saveAttrVals(row) {
      // 发起请求,把数据保存到数据库中
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          // 服务器中vals是字符串,这里需要把数组转换成字符串
          attr_vals: row.attr_vals.join(','),
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('添加动态参数属性失败')
      } else {
        this.$message.success('添加动态参数属性成功')
      }
    },
    // 文本框失去焦点或者按下enter都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim().length !== 0) {
        // 输入了合法的内容,则把内容push到vals中
        row.attr_vals.push(row.inputValue.trim())
        this.saveAttrVals(row)
      }
      // 如果把输入的属性push到了vals中即初始化,如果输入的是清除空格后还是空字符串后也初始化
      row.inputValue = ''
      row.inputVisible = false
    },
    // 点击按钮显示文本框
    showInput(row) {
      row.inputVisible = true
      // 自动获取焦点
      // $nextTick方法的作用: 当页面元素重新被渲染之后,才会调用回调函数
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 点击关闭tag标签时根据i删除对应的动态参数的属性
    handleClose(i, row) {
      // 从第i个属性开始删除一个
      row.attr_vals.splice(i, 1)
      // 删除后保存到数据库中
      this.saveAttrVals(row)
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 10px;
}
.input-new-tag {
  width: 140px;
}
</style>
