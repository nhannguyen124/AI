const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// ⚠️ Dán API key của bạn tại đây
const GEMINI_API_KEY = "AIzaSyBGMAB9MYB4hybCsW1igNcsTdcx0VWL92Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// ✅ Model ổn định nhất hiện nay (theo tài liệu Google)
const model = genAI.getGenerativeModel({
  model: "models/gemini-flash-latest",
});

app.post("/chat", async (req, res) => {
  try {
    const userText = req.body.contents?.[0]?.parts?.[0]?.text;
    if (!userText) return res.status(400).json({ error: "No input text" });

    // ✅ Bộ lọc chủ đề
    const allowedKeywords = [
      "spo2",
      "sp02",
      "nhịp tim",
      "huyết áp",
      "nhiệt độ",
      "sức khỏe",
      "oxy",
      "y tế",
      "mạch đập",
      "đo tim",
      "đo nhiệt độ",
      "sốt",
      "cơ thể",
      "SPO2",
      "sức khoẻ",
    ];
    const isMedical = allowedKeywords.some((kw) =>
      userText.toLowerCase().includes(kw)
    );

    // ✅ Nếu câu hỏi không thuộc lĩnh vực y tế, trả lời cố định
    if (!isMedical) {
      return res.json({
        text: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến sức khỏe và y tế cơ bản như SpO₂, nhịp tim, huyết áp, hoặc nhiệt độ cơ thể.",
      });
    }

    // ✅ Prompt hướng dẫn AI
    const prompt = `
Bạn là một trợ lý AI chuyên về y tế. 
Chỉ trả lời các câu hỏi liên quan đến sức khỏe cơ bản: SpO₂, nhịp tim, huyết áp, nhiệt độ cơ thể, hô hấp.
Nếu câu hỏi ngoài lĩnh vực y tế, hãy lịch sự từ chối.
Người dùng hỏi: "${userText}"
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    console.log("🔹 Gemini API Response:", text);
    res.json({ text });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("✅ Server chạy ở http://localhost:3000"));
