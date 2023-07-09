<template>
  <div>
    <Card shadow>
      <p><b>huluwa用户数据</b></p>
      <br>
      <Form ref="formInline" :model="formInline" inline>
        <FormItem>
          <FormItem prop="winningTime">
            <DatePicker type="date" placeholder="中签时间" v-model="formInline.winningTime"></DatePicker>
          </FormItem>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="getTableData()">搜索</Button>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="handleExport">导出数据</Button>
        </FormItem>
        <FormItem>
          <Button type="primary" @click="reLoginAll()">更新所有token</Button>
        </FormItem>
      </Form>
      <div style="margin-bottom: 8px">
        <Button @click="handleSelectAll(true)">全选</Button>
        <Button @click="handleSelectAll(false)">取消全选</Button>
      </div>
      <Table ref="selection" :columns="columns" :data="data" :highlight-row="true" :scroll="{x: 1500}">
      </Table>
      <Page :total="total" :page-size="pageSize" :current="currentPage" @on-change="pageSizeChangeHandler" show-elevator show-total/>
    </Card>
  </div>
</template>
<script>
import { queryAccountPage, queryExportAccount, reLoginAll } from '@/api/data'
import { Table, Page } from 'iview'

export default {
  name: 'win',
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
        { title: '手机号', key: 'phone' },
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
          title: '中签时间',
          key: 'winningTime'
        },
        {
          title: '更新时间',
          key: 'updatedAt',
          width: 150,
          render: function (h, params) {
            return <span>{ new Date(params.row.updatedAt).toLocaleDateString() + ' ' + new Date(params.row.updatedAt).toLocaleTimeString() }</span>
          }
        },
        {
          title: '订单号',
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
          title: '物流单号',
          key: 'logisticsDetails',
          render: (h, params) => {
            let text = '无物流消息'
            if (params.row.logisticsDetails != null) {
              let retJson = JSON.parse(params.row.logisticsDetails)
              if (retJson.data.length > 0) {
                text = retJson.data[0][0].deliveryId
              } else {
                text = ''
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
        { title: '备注', key: 'remark' }
      ],
      data: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      formInline: {
        winningTime: ''
      },
      requesting: false
    }
  },
  methods: {
    getTableData (searchStr = '') {
      if (this.formInline.winningTime && this.formInline.winningTime !== '') {
        let formatter = new Intl.DateTimeFormat('zh-cn', { year: 'numeric', month: '2-digit', day: '2-digit' })
        let formattedDate = formatter.format(new Date(this.formInline.winningTime))
        let winningTime = formattedDate.replaceAll('/', '-')
        searchStr += 'winning_time=' + winningTime + ';'
        console.log(winningTime)
      }
      searchStr += 'isWin=true;'
      queryAccountPage(this.currentPage, this.pageSize, searchStr).then(res => {
        this.data = res.data.data.records
        this.total = res.data.data.total
      })
    },
    pageSizeChangeHandler (current) {
      this.currentPage = current
      this.getTableData()
    },
    reLoginAll () {
      reLoginAll().then(res => {
        this.$Message.success(res.data.data)
      })
    },
    handleSelectAll (status) {
      this.$refs.selection.selectAll(status)
    },
    handleExport () {
      let winningTime = null
      if (this.formInline.winningTime && this.formInline.winningTime !== '') {
        let formatter = new Intl.DateTimeFormat('zh-cn', { year: 'numeric', month: '2-digit', day: '2-digit' })
        let formattedDate = formatter.format(new Date(this.formInline.winningTime))
        winningTime = formattedDate.replaceAll('/', '-')
        console.log(winningTime)
      }

      queryExportAccount(winningTime).then(res => {
        console.log(res)
        const blob = new Blob([res.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
        const downloadUrl = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = '中签数据.xlsx' // 设置文件名
        link.click()
        URL.revokeObjectURL(downloadUrl)
      }).catch(error => {
        console.error('下载文件失败', error)
      })
    },
    convertToCSV (data) {
      const headers = ['手机号', '姓名', '身份证', '快递公司', '收件人地址', '物流编号', '原始物流状态描述', '处理描述', '处理时间', '物品标题']
      const headers2 = Object.keys(data[0])
      const rows = data.map(obj => headers2.map(header => obj[header]))

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')

      return csvContent
    },
    downloadCSV (csvContent, filename) {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      if (navigator.msSaveBlob) {
        // For IE 10+
        navigator.msSaveBlob(blob, filename)
      } else {
        const link = document.createElement('a')
        if (link.download !== undefined) {
          // Browsers that support HTML5 download attribute
          const url = URL.createObjectURL(blob)
          link.setAttribute('href', url)
          link.setAttribute('download', filename)
          link.style.visibility = 'hidden'
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        }
      }
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
.ivu-table-cell {
  white-space: normal !important;
  word-break: break-all !important;
}
.content-wrapper  {
  min-width: 1500px;
}
</style>
