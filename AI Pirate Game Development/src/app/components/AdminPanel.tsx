import { useState, useEffect } from "react";
import { Save, RefreshCw, Trash2, LayoutDashboard, Mic, Key, Globe, Activity } from "lucide-react";

export function AdminPanel() {
  // Stan konfiguracji
  const [config, setConfig] = useState({
    baseUrl: "http://localhost:8000",
    endpoints: { zoltodziob: "", korsarz: "", duch: "" },
    apiKeys: { elevenLabs: "", openai: "" }, // Nowość: Klucze
    selectedMicId: "" // Nowość: Wybrany mikrofon
  });

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string>("");

  // Ładowanie configu i urządzeń
  useEffect(() => {
    const saved = localStorage.getItem("pirate_admin_config");
    if (saved) setConfig(JSON.parse(saved));

    // Pobierz listę mikrofonów
    navigator.mediaDevices.enumerateDevices().then(devices => {
      setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
    });
  }, []);

  const handleSave = () => {
    localStorage.setItem("pirate_admin_config", JSON.stringify(config));
    alert("Zapisano! Strona zostanie odświeżona.");
    window.location.reload();
  };

  const handleReset = () => {
    if(confirm("Czy na pewno chcesz przywrócić ustawienia fabryczne?")) {
        localStorage.removeItem("pirate_admin_config");
        window.location.reload();
    }
  };

  const testConnection = async () => {
    setStatus("Sprawdzam...");
    try {
        const res = await fetch(`${config.baseUrl}/docs`); // Sprawdzamy czy FastAPI żyje
        if (res.ok) setStatus("✅ Backend dostępny (200 OK)");
        else setStatus(`⚠️ Backend odpowiada błędem: ${res.status}`);
    } catch (e) {
        setStatus("❌ Brak połączenia z backendem!");
    }
  };

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white p-4 font-mono">
        <div className="bg-gray-900 p-8 rounded-xl border border-gray-800 w-full max-w-md shadow-2xl">
          <h1 className="text-xl font-bold mb-6 flex items-center gap-2 text-yellow-500">
            <LayoutDashboard /> DOSTĘP ADMINISTRACYJNY
          </h1>
          <input 
            type="password" 
            placeholder="Hasło" 
            className="w-full p-3 bg-black border border-gray-700 rounded mb-4 text-white focus:border-yellow-500 outline-none"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && password === "pirat123" && setIsLocked(false)}
          />
          <button onClick={() => password === "pirat123" ? setIsLocked(false) : alert("Błąd")} className="w-full bg-yellow-600 hover:bg-yellow-500 text-black p-3 rounded font-bold transition-colors">ZALOGUJ</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <LayoutDashboard className="text-yellow-500" /> PANEL STEROWANIA
            </h1>
            <p className="text-gray-500 text-sm mt-1">AI Pirate Game • v1.0.2 • Build: Production</p>
          </div>
          <div className="flex gap-3">
             <button onClick={() => window.location.href = "/"} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded border border-gray-700 text-sm font-bold">WRÓĆ DO GRY</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* 1. KONFIGURACJA SIECI */}
            <section className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg space-y-4">
                <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2"><Globe size={20}/> Połączenie Backend</h2>
                
                <div>
                    <label className="block text-xs font-bold text-gray-500 mb-1">BASE URL (Główny adres)</label>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={config.baseUrl}
                            onChange={(e) => setConfig({...config, baseUrl: e.target.value})}
                            className="flex-1 bg-black border border-gray-700 p-3 rounded text-white font-mono text-sm focus:border-blue-500 outline-none"
                        />
                        <button onClick={testConnection} className="bg-blue-900/30 text-blue-400 px-3 rounded border border-blue-900 hover:bg-blue-900/50"><Activity size={18}/></button>
                    </div>
                    {status && <p className="text-xs mt-2 font-mono">{status}</p>}
                </div>

                <div className="pt-4 border-t border-gray-800">
                    <label className="block text-xs font-bold text-gray-500 mb-2">Endpointy Postaci (Opcjonalne nadpisanie)</label>
                    <div className="grid gap-3">
                        {['zoltodziob', 'korsarz', 'duch'].map(char => (
                            <div key={char} className="flex items-center gap-2">
                                <span className="w-24 text-xs uppercase font-bold text-gray-600">{char}</span>
                                <input 
                                    type="text" 
                                    placeholder={`Domyślnie: ${config.baseUrl}/${char}`}
                                    value={(config.endpoints as any)[char]}
                                    onChange={(e) => setConfig({
                                        ...config, 
                                        endpoints: { ...config.endpoints, [char]: e.target.value }
                                    })}
                                    className="flex-1 bg-black border border-gray-700 p-2 rounded text-gray-400 font-mono text-xs focus:text-white"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 2. SPRZĘT I KLUCZE */}
            <div className="space-y-8">
                
                {/* Mikrofon */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg space-y-4">
                    <h2 className="text-xl font-bold text-green-400 flex items-center gap-2"><Mic size={20}/> Sprzęt Audio</h2>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Domyślny Mikrofon</label>
                        <select 
                            value={config.selectedMicId}
                            onChange={(e) => setConfig({...config, selectedMicId: e.target.value})}
                            className="w-full bg-black border border-gray-700 p-3 rounded text-white text-sm focus:border-green-500 outline-none"
                        >
                            <option value="">-- Domyślny Systemowy --</option>
                            {audioDevices.map(device => (
                                <option key={device.deviceId} value={device.deviceId}>
                                    {device.label || `Mikrofon ${device.deviceId.slice(0,5)}...`}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-600 mt-2">Uwaga: Przeglądarka może wymagać ponownego zezwolenia po zmianie.</p>
                    </div>
                </section>

                {/* API Keys */}
                <section className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-lg space-y-4">
                    <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2"><Key size={20}/> Klucze API (Opcjonalne)</h2>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">ElevenLabs Key</label>
                        <input 
                            type="password" 
                            value={config.apiKeys.elevenLabs}
                            onChange={(e) => setConfig({...config, apiKeys: { ...config.apiKeys, elevenLabs: e.target.value }})}
                            placeholder="sk-..."
                            className="w-full bg-black border border-gray-700 p-3 rounded text-white font-mono text-sm focus:border-purple-500 outline-none"
                        />
                    </div>
                </section>
            </div>
        </div>

        {/* FOOTER ACTIONS */}
        <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0a0a0a]/90 backdrop-blur border-t border-gray-800 flex justify-center gap-4">
            <button onClick={handleReset} className="px-8 py-4 bg-red-900/20 hover:bg-red-900/40 text-red-500 border border-red-900/50 rounded-xl font-bold flex items-center gap-2 transition-all">
              <Trash2 size={20} /> RESET
            </button>
            <button onClick={handleSave} className="px-12 py-4 bg-yellow-600 hover:bg-yellow-500 text-black rounded-xl font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(202,138,4,0.3)] transition-all transform hover:scale-105">
              <Save size={20} /> ZAPISZ KONFIGURACJĘ
            </button>
        </div>
        
        <div className="h-20"></div> {/* Spacer na footer */}
      </div>
    </div>
  );
}