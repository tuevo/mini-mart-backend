module.exports = {
  WORK_SCHEDULE_MESSAGE: {
    SUCCESS: {
      ADD_WORK_SCHEDULE_SUCCESS: 'Thêm lịch làm việc thành công',
      GET_WORK_SCHEDULES_SUCCESS: 'Lấy danh sách lịch làm việc trong tháng thành công',
      REMOVE_WORK_SCHEDULE_SUCCESS: 'Hủy lịch làm việc thành công'
    },
    ERROR: {
      INVALID_WORK_MONTH: 'Tháng làm việc không hợp lệ',
      INVALID_WORK_YEAR: 'Năm làm việc không hợp lệ',
      DUPLICATED_WORK_SCHEDULE: 'Lịch làm việc đã tồn tại',
      WORK_SCHEDULE_NOT_FOUND: 'Không tìm thấy lịch làm việc',
      WORK_SCHEDULE_HAS_WORK_SHIFT: 'Không thể hủy lịch làm việc đang có ca làm việc'
    }
  },
  CONTROLLER_NAME: 'WorkScheduleController'
}