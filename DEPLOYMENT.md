# Hướng Dẫn Deploy Dự Án Laptop Galaxy Store lên Vercel

Dự án MERN Stack này đã được cấu hình lại để sẵn sàng deploy lên Vercel. Chúng ta sẽ deploy thành **2 dự án riêng biệt** trên Vercel: một cho **Backend (server)** và một cho **Frontend (client)**.

---

## Bước 1: Deploy Backend (Server)

1. **Truy cập Vercel Dashboard**: Nhấn "Add New" -> "Project" và chọn repo GitHub của bạn.
2. **Cấu hình Project**:
   - **Root Directory**: Chọn thư mục `server`.
   - **Framework Preset**: Chọn `Other` (hoặc để Vercel tự nhận diện Node.js).
3. **Thiết lập Environment Variables**: Mở phần "Environment Variables" và thêm các biến sau:
   - `MONGODB_URI`: Link kết nối MongoDB Atlas của bạn.
   - `JWT_SECRET`: Một chuỗi ký tự bí mật bất kỳ (ví dụ: `galaxy_secret_2024`).
   - `NODE_ENV`: Đặt là `production`.
4. **Deploy**: Nhấn nút **Deploy**.
5. **Lấy URL Backend**: Sau khi deploy xong, bạn sẽ nhận được một URL (ví dụ: `https://laptop-galaxy-server.vercel.app`). **Hãy lưu URL này lại**.

---

## Bước 2: Deploy Frontend (Client)

1. **Truy cập Vercel Dashboard**: Nhấn "Add New" -> "Project" và chọn repo GitHub của bạn một lần nữa.
2. **Cấu hình Project**:
   - **Root Directory**: Chọn thư mục `client`.
   - **Framework Preset**: Chọn `Vite` (hoặc để mặc định nếu nó nhận diện đúng).
3. **Thiết lập Environment Variables**: Thêm biến môi trường sau:
   - `VITE_API_URL`: Dán URL Backend bạn vừa lấy ở Bước 1 vào đây (ví dụ: `https://laptop-galaxy-server.vercel.app`).
4. **Deploy**: Nhấn nút **Deploy**.

---

## Bước 3: Kiểm tra hành trình

Sau khi cả hai ứng dụng đã "hạ cánh" thành công trên Vercel, hãy truy cập vào URL của Frontend.
- Kiểm tra đăng nhập, xem sản phẩm.
- Mọi API call bây giờ sẽ được gửi tới URL Backend thực tế thay vì `localhost:5000`.

---

### Lưu ý quan trọng:
- Nếu bạn cập nhật code, hãy **Push** lên GitHub, Vercel sẽ tự động deploy lại bản mới nhất.
- Đảm bảo trong MongoDB Atlas, bạn đã cấu hình **Network Access** là `0.0.0.0/0` (Allow access from anywhere) để Vercel có thể kết nối được.

🚀 **Chúc phi thuyền Laptop Galaxy Store bay cao bay xa!**
