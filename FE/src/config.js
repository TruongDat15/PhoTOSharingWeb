// Cấu hình URL backend dùng trực tiếp thay vì process.env
// Nếu bạn chạy FE trên máy local (localhost) thì sẽ tự động dùng proxy (empty base) để requests là same-origin
// Nếu chạy trên CodeSandbox/điều kiện khác nó sẽ dùng giá trị SANDBOX_URL dưới đây.

const SANDBOX_URL = "https://your-backend-sandbox-url.sse.codesandbox.io"; // <-- Thay bằng URL backend CodeSandbox của bạn

let API_BASE = SANDBOX_URL;

// Trong môi trường trình duyệt, tự động chuyển sang proxy (empty) khi đang chạy local
if (typeof window !== 'undefined') {
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    // Use CRA proxy: set base to empty string so fetch('/admin/login') goes to dev server proxy
    API_BASE = '';
  }
}

export default API_BASE;

