# 🎬 CineTrack

Türe göre film keşfetmeyi, rastgele film önerisi almayı ve izlediğin ya da favori filmlerini kaydetmeyi sağlayan, Netflix tarzı poster arayüzlü bir film sitesi.

Film verileri [TMDB](https://www.themoviedb.org/) API'sinden çekilir.

## Özellikler

- **Türe göre listeleme:** Action, Thriller, Comedy, Horror, Sci-Fi ve Romance türleri. Ayrıca en yüksek puanlı filmler ("Top Rated").
- **Rastgele film:** 🎲 butonu, ekrandaki listeden tek bir film önerir ve o kartı vurgular.
- **Puana göre sıralama:** Puan (yüksekten düşüğe veya düşükten yükseğe) ve çıkış tarihine göre sıralama.
- **Arama:** Tüm TMDB filmlerinde arama yapar. Favorites ve Watched sekmelerinde ise kayıtlı listende arar.
- **Favoriler:** Kartın üzerindeki kalp ile favorilere ekle ve çıkar.
- **İzlediklerim:** Kartın üzerindeki göz simgesiyle filmi izledim olarak işaretle.
- **Kalıcı kayıt:** Favoriler ve izlenenler tarayıcının `localStorage` alanında saklanır, sayfayı kapatsan da silinmez.
- **Duyarlı tasarım:** Koyu tema, hover'da yükselip parlayan poster kartları ve telefon uyumlu görünüm.

## Kullanılan Teknolojiler

- HTML5
- CSS3 (Grid, Flexbox, CSS değişkenleri)
- JavaScript (ES6+, `fetch` ve `async/await`)
- [TMDB API](https://developer.themoviedb.org/docs)

## Proje Yapısı

```
cineTrack/
├── index.html   # Sayfa yapısı
├── style.css    # Tasarım
├── script.js    # API istekleri ve sayfa mantığı
└── README.md
```

## Kurulum

Projeyi çalıştırmak için ek bir kuruma gerek yoktur (`npm install` gerekmez).

1. Projeyi indir veya klonla:
   ```bash
   git clone https://github.com/elif-uzundere/cineTrack.git
   cd cineTrack
   ```
2. [themoviedb.org](https://www.themoviedb.org/) üzerinde ücretsiz bir hesap aç ve **Ayarlar → API** bölümünden bir API anahtarı al.
3. `script.js` dosyasının en üstündeki satıra kendi anahtarını yaz:
   ```js
   const API_KEY = "BURAYA_API_ANAHTARIN";
   ```
4. Projeyi VS Code'da aç, `index.html` açıkken **Live Server** eklentisinin **Go Live** butonuna bas.
   Adres `http://127.0.0.1:5500/index.html` şeklinde açılmalıdır.

## Notlar

- Sitede görünen puanlar **TMDB puanıdır**, IMDb puanı ile yakındır ama aynı değildir.
- API anahtarı tarayıcıda görünür olduğu için kendi anahtarını koda yazıp herkese açık bir yerde yayınlama.
- Film başlıkları Türkçe (`tr-TR`) olarak çekilir, çevirisi olmayan filmler orijinal adıyla görünür.

## Gelecek Fikirleri

- IMDb puanı için OMDb API'si eklemek
- Film detay sayfası (özet, oyuncular, fragman)
- Daha fazla sonuç için sayfalama veya "Daha fazla yükle" butonu
- Giriş sistemi ve favorilerin veritabanında tutulması

## Lisans

Bu proje kişisel öğrenme amacıyla yapılmıştır. Film verileri ve posterler TMDB'ye aittir.

> This product uses the TMDB API but is not endorsed or certified by TMDB.
