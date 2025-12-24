import axios from 'axios';


const API_URL = 'http://localhost:5001/api/houseprice';


export const predictPrice = async (features) => {
    try {
        const response = await axios.post(`${API_URL}/predict`, features);
        return response.data;
    } catch (error) {
        console.error("Tahmin Hatası:", error);
        throw error;
    }
};


export const getModelInfo = async () => {
    try {
        const response = await axios.get(`${API_URL}/model-info`);
        return response.data;
    } catch (error) {
        console.error("Model Bilgisi Hatası:", error);
        return null; 
    }
};