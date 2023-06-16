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
        <FormItem>
          <Button type="primary" @click="queryOrderBatch()">批量查询订单</Button>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="queryExpressBatch()">批量查询物流</Button>
        </FormItem>
      </Form>
      <div style="margin-bottom: 8px">
        <Button @click="handleSelectAll(true)">全选</Button>
        <Button @click="handleSelectAll(false)">取消全选</Button>
      </div>
      <Table ref="selection" :columns="columns" :data="data" :highlight-row="true">
        <template #action="{ row, index }">
          <Button type="primary" size="small" style="margin-right: 5px" @click="queryOrder(row, true)">查询订单</Button>
          <Button type="success" size="small" style="margin-right: 5px" @click="queryOrderExpress(row, true)">查询物流</Button>
          <Button type="primary" size="small" style="margin-right: 5px" @click="showExpress(row.logisticsDetails)">显示物流</Button>
          <Button type="success" size="small" style="margin-right: 5px" @click="reLoginMethod(row)">重新登录</Button>
        </template>
      </Table>
      <Page :total="total" :page-size="pageSize" :current="currentPage" @on-change="pageSizeChangeHandler" show-elevator show-total/>
    </Card>

    <Modal
      v-model="dialog.isShowDialog"
      :title="dialog.title"
      @on-cancel="cancelDialog">
      <div>
        <h3>{{ dialog.dialogContent}}</h3>
        <div v-show="dialog.showOrder">
          <p>订单数量：{{ dialog.order.total }}</p>
          <p>订单ID：{{ dialog.order.orderId }}</p>
          <p>当前状态：{{ dialog.order.statusName }}</p>
          <p>产品名称：{{ dialog.order.sellerName }}</p>
          <p>收货人：{{ dialog.order.receiverName }}</p>
          <p>收货手机：{{ dialog.order.receiverPhone }}</p>
        </div>
        <div v-show="dialog.showExpress">
          <p>订单ID：{{ dialog.express.primaryOrderId }}</p>
          <p>物流公司：{{ dialog.express.deliveryCompany }}</p>
          <p>物流单号：{{ dialog.express.deliveryId }}</p>
          <p>物流状态：{{ dialog.express.deliveryStatusName }}</p>
          <p>更新时间：{{ dialog.express.processTime }}</p>
          <p>最新流程：{{ dialog.express.processDesc }}</p>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
