<template>
  <div>
    <Card>
      <tables highlight-row ref="tables" editable searchable search-place="top" v-model="tableData" :columns="columns"
              @on-delete="handleDelete"/>
      <Button style="margin: 10px 0;" type="primary" @click="exportExcel">导出为Csv文件</Button>
    </Card>
  </div>
</template>

<script>
import Tables from '_c/tables'
import { getTableData } from '@/api/data'
export default {
  name: 'tables_page',
  components: {
    Tables
  },
  data () {
    return {
      columns: [
        { title: 'id', key: 'id', sortable: true },
        { title: '手机号', key: 'phone' },
        { title: '创建时间', key: 'created_at', editable: true },
        { title: 'token', key: 'token', editable: true },
        { title: 'real_name', key: 'real_name', editable: true },
        { title: 'status', key: 'status', editable: true },
        {
          title: 'Handle',
          key: 'handle',
          options: ['delete'],
          button: [
            (h, params, vm) => {
              return h('Poptip', {
                props: {
                  confirm: true,
                  title: '你确定要删除吗?'
                },
                on: {
                  'on-ok': () => {
                    vm.$emit('on-delete', params)
                    vm.$emit('input', params.tableData.filter((item, index) => index !== params.row.initRowIndex))
                  }
                }
              }, [
                h('Button', '自定义删除')
              ])
            }
          ]
        }
      ],
      tableData: []
    }
  },
  methods: {
    handleDelete (params) {
      console.log(params)
    },
    exportExcel () {
      this.$refs.tables.exportCsv({
        filename: `table-${(new Date()).valueOf()}.csv`
      })
    },
    handleClearCurrentRow () {
      this.$refs.currentRowTable.clearCurrentRow()
    }
  },
  mounted () {
    getTableData().then(res => {
      console.log(res.data)
      this.tableData = res.data.data.records
    })
  }
}
</script>

<style>

</style>
