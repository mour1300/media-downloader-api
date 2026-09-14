const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// الصفحة الرئيسية لتأكيد عمل السيرفر
app.get('/', (req, res) => {
    res.json({
        status: true,
        message: "🚀 Media Downloader Server is Running Successfully!",
        developer: "mex13"
    });
});

// Endpoint لمعالجة رابط الميديا
app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ status: false, message: 'يرجى تقديم رابط الفيديو أو الصورة!' });
    }

    try {
        // الاستعانة بمحرك معالجة التنزيل بدون علامة مائية (Cobalt Engine)
        const response = await axios.post('https://api.cobalt.tools/api/json', {
            url: url,
            videoQuality: 'max',       // أعلى جودة فيديو متاحة
            filenamePattern: 'basic',
            isNoWatermark: true,       // إزالة العلامة المائية
            isAudioOnly: false
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const data = response.data;

        if (data.status === 'stream' || data.status === 'redirect') {
            return res.json({
                status: true,
                type: 'video',
                downloadUrl: data.url
            });
        } else if (data.status === 'picker') {
            // في حال كانت المنصة تحتوي على صور متعددة (مثل ألبوم إنستغرام أو تيك توك)
            return res.json({
                status: true,
                type: 'gallery',
                picker: data.picker
            });
        } else {
            return res.status(400).json({
                status: false,
                message: 'تعذر جلب رابط التحميل، تأكد من صحة الرابط أو الحساب العام.'
            });
        }

    } catch (error) {
        console.error("Error fetching media:", error.message);
        return res.status(500).json({
            status: false,
            message: 'حدث خطأ أثناء معالجة الرابط من السيرفر الرئيسي.',
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});