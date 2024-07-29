<template>
  <div class="list-container">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="id" label="ID" width="80"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'active' ? 'success' : 'danger'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" type="primary" @click="editRow(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteRow(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="currentPage"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'List',
  data() {
    return {
      tableData: [],
      currentPage: 1,
      pageSize: 10,
      total: 0,
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData(page = 1, size = this.pageSize) {
      axios.get('https://api.example.com/data', {
        params: {
          page,
          size,
        },
      })
      .then(response => {
        this.tableData = response.data.items;
        this.total = response.data.total;
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    },
    editRow(row) {
      // 编辑行的逻辑
      console.log('Editing row:', row);
    },
    deleteRow(row) {
      // 删除行的逻辑
      console.log('Deleting row:', row);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.fetchData(this.currentPage, val);
    },
    handleCurrentChange(val) {
      this.currentPage = val;
      this.fetchData(val, this.pageSize);
    },
  },
};
</script>

<style scoped>
.list-container {
  padding: 20px;
}
</style>