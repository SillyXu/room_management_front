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
          <span>{{ row.checkin_date }} {{ row.startDateMinute }}</span>
        </template>
      </el-table-column>
      <el-table-column label="离开时间" prop="checkout_date" :minwidth="120" show-overflow-tooltip>
        <template #default="{ row }">
          <span>{{ row.checkout_date }} {{ row.endDateMinute }}</span>
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
import { get } from "@/api/http";
import { getCheckinInfo } from "@/api/url";

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
          italicEl.append(arg.event.room_number);
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

    const processCalendarData = (data) => {
      state.Tcalendar.getEventSources().forEach(item => {
        item.remove();
      });
      return data.map(item => ({
        title: item.room_number,
        start: item.checkin_date,
        end: item.checkout_date,
        item,
      }));
    };
    const getCalendarList = async () => {

      try {
        const response = await get({
          url: getCheckinInfo,
          data: {} 
        });
        // 处理响应数据
        console.log(response.data);
        // 可以将数据存储到状态中，例如:
        state.infoList = response.data; // 假设响应数据在data字段中
        console.log(state.infoList);
      } catch (error) {
        console.error('获取入住信息失败:', error);
      }
      
      state.infoList = processCalendarData(state.infoList);
      
      state.Tcalendar.addEventSource(state.infoList);
    };
    // 点击计划查看
    const handleClick = info => {
      const detail = info.event._def;
      // 接口查看详情但为了方便展示变量值直接写出来
      plandetailId(detail.publicId).then(res => {
        if (res) {
          state.detailInfo = res.data.data;
          console.log(res.data.data);
          state.dialogCalendar = true;
        }
      });
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
          managerIds: 'managerIds', // 当前系统登陆人的id，业务场景只有创建人才可以编辑计划，其他人均只能查看
          fileList: [],
          startDateMinute: '',
          endDateMinute: '',
          isAllDay: 1
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