import { queryAccountPage, queryOrderById, queryOrderExpressById, reLogin } from '@/api/data'
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
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        { title: 'id', key: 'id', width: 80 },
        { title: '手机号', key: 'phone' },
        {
          title: '创建时间',
          key: 'createdAt',
          width: 150,
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
            let channelText = ''
            switch (params.row.channelId) {
              case 2:
                channelText = '空港乐购'
                break
              case 3:
                channelText = '贵盐黔品'
                break
              case 4:
                channelText = '乐旅商城'
                break
              case 5:
                channelText = '遵航出山'
                break
              case 6:
                channelText = '航旅黔购'
                break
              case 7:
                channelText = '贵旅优品'
                break
              case 8:
                channelText = '新联惠购'
                break
            }
            return <span>{ channelText }</span>
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
        {
          title: '预约时间',
          key: 'appointmentTime'
        },
        { title: '备注', key: 'remark' },
        {
          title: '订单消息',
          key: 'orderDetail',
          width: 150,
          render: (h, params) => {
            let text = '无订单消息'
            if (params.row.orderDetail != null) {
              let retJson = JSON.parse(params.row.orderDetail)
              if (retJson.code === '10000' && retJson.data.list.length > 0) {
                text = retJson.data.list[0].orderId
              }
            }
            return <span>{text}</span>
          }
        },
        {
          title: '物流消息',
          key: 'logisticsDetails',
          render: (h, params) => {
            let text = '无物流消息'
            if (params.row.logisticsDetails != null) {
              let retJson = JSON.parse(params.row.logisticsDetails)
              if (retJson.data.length > 0) {
                text = retJson.data[0][0].deliveryStatusName
              } else {
                text = '待发货'
              }
            }
            return <span>{text}</span>
          }
        },
        { title: '操作', slot: 'action', width: 350 }
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
      dialog: {
        isShowDialog: false, // 是否显示弹出框
        title: '弹出框',
        dialogContent: '',
        showOrder: false,
        showExpress: false,
        order: {
          total: '',
          orderId: '',
          statusName: '',
          sellerName: '',
          receiverName: '',
          receiverPhone: ''
        },
        express: {
          deliveryCompany: '',
          primaryOrderId: '',
          deliveryStatusName: '',
          deliveryId: '',
          processDesc: '',
          originalLogisticsStatusDesc: '',
          processTime: ''
        }
      }
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
        this.data = res.data.data.records
        this.total = res.data.data.total
      })
    },
    pageSizeChangeHandler (current) {
      this.currentPage = current
      this.getTableData()
    },
    queryOrder (item, show = false) {
      queryOrderById(item.id).then(res => {
        if (res.data.code !== 200) {
          this.$Message.warning(res.data.data)
          return
        }
        if (show) {
          let retJson = JSON.parse(res.data.data)
          if (retJson.code !== '10000') {
            this.$Message.warning(retJson.message)
            return
          }
          item.orderDetail = res.data.data
          this.dialog.isShowDialog = true
          this.dialog.title = '订单详情'
          if (retJson.data.total !== 0) {
            item.status = 1
            this.dialog.showOrder = true
            let list = retJson.data.list[0]
            this.dialog.dialogContent = ''
            this.dialog.order.total = retJson.data.total
            this.dialog.order.orderId = list.orderId
            this.dialog.order.statusName = list.orderStatusName
            this.dialog.order.sellerName = list.sellerName
            this.dialog.order.receiverName = list.receiverName
            this.dialog.order.receiverPhone = list.receiverPhone
            console.log(this.dialog)
          } else {
            item.status = 0
            this.dialog.dialogContent = '未查询到订单'
            this.getTableData()
          }
        }
      }).catch((err) => {
        console.log(err)
        this.$Message.warning('查询失败')
      })
    },
    queryOrderBatch () {
      let selectItems = this.$refs.selection.getSelection()
      console.log(selectItems)
      for (const item in selectItems) {
        this.queryOrder(selectItems[item])
      }
    },
    queryExpressBatch () {
      let selectItems = this.$refs.selection.getSelection()
      for (const item in selectItems) {
        this.queryOrderExpress(selectItems[item])
      }
    },
    handleSelectAll (status) {
      this.$refs.selection.selectAll(status)
    },
    showExpress (data) {
      if (data == null) {
        this.$Message.warning('无物流消息')
        return
      }
      this.dialog.isShowDialog = true
      this.dialog.title = '物流详情'
      let retJson = JSON.parse(data)
      if (!retJson.data.length > 0) {
        this.dialog.dialogContent = '待发货'
        return
      }
      let list = retJson.data[0][0]
      this.dialog.showExpress = true
      this.dialog.express.primaryOrderId = list.primaryOrderId
      this.dialog.express.deliveryCompany = list.deliveryCompany
      this.dialog.express.deliveryId = list.deliveryId
      this.dialog.express.deliveryStatusName = list.deliveryStatusName
      this.dialog.express.processDesc = list.logisticsAttr.processDesc
      this.dialog.express.processTime = list.logisticsAttr.processTime
    },
    queryOrderExpress (item, show = false) {
      console.log(item)
      let data = item
      if (data.status === 1 && data.orderDetail != null) {
        queryOrderExpressById(data.id).then(res => {
          data.logisticsDetails = res.data.data
          if (show) {
            this.showExpress(res.data.data)
          }
        }).catch((err) => {
          console.log(err)
          this.$Message.warning('查询失败')
        })
      } else {
        this.$Message.warning('手机号: ' + data.phone + ' 请先查询订单数据')
      }
    },
    reLoginMethod (item) {
      if (item.status !== -1) {
        this.$Message.warning('此账号无需重新登陆')
        return
      }
      reLogin(item.id).then(res => {
        console.log(res)
      })
    },
    cancelDialog () {
      this.dialog.isShowDialog = false
      this.dialog.dialogContent = ''
      this.dialog.showExpress = false
      this.dialog.showOrder = false
      this.dialog.order.total = ''
      this.dialog.order.orderId = ''
      this.dialog.order.statusName = ''
      this.dialog.order.sellerName = ''
      this.dialog.order.receiverName = ''
      this.dialog.order.receiverPhone = ''
      this.dialog.express.deliveryCompany = ''
      this.dialog.express.primaryOrderId = ''
      this.dialog.express.deliveryStatusName = ''
      this.dialog.express.deliveryId = ''
      this.dialog.express.processDesc = ''
      this.dialog.express.originalLogisticsStatusDesc = ''
      this.dialog.express.processTime = ''
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style>

</style>
