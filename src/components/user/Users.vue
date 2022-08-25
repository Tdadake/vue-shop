<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索栏 && 添加区域 -->
      <!-- 分隔栏 gutter 分栏间隔-->
      <el-row :gutter="30">
        <el-col :span="10">
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList()"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList()"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表区 -->
      <!-- :data 指定数据源 -->
      <el-table :data="userList" border stripe>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <!-- 状态按钮 -->
        <el-table-column label="状态">
          <!-- 获取状态的值 -->
          <template slot-scope="scope">
            <el-switch
              v-model="scope.row.mg_state"
              @change="userStateChange(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改角色按钮 -->
            <el-tooltip
              effect="dark"
              content="编辑角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditDialog(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 删除角色按钮 -->
            <el-tooltip
              effect="dark"
              content="删除角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="danger"
                icon="el-icon-delete"
                size="mini"
                @click="removeUserById(scope.row.id)"
              ></el-button>
            </el-tooltip>
            <!-- 分配角色按钮 -->
            <el-tooltip
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed()"
    >
      <!-- 内容主体 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser()">添 加</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户信息对话框 -->
    <el-dialog
      title="编辑用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed()"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <!-- disabled 是否禁用该表单内的所有组件-->
          <el-input v-model="editForm.username" disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoledialogVisible"
      width="50%"
      @close="setRoleDialogClosed()"
    >
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <P>
          分配角色：
          <el-select v-model="selectRoleId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </P>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoledialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Users',
  data() {
    // 自定义验证规则
    // 邮箱验证规则
    var checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的邮箱'))
      }
    }
    // 手机验证规则
    var checkMobile = (rule, value, callback) => {
      // 验证手机的正则表达式
      const regMobile =
        /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])\d{8}$/
      if (regMobile.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的手机号'))
      }
    }
    return {
      // 查询参数对象
      queryInfo: {
        // 搜索关键字
        query: '',
        // 页数
        pagenum: 1,
        // 每页显示的数据数
        pagesize: 2,
      },
      // 用户列表
      userList: [],
      // 用户数据的总数
      total: 0,
      // 控制添加用户对话框的显示与隐藏
      addDialogVisible: false,
      // 添加用户的数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 添加用户表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 ~ 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 16,
            message: '长度在 6 到 16 个字符',
            trigger: 'blur',
          },
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 控制编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息对象
      editForm: {},
      // 修改用户表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 控制分配角色对话框的显示与隐藏
      setRoledialogVisible: false,
      // 保存被分配角色的用户的信息
      userInfo: {},
      // 所有角色列表
      rolesList: [],
      // 已选中角色的id
      selectRoleId: [],
    }
  },
  created() {
    // 获取用户列表
    this.getUserList()
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户列表失败!')
      } else {
        this.userList = res.data.users
        this.total = res.data.total
      }
    },
    // 今天switch状态的改变
    async userStateChange(userInfo) {
      // 监听到switch按钮状态改变后发送请求修改用户状态
      const { data: res } = await this.$http.put(
        `users/${userInfo.id}/state/${userInfo.mg_state}`
      )
      if (res.meta.status !== 200) {
        userInfo.mg_state = !userInfo.mg_state
        this.$message.error('用户状态更新失败')
      } else {
        this.$message.success('用户状态更新成功')
      }
    },
    // 监听pageszie 改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // 修改pagesize后重新发送请求获取用户列表
      this.getUserList()
    },
    // 监听 页码值 改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      // 跳转到下一页时发送请求获取用户列表
      this.getUserList()
    },
    // 监听添加用户对话框的关闭事件
    addDialogClosed() {
      // 对话框关闭后,重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮后添加新用户
    addUser() {
      // validata(element的方法)预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起添加用户请求
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
          // 添加成功后隐藏添加用户的对话框
          this.addDialogVisible = false
          // 添加成功后刷新用户列表
          this.getUserList()
        }
      })
    },
    // 展示编辑用户对话框
    async showEditDialog(id) {
      // 展示修改用户对话框后,获取对应的用户信息
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询用户失败')
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
    // 编辑用户信息并提交
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 验证通过后发起修改信息请求
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新用户信息失败')
        } else {
          // 关闭对话框
          this.editDialogVisible = false
          // 更新用户列表
          this.getUserList()
          this.$message.success('更新用户信息成功')
        }
      })
    },
    // 根据id删除对应的用户信息
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
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
      } else {
        this.$message.success('删除用户成功')
        // 删除后重新获取用户列表
        this.getUserList()
      }
    },
    // 展示分配角色的对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 在对话框弹出之前获取所有角色列表
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败')
      } else {
        this.$message.success('获取角色列表成功')
        this.rolesList = res.data
        this.setRoledialogVisible = true
      }
    },
    // 点击确定按钮后,保存已经分配的角色
    async saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色')
      }
      const { data: res } = await this.$http.put(
        `users/${this.userInfo.id}/role`,
        { rid: this.selectRoleId }
      )
      if (res.meta.status !== 200) {
        this.$message.error('更新角色失败')
      } else {
        this.$message.success('更新角色成功')
        // 更新列表
        this.getUserList()
        // 关闭对话框
        this.setRoledialogVisible = false
      }
    },
    // 监听分配角色对话框关闭的事件
    setRoleDialogClosed() {
      // 初始化
      this.selectRoleId = ''
      this.userInfo = ''
    },
  },
}
</script>

<style lang="less" scoped>
</style>