module.exports = {
  USER_ROLE: {
    CASHIER: {
      type: 'CASHIER',
      salaryRate: 1
    },
    IMPORTER: {
      type: 'IMPORTER',
      salaryRate: 1.5
    },
    MANAGER: {
      type: 'MANAGER',
      salaryRate: 2
    }
  },
  BASIC_SALARY: 5000000,
  SEX: {
    MALE: {
      name: 'Nam',
      value: 1
    },
    FEMALE: {
      name: 'Nữ',
      value: 2
    }
  },
  USER_MESSAGE: {
    ERROR: {
      WRONG_USERNAME_OR_PASSWORD: 'Tài khoản hoặc mật khẩu không đúng',
      DUPLICATED_USERNAME: 'Tên người dùng đã được sử dụng',
      DUPLICATED_EMAIL: 'Địa chỉ email đã được sử dụng',
      CONFIRMED_NEW_PASSWORD_NOT_MATCHED: 'Nhập lại mật khẩu mới không chính xác',
      WRONG_CURRENT_PASSWORD: 'Mật khẩu hiện tại không chính xác',
      INVALID_USER_ROLE: 'Quyền người dùng không hợp lệ',
      PERMISSION_DENIED: 'Không có quyền thao tác',
      USER_NOT_FOUND: 'Không tìm thấy nhân viên',
      INVALID_USER_SEX: 'Giới tính không hợp lệ'
    },
    SUCCESS: {
      LOGIN_SUCCESS: 'Đăng nhập thành công',
      ADD_USER_SUCCESS: 'Nhân viên đã được thêm vào hệ thống',
      GET_USERS_SUCCESS: 'Lấy danh sách nhân viên thành công',
      CHANGE_PASSWORD_SUCCESS: 'Đổi mật khẩu thành công',
      UPDATE_PROFILE_SUCCESS: 'Cập nhật thông tin thành công',
      DELETE_USER_SUCCESS: 'Đã xóa nhân viên khỏi hệ thống'
    }
  },
  CONTROLLER_NAME: 'UserController',
  PASSWORD_SALT_ROUNDS: 10
};
