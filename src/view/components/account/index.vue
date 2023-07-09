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
        <FormItem prop="status">
          <Select v-model="formInline.currentStatus" style="width:200px" placeholder="状态">
            <Option v-for="item in statusList" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem prop="winningTime">
            <DatePicker type="date" placeholder="中签时间" v-model="formInline.winningTime"></DatePicker>
        </FormItem>
        <FormItem prop="isWin">
            <Checkbox v-model="formInline.isWin" label="中签">中签</Checkbox>
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
        <FormItem>
          <Button type="primary" @click="reLoginBatch()">批量重新登陆</Button>
        </FormItem>
      </Form>
      <div style="margin-bottom: 8px">
        <Button @click="handleSelectAll(true)">全选</Button>
        <Button @click="handleSelectAll(false)">取消全选</Button>
      </div>
      <Table ref="selection" :columns="columns" :data="data" :highlight-row="true" :scroll="{x: 1500}">
        <template #action="{ row, index }">
          <Button type="primary" size="small" style="margin-right: 5px" @click="queryOrder(row, true)">查询订单</Button>
          <Button type="success" size="small" style="margin-right: 5px" @click="queryOrderExpress(row, true)">查询物流</Button>
          <Button type="primary" size="small" style="margin-right: 5px" @click="queryAccountBookSum(row)">查询积分</Button>
          <Button type="success" size="small" style="margin-right: 5px" @click="reLoginMethod(row)" :disabled="requesting">重新登录</Button>
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
          <p>订单数量：{{ dialog.orders.length }}</p>
          <br>
          <div v-for="order in dialog.orders" :key="order.orderId">
            <p>订单ID：{{ order.orderId }}</p>
            <p>当前状态：{{ order.orderStatusName }}</p>
            <p>产品名称：{{ order.sellerName }}</p>
            <p>收货人：{{ order.receiverName }}</p>
            <p>收货手机：{{ order.receiverPhone }}</p>
            <p>创建时间：{{ order.createTime }}</p>
            <br/>
          </div>
        </div>
        <div v-show="dialog.showExpress">
          <p>订单ID：{{ dialog.express.primaryOrderId }}</p>
          <p>物流公司：{{ dialog.express.deliveryCompany }}</p>
          <p>物流单号：{{ dialog.express.deliveryId }}</p>
          <p>物流状态：{{ dialog.express.deliveryStatusName }}</p>
          <p>更新时间：{{ dialog.express.processTime }}</p>
          <p>最新流程：{{ dialog.express.processDesc }}</p>
        </div>
        <div v-show="dialog.showAccountBookSum">
          <p>积分数量：{{ dialog.account.points }}</p>
          <p>购酒卷数量：{{ dialog.account.ticketCount }}</p>
        </div>
      </div>
    </Modal>
  </div>
