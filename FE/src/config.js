// Cấu hình URL backend: ưu tiên biến môi trường REACT_APP_API_BASE (tiện khi deploy trên CodeSandbox)
// Nếu chạy FE local (localhost) sẽ sử dụng proxy của CRA (API_BASE = '') để tránh CORS.

// Thay đổi nhanh: đặt REACT_APP_API_BASE trong môi trường (hoặc sửa trực tiếp dòng dưới) thành URL backend của bạn trên CodeSandbox.
const DEFAULT_SANDBOX_URL = process.env.REACT_APP_API_BASE || "https://your-backend-sandbox-url.sse.codesandbox.io"; // <-- Thay bằng URL backend CodeSandbox của bạn nếu biết

let API_BASE = DEFAULT_SANDBOX_URL;

// Nếu đang chạy local trên dev (CRA), dùng proxy (empty base) để fetch relative paths
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    // Use CRA proxy: set base to empty string so fetch('/admin/login') goes to dev server proxy
    API_BASE = '';
  } else {
    // Nếu biến REACT_APP_API_BASE được cung cấp (ví dụ trên CodeSandbox), dùng nó.
    if (process.env.REACT_APP_API_BASE) {
      API_BASE = process.env.REACT_APP_API_BASE;
    }
    // Nếu không, API_BASE giữ giá trị DEFAULT_SANDBOX_URL (nếu bạn đã nhập URL vào file này)
  }
}

export default API_BASE;

