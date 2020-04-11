module.exports = {
  CHECKOUT_SESSION_MESSAGE: {
    SUCCESS: {
      CREATE_CHECKOUT_SESSION_SUCCESS: 'Bắt đầu phiên tính tiền',
      SUBMIT_CHECKOUT_SESSION_SUCCESS: 'Hoàn tất phiên tính tiền',
      CANCEL_CHECKOUT_SESSION_SUCCESS: 'Đã hủy phiên tính tiền',
      GET_CHECKOUT_SESSIONS_SUCCESS: 'Lấy danh sách phiên tính tiền thành công'
    },
    ERROR: {
      CHECKOUT_SESSION_NOT_FOUND: 'Phiên tính tiền chưa được ghi nhận',
      CHECKOUT_SESSION_LACK_OF_PRODUCT: 'Số lượng sản phẩm hiện có không đủ để đáp ứng',
      CHECKOUT_SESSION_PRODUCT_NOT_FOUND: 'Có sản phẩm không được tìm thấy',
      CHECKOUT_SESSION_WAS_SUBMITTED: 'Phiên tính tiền đã hoàn thất',
      CHECKOUT_SESSION_CANNOT_BE_CANCELLED: 'Không thể hủy phiên tính tiền đã hoàn tất',
      CHECKOUT_SESSION_EMPTY_LIST_PRODUCTS: 'Danh sách sản phẩm không được để trống'
    }
  },
  CONTROLLER_NAME: 'CheckoutSessionController'
}