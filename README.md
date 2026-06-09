# Hướng Dẫn Kỹ Thuật & Tài Liệu Hệ Thống Quản Lý Giáo Trình (Yap! Curriculum Management Platform)

Chào mừng bạn đến với **Yap! Curriculum Management Platform** — nền tảng quản trị nội dung giáo trình được thiết kế đặc thù cho các chuyên viên biên soạn nội dung (Content Operators/Marketing) và các kỹ sư phát triển ứng dụng (Mobile Engineers) của Yap.

Tài liệu này tổng hợp toàn bộ cấu trúc hệ thống, kiến trúc cơ sở dữ liệu, các API endpoints, công cụ tự động hóa đi kèm và hướng dẫn chi tiết cách thiết lập, vận hành nền tảng từ đầu.

---

## 🗺️ Tổng Quan Kiến Trúc Hệ Thống (Architecture Overview)

Hệ thống được thiết kế theo mô hình **Hybrid Architecture** (Kiến trúc lai), cho phép linh hoạt lưu trữ dữ liệu trên đám mây hoặc chạy hoàn toàn ngoại tuyến tại môi trường local.

```
                   +-----------------------------------------------+
                   |            Giao diện Web Dashboard            |
                   |       (HTML5, Vanilla CSS, Vanilla JS)        |
                   +-----------------------+-----------------------+
                                           |
                                       HTTP Requests
                                           |
                                           v
                   +-----------------------------------------------+
                   |           Node.js & Express Server            |
                   |               (api/index.js)                  |
                   +-----------+-----------------------+-----------+
                               |                       |
                     Nếu có .env credentials       Không có credentials
                               |                       |
                               v                       v
                   +-----------------------+   +-------------------+
                   |    Supabase Cloud     |   |   Local Database  |
                   |     (PostgreSQL)      |   |  (data/db.json)   |
                   +-----------------------+   +-------------------+
                               ^
                               | (Sync / Import)
            +------------------+------------------+
            |                                     |
+-----------------------+             +-----------------------+
|  Excel Sync Script    |             |  Notion Import Tool   |
| (sync_excel_to_sp.py) |             |  (import_notion.py)   |
+-----------+-----------+             +-----------+-----------+
            |                                     |
            v                                     v
   [Original] Yapsu AI                         Notion API
     Curriculum.xlsx                       (Page 3796d067...)
```

---

## 🛠️ Các Thành Phần Đã Hoàn Thành (What Was Accomplished)

### 1. Cơ Sở Dữ Liệu Quan Hệ (Database Schema)
Tất cả cấu trúc dữ liệu đã được tối ưu hóa từ dạng bảng phẳng (Excel) sang cơ sở dữ liệu quan hệ PostgreSQL trên Supabase.
*   **File định nghĩa:** [schema.sql](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/schema.sql)
*   **Tính năng:**
    *   Hỗ trợ quản lý song song hai định dạng bài học: **Micro Lesson** (dành cho tự học/Tutor dẫn dắt) và **Dialogue Lesson** (dành cho bài tập hội thoại thực tế).
    *   Cấu trúc bảng đa ngôn ngữ, sẵn sàng cho việc bản địa hóa (Localization/Translation) sang các ngôn ngữ bản xứ khác nhau (English, Vietnamese,...).
    *   Hỗ trợ lưu trữ word-level cues (dấu mốc thời gian dạng từ của Whisper) và các thẻ hướng dẫn phát âm/ngắt nghỉ của Gemini TTS (`tts_tag`).

### 2. Giao Diện Người Dùng (Grid Web UI Dashboard)
*   **Thư mục nguồn:** [public/](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/public)
*   **Đặc điểm nổi bật:**
    *   **Giao diện "Minimal Airtable"**: Thiết kế bảng lưới trực quan, cho phép chỉnh sửa nội dung bài học, từ vựng, câu mẫu, kịch bản bằng cách click trực tiếp vào ô (Inline cell-editing).
    *   **Nhận diện bài học thông minh**: Tự động chuyển đổi tiêu đề cột và chế độ hiển thị tùy thuộc vào loại bài học được chọn (Micro Lesson đổi thành *Tutor Script* với cột *TTS Tag*; Dialogue Lesson hiển thị dạng đối thoại với cột *Character/Role*).
    *   **Dirty State Tracking (Đánh dấu chỉnh sửa)**: Tự động đổi màu nền của các ô có thay đổi chưa lưu sang màu tím nhạt và kích hoạt nút `Save Changes`.
    *   **Xuất & Xem trước JSON**: Tích hợp Modal xem trước cấu trúc file spec JSON chuẩn hóa dành cho Mobile App và tải xuống trực tiếp chỉ với một click.

