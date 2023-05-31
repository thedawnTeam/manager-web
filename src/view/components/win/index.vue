<template>
  <div>
    <Card shadow>
      <p><b>huluwa用户数据</b></p>
      <br>
      <Form ref="formInline" :model="formInline"  inline>
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
        <FormItem>
          <Button type="primary" @click="handleSubmit(formInline)">搜索</Button>
        </FormItem>
      </Form>
      <Table :columns="columns" :data="data" :highlight-row="true">
      </Table>
    </Card>
  </div>
</template>
<script>
import { queryLuckyPerson } from '@/api/data'
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
        { title: 'id', key: 'id' },
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
        { title: '备注', key: 'remark' }
      ],
      data: [],
      total: 0,
      currentPage: 1,
      pageSize: 30,
      formInline: {
        phone: '',
        realName: ''
      }
    }
  },
  methods: {
    getTableData (searchStr = '') {
      console.log(1)
      if (this.formInline.phone !== '') {
        searchStr += 'phone=' + this.formInline.phone + ';'
      }
      if (this.formInline.realName !== '') {
        searchStr += 'real_name=' + this.formInline.realName + ';'
      }
      queryLuckyPerson(this.currentPage, this.pageSize, searchStr).then(res => {
        console.log(res.data)
        this.data = res.data.data
      })
    },
    pageSizeChangeHandler (current) {
      this.currentPage = current
      this.getTableData()
    },
    handleSubmit (form) {
      console.log(form)
      this.getTableData()
    }
  },
  mounted () {
    this.getTableData()
  }
}
</script>

<style>

</style>
