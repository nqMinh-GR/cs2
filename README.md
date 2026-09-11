# Trưa Nay Ăn Gì 🍜

**Tiếng Việt** · [English](README.en.md)

**Website chính thức: [truanayangi.com](https://truanayangi.com/)**

Chưa biết ăn gì trưa nay? Vào **kho đồ**, chọn một hòm (món chính, đồ uống, món nhậu, đồ chay, món ngọt, ăn vặt hoặc theo ẩm thực), mở hòm và để reel quay chọn giúp bạn — giao diện mô phỏng màn *Unlock Container* của Counter-Strike 2.

Bản này là frontend tĩnh, không đăng nhập, không backend. Sở thích (ngân sách, lọc chay, danh sách món riêng) lưu bằng cookie trong trình duyệt.

## Chạy trên máy

Cần **Node.js 24.x** (tối thiểu 22.12) và **npm**.

```sh
git clone https://github.com/truanayangi-com/truanayangi.git
cd truanayangi
npm install
npm run dev
```

Mở [127.0.0.1:5173](http://127.0.0.1:5173). Không cần `.env` hay dịch vụ bên ngoài. Nếu cổng đang bận: `npm run dev -- --port 5188`.

```sh
npm test          # Chạy kiểm tra (node --test)
npm run typecheck # Kiểm tra kiểu TypeScript
npm run build     # Tạo bản build vào dist/
npm run preview   # Xem bản build tại http://127.0.0.1:4173
```

## Triển khai lên Vercel

Repo đã có `vercel.json` (framework Vite, `npm run build`, thư mục `dist/`, header cache và `noindex`).

1. Import repo vào Vercel (**Add New → Project**). Vercel tự nhận Vite và dùng npm nhờ `package-lock.json`.
2. Không cần biến môi trường. Node 24 được chọn qua `engines` trong `package.json`.
3. Bấm **Deploy**. Kiểm tra bản preview trước khi gắn domain.

Muốn thử từ máy: `npx vercel@latest` (đăng nhập tài khoản Vercel của bạn) hoặc `npx vercel@latest build` để kiểm tra cấu hình.

## Mô hình 3D của hòm

Hòm trong kho đồ và màn mở hòm là mô hình **"CS:GO Case" của artfreex** (Sketchfab, CC BY 4.0), đã được chuyển sang `public/models/csgo-case.v1.glb` (≈1 MB). Một model dùng cho mọi hòm, đổi màu sơn theo từng hòm ngay trong trình duyệt. Nếu thiếu file GLB hoặc trình duyệt không có WebGL2, ứng dụng hiển thị ảnh tĩnh `public/case.png`.

Mỗi hòm có huy hiệu và vệt sơn riêng (`src/lib/case-decals.ts`). Ảnh hòm trong kho đồ và ảnh dự phòng khi 3D chưa tải (`public/cases/*.webp`) được xuất từ chính ứng dụng qua `/?render=cases`. Cách dựng lại GLB từ file FBX gốc và xuất ảnh: xem [tools/model/README.md](tools/model/README.md).

## Dữ liệu và ảnh món

- Món ăn trưa nằm trong `src/lib/foods.ts` (mỗi món có tag `cuisine` để chia hòm theo ẩm thực). Ảnh atlas `public/food-*.webp` (0–131) và ảnh lẻ `public/items/` cho món clone từ [Kho tiếp tế](https://truanayangi.com/dishes).
- Đồ uống, món nhậu, món ngọt, ăn vặt và món chay bổ sung nằm trong `src/lib/items/` với ảnh WebP khi Kho tiếp tế có sprite; món chỉ có ở bản local vẫn dùng glyph SVG.
- Clone lại ảnh: `python3 tools/dishes/import.py` (xem [tools/dishes/README.md](tools/dishes/README.md)).
- Cookie lưu: ngôn ngữ, âm thanh, ngân sách/lọc chay theo từng hòm, danh sách "Món của tôi". Xóa cookie sẽ đặt lại.

## GitHub Pages và website chính

GitHub Pages chỉ chuyển hướng đến https://truanayangi.com/. Chỉ xuất bản `pages-redirect/` lên `gh-pages`; mã ứng dụng trong `main` dùng để chạy trên máy hoặc deploy Vercel.

## Đóng góp

Chào đón mọi người [báo lỗi, đề xuất ý tưởng](https://github.com/truanayangi-com/truanayangi/issues/new) hoặc fork repo và [gửi PR vào `main`](https://github.com/truanayangi-com/truanayangi/compare). Tiếng Việt hoặc tiếng Anh đều được, draft PR cũng được. Với thay đổi code, hãy chạy `npm test` và `npm run build` khi có thể.

## Nguồn gốc và ghi công

Repo được chuyển từ `nagisanzenin/truanayangi`, giữ nguyên lịch sử Git. Xem [ATTRIBUTION.md](ATTRIBUTION.md) cho ghi công tác giả, mô hình 3D, font và âm thanh. Dự án fan-made, không liên kết với Valve.
