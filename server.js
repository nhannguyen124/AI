const express = require("express");
const cors = require("cors");
const path = require("path"); 
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

// Phục vụ file giao diện
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Cấu hình Gemini
const GEMINI_API_KEY = "AIzaSyBGMAB9MYB4hybCsW1igNcsTdcx0VWL92Q";
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.post("/chat", async (req, res) => {
    try {
        // Hỗ trợ cả 2 định dạng: contents (Gemini style) hoặc prompt (Simple style)
        const userText = req.body.prompt || req.body.contents?.[0]?.parts?.[0]?.text;
        
        if (!userText) {
            return res.status(400).json({ error: "Không nhận được nội dung câu hỏi" });
        }

        const allowedKeywords = ["spo2", "nhịp tim", "huyết áp", "nhiệt độ", "sức khỏe", "oxy", "y tế", "sốt"];
        const isMedical = allowedKeywords.some((kw) => userText.toLowerCase().includes(kw));

        if (!isMedical) {
            return res.json({ text: "Xin lỗi, tôi chỉ hỗ trợ các câu hỏi liên quan đến sức khỏe cơ bản." });
        }

        const prompt = `Bạn là trợ lý y tế. Trả lời ngắn gọn câu hỏi sau: ${userText}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ text: response.text() });
    } catch (err) {
        console.error("Lỗi chi tiết:", err);
        res.status(500).json({ error: "Lỗi kết nối Gemini: " + err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server đang chạy trên port ${PORT}`));
