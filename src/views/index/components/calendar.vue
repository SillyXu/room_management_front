<template>
  <!-- 体系管理-计划管理 -->
  <div v-loading="loading" class="plan_management">
    <div class="calendarHeader">
      <div class="header_left">
        <h1>{{ calendarTitle }}</h1>
      </div>
      <div class="header_right">
        <span v-if="type !== '3' && isShowBack" class="blue-color backToday" @click="getToday()">{{
          type === '1' ? '返回本月' : '返回本周'
        }}</span>
        <el-select v-model="type" placeholder="视图类型" style="width: 80px" size="small" class="header_select"
          @change="handleChangeType">
          <el-option label="月" value="1" />
          <el-option label="周" value="2" />
          <el-option label="列" value="3" />
        </el-select>
        <el-date-picker v-if="type === '1'" v-model="showMonth" type="month" size="small" :clearable="false"
          placeholder="请选择日期" style="margin-left: 10px; vertical-align: middle" @change="changeDate" />
        <el-button-group v-if="type === '2'" style="margin-left: 10px">
          <el-button size="small" class="el-icon-arrow-left" @click="getPrev()">上一周</el-button>
          <el-button size="small" @click="getNext()">下一周<i class="el-icon-arrow-right" /></el-button>
        </el-button-group>

      </div>
    </div>
    <div v-show="type !== '3'" ref="fullcalendar" class="card" />
    <el-table v-show="type === '3'" ref="tableRef" v-loading="loading" :data="infoList" fit border height="auto"
      size="medium" class="dark-table base-table format-height-table">
      <el-table-column label="房号" prop="room_number" :min-width="110" show-overflow-tooltip>
        <template #default="{ row }">
          <span class="nowrap blue-color" @click="handleClickList(row)">{{ row.room_number || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="出差类型" prop="reason" :min-width="100" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.reason || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="员工名" prop="occupant_name" :min-width="110" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.occupant_name || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="员工ID" prop="employee_id" :min-width="110" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.employee_id || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="入住时间" prop="checkin_date" :minwidth="120" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.checkin_date }}</span>
        </template>
      </el-table-column>
      <el-table-column label="离开时间" prop="checkout_date" :minwidth="120" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.checkout_date }}</span>
        </template>
      </el-table-column>
    </el-table>
    <!-- 新建编辑日程 -->
    <DrawerAddPlan :drawer="drawerVisiable" :drawer-type="drawerType" :detail-data="detailData"
      @closeDrawer="closeDrawer" />
    <!-- 类目维护 -->
    <DialogCategory :dialog-show="dialogCategory" @closeDialog="closeDialogCategory" />
    <!-- 查看计划 -->
    <DialogCalendar :dialog-show="dialogCalendar" :detail-info="detailInfo" @closeDialog="closeDialogCalendar" />
  </div>
</template>

<script>
import { reactive, toRefs, ref, onMounted, getCurrentInstance } from 'vue';
import {
  formatDateFilter,
  formatDateDay,
  formatDate,
  formatCalendar,
  formatYM,
  getWeekNumber
} from '@/utils/formatTime';
import DrawerAddPlan from './calendar/drawer-add-plan.vue';
import DialogCalendar from './calendar/dialog-calendar.vue';
import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import { get } from "@/api/http";
import { getCheckinInfo } from "@/api/url";

export default {
  name: 'PlanManagement',
  components: { DrawerAddPlan, DialogCalendar },
  setup() {
    const { proxy } = getCurrentInstance();
    const state = reactive({
      calendarTitle: new Date().getFullYear() + '年' + Number(new Date().getMonth() + 1) + '月',
      dialogVisiable: false,
      showMonth: formatYM(new Date()),
      loading: false,
      isShowBack: false,
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
      dialogCategory: false,
      dialogCalendar: false,
      infoList: [],
    });

    onMounted(async () => {
      initCalendar();
      await getCalendarList();
    });

    const initCalendar = () => {
      state.Tcalendar = new Calendar(state.fullcalendar, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        aspectRatio: 2.2,
        locale: 'zh-cn',
        handleWindowResize: true,
        editable: true,
        droppable: true,
        eventDurationEditable: true,
        eventResizableFromStart: true,
        selectable: true,
        firstDay: 1,
        unselectAuto: true,
        unselectCancel: '.el-drawer',
        dayMaxEvents: true,
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
          return [arg.event.extendedProps.class];
        },
        eventContent: function (arg) {
          const italicEl = document.createElement('div');
          italicEl.append('房间号:', arg.event.title, ' | 入住人:', arg.event.extendedProps.occupant_name);
          italicEl.setAttribute('class', `plan_title ${arg.event.extendedProps.class}`);
          return { domNodes: [italicEl] };
        },
        eventDrop: function (info) {
          handleDrap(info);
        },
        eventClick: function (info) {
          handleClick(info);
        },
        select: function (info) {
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

    const processCalendarData = (data) => {
      return data.map(item => ({
        id: String(item.checkin_id),
        title: item.room_number,
        occupant_name: item.occupant_name,
        employee_id: item.employee_id,
        room_number: item.room_number,
        reason: item.reason,
        class: item.reason === '因公' ? 'green' : 'orange',
        start: item.checkin_date,
        end: item.checkout_date,
        startDate: item.checkin_date,
        endDate: item.checkout_date
      }));
    }

    const getRoomScheduleList = async () => {
      try {
        const response = await get({
          url: getCheckinInfo,
          data: {}
        });
        return response.data;
      } catch (error) {
        console.error('获取入住信息失败:', error);
        return [];
      }
    };

    const getCalendarList = async () => {
      state.Tcalendar.getEventSources().forEach(item => {
        item.remove();
      });
      const res = await getRoomScheduleList();
      if (res) {
        state.infoList = processCalendarData(res);
        state.Tcalendar.addEventSource(state.infoList);
      }

    };

    // 点击计划查看
    const handleClick = info => {
      const detail = info.event._def;
      const res = detail.extendedProps;
      if (res) {
        state.detailInfo = res; // Set the detailInfo state
        console.log('state:', state.detailInfo);
        state.dialogCalendar = true; // Open the dialog
      }
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
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
      };
    };
    // 拖拽计划时触发
    const handleDrap = info => {
      const params = { ...info.event.extendedProps, id: info.event.id };
      params.startDate = formatCalendar(info.event.start);
      params.endDate = info.event.end;
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
      params.endDate = info.event.end;
      console.log(params);
    };
    // 拖拽触发
    const handleSelectDate = info => {
      if (info.view.type === 'timeGridWeek') {
        state.detailData = {
          startDate: formatCalendar(info.startStr),
          endDate: formatCalendar(new Date(info.endStr).getTime() - 24 * 3600 * 1000),
        };
      } else {
        // 月视图
        state.detailData = {
          startDate: info.startStr,
          endDate: formatDate(new Date(info.endStr).getTime() - 24 * 3600 * 1000),
        };
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
      handleEventResize,
      handleChangePlanId,
      getNext,
      getToday,
      closeDrawer,
      getRoomScheduleList,
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
// }</style>
<style lang="scss" scoped>
@import './calendar/fullcalendar.scss';
</style>
