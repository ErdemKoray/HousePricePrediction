import React, { useState, useEffect } from 'react';
import Snowfall from 'react-snowfall';
import { predictPrice, getModelInfo } from '../services/api';
import { Home, MapPin, Shield, CheckCircle, Navigation, Cpu, Activity, Info, X, Award, BarChart3 } from 'lucide-react';
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
    const [modelInfo, setModelInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const [cities, setCities] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [neighborhoods, setNeighborhoods] = useState([]);

    // Kayan yıldızların konfigürasyonu
    const stars = Array.from({ length: 5 }).map((_, i) => {
        const isRTL = Math.random() > 0.5;
        return {
            id: i,
            top: Math.floor(Math.random() * 40) + '%',
            stylePosition: isRTL ? { right: '-50px' } : { left: '-50px' },
            animationClass: isRTL ? 'shooting-star-rtl' : 'shooting-star-ltr',
            delay: Math.random() * 10 + 's'
        };
    });

    useEffect(() => {
        const cityList = Object.keys(locationData);
        setCities(cityList);
        if (cityList.length === 1) {
            const firstCity = cityList[0];
            setFeatures(prev => ({ ...prev, Sehir: firstCity }));
            setDistricts(Object.keys(locationData[firstCity]));
        }

        const fetchModelInfo = async () => {
            const info = await getModelInfo();
            if (info) setModelInfo(info);
        };
        fetchModelInfo();
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
            setError("Bağlantı Hatası veya Sunucu Kapalı");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full h-screen overflow-hidden bg-white">
            {/* Özel CSS Animasyonları */}
            <style>{`
                .shooting-star-base {
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: white;
                    border-radius: 50%;
                    box-shadow: 0 0 0 4px rgba(255,255,255,0.1), 0 0 0 8px rgba(255,255,255,0.1), 0 0 20px rgba(255,255,255,1);
                    animation-duration: 8s;
                    animation-timing-function: linear;
                    animation-iteration-count: infinite;
                    opacity: 0;
                }
                @keyframes anim-rtl {
                    0% { transform: translateX(0) translateY(0) rotate(-45deg); opacity: 1; }
                    100% { transform: translateX(-800px) translateY(800px) rotate(-45deg); opacity: 0; }
                }
                .shooting-star-rtl { animation-name: anim-rtl; }
                .shooting-star-rtl::before {
                    content: ''; position: absolute; top: 50%; right: 0; transform: translateY(-50%);
                    width: 300px; height: 1px; background: linear-gradient(90deg, white, transparent);
                }
                @keyframes anim-ltr {
                     0% { transform: translateX(0) translateY(0) rotate(-135deg); opacity: 1; }
                    100% { transform: translateX(800px) translateY(800px) rotate(-135deg); opacity: 0; }
                }
                .shooting-star-ltr { animation-name: anim-ltr; }
                 .shooting-star-ltr::before {
                    content: ''; position: absolute; top: 50%; left: 0; transform: translateY(-50%) rotate(180deg);
                    width: 300px; height: 1px; background: linear-gradient(90deg, white, transparent);
                }

                /* AĞAÇ SALLANMA EFEKTİ (YENİ EKLENDİ) */
                .tree-sway {
                    transform-origin: bottom center;
                    animation-name: sway;
                    animation-timing-function: ease-in-out;
                    animation-iteration-count: infinite;
                }
                @keyframes sway {
                    0% { transform: rotate(0deg); }
                    25% { transform: rotate(2deg); }
                    50% { transform: rotate(0deg); }
                    75% { transform: rotate(-2deg); }
                    100% { transform: rotate(0deg); }
                }
            `}</style>
            
            {/* --- SOL PANEL: FORM --- */}
            <div className="w-full md:w-5/12 lg:w-4/12 h-full bg-white flex flex-col border-r border-gray-100 shadow-xl z-20 overflow-y-auto custom-scrollbar">
                <div className="p-6 md:p-8 flex-grow flex flex-col justify-center">
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
                
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    {modelInfo ? (
                        <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <Cpu size={14} className="text-indigo-500" />
                                <span className="font-bold">Model:</span> {modelInfo.active_model || 'AI Model'}
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Activity size={14} className="text-emerald-500" />
                                <span className="font-bold">Başarı:</span> %{modelInfo.best_score_r2 ? (modelInfo.best_score_r2 * 100).toFixed(1) : '-'}
                            </div>
                        </div>
                    ) : (
                        <p className="text-[10px] text-gray-300 text-center uppercase font-bold tracking-widest">Powered by AI Engine v1.0</p>
                    )}
                </div>
            </div>

            {/* --- SAĞ PANEL --- */}
            <div className="hidden md:flex w-7/12 lg:w-8/12 h-full bg-slate-900 relative overflow-hidden items-center justify-center">
                
                {/* 1. Kayan Yıldızlar */}
                {stars.map((star) => (
                    <div 
                        key={star.id} 
                        className={`shooting-star-base ${star.animationClass} z-10`}
                        style={{ top: star.top, ...star.stylePosition, animationDelay: star.delay }}
                    ></div>
                ))}

                {/* Kar Yağışı */}
                <Snowfall 
                    color="rgba(255, 255, 255, 0.7)" 
                    snowflakeCount={120} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                />

                {/* Arka Plan */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-blue-950 to-slate-950 z-0"></div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse z-0"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse delay-700 z-0"></div>
                <div className="absolute inset-0 opacity-5 z-0" style={{backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>

                {/* Ana İçerik */}
                <div className="relative z-30 w-full max-w-2xl px-8 text-center pb-20">
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
                            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-[2rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-500"></div>
                                <span className="inline-block py-1.5 px-5 rounded-full bg-emerald-500/20 text-emerald-300 text-sm font-bold tracking-wider mb-6 border border-emerald-500/30">
                                    TAHMİN BAŞARILI
                                </span>
                                <h2 className="text-slate-300 text-lg uppercase tracking-widest font-semibold mb-2">Tahmini Piyasa Değeri</h2>
                                <div className="text-6xl md:text-7xl font-black text-white mb-4 drop-shadow-2xl tracking-normal">
                                    {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 0 }).format(result.estimated_price)}
                                </div>
                                
                                <button 
                                    onClick={() => setShowDetails(true)} 
                                    className="flex items-center gap-2 mx-auto text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all text-sm font-medium"
                                >
                                    <Info size={16} />
                                    Analiz Detaylarını İncele
                                </button>

                                <button onClick={() => setResult(null)} className="mt-6 text-slate-500 hover:text-slate-300 text-sm underline underline-offset-4 decoration-indigo-500/50 hover:decoration-indigo-400 transition-all">
                                    Yeni Hesaplama Yap
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* --- MASKOTLAR & SÜSLEMELER --- */}
                
                {/* Kardan Adam (SOLDA) */}
                <div className="absolute bottom-[6.25rem] left-16 z-20 pointer-events-none animate-fade-in-up delay-500">
                    <img 
                        src="https://cdn-icons-png.flaticon.com/512/3912/3912767.png" 
                        alt="Cute Snowman" 
                        className="w-40 h-auto drop-shadow-2xl filter brightness-110 hover:scale-105 transition-transform duration-300"
                    />
                </div>

                {/* SALLANAN AĞAÇLAR (GÜNCELLENDİ) */}
                <div className="absolute bottom-[70px] right-4 z-40 flex items-end gap-6 pointer-events-none animate-fade-in-up delay-700">

                    {/* Ağaç 1 (Karlı) - Orta Boy */}
                    <div className="relative top-[2px] left-[-4px]">
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/9454/9454285.png" 
                            alt="Snowy Pine Tree" 
                            className="w-16 h-auto drop-shadow-lg brightness-95 tree-sway"
                            style={{ animationDuration: '12s', animationDelay: '0s' }}
                        />
                    </div>

                    {/* Ağaç 2 (Süslü) - Büyük Boy */}
                    <div className="relative top-[-11px] left-[2px] z-10">
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/1328/1328357.png" 
                            alt="Decorated Christmas Tree" 
                            className="w-24 h-auto drop-shadow-xl tree-sway"
                            style={{ animationDuration: '6s', animationDelay: '1s' }}
                        />
                    </div>

                    {/* Ağaç 3 (Karlı) - Büyük Boy */}
                    <div className="relative top-[-35px] left-[6px]">
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/9454/9454285.png" 
                            alt="Snowy Pine Tree" 
                            className="w-20 h-auto drop-shadow-lg brightness-95 tree-sway"
                            style={{ animationDuration: '5.5s', animationDelay: '0.5s' }}
                        />
                    </div>

                    {/* Ağaç 4 (Süslü) - Küçük Boy */}
                    <div className="relative top-[-50px] left-[-2px]">
                        <img 
                            src="https://cdn-icons-png.flaticon.com/512/1328/1328357.png" 
                            alt="Decorated Christmas Tree" 
                            className="w-14 h-auto drop-shadow-md brightness-90 tree-sway"
                            style={{ animationDuration: '3.5s', animationDelay: '1.5s' }}
                        />
                    </div>

                </div>

                {/* Alt Kar Birikintisi (SVG) */}
                <div className="absolute bottom-0 left-0 w-full z-5 pointer-events-none">
                    <svg className="w-full h-auto translate-y-1 scale-105" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path fill="#ffffff" fillOpacity="1.0" d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,202.7C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                        <path fill="#ffffff" fillOpacity="0.8" d="M0,256L48,245.3C96,235,192,213,288,218.7C384,224,480,256,576,266.7C672,277,768,267,864,250.7C960,235,1056,213,1152,208C1248,203,1344,213,1392,218.7L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white via-white/50 to-transparent blur-2xl"></div>
                </div>

                {/* --- DETAY MODALI (POPUP) --- */}
                {showDetails && modelInfo && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowDetails(false)}></div>
                        
                        <div className="relative bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
                            <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-slate-800/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                                        <BarChart3 size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Yapay Zeka Performans Raporu</h3>
                                        <p className="text-xs text-slate-400">Tüm modellerin karşılaştırmalı analiz sonuçları</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowDetails(false)} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="bg-gradient-to-r from-emerald-900/40 to-slate-800 border border-emerald-500/30 p-5 rounded-xl flex items-center justify-between">
                                    <div>
                                        <div className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Award size={14} /> En İyi Model
                                        </div>
                                        <div className="text-2xl font-black text-white">{modelInfo.active_model}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black text-emerald-400">%{modelInfo.best_score_r2 ? (modelInfo.best_score_r2 * 100).toFixed(1) : '-'}</div>
                                        <div className="text-xs text-slate-400 font-medium">Doğruluk Skoru (R²)</div>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Tüm Modellerin Karşılaştırması</h4>
                                    <div className="grid gap-3">
                                        {modelInfo.all_results && Object.entries(modelInfo.all_results)
                                            .sort(([,a], [,b]) => b.r2_score - a.r2_score)
                                            .map(([name, scores]) => (
                                            <div key={name} className={`p-4 rounded-lg border flex items-center justify-between transition-all ${name === modelInfo.active_model ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'}`}>
                                                <div className="flex items-center gap-3">
                                                    {name === modelInfo.active_model ? (
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                                    ) : (
                                                        <div className="w-2 h-2 rounded-full bg-slate-600"></div>
                                                    )}
                                                    <span className={`font-bold ${name === modelInfo.active_model ? 'text-white' : 'text-slate-300'}`}>{name}</span>
                                                </div>
                                                <div className="flex items-center gap-6 text-right">
                                                    <div>
                                                        <div className="text-[10px] text-slate-500 uppercase font-bold">Ort. Hata (MAE)</div>
                                                        <div className="text-sm font-mono text-slate-300">
                                                            ₺{new Intl.NumberFormat('tr-TR').format(scores.mae)}
                                                        </div>
                                                    </div>
                                                    <div className="w-16">
                                                        <div className="text-[10px] text-slate-500 uppercase font-bold">R² Skoru</div>
                                                        <div className={`text-sm font-black ${name === modelInfo.active_model ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                            %{(scores.r2_score * 100).toFixed(1)}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PredictionForm;