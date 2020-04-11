module.exports = {
  WORK_SHIFT_MESSAGE: {
    SUCCESS: {
      ADD_WORK_SHIFT_SUCCESS: 'Thêm ca làm việc thành công',
      GET_WORK_SHIFTS_SUCCESS: 'Lấy danh sách ca làm việc thành công',
      REMOVE_WORK_SHIFT_SUCCESS: 'Hủy ca làm việc thành công'
    },
    ERROR: {
      DUPLICATED_WORK_SHIFT: 'Ca làm việc đã tồn tại',
      INVALID_WORK_SHIFT_TIME_RANGE: 'Khoảng thời gian của ca làm việc không hợp lệ',
      WORK_SHIFT_NOT_FOUND: 'Không tìm thấy ca làm việc',
      ASSIGNED_WORK_SHIFT: 'Không thể hủy ca làm việc đã có nhân viên được phân công'
    }
  },
  CONTROLLER_NAME: 'WorkShiftController'
}