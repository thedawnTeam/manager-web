<template>
  <div>
    <Card shadow>
      <p><b>huluwa用户数据</b></p>
      <br>
      <Form ref="formInline" :model="formInline" inline>
        <FormItem prop="phone">
          <Input type="text" v-model="formInline.phone" placeholder="手机号">
            <template #prepend>
              <Icon type="md-phone-portrait" />
            </template>
          </Input>
        </FormItem>
        <FormItem prop="realName">
          <Input type="text" v-model="formInline.realName" placeholder="姓名">
            <template #prepend>
              <Icon type="md-person" />
            </template>
          </Input>
        </FormItem>
        <FormItem prop="cardNumber">
          <Input type="text" placeholder="身份证">
            <template #prepend>
              <Icon type="md-card" />
            </template>
          </Input>
        </FormItem>
        <FormItem prop="cardNumber">
          <Select v-model="formInline.currentStatus" style="width:200px" placeholder="状态">
            <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="getTableData()">搜索</Button>
        </FormItem>
      </Form>
      <Table :columns="columns" :data="data" :highlight-row="true">
        <template #action="{ row, index }">
          <Button type="primary" size="small" style="margin-right: 5px" @click="showOrder(index)">查询订单</Button>
          <Button type="success" size="small" style="margin-right: 5px" @click="showExpress(index)">查询物流</Button>
        </template>
      </Table>
      <Page :total="total" :page-size="pageSize" :current="currentPage" @on-change="pageSizeChangeHandler" show-elevator show-total/>
    </Card>
    <Modal
      v-model="isShowDialog"
      title="订单详情">
      <div>
        <pre>{{ dialogContent ? JSON.stringify(dialogContent, null, 2) : 'Invalid JSON' }}</pre>
      </div>
    </Modal>
  </div>
</template>
<script>
import { queryAccountPage, queryOrderById, queryOrderExpressById } from '@/api/data'
import { Table, Page } from 'iview'

export default {
  name: 'account',
  components: {
    Table,
    Page
  },
  data () {
    return {
      columns: [
        { title: 'id', key: 'id', width: 80 },
        { title: '手机号', key: 'phone' },
        {
          title: '创建时间',
          key: 'createdAt',
          render: function (h, params) {
            return <span>{ new Date(params.row.createdAt).toLocaleDateString() + ' ' + new Date(params.row.createdAt).toLocaleTimeString() }</span>
          }
        },
        { title: '名称', key: 'realName' },
        {
          title: '是否绑定顺丰',
          key: 'isSf',
          render: (h, params) => {
            return <span>{ params.row.isSf === 0 ? '未绑定' : '已绑定' }</span>
          }
        },
        {
          title: '平台',
          key: 'channelId',
          render: (h, params) => {
            return <span>{ params.row.channelId === 7 ? '贵旅优品' : '新联惠购' }</span>
          }
        },
        {
          title: '状态',
          key: 'name',
          render: (h, params) => {
            let statusText = ''
            if (params.row.status === 0) {
              statusText = '正常'
            } else if (params.row.status === -1) {
              statusText = 'Token失效'
            } else if (params.row.status === 1) {
              statusText = '中签'
            }
            return <span>{ statusText }</span>
          }
        },
        { title: '备注', key: 'remark' },
        { title: '操作', slot: 'action' }
      ],
      data: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      formInline: {
        phone: '',
        realName: '',
        currentStatus: ''
      },
      statusList: [
        {
          value: '',
          label: ''
        },
        {
          value: '0',
          label: '正常'
        },
        {
          value: '1',
          label: '中签'
        },
        {
          value: '-1',
          label: 'Token失效'
        }
      ],
      isShowDialog: false, // 是否显示弹出框
      dialogContent: ''
    }
  },
  methods: {
    getTableData (searchStr = '') {
      if (this.formInline.phone !== '') {
        searchStr += 'phone=' + this.formInline.phone + ';'
      }
      if (this.formInline.realName !== '') {
        searchStr += 'real_name=' + this.formInline.realName + ';'
      }
      if (this.formInline.currentStatus && this.formInline.currentStatus !== '') {
        searchStr += 'status=' + this.formInline.currentStatus + ';'
      }
      queryAccountPage(this.currentPage, this.pageSize, searchStr).then(res => {
        console.log(res.data)
        this.data = res.data.data.records
        this.total = res.data.data.total
      })
    },
    pageSizeChangeHandler (current) {
      this.currentPage = current
      this.getTableData()
    },
    showOrder (index) {
      console.log(this.data[index])
      queryOrderById(this.data[index].id).then(res => {
        this.isShowDialog = true
        let retJson = JSON.parse(res.data.data)
        if (retJson.data.total !== 0) {
          this.data[index].status = 1
          this.dialogContent = `<Button type="default" ghost>Default</Button>`
        } else {
          this.dialogContent = '未查询到订单'
        }
        console.log(retJson)
      })
    },
    showExpress (index) {
      console.log(this.data[index])
      if (this.data[index].status === 1) {
        queryOrderExpressById(this.data[index].id).then(res => {
          this.isShowDialog = true
          let retJson = JSON.parse(res.data.data)
          if (retJson.data.total !== 0) {
            this.orderDesc = retJson.data.list
            this.dialogContent = res.data
          } else {
            this.dialogContent = '未查询到物流'
          }
          console.log(retJson)
        })
      } else {
        this.$Message.warning('请先查询订单')
      }
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style>

</style>
