<template>
  <div>
    <Card shadow title="社区">
      <row class="join-page" :gutter="32">
        <i-col span="10">
          <row type="flex" justify="center">
            <i-col span="12">
              <p>QQ：318341362</p>
            </i-col>
            <i-col span="12"></i-col>
          </row>
        </i-col>
      </row>
    </Card>
  </div>
</template>

<script>
export default {
  name: 'join_page',
  data () {
    return {
    }
  }
}
</script>
<style>
  .join-page{
    text-align: center;
  }
  .qq-group-img{
    width: 100%;
  }
  .join-page-other .ivu-btn{
    margin-right: 6px;
  }
</style>
