

// 过滤年月日
export function formatDateFilter(time) {
    let timeResult;
    if (time.indexOf('日') > -1) {
      timeResult = time.replace(/年/g, '-').replace(/月/g, '-').split('日')[0];
      timeResult = formatDate(timeResult);
    } else {
      timeResult = time.replace(/年/g, '-').replace(/月/g, '');
      timeResult = formatYM(timeResult);
    }
    return timeResult;
  }
  
  // 过滤只显示月日, date：只显示日期，month：只显示月份，不传全部显示
  export function formatDateDay(time, type) {
    var date = new Date();
    if (time) {
      date = new Date(time);
    }
    const month = date.getMonth() + 1;
    const day = date.getDate();
    if (type === 'date') {
      return day;
    } else if (type === 'month') {
      return month;
    } else {
      return month + '月' + day + '日';
    }
  }
  
  // 过滤年月日，包括星期几
  export function formatDate(time, num, text) {
    var date = new Date();
    var time_str = '';
    var show_day = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    if (time) {
      date = new Date(time);
    } else {
      return time;
    }
    let month = date.getMonth() + 1;
    let day = date.getDate();
    if (date.getMonth() + 1 < 10) {
      month = '0' + month;
    }
    if (date.getDate() < 10) {
      day = '0' + day;
    }
  
    if (num === 1) {
      time_str = date.getFullYear() + '年' + month + '月' + day + '日 ' + show_day[date.getDay()];
    } else {
      if (text) {
        time_str = date.getFullYear() + '年' + month + '月' + day + '日';
      } else {
        time_str = date.getFullYear() + '-' + month + '-' + day;
      }
    }
    if (time_str === 'NaN-NaN-NaN') {
      return '';
    } else {
      return time_str;
    }
  }
  
  // 过滤显示几点几分
  export function formatCalendar(time, type) {
    let timeStr;
    var date = formatDateTime(time);
    if (type === 'hour') {
      timeStr = date.split(' ')[1].split(':')[0] + ':' + date.split(' ')[1].split(':')[1];
    } else {
      timeStr = date.split(' ')[0];
    }
    return timeStr;
  }
  
  // 过滤年月
  export function formatYM(time) {
    var date = new Date();
    if (time) {
      date = new Date(time);
    }
    let month = date.getMonth() + 1;
    if (date.getMonth() + 1 < 10) {
      month = '0' + month;
    }
    return date.getFullYear() + '-' + month;
  }
  
  // 获取当前日期是一年的第几周
  export function getWeekNumber(date) {
    const nowDate = new Date(date);
    const startOfYear = new Date(nowDate.getFullYear(), 0, 1);
    const startOfWeek = new Date(startOfYear);
    const diff = nowDate.getTime() - startOfWeek.getTime();
    const currentWeek = Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
    return currentWeek;
  }