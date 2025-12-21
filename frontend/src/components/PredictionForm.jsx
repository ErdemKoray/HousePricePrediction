import React, { useState, useEffect } from 'react';
import Snowfall from 'react-snowfall';
import { predictPrice } from '../services/api';
import { Home, MapPin, Shield, CheckCircle, Navigation } from 'lucide-react';
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
            
            {/* --- SOL PANEL: FORM ALANI --- */}
            <div className="w-full md:w-5/12 lg:w-4/12 h-full bg-white flex flex-col border-r border-gray-100 shadow-xl z-20 overflow-y-auto custom-scrollbar">
                
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
                    
                    {/* --- BAŞLIK ALANI --- */}
                    <div className="mb-8 border-b border-gray-100 pb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-md shadow-indigo-200">
                                <Home size={20} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-gray-800 tracking-tight leading-none">
                                    House Price <span className="text-indigo-600">Prediction</span>
                                </h1>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">AI Powered Valuation</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Konum */}
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

                        {/* Özellikler */}
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

                        {/* Checkbox */}
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
                            {loading ? <span className="animate-spin">Wait...</span> : 'Fiyatı Hesapla'}
                        </button>
                    </form>
                </div>
                
                <div className="p-4 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-300 uppercase font-bold tracking-widest">Powered by AI Engine v1.0</p>
                </div>
            </div>

            {/* --- SAĞ PANEL (GÖRSEL VE KAR YAĞIŞI) --- */}
            <div className="hidden md:flex w-7/12 lg:w-8/12 h-full bg-slate-900 relative overflow-hidden items-center justify-center">
                
                {/* 1. KAR YAĞIŞI (Z-Index: 1) */}
                <Snowfall 
                    color="rgba(255, 255, 255, 0.7)" 
                    snowflakeCount={120} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                />

                {/* 2. ARKA PLAN EFEKTLERİ (Z-Index: 0) */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-950 to-slate-950 z-0"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse z-0"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse delay-700 z-0"></div>
                <div className="absolute inset-0 opacity-5 z-0" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

                {/* 3. ANA İÇERİK (Yazılar ÖNDE olacak - Z-Index: 30) */}
                <div className="relative z-30 w-full max-w-2xl px-8 text-center">
                    {!result && !loading && (
                        <div className="animate-fade-in-up">
                            <div className="inline-block p-8 bg-white/5 backdrop-blur-2xl rounded-full mb-8 border border-white/10 shadow-2xl">
                                <Home size={80} className="text-indigo-400" strokeWidth={1.5} />
                            </div>
                            <h1 className="text-6xl font-black text-white mb-6 tracking-tight">
                                Geleceği <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Keşfet</span>
                            </h1>
                            <p className="text-xl text-slate-400 max-w-lg mx-auto leading-relaxed font-light">
                                İstanbul emlak piyasasının nabzını yapay zeka ile tutun. Saniyeler içinde en doğru fiyat tahminine ulaşın.
                            </p>
                        </div>
                    )}

                    {loading && (
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-8"></div>
                            <h3 className="text-3xl font-bold text-white animate-pulse">Analiz Ediliyor...</h3>
                            <p className="text-slate-400 mt-2 text-lg">Milyonlarca veri noktası taranıyor</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="animate-fade-in-up scale-100">
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                                <span className="inline-block py-1.5 px-5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-bold tracking-wider mb-6 border border-emerald-500/30">
                                    TAHMİN BAŞARILI
                                </span>
                                <h2 className="text-slate-300 text-lg uppercase tracking-widest font-semibold mb-2">Tahmini Piyasa Değeri</h2>
                                <div className="text-7xl md:text-8xl font-black text-white mb-8 drop-shadow-2xl tracking-tighter">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(result.estimated_price)}
                                </div>
                                <button onClick={() => setResult(null)} className="text-slate-400 hover:text-white underline underline-offset-8 decoration-indigo-500 hover:decoration-white transition-all">
                                    Yeni Hesaplama Yap
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- KARDAN ADAM MASKOTU (Yazıların ARKASINDA - Z-Index: 10) --- */}
                <div className="absolute bottom-6 right-6 z-10 flex flex-col items-center pointer-events-none animate-fade-in-up delay-500">
                    {/* Buzlu Efektli Yazı */}
                    <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-1 text-center drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
                        House Price <br/>
                        <span className="text-cyan-300">Prediction</span>
                    </h3>
                    
                    {/* Kardan Adam Görseli (Boyu uzun, yazıların arkasında kalacak şekilde) */}
                    <img 
                        src="https://cdn-icons-png.flaticon.com/512/1409/1409305.png" 
                        alt="Christmas Snowman" 
                        // w-48 (yaklaşık 190px genişlik) ve h-[500px] (uzun boy)
                        className="w-48 h-[500px] drop-shadow-2xl filter brightness-110 hover:scale-105 transition-transform duration-300 object-fill"
                    />
                </div>

                {/* --- ALTTA KAR BİRİKİNTİSİ (Z-Index: 5) --- */}
                <div className="absolute bottom-0 left-0 w-full z-5 pointer-events-none">
                    <svg className="w-full h-auto translate-y-1 scale-105" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#ffffff" fillOpacity="0.4" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        <path fill="#ffffff" fillOpacity="0.8" d="M0,256L48,245.3C96,235,192,213,288,218.7C384,224,480,256,576,266.7C672,277,768,267,864,250.7C960,235,1056,213,1152,208C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/50 to-transparent blur-2xl"></div>
                </div>
            </div>
        </div>
    );
};

export default PredictionForm;