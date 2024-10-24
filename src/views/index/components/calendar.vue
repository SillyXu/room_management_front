<template>
  <!-- 体系管理-计划管理 -->
  <div v-loading="loading" class="plan_management">
    <div class="calendarHeader">
      <div class="header_left">
        <h1>{{ type === '3' ? '计划列表' : calendarTitle }}</h1>
      </div>
      <div class="header_right">
        <span v-if="type !== '3' && isShowBack" class="blue-color backToday" @click="getToday()">{{
          type === '1' ? '返回本月' : '返回本周'
        }}</span>
        <el-select
          v-model="type"
          placeholder="视图类型"
          style="width: 80px"
          size="small"
          class="header_select"
          @change="handleChangeType"
        >
          <el-option label="月" value="1" />
          <el-option label="周" value="2" />
          <el-option label="列" value="3" />
        </el-select>
        <el-date-picker
          v-if="type === '1'"
          v-model="showMonth"
          type="month"
          size="small"
          :clearable="false"
          placeholder="请选择日期"
          style="margin-left: 10px; vertical-align: middle"
          @change="changeDate"
        />
        <el-button-group v-if="type === '2'" style="margin-left: 10px">
          <el-button size="small" class="el-icon-arrow-left" @click="getPrev()">上一周</el-button>
          <el-button size="small" @click="getNext()">下一周<i class="el-icon-arrow-right" /></el-button>
        </el-button-group>
        <el-select
          v-model="planCategoryId"
          placeholder="计划分类"
          style="width: 120px"
          class="header_select"
          size="small"
          @change="handleChangePlanId"
        >
          <el-option label="全部" value="" />
          <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <div class="separator" />
        <el-tooltip content="类目维护" placement="top" effect="light">
          <el-button size="small" class="el-icon-setting setting_btn" @click="handleSetting()" />
        </el-tooltip>
        <el-button v-if="categoryList.length" size="small" type="primary" class="el-icon-plus" @click="handleAddPlan()">
          新增计划</el-button
        >
      </div>
    </div>
    <div v-show="type !== '3'" ref="fullcalendar" class="card" />
    <el-table
      v-show="type === '3'"
      ref="tableRef"
      v-loading="loading"
      :data="infoList"
      fit
      border
      height="auto"
      size="medium"
      class="dark-table base-table format-height-table"
    >
      <el-table-column label="标题" prop="title " :min-width="110" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="nowrap blue-color" @click="handleClickList(row)">{{ row.title || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类型" prop="planCategoryName" :min-width="100" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.planCategoryName || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="负责人/协作者" prop="managerId " :min-width="110" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.managerId || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="开始时间" prop="startDate " :minwidth="120" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.startDate }} {{ row.startDateMinute }}</span>
        </template>
      </el-table-column>
      <el-table-column label="结束时间" prop="endDate " :minwidth="120" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.endDate }} {{ row.endDateMinute }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" :width="100" fixed="right" class-name="fixed-right">
        <template #default="{ row }">
          <span v-if="categoryList.length" class="blue-color" @click="handleEdit(row)">编辑</span>
          <span class="blue-color" @click="handleDelete(row)">删除</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新建编辑日程 -->
    <DrawerAddPlan
      :drawer="drawerVisiable"
      :drawer-type="drawerType"
      :category-list="categoryAllList"
      :detail-data="detailData"
      @closeDrawer="closeDrawer"
    />
    <!-- 类目维护 -->
    <DialogCategory :dialog-show="dialogCategory" :detail-list="categoryAllList" @closeDialog="closeDialogCategory" />
    <!-- 查看计划 -->
    <DialogCalendar
      :dialog-show="dialogCalendar"
      :detail-info="detailInfo"
      :category-json="categoryJSON"
      @closeDialog="closeDialogCalendar"
    />
  </div>
</template>

<script>
import { reactive, toRefs, ref, onMounted, getCurrentInstance } from 'vue';
// 处理时间相关函数，函数已在下面列出，记得修改'@/utils/formatTime'路径
import {
  formatDateFilter,
  formatDateDay,
  formatDate,
  formatCalendar,
  formatYM,
  getWeekNumber
} from '@/utils/formatTime';
// 新增计划弹出框
import DrawerAddPlan from './calendar/drawer-add-plan.vue';
// 查看计划弹出框
import DialogCalendar from './calendar/dialog-calendar.vue';
// 下载安装的插件相关
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';

export default {
  name: 'PlanManagement',
  components: { DrawerAddPlan, DialogCalendar },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      calendarTitle: new Date().getFullYear() + '年' + Number(new Date().getMonth() + 1) + '月', // 日历头部显示文字
      dialogVisiable: false,
      showMonth: formatYM(new Date()), // 显示月份
      loading: false,
      isShowBack: false, // 是否显示回到当月或当周
      planCategoryId: '', // 计划分类Id
      type: '1',
      dialogType: '',
      detailInfo: {},
      Tcalendar: null,
      drawerVisiable: false,
      drawerType: '',
      colorJSON: {
        green: { title: '#00B578', class: 'green' },
        red: { title: '#FA5151', class: 'red' },
        orange: { title: '#FF8F1F', class: 'orange' },
        yellow: { title: '#FFC300', class: 'yellow' },
        cyan: { title: '#07B9B9', class: 'cyan' },
        blue: { title: '#3662EC', class: 'blue' },
        purple: { title: '#8A38F5', class: 'purple' },
        magenta: { title: '#EB2F96', class: 'magenta' }
      },
      fullcalendar: ref(),
      detailData: {},
      calendarList: [],
      calendarViewType: {
        1: 'dayGridMonth',
        2: 'timeGridWeek',
        3: 'listMonth'
      },
      nowDate: new Date(),
      dialogCategory: false, // 计划分类弹出窗
      dialogCalendar: false, // 计划详情弹出窗
      infoList: [], // 日历显示的列信息
      categoryJSON: {
        '1749704445988134980': {
          id: '1749704445988134980',
          name: '内审计划',
          code: '2',
          status: 1,
          color: 'orange'
        },
        '1752892951510384728': {
          id: '1752892951510384728',
          name: '设备使用计划',
          code: 'BH2',
          status: 1,
          color: 'red'
        },
        '1752893602613166115': {
          id: '1752893602613166115',
          name: '外审计划',
          code: 'BH3',
          status: 1,
          color: 'green'
        },
        '1752926256591011902': {
          id: '1752926256591011902',
          name: '纠正计划',
          code: 'BH4',
          status: 1,
          color: 'purple'
        }
      }, // 计划分类json
      categoryAllList: [
        {
          id: '1749704445988134980',
          name: '内审计划',
          code: '2',
          status: 1,
          color: 'orange'
        },
        {
          id: '1752892951510384728',
          name: '设备使用计划',
          code: 'BH2',
          status: 1,
          color: 'red'
        },
        {
          id: '1752893602613166115',
          name: '外审计划',
          code: 'BH3',
          status: 1,
          color: 'green'
        },
        {
          id: '1752926256591011902',
          name: '纠正计划',
          code: 'BH4',
          status: 1,
          color: 'purple'
        }
      ], // 全部计划分类
      categoryList: [] // 已启用计划分类
    });
    onMounted(() => {
      initCalendar();
      getCalendarList();
    });
    const initCalendar = () => {
      state.Tcalendar = new Calendar(state.fullcalendar, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        aspectRatio: 2.2,
        locale: 'zh-cn',
        handleWindowResize: true,
        editable: true, // 允许编辑表格
        droppable: true,
        eventDurationEditable: true,
        eventResizableFromStart: true,
        selectable: true, // 允许用户通过单击和拖动来突出显示多个日期或时间段
        firstDay: 1, // 设置一周中显示的第一天是哪天，周日是0，周一是1，类推。
        unselectAuto: true, // 当点击页面日历以外的位置时，是否自动取消当前的选中状态
        unselectCancel: '.el-drawer',
        dayMaxEvents: true,
        // eventLimit: true,
        headerToolbar: false,
        buttonText: {
          today: '回到今天',
          month: '月',
          week: '周',
          list: '列',
          day: '日'
        },
        allDayText: '全天',
        events: state.infoList,
        eventClassNames: function (arg) {
          // 添加自定义class
          return [arg.event.extendedProps.class];
        },
        eventContent: function (arg) {
          const italicEl = document.createElement('div');
          if (arg.event.extendedProps.startDateMinute) {
            const childEl = document.createElement('span');
            childEl.innerHTML = arg.event.extendedProps.startDateMinute;
            italicEl.append(childEl);
          }
          italicEl.append(arg.event.title);
          italicEl.setAttribute('class', `plan_title ${arg.event.extendedProps.class}`);
          return { domNodes: [italicEl] };
        },
        eventDrop: function (info) {
          // 拖拽停止时触发
          handleDrap(info);
        },
        eventClick: function (info) {
          // 点击查看时触发
          handleClick(info);
        },
        select: function (info) {
          // 视图选择日期触发
          handleSelectDate(info);
        },
        eventResize: function (info) {
          handleEventResize(info);
        }
      });
      state.Tcalendar.render();
    };
    // 上一月、周、日
    const getPrev = () => {
      state.Tcalendar.prev();
      state.calendarTitle = state.Tcalendar.view.title;
      const nowDate = formatDateFilter(state.calendarTitle);
      // 判断已经是当前周隐藏返回当前周按钮
      if (
        getWeekNumber(nowDate) === getWeekNumber(new Date()) &&
        new Date(nowDate).getFullYear() === new Date().getFullYear()
      ) {
        state.isShowBack = false;
      } else {
        state.isShowBack = true;
      }
      getCalendarList();
    };
    // 下一月、周、日
    const getNext = () => {
      state.Tcalendar.next();
      state.calendarTitle = state.Tcalendar.view.title;
      const nowDate = formatDateFilter(state.calendarTitle);
      // 判断已经是当前周隐藏返回当前周按钮
      if (
        getWeekNumber(nowDate) === getWeekNumber(new Date()) &&
        new Date(nowDate).getFullYear() === new Date().getFullYear()
      ) {
        state.isShowBack = false;
      } else {
        state.isShowBack = true;
      }
      getCalendarList();
    };
    // 回到今天
    const getToday = () => {
      state.Tcalendar.today();
      state.calendarTitle = state.Tcalendar.view.title;
      state.isShowBack = false;
      state.showMonth = formatYM(new Date());
      getCalendarList();
    };

    const handleSetting = () => {
      state.dialogCategory = true;
    };
    const getCalendarList = () => {
      state.Tcalendar.getEventSources().forEach(item => {
        item.remove();
      });
      // 根据你的接口获取日历中的计划信息，这里为了展示直接把数据展示出来
      // 其中class字段是为了和colorJSON做匹配方便知道显示什么颜色
      state.infoList = [
        {
          id: '1843904335660290114',
          planCategoryId: '1749704445988134980',
          planCategoryName: '内审计划',
          planCategoryColor: '',
          title: '123',
          status: '',
          fileIdList: [],
          managerId: '1526076003284926557',
          startDate: '2024-10-16',
          startDateMinute: '',
          endDate: '2024-10-17',
          endDateMinute: '',
          isAllDay: 1,
          description: '',
          attachmentVoList: [],
          createBy: '1526076003284926557',
          createTime: '2024-10-09T06:40:26.000+00:00',
          class: 'orange',
          start: '2024-10-16',
          end: '2024-10-18'
        },
        {
          id: '1843904335660290114',
          planCategoryId: '1749704445988134980',
          planCategoryName: '内审计划',
          planCategoryColor: '',
          title: '123',
          status: '',
          fileIdList: [],
          managerId: '1526076003284926557',
          startDate: '2024-10-16',
          startDateMinute: '',
          endDate: '2024-10-17',
          endDateMinute: '',
          isAllDay: 1,
          description: '',
          attachmentVoList: [],
          createBy: '1526076003284926557',
          createTime: '2024-10-09T06:40:26.000+00:00',
          class: 'orange',
          start: '2024-10-16',
          end: '2024-10-18'
        },
        {
          id: '1843904335660290114',
          planCategoryId: '1749704445988134980',
          planCategoryName: '内审计划',
          planCategoryColor: '',
          title: '123',
          status: '',
          fileIdList: [],
          managerId: '1526076003284926557',
          startDate: '2024-10-16',
          startDateMinute: '',
          endDate: '2024-10-17',
          endDateMinute: '',
          isAllDay: 1,
          description: '',
          attachmentVoList: [],
          createBy: '1526076003284926557',
          createTime: '2024-10-09T06:40:26.000+00:00',
          class: 'orange',
          start: '2024-10-16',
          end: '2024-10-18'
        },
        {
          id: '1843904335660290114',
          planCategoryId: '1749704445988134980',
          planCategoryName: '内审计划',
          planCategoryColor: '',
          title: '123',
          status: '',
          fileIdList: [],
          managerId: '1526076003284926557',
          startDate: '2024-10-16',
          startDateMinute: '',
          endDate: '2024-10-17',
          endDateMinute: '',
          isAllDay: 1,
          description: '',
          attachmentVoList: [],
          createBy: '1526076003284926557',
          createTime: '2024-10-09T06:40:26.000+00:00',
          class: 'orange',
          start: '2024-10-16',
          end: '2024-10-22'
        },
        {
          id: '1843904335660290114',
          planCategoryId: '1749704445988134980',
          planCategoryName: '内审计划',
          planCategoryColor: '',
          title: '123',
          status: '',
          fileIdList: [],
          managerId: '1526076003284926557',
          startDate: '2024-10-16',
          startDateMinute: '',
          endDate: '2024-10-17',
          endDateMinute: '',
          isAllDay: 1,
          description: '',
          attachmentVoList: [],
          createBy: '1526076003284926557',
          createTime: '2024-10-09T06:40:26.000+00:00',
          class: 'orange',
          start: '2024-10-16',
          end: '2024-10-22'
        },
        {
          id: '1843904335660290114',
          planCategoryId: '1749704445988134980',
          planCategoryName: '内审计划',
          planCategoryColor: '',
          title: '123',
          status: '',
          fileIdList: [],
          managerId: '1526076003284926557',
          startDate: '2024-10-16',
          startDateMinute: '',
          endDate: '2024-10-17',
          endDateMinute: '',
          isAllDay: 1,
          description: '',
          attachmentVoList: [],
          createBy: '1526076003284926557',
          createTime: '2024-10-09T06:40:26.000+00:00',
          class: 'orange',
          start: '2024-10-16',
          end: '2024-10-22'
        }
      ];
      state.Tcalendar.addEventSource(state.infoList);
    };
    // 点击计划查看
    const handleClick = info => {
      // const detail = info.event._def;
      state.detailInfo = {
        id: '1843904335660290114',
        planCategoryId: '1749704445988134980',
        planCategoryName: '内审计划',
        planCategoryColor: '',
        title: '123',
        status: '',
        fileIdList: [],
        managerId: '1526076003284926557',
        startDate: '2024-10-16',
        startDateMinute: '',
        endDate: '2024-10-17',
        endDateMinute: '',
        isAllDay: 1,
        description: '',
        attachmentVoList: [],
        createBy: '1526076003284926557',
        createTime: '2024-10-09T06:40:26.000+00:00'
      };
      state.dialogCalendar = true;
      // 接口查看详情但为了方便展示变量值直接写出来
      // plandetailId(detail.publicId).then(res => {
      //   if (res) {
      //     state.detailInfo = res.data.data;
      //     console.log(res.data.data);
      //     state.dialogCalendar = true;
      //   }
      // });
    };
    // 列视图点击查看
    const handleClickList = row => {
      // plandetailId(row.id).then(res => {
      //   if (res) {
      //     state.detailInfo = res.data.data;
      //     state.dialogCalendar = true;
      //   }
      // });
    };
    // 删除
    const handleDelete = row => {
      proxy
        .$confirm('是否确认删除', '删除确认', {
          confirmButtonText: '确认删除',
          cancelButtonText: '取消',
          showCancelButton: true,
          closeOnClickModal: false,
          type: 'warning'
        })
        .then(() => {
          // 删除计划的接口
          // deletePlanDetail(row.id).then(function (res) {
          //   if (res) {
          //     proxy.$message.success('删除成功！');
          //     getCalendarList();
          //   }
          // });
        })
        .catch(() => {});
    };
    // 编辑
    const handleEdit = row => {
      state.loading = true;
      // plandetailId(row.id).then(res => {
      //   state.loading = false;
      //   if (res) {
      //     state.detailData = res.data.data;
      //     state.drawerType = 'edit';
      //     state.drawerVisiable = true;
      //   }
      // });
    };
    const closeDialog = () => {
      state.dialogVisiable = false;
    };
    const closeDialogCategory = val => {
      state.dialogCategory = false;
    };
    const closeDialogCalendar = val => {
      state.dialogCalendar = false;
      if (val?.isRefresh) {
        getCalendarList();
      }
      if (val?.isEdit) {
        // 编辑计量计划
        state.detailData = val.info;
        state.drawerType = 'edit';
        state.drawerVisiable = true;
      }
    };
    const closeDrawer = val => {
      state.drawerVisiable = false;
      if (val) {
        getCalendarList();
      }
    };
    // 切换视图类型
    const handleChangeType = val => {
      if (val === '1') {
        state.Tcalendar.changeView('dayGridMonth');
        state.showMonth = formatYM(new Date());
      } else if (val === '2') {
        state.Tcalendar.changeView('timeGridWeek');
      } else {
        state.Tcalendar.changeView('listMonth');
      }
      state.isShowBack = false;
      state.calendarTitle = state.Tcalendar.view.title;
      getToday();
    };
    // 切换类型
    const handleChangePlanId = () => {
      getCalendarList();
    };
    // 新增计划
    const handleAddPlan = () => {
      state.drawerVisiable = true;
      state.drawerType = 'add';
      state.detailData = {
        managerIds: 'managerIds', // 当前登录人的id,为了方便后续实现只有创建人才可以修改的限制
        fileList: [],
        isAllDay: 0,
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
        startDateMinute: new Date().getHours() < 23 ? new Date().getHours() + 1 + ':00' : '23:00',
        endDateMinute: new Date().getHours() < 22 ? new Date().getHours() + 2 + ':00' : '23:00'
      };
    };
    // 拖拽计划时触发
    const handleDrap = info => {
      const params = { ...info.event.extendedProps, id: info.event.id };
      params.startDate = formatCalendar(info.event.start);
      if (info.event.allDay) {
        // 全天
        params.startDateMinute = '';
        params.endDateMinute = '';
        params.isAllDay = 1;
        params.endDate = info.event.end
          ? formatCalendar(new Date(info.event.end).getTime() - 24 * 3600 * 1000)
          : formatCalendar(info.event.start);
      } else {
        // 非全天
        params.startDateMinute = formatCalendar(info.event.start, 'hour');
        params.endDateMinute = formatCalendar(new Date(info.event.end), 'hour');
        params.endDate = info.event.end ? formatCalendar(new Date(info.event.end)) : formatCalendar(info.event.start);
        params.isAllDay = 0;
      }
      // 拖拽编辑计划的接口
      console.log(params);
      // params = {
      //   planCategoryId: '1749704445988134980',
      //   planCategoryName: '内审计划',
      //   planCategoryColor: '',
      //   status: '',
      //   fileIdList: [],
      //   managerId: '1526076003284926557',
      //   startDate: '2024-10-09',
      //   startDateMinute: '',
      //   endDate: '2024-10-10',
      //   endDateMinute: '',
      //   isAllDay: 1,
      //   description: '',
      //   attachmentVoList: [],
      //   createBy: '1526076003284926557',
      //   createTime: '2024-10-09T06:40:26.000+00:00',
      //   class: 'orange',
      //   id: '1843904335660290114'
      // };
      // state.loading = true;
      // savePlanDetail(params).then(res => {
      //   state.loading = false;
      //   if (res) {
      //     proxy.$message.success('修改成功！');
      //     getCalendarList();
      //   }
      // });
    };
    // 调整大小时触发
    const handleEventResize = info => {
      const params = { ...info.event.extendedProps, id: info.event.id };
      params.startDate = formatCalendar(info.event.start);
      if (info.event.allDay) {
        // 全天
        params.startDateMinute = '';
        params.endDateMinute = '';
        params.isAllDay = 1;
        params.endDate = info.event.end
          ? formatCalendar(new Date(info.event.end).getTime() - 24 * 3600 * 1000)
          : formatCalendar(info.event.start);
      } else {
        // 非全天
        params.startDateMinute = formatCalendar(info.event.start, 'hour');
        params.endDateMinute = formatCalendar(new Date(info.event.end), 'hour');
        params.endDate = info.event.end ? formatCalendar(new Date(info.event.end)) : formatCalendar(info.event.start);
        params.isAllDay = 0;
      }
      console.log(params);
      // params = {
      //   planCategoryId: '1749704445988134980',
      //   planCategoryName: '内审计划',
      //   planCategoryColor: '',
      //   status: '',
      //   fileIdList: [],
      //   managerId: '1526076003284926557',
      //   startDate: '2024-10-16',
      //   startDateMinute: '',
      //   endDate: '2024-10-18',
      //   endDateMinute: '',
      //   isAllDay: 1,
      //   description: '',
      //   attachmentVoList: [],
      //   createBy: '1526076003284926557',
      //   createTime: '2024-10-09T06:40:26.000+00:00',
      //   class: 'orange',
      //   id: '1843904335660290114'
      // };
      // 调整计划大小触发的接口
      // savePlanDetail(params).then(res => {
      //   if (res) {
      //     proxy.$message.success('修改成功！');
      //     getCalendarList();
      //   }
      // });
    };
    // 拖拽触发
    const handleSelectDate = info => {
      if (info.view.type === 'timeGridWeek') {
        // 周视图
        if (info.allDay) {
          state.detailData = {
            startDate: formatCalendar(info.startStr),
            endDate: formatCalendar(new Date(info.endStr).getTime() - 24 * 3600 * 1000),
            managerIds: 'managerIds', // 当前系统登陆人的id，业务场景只有创建人才可以编辑计划，其他人均只能查看
            fileList: [],
            startDateMinute: '',
            endDateMinute: '',
            isAllDay: 1
          };
        } else {
          state.detailData = {
            startDate: formatCalendar(info.startStr),
            endDate: formatCalendar(info.endStr),
            managerIds: 'managerIds', // 当前系统登陆人的id，业务场景只有创建人才可以编辑计划，其他人均只能查看
            fileList: [],
            startDateMinute: formatCalendar(info.startStr, 'hour'),
            endDateMinute: formatCalendar(info.endStr, 'hour'),
            isAllDay: 0
          };
        }
      } else {
        // 月视图
        if (info.startStr === formatDate(new Date(info.endStr).getTime() - 24 * 3600 * 1000)) {
          // 只选择一天，默认非全天
          state.detailData = {
            startDate: info.startStr,
            endDate: formatDate(new Date(info.endStr).getTime() - 24 * 3600 * 1000),
            managerIds: 'managerIds', // 当前系统登陆人的id，业务场景只有创建人才可以编辑计划，其他人均只能查看
            fileList: [],
            startDateMinute: new Date().getHours() < 23 ? new Date().getHours() + 1 + ':00' : '23:00',
            endDateMinute: new Date().getHours() < 22 ? new Date().getHours() + 2 + ':00' : '23:00',
            isAllDay: 0
          };
        } else {
          // 跨天，默认全天
          state.detailData = {
            startDate: info.startStr,
            endDate: formatDate(new Date(info.endStr).getTime() - 24 * 3600 * 1000),
            managerIds: 'managerIds', // 当前系统登陆人的id，业务场景只有创建人才可以编辑计划，其他人均只能查看
            fileList: [],
            startDateMinute: '',
            endDateMinute: '',
            isAllDay: 1
          };
        }
      }
      state.drawerVisiable = true;
      state.drawerType = 'add';
    };
    // 切换月份和日期
    const changeDate = date => {
      state.Tcalendar.gotoDate(formatDate(date));
      // 判断不是当前月份，显示返回当前月
      if (date.getMonth() !== new Date().getMonth() || new Date().getFullYear() !== new Date(date).getFullYear()) {
        state.isShowBack = true;
      } else {
        state.isShowBack = false;
      }
      state.calendarTitle = state.Tcalendar.view.title;
      getCalendarList();
    };
    return {
      ...toRefs(state),
      formatDateFilter,
      changeDate,
      getPrev,
      handleDrap,
      handleAddPlan,
      handleClickList,
      handleDelete,
      handleEdit,
      handleEventResize,
      handleChangePlanId,
      getNext,
      getToday,
      closeDrawer,
      getCalendarList,
      handleSetting,
      handleChangeType,
      closeDialog,
      handleClick,
      closeDialogCategory,
      closeDialogCalendar,
      handleSelectDate,
      formatDateDay,
      formatDate
    };
  }
};
</script>
<style lang="scss" scoped>
.plan_management {
  background-color: #fff;
  margin: 20px;
  padding: 20px;
}
.calendarHeader {
  margin: 0 0 20px 0;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  .header_select {
    margin: 0 0 0 10px;
    display: inline-block;
    vertical-align: middle;
  }
  .separator {
    display: inline-block;
    position: relative;
    margin: 0 12px;
    &:after {
      content: '';
      position: absolute;
      top: -16px;
      left: 0;
      height: 24px;
      width: 1px;
      background: #dcdfe6;
    }
  }
}
h1 {
  font-size: 20px;
  font-weight: 500;
  line-height: 32px;
  margin: 0 0 0 0;
  text-align: left;
  vertical-align: middle;
  display: inline-block;
  color: #303133;
}
// .el-button-group {
//   vertical-align: top;
// }
</style>
<style lang="scss" scoped>
@import './calendar/fullcalendar.scss';
</style>

