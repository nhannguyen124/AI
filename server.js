const express = require("express");
const cors = require("cors");
const path = require("path"); // Thêm thư viện xử lý đường dẫn
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// 1. Phục vụ giao diện từ thư mục 'public'
app.use(express.static(path.join(__dirname, "public")));

// 2. Trả về index.html khi truy cập trang chủ (Sửa lỗi Cannot GET /)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 3. Cấu hình Gemini API
const GEMINI_API_KEY = "AIzaSyBwZlOM-K1tzRQMY34iPZPVINz4ReUlM58";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Sử dụng model mới nhất và ổn định nhất
});

app.post("/chat", async (req, res) => {
  try {
    // Hỗ trợ cả định dạng contents hoặc prompt từ frontend
    const userText = req.body.prompt || req.body.contents?.[0]?.parts?.[0]?.text;
    
    if (!userText) return res.status(400).json({ error: "No input text" });

    const allowedKeywords = ["spo2", "sp02", "nhịp tim", "huyết áp", "nhiệt độ", "sức khỏe", "oxy", "y tế", "mạch đập", "đo tim", "đo nhiệt độ", "sốt", "cơ thể", "SPO2", "sức khoẻ"];
    const isMedical = allowedKeywords.some((kw) => userText.toLowerCase().includes(kw));

    if (!isMedical) {
      return res.json({ text: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến sức khỏe cơ bản." });
    }

    const prompt = `Bạn là trợ lý AI y tế chuyên về: SpO2, nhịp tim, huyết áp, nhiệt độ. Trả lời ngắn gọn: "${userText}"`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error("❌ Lỗi Gemini:", err.message);
    res.status(500).json({ error: "Lỗi kết nối AI: " + err.message });
  }
});

// 4. Sửa Port để Render nhận diện được (Sửa lỗi Build Failed/Timeout)
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server live tại Port ${PORT}`);
});
