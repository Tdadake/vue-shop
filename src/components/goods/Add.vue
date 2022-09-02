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
      <!-- activeindex - 0将字符串转化成数值 -->
      <el-steps
        :space="200"
        :active="activeIndex - 0"
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
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- tabs栏,显示商品需要添加的信息的名称 -->
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabsLeave"
          @tab-click="tabClicked()"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="">
              <!-- 选择商品分类的级联 -->
              <el-cascader
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="cateProp"
                @change="handleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单item项 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyTableData"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  :label="item_1"
                  v-for="(item_1, i) in item.attr_vals"
                  :key="i"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action图片传到后台的API地址 -->
            <!-- type-list文件列表的类型,picture带有缩略图的列表 -->
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-success="handleSuccess"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="addGoods()"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 图片预览对话框 -->
    <el-dialog
      title="图片预览"
      :visible.sync="previewDialogVisible"
      width="50%"
    >
      <img :src="previewPath" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 导入loash
import _ from 'lodash'
export default {
  name: 'Add',
  data() {
    return {
      // 控制步骤条走到哪一步
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 商品所属的分类数组
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 商品的动态参数和静态属性
        attrs: [],
      },
      // 表单的验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请输入商品f分类', trigger: 'blur' },
        ],
      },
      // 商品分类列表
      cateList: [],
      // 级联选择框属性
      cateProp: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
      },
      // 商品动态参数列表
      manyTableData: [],
      // 商品静态属性列表
      onlyTableData: [],
      // 图片上传的地址
      uploadURL: 'http://127.0.0.1:9000/api/private/v1/upload',
      // 图片上传的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 图片预览的数据
      previewPath: '',
      // 控制图片预览对话框展示与隐藏
      previewDialogVisible: false,
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      } else {
        return null
      }
    },
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品分类失败')
      } else {
        // 保存商品分类信息
        this.cateList = res.data
      }
    },
    // 级联选择框中选项变化,会触发此函数
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 判断是否能切换tabs标签的事件
    beforeTabsLeave(_activeName, oldActiveNave) {
      if (oldActiveNave === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        return false
      }
    },
    // tabs标签切换后触发
    async tabClicked() {
      // 值为1是获取商品动态参数,值为2获取商品静态属性
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('商品参数获取失败')
        }
        res.data.forEach((item) => {
          // 没有属性的时候返回空数组
          item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' },
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('商品参数获取失败')
        }
        this.onlyTableData = res.data
      }
    },
    // 上传图片后处理图片预览效果
    handlePreview(file) {
      const u = 'http://127.0.0.1:9000/'
      this.previewPath = u + file.response.data.tmp_path
      this.previewDialogVisible = true
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path }
      // 将图片信息添加到pics中
      this.addForm.pics.push(picInfo)
    },
    // 处理移出图片的操作
    handleRemove(file) {
      // 获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 从pics数组中找到这个图片对应的索引值,x代表pics中的项
      const index = this.addForm.pics.findIndex((x) => x.pic === filePath)
      // 调用数组的splice方法,把图片对象信息从pics中移出
      this.addForm.pics.splice(index, 1)
    },
    // 点击按钮添加商品
    addGoods() {
      this.$refs.addFormRef.validate(async (vaild) => {
        if (!vaild) {
          return this.$message.error('请填写必要的表单项')
        }
        // 利用lodash 深拷贝addForm,避免在将goods_cat转化为字符串再赋给goods_cat出现冲突
        const form = _.cloneDeep(this.addForm)
        // 发送请求前把goods_cat变成字符串
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数和静态属性
        this.manyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals.join(' '),
          }
          this.addForm.attrs.push(newInfo)
        })
        this.onlyTableData.forEach((item) => {
          const newInfo = {
            attr_id: item.attr_id,
            attr_vals: item.attr_vals,
          }
          this.addForm.attrs.push(newInfo)
        })
        // 将addForm的attrs赋给form
        form.attrs = this.addForm.attrs
        // 发送请求添加商品
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        } else {
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin: 0 5px 0 0 !important;
}
.previewImg {
  widows: 80%;
}
.btnAdd {
  margin-top: 15px;
}
</style>