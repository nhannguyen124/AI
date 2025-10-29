const express = require("express");
const cors = require("cors");
const path = require("path");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("❌ Thiếu GEMINI_API_KEY trong biến môi trường!");
}
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

app.post("/chat", async (req, res) => {
  try {
    const userText = req.body.contents?.[0]?.parts?.[0]?.text;
    if (!userText) return res.status(400).json({ error: "No input text" });

    const allowedKeywords = [
      "spo2", "sp02", "nhịp tim", "huyết áp", "nhiệt độ",
      "sức khỏe", "oxy", "y tế", "mạch đập", "đo tim",
      "đo nhiệt độ", "tình trạng","bệnh","sốt","ốm"
    ];
    const isMedical = allowedKeywords.some((kw) =>
      userText.toLowerCase().includes(kw)
    );

    if (!isMedical) {
      return res.json({
        text: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến sức khỏe và y tế cơ bản như SpO₂, nhịp tim, huyết áp, hoặc nhiệt độ cơ thể."
      });
    }

    const prompt = `
Bạn là một trợ lý AI chuyên về y tế. 
Chỉ trả lời các câu hỏi liên quan đến sức khỏe cơ bản: SpO₂, nhịp tim, huyết áp, nhiệt độ cơ thể, hô hấp.
Nếu câu hỏi ngoài lĩnh vực y tế, hãy lịch sự từ chối.
Người dùng hỏi: "${userText}"
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    res.json({ text });
  } catch (err) {
    console.error("❌ Lỗi server:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server chạy ở cổng ${PORT}`));

