// src/services/api.js
import axios from 'axios';


const API_BASE_URL = 'http://localhost:5001/api/HousePrice'; 

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Konut özellikleri üzerinden fiyat tahmini yapan POST isteği.
 * @param {object} features - HouseFeaturesDto şemasına uygun konut özellikleri.
 * @returns {Promise<{estimated_price: number, currency: string}>}
 */
export const predictPrice = async (features) => {
    try {
        const response = await api.post('/predict', features);
        // Core Backend'in dönüştürdüğü sonucu döndür
        return response.data; 
    } catch (error) {
        console.error("Tahmin API Hatası:", error);
        // Hata durumunda, hatayı yukarıya fırlatıyoruz ki form yakalayabilsin
        throw error;
    }
};

export default api;