### 3. Server API (Node.js & Express)
*   **File nguồn:** [server.js](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/server.js) và [api/index.js](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/api/index.js)
*   **Đặc điểm nổi bật:**
    *   Tự động phát hiện cấu hình môi trường: Kết nối đến Supabase Cloud nếu tìm thấy URL & Key trong `.env`, nếu không sẽ tự động chuyển sang chế độ dự phòng đọc/ghi file local [data/db.json](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/data/db.json).
    *   Cung cấp đầy đủ các API CRUD bài học và API xuất định dạng đặc tả bài học sang JSON (`_spec.json`).

### 4. Công Cụ Đồng Bộ Excel (`sync_excel_to_supabase.py`)
*   **File nguồn:** [sync_excel_to_supabase.py](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/sync_excel_to_supabase.py)
*   **Tính năng:**
    *   Phân tích cú pháp trực tiếp từ file Excel giáo trình gốc: `[Original] Yapsu AI Curriculum.xlsx`.
    *   Tự động trích xuất các phần Vocabulary, Sentences và Grammar của bài học và đẩy trực tiếp lên các bảng tương ứng trên Supabase.
    *   Đặc biệt tích hợp **Monkeypatch** cho thư viện `openpyxl` để sửa lỗi đọc mã màu không hợp lệ từ file Excel cũ (tránh crash chương trình khi chạy).

### 5. Công Cụ Trích Xuất Notion (`import_notion.py`)
*   **File nguồn:** [import_notion.py](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/import_notion.py)
*   **Tính năng:** Tích hợp API Notion chính thức để quét trang demo giáo trình Yap, tự động trích xuất cấu trúc Database con và thông tin kịch bản bài học từ Notion về hiển thị trên Terminal.

---

## 🗄️ Cấu Trúc Cơ Sở Dữ Liệu (Database Schema Details)

Hệ thống quản lý giáo trình lưu trữ dữ liệu dưới cấu trúc quan hệ PostgreSQL thông qua 8 bảng dữ liệu:

| Tên Bảng | Vai Trò | Khóa Chính | Khóa Ngoại / Quan Hệ |
| :--- | :--- | :--- | :--- |
| **`languages`** | Danh sách ngôn ngữ học mục tiêu (zh, ja) | `id` (VARCHAR) | |
| **`native_languages`** | Danh sách ngôn ngữ mẹ đẻ để hiển thị nghĩa dịch (en, vi) | `id` (VARCHAR) | |
| **`levels`** | Phân cấp độ của từng ngôn ngữ (Level 1, 2, 3...) | `id` (VARCHAR) | `language_id` $\rightarrow$ `languages.id` |
| **`lessons`** | Chứa thông tin bài học (tên, mục tiêu, loại bài, thời lượng) | `id` (VARCHAR) | `level_id` $\rightarrow$ `levels.id` |
| **`vocabularies`** | Danh sách từ vựng giảng dạy thuộc từng bài học | `id` (VARCHAR) | `lesson_id` $\rightarrow$ `lessons.id` |
| **`sentences`** | Danh sách câu mẫu giảng dạy thuộc bài học | `id` (VARCHAR) | `lesson_id` $\rightarrow$ `lessons.id` |
| **`dialogues`** | Kịch bản giảng dạy (Tutor Script) hoặc Hội thoại của bài học | `id` (UUID) | `lesson_id` $\rightarrow$ `lessons.id` |
| **`translations`** | Bản dịch tiêu đề bài học, từ vựng, câu mẫu ra tiếng mẹ đẻ | `id` (UUID) | `native_language_id` $\rightarrow$ `native_languages.id` |

> [!NOTE]
> Bảng `dialogues` sử dụng khóa phức hợp ảo thông qua ràng buộc duy nhất `UNIQUE(lesson_id, segment_id)` để đảm bảo tính nhất quán của mã phân đoạn kịch bản khi đồng bộ từ Excel/Notion.

---

## 🚀 Hướng Dẫn Thiết Lập & Khởi Chạy (Setup Guide)

