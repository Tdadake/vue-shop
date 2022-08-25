<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true"
            >添加角色</el-button
          >
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 点击展开对应权限信息-->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item_1, index) in scope.row.children"
              :key="item_1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag
                  closable
                  @close="removeRightById(scope.row, item_1.id)"
                  >{{ item_1.authName }}</el-tag
                >
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环 嵌套渲染二级权限 -->
                <el-row
                  :class="[index === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item_2, index) in item_1.children"
                  :key="item_2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item_2.id)"
                      >{{ item_2.authName }}</el-tag
                    >
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item_3.id)"
                      v-for="item_3 in item_2.children"
                      :key="item_3.id"
                      >{{ item_3.authName }}</el-tag
                    >
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="插槽" width="300px">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.id)"
              >编辑</el-button
            >
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="removeRolesById(scope.row.id)"
              >删除</el-button
            >
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightDialog(scope.row)"
              >分配权限</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色对话框 -->
    <el-dialog
      title="添加角色"
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
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles()">添 加</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户信息对话框 -->
    <el-dialog
      title="编辑角色信息"
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
        <el-form-item label="名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo()">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="40%"
      @close="setRightDialogClosed()"
    >
      <!-- 树形控件展示权限信息 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        node-key="id"
        :default-checked-keys="defKeys"
        ref="treeRef"
        show-checkbox
        default-expand-all
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      // 角色列表数据
      rolesList: [],
      // 控制添加角色对话框的显示与隐藏
      addDialogVisible: false,
      // 添加角色的数据
      addForm: {
        roleName: '',
        roleDesc: '',
      },
      // 修改用户表单的验证规则对象
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 ~ 10 个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 ~ 20 个字符', trigger: 'blur' },
        ],
      },
      // 查询到的角色信息对象
      editForm: {},
      // 修改用户表单的验证规则对象
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 ~ 10 个字符', trigger: 'blur' },
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 2, max: 20, message: '长度在 2 ~ 20 个字符', trigger: 'blur' },
        ],
      },
      // 控制添加用户对话框的显示与隐藏
      editDialogVisible: false,
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 获取的权限数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: 'children',
        label: 'authName',
      },
      // 默认选中的权限的id
      defKeys: [],
      // 即将分配权限角色的id
      roleId: '',
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败')
      } else {
        this.rolesList = res.data
      }
    },
    // 监听添加角色对话框的关闭事件
    addDialogClosed() {
      // 对话框关闭后,重置表单
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮后添加新角色
    addRoles() {
      // validata(element的方法)预验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        // 发起添加用户请求
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        } else {
          this.$message.success('添加用户成功')
          // 添加成功后隐藏添加用户的对话框
          this.addDialogVisible = false
          // 添加成功后刷新用户列表
          this.getRolesList()
        }
      })
    },
    // 展示编辑角色对话框
    async showEditDialog(id) {
      // 展示修改角色对话框后,获取对应的用户信息
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('查询角色失败')
      } else {
        // 查询到的数据保存到editform中
        this.editForm = res.data
        // 为true时展开对话框
        this.editDialogVisible = true
      }
    },
    // 监听编辑角色对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑角色信息并提交
    editRolesInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 验证通过后发起修改信息请求
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc,
          }
        )
        if (res.meta.status !== 200) {
          this.$message.error('更新角色信息失败')
        } else {
          // 关闭对话框
          this.editDialogVisible = false
          // 更新角色列表
          this.getRolesList()
          this.$message.success('更新角色信息成功')
        }
      })
    },
    // 根据id删除对应的用户信息
    async removeRolesById(id) {
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
      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        this.$message.error('删除用户失败')
      } else {
        this.$message.success('删除用户成功')
        // 删除后重新获取用户列表
        this.getRolesList()
      }
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹窗提示用户是否删除权限
      const confirmResult = await this.$confirm(
        '此操作将永久删除该权限, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      /*
       * 判断用户是否要删除权限
       * 如果用户确认删除,则返回值是字符串 confirm
       * 如果用户取消删除,返回值是字符串 cancel
       */
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        this.$message.error('删除权限失败')
      } else {
        this.$message.success('删除权限成功')
        // 删除后会返回最新的权限信息,直接把data数据赋值给role,就不会重新刷新页面
        role.children = res.data
      }
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 保存打开的分配权限对话框对应角色的id
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        this.$message.error('获取权限失败')
      } else {
        // 把获取的权限数据保存到rightsList
        this.rightsList = res.data
        // 递归获取三级节点的id
        this.getLeafKeys(role, this.defKeys)
        this.setRightDialogVisible = true
      }
    },
    // 通过递归的形式,获取角色下所有的三级权限的id,并保存到defKeys数组中
    getLeafKeys(node, arr) {
      // 不包含children属性就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getLeafKeys(item, arr)
      })
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      // 关闭后初始化defKeys
      this.defKeys = []
    },
    // 点击确定后为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        {
          rids: idStr,
        }
      )
      if (res.meta.status !== 200) {
        this.$message.error('分配权限失败')
      } else {
        this.$message.success('分配权限成功')
        // 刷新权限列表
        this.getRolesList()
        // 关闭权限对话框
        this.setRightDialogVisible = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>