import axios from 'axios';

// Backend Docker üzerinde 5000 portunda çalışıyor
const API_URL = 'http://localhost:5001/api/houseprice';

// 1. Fiyat Tahmin Fonksiyonu
export const predictPrice = async (features) => {
    try {
        const response = await axios.post(`${API_URL}/predict`, features);
        return response.data;
    } catch (error) {
        console.error("Tahmin Hatası:", error);
        throw error;
    }
};

// 2. Model Bilgisi Çekme Fonksiyonu (Önceki hatayı çözen kısım burası)
export const getModelInfo = async () => {
    try {
        const response = await axios.get(`${API_URL}/model-info`);
        return response.data;
    } catch (error) {
        console.error("Model Bilgisi Hatası:", error);
        return null; // Hata olursa null dön, uygulamayı bozma
    }
};