const express = require("express");
const cors = require("cors");
const path = require("path"); // Đã thêm
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Chỉ định thư mục tĩnh
app.use(express.static(path.join(__dirname, 'public')));

// Trả về file index.html khi vào trang chủ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Key (Lưu ý: Không nên để lộ key này công khai)
const GEMINI_API_KEY = "AIzaSyBGMAB9MYB4hybCsW1igNcsTdcx0VWL92Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash", // Cập nhật model mới nhất
});

app.post("/chat", async (req, res) => {
  try {
    const userText = req.body.contents?.[0]?.parts?.[0]?.text;
    if (!userText) return res.status(400).json({ error: "No input text" });

    const allowedKeywords = ["spo2", "sp02", "nhịp tim", "huyết áp", "nhiệt độ", "sức khỏe", "oxy", "y tế", "mạch đập", "đo tim", "đo nhiệt độ", "sốt", "cơ thể", "SPO2", "sức khoẻ"];
    const isMedical = allowedKeywords.some((kw) => userText.toLowerCase().includes(kw));

    if (!isMedical) {
      return res.json({ text: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến sức khỏe và y tế cơ bản." });
    }

    const prompt = `Bạn là một trợ lý AI chuyên về y tế. Chỉ trả lời ngắn gọn về: SpO2, nhịp tim, huyết áp, nhiệt độ. Câu hỏi: "${userText}"`;
    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sửa Port để chạy được trên Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy thành công`));