### 1. Chuẩn Bị Môi Trường
*   Yêu cầu đã cài đặt **Node.js (v18+)** trên máy tính.
*   Yêu cầu cài đặt **Python (v3.10+)**. Để thuận tiện nhất, bạn nên cài đặt trình quản lý gói [uv](https://github.com/astral-sh/uv) (đã có sẵn trong hệ thống) để chạy script Python không cần tạo môi trường ảo phức tạp.

### 2. Thiết Lập Cơ Sở Dữ Liệu Supabase Cloud
1. Đăng nhập vào [Supabase Console](https://supabase.com).
2. Tạo một dự án mới (New Project). Chọn tên dự án, mật khẩu database và vị trí server gần bạn.
3. Khi dự án khởi tạo xong, truy cập vào menu **SQL Editor** ở thanh điều hướng bên trái.
4. Nhấp vào **New Query**, mở file [schema.sql](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/schema.sql), sao chép toàn bộ mã SQL và dán vào trình soạn thảo.
5. Nhấp vào **Run** để khởi tạo cấu trúc bảng dữ liệu.

### 3. Cấu Hình Biến Môi Trường (`.env`)
Tạo hoặc mở file [.env](file:///c:/Users/PC/Downloads/EveryLab%20workspace/curriculum-management-platform/.env) tại thư mục `curriculum-management-platform/` và cập nhật thông tin:

```env
PORT=3000

# Lấy URL và Anon Key từ mục Project Settings -> API trên Supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-public-key

# Lấy Token Notion từ trang quản lý tích hợp Notion
NOTION_TOKEN=secret_yournotionintegrationtoken
```

### 4. Nạp Dữ Liệu Giáo Trình (Seeding Dữ Liệu)
Chúng ta có hai lựa chọn để nạp dữ liệu giáo trình lên cơ sở dữ liệu:

*   **Cách 1: Nạp từ file Excel giáo trình thật** (Quét qua file Excel và đồng bộ trực tiếp):
    ```bash
    uv run --with openpyxl --with supabase --with python-dotenv sync_excel_to_supabase.py
    ```

*   **Cách 2: Nạp bộ dữ liệu Seed mẫu sạch đã được đối soát chuẩn**:
    ```bash
    uv run --with supabase --with python-dotenv seed_to_supabase.py
    ```

### 5. Chạy Ứng Dụng Web Dashboard
Di chuyển vào thư mục `curriculum-management-platform/` trong Terminal của bạn và chạy:

```bash
# Cài đặt các thư viện Node.js phụ thuộc
npm install

# Khởi chạy server ở chế độ Development (Auto-reload khi lưu file)
npm run dev
```

Mở trình duyệt và truy cập vào **[http://localhost:3000](http://localhost:3000)**. Giao diện Web Dashboard sẽ tải danh sách các bài học hiện có trên hệ thống.

---

## 🔌 Tài Liệu API Endpoints

Server Express cung cấp các API để truy vấn, chỉnh sửa dữ liệu giáo trình và kết nối trực tiếp với Database.

### 1. Lấy danh sách ngôn ngữ học mục tiêu
*   **Endpoint:** `GET /api/languages`
*   **Mô tả:** Trả về danh sách ngôn ngữ được hỗ trợ giảng dạy trên hệ thống.
*   **Response mẫu:**
    ```json
    [
      { "id": "zh", "name": "Chinese" },
      { "id": "ja", "name": "Japanese" }
    ]
    ```

### 2. Lấy danh sách ngôn ngữ dịch nghĩa (Native Languages)
*   **Endpoint:** `GET /api/native-languages`
*   **Response mẫu:**
    ```json
    [
      { "id": "en", "name": "English" },
      { "id": "vi", "name": "Vietnamese" }
    ]
    ```

### 3. Lấy danh sách bài học theo bộ lọc
*   **Endpoint:** `GET /api/lessons`
*   **Query Parameters:**
    *   `language`: Mã ngôn ngữ mục tiêu (ví dụ: `zh` hoặc `ja`).
    *   `level`: Số cấp độ (ví dụ: `1`).
*   **Mô tả:** Lọc và trả về danh sách tóm tắt các bài học tương ứng.
*   **Response mẫu:**
    ```json
    [
      {
        "id": "CN_L101_MICRO",
        "level_id": "level-1-zh",
        "code": "CN_L101_MICRO",
        "lesson_number": 1,
        "title": "Greetings (Micro)",
        "goal": "Learn basic hello and welcome in Chinese tutor style",
        "type": "micro",
        "max_duration_seconds": 210,
        "version": "2026.06.08.1",
        "content_version": "2026.06.08"
      }
    ]
    ```

### 4. Lấy thông tin chi tiết của bài học (bao gồm từ vựng, câu mẫu, hội thoại)
*   **Endpoint:** `GET /api/lessons/:id`
*   **Mô tả:** Trả về toàn bộ thực thể liên kết với bài học (vocabularies, sentences, dialogues, translations) để hiển thị lên bảng chỉnh sửa.

### 5. Cập nhật nội dung bài học
*   **Endpoint:** `PUT /api/lessons/:id`
*   **Headers:** `Content-Type: application/json`
*   **Body gửi lên:**
    ```json
    {
      "title": "Tên bài học mới",
      "goal": "Mục tiêu bài học mới",
      "vocabularies": [
        { "id": "CN_L101_MICRO_V01", "character": "你好", "reading_or_pronunciation": "nǐ hǎo" }
      ],
      "sentences": [],
      "dialogues": []
    }
    ```

### 6. Xuất cấu hình bài học sang tệp JSON chuẩn của Mobile App
*   **Endpoint:** `GET /api/lessons/:id/export`
*   **Query Parameters:**
    *   `native`: Mã ngôn ngữ dịch nghĩa để ghi đè tiêu đề và mục tiêu bài học (ví dụ: `vi`).
*   **Mô tả:** Trả về file spec JSON đã được chuyển đổi cấu trúc, sắp xếp thứ tự và tự động bản địa hóa theo tham số đầu vào.

---

## 🔗 Hướng Dẫn Tích Hợp Notion API

Nếu muốn đọc nội dung giáo trình được soạn thảo trên Notion thay vì Excel:

### Bước 1: Tạo Notion Integration
1. Truy cập trang **[My Integrations](https://www.notion.so/my-integrations)** trên Notion.
2. Nhấp vào **New integration**, đặt tên (ví dụ: `Yap Curriculum API Connection`) và chọn workspace chứa trang tài liệu.
3. Nhấp Submit và sao chép đoạn mã **Internal Integration Secret**.
4. Cập nhật mã này vào biến `NOTION_TOKEN` trong file `.env`.

### Bước 2: Chia sẻ trang Notion của bạn
1. Mở trang Notion demo: `https://app.notion.com/p/Yapsu-Hybrid-Two-Language-Demo-3796d0671d6181f9a886c96b765b72c6`.
2. Nhấp vào biểu tượng dấu ba chấm **`...`** ở góc phải trang.
3. Cuộn xuống phần **Connections** -> **Add Connections**, gõ và chọn tích hợp bạn vừa tạo ở Bước 1.
4. Xác nhận để cấp quyền đọc cho API.

### Bước 3: Chạy script tải dữ liệu từ Notion
Chạy lệnh sau để truy xuất dữ liệu từ Notion:
```bash
uv run --with python-dotenv import_notion.py
```
Dữ liệu khối và thông tin các bảng dữ liệu con (Child Databases) nằm trong trang sẽ được phân tích và hiển thị trực tiếp trên Terminal của bạn.

---

## 🛠️ Trạng Thái Phát Triển Tiếp Theo (Roadmap & Next Steps)

Dựa theo biên bản thống nhất kỹ thuật với anh Khoa và yêu cầu nghiệp vụ của chị Huyền, các giai đoạn phát triển tiếp theo của hệ thống bao gồm:

1.  **Tích hợp Pipeline Sinh Audio tự động**: Kết nối backend với API của **Gemini 3.1 Flash TTS** để tự động tạo audio từ cột `tts_tag` của Tutor Script, sử dụng định dạng Transcript Tags (như `[pause]`, `[sigh]`) thay vì thẻ SSML.
2.  **Hệ Thống Tự Động QA Audio**: Tích hợp Whisper API để dịch ngược file audio được sinh ra sang dạng text, đối soát lỗi phát âm, lỗi đọc thẻ HTML và tự động kích hoạt vòng lặp tự sửa lỗi (AI auto-fix loop).
3.  **Hỗ Trợ Thêm Các Loại Bài Tập (Drill Builder)**: Bổ sung tab cấu hình bài tập cho phép thiết lập 7 vòng bài tập tương tác (Listen & Repeat, Fill-in-blank, Tap-to-speak) trực tiếp trên Web Dashboard.
