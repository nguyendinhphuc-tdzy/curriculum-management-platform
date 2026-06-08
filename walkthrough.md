# Walkthrough - Curriculum Management Platform MVP

Tài liệu này tổng hợp các kết quả đã hoàn thành, hướng dẫn chạy, cấu hình cơ sở dữ liệu Supabase Cloud và tích hợp Notion API.

---

## 1. Kết Quả Đã Hoàn Thành (What Was Accomplished)

1. **Database Schema ([schema.sql](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/schema.sql))**:
   - Thiết kế mô hình cơ sở dữ liệu quan hệ hoàn chỉnh trên Supabase/PostgreSQL hỗ trợ cả Micro và Dialogue (Non-Micro cũ).
2. **Backend Server ([server.js](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/server.js))**:
   - Node.js & Express API endpoints. Tự động kết nối với Supabase Cloud nếu cấu hình trong `.env` hoặc fallback về database JSON local `data/db.json` nếu chưa điền key.
3. **Web UI Dashboard**:
   - Giao diện chỉnh sửa bảng lưới giống Airtable/Excel. Hỗ trợ thay đổi tiêu đề tab và cột động tương ứng với dạng bài Micro (Tutor Script) và Dialogue (Dialogue Script).
4. **Excel Sync Tool ([sync_excel_to_supabase.py](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/sync_excel_to_supabase.py))**:
   - Script Python phân tích file Excel giáo trình thật `[Original] Yapsu AI Curriculum.xlsx` và tự động đẩy dữ liệu (Vocab, Sentence, Grammar) lên Supabase.
5. **Notion API Loader ([import_notion.py](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/import_notion.py))**:
   - Script Python kết nối với Notion API của người dùng để tải và hiển thị nội dung mẫu từ trang Notion được chia sẻ.

---

## 2. Hướng Dẫn Setup Cơ Sở Dữ Liệu Supabase Cloud

Vì máy tính của bạn không cài được Docker Desktop, chúng ta sẽ kết nối trực tiếp đến **Supabase Cloud (Miễn phí)** mà không cần chạy bất cứ container local nào.

### Bước 1: Tạo Dự Án Trên Supabase
1. Truy cập **[https://supabase.com](https://supabase.com)** và đăng nhập/tạo tài khoản.
2. Nhấn **New Project** và điền thông tin dự án (Tên, Password database, khu vực).
3. Đợi vài phút để Supabase Cloud khởi tạo database.

### Bước 2: Tạo Các Bảng Dữ Liệu (DDL)
1. Trong màn hình quản trị của Supabase, chọn mục **SQL Editor** ở thanh menu bên trái.
2. Bấm **New query**.
3. Copy toàn bộ nội dung trong file [schema.sql](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/schema.sql) và dán vào ô nhập lệnh.
4. Nhấn nút **Run** ở góc dưới. Các bảng dữ liệu và khóa ngoại sẽ được tạo ngay lập tức.

### Bước 3: Lấy API Key & Cấu Hân `.env`
1. Đi tới mục **Project Settings** (biểu tượng Bánh răng) $\rightarrow$ **API**.
2. Tìm và copy:
   - **Project URL** (ở phần API Settings).
   - **anon public** (ở phần Project API keys).
3. Mở file [.env](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/.env) ở dự án và điền:
   ```env
   SUPABASE_URL=URL_BẠN_VỪA_COPY
   SUPABASE_ANON_KEY=KEY_ANON_VỪA_COPY
   ```

### Bước 4: Chạy Sync Dữ Liệu Từ Excel
Để đẩy dữ liệu thực tế từ file Excel giáo trình của bạn lên Supabase Cloud, chạy lệnh sau trong Terminal (sử dụng `uv` để tự động tải các thư viện Python cần thiết không cần cài đặt phức tạp):
```bash
uv run --with openpyxl --with supabase --with python-dotenv sync_excel_to_supabase.py
```
*(Nếu muốn nạp nhanh bộ dữ liệu Seed mẫu sạch đã được đối soát sẵn, bạn chạy: `uv run --with supabase --with python-dotenv seed_to_supabase.py`)*

---

## 3. Hướng Dẫn Tích Hợp Notion API & Notion CLI

Trang Notion của bạn là một trang riêng tư, do đó để tải được dữ liệu, bạn cần cấp quyền cho một API integration:

### Bước 1: Tạo Notion Integration Token
1. Truy cập **[https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)**.
2. Nhấn nút **New integration**, chọn Workspace của bạn và đặt tên (ví dụ: `Yap Curriculum Connection`).
3. Nhấn Submit, ở màn hình tiếp theo copy đoạn mã **Internal Integration Secret** (bắt đầu bằng `secret_...`).
4. Dán token này vào file [.env](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/.env):
   ```env
   NOTION_TOKEN=secret_bạn_vừa_copy
   ```

### Bước 2: Chia sẻ trang Notion với Integration
1. Mở trang Notion của bạn bằng trình duyệt: `https://app.notion.com/p/Yapsu-Hybrid-Two-Language-Demo-3796d0671d6181f9a886c96b765b72c6`.
2. Nhấn vào biểu tượng **`...`** (More options) ở góc trên bên phải trang Notion.
3. Tìm phần **Add connections** và chọn tên Integration bạn vừa tạo (ví dụ: `Yap Curriculum Connection`).
4. Nhấn Confirm để cấp quyền đọc trang cho API.

### Bước 3: Tải Dữ Liệu Notion
Sau khi hoàn thành, bạn chạy script sau để lấy nội dung các block và database trên trang Notion của bạn:
```bash
uv run --with python-dotenv import_notion.py
```
Script sẽ tự động quét, parse các khối dữ liệu, và in ra cấu trúc bảng giáo trình trên Notion ngay trên Terminal.
