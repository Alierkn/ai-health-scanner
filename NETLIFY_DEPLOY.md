# Netlify Deployment Rehberi

## 🚀 Netlify'de Deployment Adımları

### 1. Netlify'de Yeni Site Oluştur
- [netlify.com](https://netlify.com) adresine git
- "New site from Git" butonuna tıkla
- GitHub repository'ni seç

### 2. Build Ayarları
```
Build command: npm run build
Publish directory: .next
```

### 3. Environment Variables Ekle
Site Settings → Environment Variables bölümünde:
```
OPENAI_API_KEY = your_openai_api_key_here
```

### 4. Plugin Kurulumu
Site Settings → Plugins bölümünde:
- "Next.js Runtime" plugin'ini aktifleştir

### 5. Deploy Et
- "Deploy site" butonuna tıkla
- Build loglarını takip et

## 🔧 Sorun Giderme

### API Endpoint Sorunu
Eğer `/api/analyze` endpoint'i çalışmıyorsa:
1. Netlify Functions klasörünün doğru yerde olduğunu kontrol et
2. Environment variable'ların doğru ayarlandığını kontrol et
3. Build loglarında hata olup olmadığını kontrol et

### CORS Sorunu
Eğer CORS hatası alıyorsan:
1. `public/_headers` dosyasının doğru yüklendiğini kontrol et
2. Netlify Functions'ın CORS header'larını döndürdüğünü kontrol et

### Build Hatası
Eğer build başarısız oluyorsa:
1. Node.js versiyonunu kontrol et (18+ gerekli)
2. Dependencies'lerin doğru yüklendiğini kontrol et
3. TypeScript hatalarını kontrol et

## 📱 Test Etme
Deploy edildikten sonra:
1. Netlify URL'ini mobil cihazda aç
2. HTTPS üzerinden çalıştığını kontrol et
3. Kamera izinlerini ver
4. Food product tarayarak test et

## 🔒 Güvenlik
- API key'in environment variable olarak ayarlandığından emin ol
- HTTPS üzerinden çalıştığından emin ol
- Rate limiting'in çalıştığını test et
