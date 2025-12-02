import React, { useState, useEffect } from 'react';
import { predictPrice } from '../services/api';
import { Home, Ruler, MapPin, Building, Bed, Sun, Shield, Navigation, TrendingUp, CheckCircle } from 'lucide-react';
import locationData from '../data/locations.json';

const KATTIPLERI = ['Normal', 'Dubleks', 'Tripleks'];

const INITIAL_FEATURES = {
    NetAlan: 100.0,
    OdaSayisi: 2.0,
    SalonSayisi: 1.0,
    BinaYasi: 5.0,
    BalkonSayisi: 1.0,
    SiteIcerisinde: 1,
    KatTipi: 'Normal',
    Sehir: '', Ilce: '', Mahalle: ''
};

// Inputlar için daha kompakt stil
const inputClasses = "w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-medium text-gray-700 placeholder-gray-400 hover:bg-white";
const labelClasses = "text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 flex items-center";

const PredictionForm = () => {
    const [features, setFeatures] = useState(INITIAL_FEATURES);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);

    useEffect(() => {
        const cityList = Object.keys(locationData);
        setCities(cityList);
        if (cityList.length === 1) {
            const firstCity = cityList[0];
            setFeatures(prev => ({ ...prev, Sehir: firstCity }));
            setDistricts(Object.keys(locationData[firstCity]));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? (checked ? 1 : 0) : value;
        if (type === 'number' && name !== 'SiteIcerisinde') {
            setFeatures(prev => ({ ...prev, [name]: parseFloat(newValue) }));
        } else {
            setFeatures(prev => ({ ...prev, [name]: newValue }));
        }
    };

    const handleCityChange = (e) => {
        const selectedCity = e.target.value;
        setFeatures(prev => ({ ...prev, Sehir: selectedCity, Ilce: '', Mahalle: '' }));
        if (selectedCity && locationData[selectedCity]) {
            setDistricts(Object.keys(locationData[selectedCity]));
            setNeighborhoods([]);
        } else { setDistricts([]); setNeighborhoods([]); }
    };

    const handleDistrictChange = (e) => {
        const selectedDistrict = e.target.value;
        setFeatures(prev => ({ ...prev, Ilce: selectedDistrict, Mahalle: '' }));
        if (features.Sehir && selectedDistrict && locationData[features.Sehir][selectedDistrict]) {
            setNeighborhoods(locationData[features.Sehir][selectedDistrict]);
        } else { setNeighborhoods([]); }
    };

    const toggleSiteStatus = () => {
        setFeatures(prev => ({ ...prev, SiteIcerisinde: prev.SiteIcerisinde === 1 ? 0 : 1 }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setError(null);
        // Sonuçları sıfırlamıyoruz ki sağ tarafta değişim görülsün
        try {
            const data = await predictPrice(features);
            setResult(data);
        } catch (err) {
            setError("Bağlantı Hatası");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full h-screen overflow-hidden bg-white">
            
            {/* --- SOL PANEL: FORM ALANI (%40 Genişlik) --- */}
            <div className="w-full md:w-5/12 lg:w-4/12 h-full bg-white flex flex-col border-r border-gray-100 shadow-xl z-20 overflow-y-auto custom-scrollbar">
                
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                                <TrendingUp size={20} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">House Price <span className="text-indigo-600">Prediction</span></h2>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">Parametreleri girin, anlık piyasa değerini görün.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        
                        {/* Konum Satırı */}
                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase flex items-center"><MapPin size={12} className="mr-1"/> Lokasyon</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="relative col-span-1">
                                    <select name="Sehir" value={features.Sehir} onChange={handleCityChange} required className={`${inputClasses} appearance-none`}>
                                        <option value="">İl</option>
                                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="relative col-span-1">
                                    <select name="Ilce" value={features.Ilce} onChange={handleDistrictChange} required disabled={!features.Sehir} className={`${inputClasses} appearance-none`}>
                                        <option value="">İlçe</option>
                                        {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                                <div className="relative col-span-2">
                                    <select name="Mahalle" value={features.Mahalle} onChange={handleChange} required disabled={!features.Ilce} className={`${inputClasses} appearance-none`}>
                                        <option value="">Mahalle Seçiniz</option>
                                        {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                    <Navigation className="absolute right-3 top-3 text-gray-400 pointer-events-none" size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Özellikler Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClasses}>Net Alan (m²)</label>
                                <input type="number" name="NetAlan" value={features.NetAlan} onChange={handleChange} className={inputClasses} placeholder="100" />
                            </div>
                            <div>
                                <label className={labelClasses}>Bina Yaşı</label>
                                <input type="number" name="BinaYasi" value={features.BinaYasi} onChange={handleChange} className={inputClasses} placeholder="5" />
                            </div>
                            <div>
                                <label className={labelClasses}>Oda</label>
                                <input type="number" name="OdaSayisi" value={features.OdaSayisi} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Salon</label>
                                <input type="number" name="SalonSayisi" value={features.SalonSayisi} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Balkon</label>
                                <input type="number" name="BalkonSayisi" value={features.BalkonSayisi} onChange={handleChange} className={inputClasses} />
                            </div>
                            <div>
                                <label className={labelClasses}>Kat Tipi</label>
                                <select name="KatTipi" value={features.KatTipi} onChange={handleChange} className={inputClasses}>
                                    {KATTIPLERI.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Checkbox Card */}
                        <div onClick={toggleSiteStatus} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${features.SiteIcerisinde === 1 ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-md ${features.SiteIcerisinde === 1 ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-500'}`}><Shield size={16}/></div>
                                <span className="text-sm font-semibold text-gray-700">Site İçerisinde</span>
                            </div>
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${features.SiteIcerisinde === 1 ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'}`}>
                                {features.SiteIcerisinde === 1 && <CheckCircle size={14} className="text-white"/>}
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full py-4 rounded-xl shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-all transform active:scale-95 flex items-center justify-center gap-2">
                            {loading ? <span className="animate-spin">Wait...</span> : 'Fiyat Hesapla'}
                        </button>
                    </form>
                </div>
                
                
            </div>

            {/* --- SAĞ PANEL: SONUÇ VE GÖRSEL (%60 Genişlik) --- */}
            <div className="hidden md:flex w-7/12 lg:w-8/12 h-full bg-slate-900 relative overflow-hidden items-center justify-center">
                
                {/* Dinamik Arka Plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 z-0"></div>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20 animate-pulse delay-700"></div>

                {/* Arka Plan Deseni */}
                <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px'}}></div>

                {/* İçerik Alanı */}
                <div className="relative z-10 w-full max-w-2xl px-8 text-center">
                    
                    {!result && !loading && (
                        <div className="animate-fade-in-up">
                            <div className="inline-block p-6 bg-white/5 backdrop-blur-lg rounded-full mb-6 border border-white/10">
                                <Home size={64} className="text-indigo-400" />
                            </div>
                            <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
                                Geleceği <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Keşfet</span>
                            </h1>
                            <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                                İstanbul'daki hayalinizdeki evin değerini yapay zeka hassasiyetiyle saniyeler içinde öğrenin. Sol taraftaki paneli kullanarak başlayın.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <h3 className="text-2xl font-bold text-white animate-pulse">Yapay Zeka Analiz Ediyor...</h3>
                            <p className="text-slate-400 mt-2">Piyasa verileri taranıyor</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="animate-fade-in-up scale-100">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                                
                                <span className="inline-block py-1 px-4 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-bold tracking-wider mb-4 border border-emerald-500/30">
                                    TAHMİN BAŞARILI
                                </span>
                                
                                <h2 className="text-slate-300 text-lg uppercase tracking-widest font-semibold mb-2">Tahmini Değer</h2>
                                
                                <div className="text-6xl md:text-7xl font-black text-white mb-6 drop-shadow-xl tracking-tighter">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(result.estimated_price)}
                                </div>
                                
                                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                                    <div>
                                        <div className="text-slate-400 text-xs uppercase">Bölge</div>
                                        <div className="text-white font-bold">{features.Ilce}</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-xs uppercase">Büyüklük</div>
                                        <div className="text-white font-bold">{features.NetAlan} m²</div>
                                    </div>
                                    <div>
                                        <div className="text-slate-400 text-xs uppercase">Oda</div>
                                        <div className="text-white font-bold">{features.OdaSayisi} + {features.SalonSayisi}</div>
                                    </div>
                                </div>
                            </div>
                            
                            <button onClick={() => setResult(null)} className="mt-8 text-slate-400 hover:text-white underline underline-offset-4 transition-colors">
                                Yeni Hesaplama Yap
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default PredictionForm;