</template>
<script>
import { queryAccountBookSum, queryAccountPage, queryOrderById, queryOrderExpressById, reLogin } from '@/api/data'
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
        { title: '手机号', key: 'phone', width: 110 },
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
          title: '中签时间',
          key: 'winningTime',
          width: 100
        },
        { title: '备注', key: 'remark' },
        {
          title: '是否中签',
          render: (h, params) => {
            let isWin = '未中签'
            if (params.row.winningTime !== null && params.row.winningTime !== '') {
              isWin = '已中签'
            }
            return <span>{ isWin }</span>
          }
        },
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
              if (retJson.data && retJson.data.length > 0) {
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
        currentStatus: '',
        winningTime: '',
        isWin: false
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
        showAccountBookSum: false,
        orders: [],
        express: {
          deliveryCompany: '',
          primaryOrderId: '',
          deliveryStatusName: '',
          deliveryId: '',
          processDesc: '',
          originalLogisticsStatusDesc: '',
          processTime: ''
        },
        account: {
          ticketCount: '',
          points: ''
        }
      },
      requesting: false
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
      if (this.formInline.isWin) {
        searchStr += 'isWin=true'
      }
      if (this.formInline.winningTime && this.formInline.winningTime !== '') {
        let formatter = new Intl.DateTimeFormat('zh-cn', { year: 'numeric', month: '2-digit', day: '2-digit' })
        let formattedDate = formatter.format(new Date(this.formInline.winningTime))
        let winningTime = formattedDate.replaceAll('/', '-')
        searchStr += 'winning_time=' + winningTime + ';'
        console.log(winningTime)
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
      this.$Spin.show()
      let self = this
      queryOrderById(item.id).then(res => {
        this.$Spin.hide()
        console.log(res)
        if (res.data.code !== 200) {
          this.$Message.warning(res.data.data)
          return
        }
        let retJson = JSON.parse(res.data.data)
        const index = self.data.findIndex(d => d.id === parseInt(res.data.id))
        console.log(self.data[index].orderDetail)
        self.data[index].orderDetail = res.data.data
        if (retJson.code === '401') {
          self.data[index].status = -1
          this.$Message.warning(self.data[index].phone + 'token失效请重新登录')
          return
        } else if (retJson.code !== '10000') {
          this.$Message.warning(retJson.message)
          return
        }
        if (show) {
          this.dialog.isShowDialog = true
          this.dialog.title = '订单详情'
          if (retJson.data.total !== 0) {
            item.status = 1
            this.dialog.showOrder = true
            let i = 0
            while (i < retJson.data.list.length) {
              if (retJson.data.list[i].orderStatusName === '系统关闭') {
                i += 1
                continue
              }
              this.dialog.orders.push(retJson.data.list[i])
              i += 1
            }
            this.dialog.dialogContent = ''
          } else {
            item.status = 0
            this.dialog.dialogContent = '未查询到订单'
          }
        } else {
          this.$Message.success(item.phone + '查询成功')
        }
      }).catch((err) => {
        this.$Spin.hide()
        console.log(err)
        this.$Message.warning('查询失败')
      })
    },
    queryOrderBatch () {
      let selectItems = this.$refs.selection.getSelection()
      if (selectItems.length <= 0) {
        this.$Message.warning('请先选中需要查询的账号')
      }
      console.log(selectItems)
      for (const index in selectItems) {
        this.queryOrder(selectItems[index])
      }
    },
    queryExpressBatch () {
      let selectItems = this.$refs.selection.getSelection()
      if (selectItems.length <= 0) {
        this.$Message.warning('请先选中需要查询的账号')
      }
      for (const index in selectItems) {
        this.queryOrderExpress(selectItems[index])
      }
    },
    reLoginBatch () {
      let selectItems = this.$refs.selection.getSelection()
      if (selectItems.length <= 0) {
        this.$Message.warning('请先选中需要查询的账号')
      }
      try {
        for (const index in selectItems) {
          this.reLoginMethod(selectItems[index])
        }
      } catch (e) {
        console.log(e)
      }
      this.requesting = false
    },
    handleSelectAll (status) {
      this.$refs.selection.selectAll(status)
    },
    showExpress (data) {
      if (data == null || data.indexOf('订单为空') != -1) {
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
      let data = item
      let self = this
      if (data.orderDetail != null) {
        queryOrderExpressById(data.id).then(res => {
          const index = self.data.findIndex(d => d.id === parseInt(res.data.id))
          self.data[index].logisticsDetails = res.data.data
          if (show) {
            this.showExpress(res.data.data)
          } else {
            this.$Message.success('查询物流成功，已显示状态')
          }
        }).catch((err) => {
          console.log(err)
          this.$Message.warning('查询失败')
        })
      } else {
        this.$Message.warning('手机号: ' + data.phone + ' 请先查询订单数据')
      }
    },
    queryAccountBookSum (item) {
      if (item.orderDetail != null) {
        queryAccountBookSum(item.id).then(res => {
          console.log(res)
          this.dialog.isShowDialog = true
          this.dialog.title = '积分详情'
          let retJson = res.data.data
          this.dialog.showAccountBookSum = true
          this.dialog.account.points = retJson.points
          this.dialog.account.ticketCount = retJson.ticketCount
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
      let self = this
      self.$Spin.show()
      reLogin(item.id).then(res => {
        if (res.data.code === 200) {
          let returnJson = JSON.parse(res.data.data.data)
          const index = self.data.findIndex(d => d.id === parseInt(res.data.id))
          if (returnJson['status'] === 200) {
            this.$Message.info(self.data[index].phone + returnJson['msg'])
            self.data[index].status = 0
          } else {
            this.$Message.error(self.data[index].phone + '更新失败')
          }
        } else {
          this.$Message.error('发生错误')
        }
        console.log(res)
        self.$Spin.hide()
      }).catch((err) => {
        console.log(err)
        this.$Message.warning('查询失败')
        self.$Spin.hide()
      })
    },
    cancelDialog () {
      this.dialog.orders = []
      this.dialog.isShowDialog = false
      this.dialog.dialogContent = ''
      this.dialog.showExpress = false
      this.dialog.showOrder = false
      this.dialog.showAccountBookSum = false
      this.dialog.express.deliveryCompany = ''
      this.dialog.express.primaryOrderId = ''
      this.dialog.express.deliveryStatusName = ''
      this.dialog.express.deliveryId = ''
      this.dialog.express.processDesc = ''
      this.dialog.express.originalLogisticsStatusDesc = ''
      this.dialog.express.processTime = ''
      this.dialog.account.ticketCount = ''
      this.dialog.account.points = ''
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style>
.ivu-table-cell {
  white-space: normal !important;
  word-break: break-all !important;
}
.ivu-table-wrapper  {
  min-width: 1500px;
}

</style>
