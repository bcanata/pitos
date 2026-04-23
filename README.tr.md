<p align="center">
  <img src="public/logo.png" alt="PitOS" width="260">
</p>

# PitOS

FRC (FIRST Robotics Competition) takımları için yapay zeka destekli bir çalışma alanı. Slack tarzı kanallar, görev takibi, karar kayıtları ve jüri mülakatı hazırlığı — hepsi sadece sohbet etmekle kalmayıp gerçekten iş yapan Claude ajanlarıyla entegre.

[Built with Claude Opus 4.7 Hackathon](https://cerebralvalley.ai/e/built-with-4-7-hackathon) için geliştirildi.

> **Read in:** [English](README.md) · [Other language? →](https://github.com/bcanata/pitos/issues/new?labels=translation-request&template=translation-request.md)

---

## Hızlı başlangıç

```bash
npx pitos-app
```

Bu kadar. Sihirbaz projeyi iskeletler, bağımlılıkları kurar, veritabanınızı hazırlar, isteğe bağlı olarak Cloudflare üzerinde özel bir alan adı ayarlar ve Vercel'e dağıtır. Sonunda çalışan bir oturum açma bağlantısı alırsınız — baştan sona yaklaşık 2 dakika.

**Gereksinimler:**
- Node.js 20+
- Bir [Claude API anahtarı](https://console.anthropic.com) (`sk-ant-...`)
- *(İsteğe bağlı)* Üretim dağıtımları için bir [Vercel hesabı](https://vercel.com)
- *(İsteğe bağlı)* Ücretsiz işlem e-postası için bir [Resend hesabı](https://resend.com) (ayda 3.000 adet)
- *(İsteğe bağlı)* Özel alan adı için bir [Cloudflare hesabı](https://dash.cloudflare.com)

---

## Kurulum sihirbazı ne yapar

Boş bir dizinden `npx pitos-app` çalıştırmak etkileşimli bir sihirbazı başlatır. **Zorunlu** olarak işaretlenenler dışındaki tüm adımlar isteğe bağlıdır.

### 1. Proje iskeleti
Zaten bir PitOS kopyasında değilseniz, sihirbaz paketi yeni bir dizine kopyalar ve `npm install` çalıştırır. İstendiğinde dizin adını seçin.

### 2. Claude API anahtarı *(zorunlu)*
`sk-ant-...` anahtarınızı yapıştırın. Sihirbaz, devam etmeden önce bunu Anthropic API'sine karşı doğrular — yazım hataları gözden kaçmaz.

### 3. Dil
On yerleşik dilden birini seçin (English, Türkçe, Español, Français, Deutsch, Português, 中文, 日本語, עברית veya başka herhangi biri). "Other" seçeneği, tüm kurulum paketinin istek üzerine Claude tarafından dilinize çevrilmesini tetikler.

### 4. Takım bilgileri *(zorunlu)*
- **Takım numarası** — örn. `8092` (demo / sezon dışı için boş bırakın)
- **Takım adı** — örn. *Nordic Storm*
- **Adınız** ve **e-posta adresiniz** — çalışma alanı yöneticisi siz olacaksınız

### 5. E-posta sağlayıcı *(isteğe bağlı)*
Geliştirme aşamasında bunu atlayın — sihirli bağlantı oturum açma URL'leri konsola yazdırılır.

Üç seçenekten birini seçin:

**Resend (önerilir — ayda 3.000 e-posta ücretsiz)**
- [resend.com](https://resend.com) adresinde ücretsiz bir hesap oluşturun ve alan adınızı ekleyin
- `re_*` API anahtarınızı ve doğrulanmış gönderen adresini yapıştırın
- Ücretsiz katman, herhangi bir FRC takımını süresiz olarak karşılar

**Cloudflare Email Sending (isteğe bağlı — Workers Paid 5$/ay gerektirir)**
- **Cloudflare Account ID** — Cloudflare kontrol paneli kenar çubuğundan
- **Cloudflare Email API token** — `Email Sending` izinli `cfut_*` kapsamlı kullanıcı belirteci
- **Gönderen e-posta adresi** — örn. `noreply@yourteam.com`
- Not: Workers Paid planını (5$/ay) gerektirir; ücretsiz katmanda mevcut değildir

**Atla** — sihirli bağlantı URL'leri sunucu konsoluna yazdırılır (yalnızca geliştirme, oturum açmak için kopyala-yapıştır)

### 6. Özel alan adı *(isteğe bağlı)*
Vercel dağıtımınıza `pitos.yourteam.com` gibi bir alan adı bağlayın.

Sizden bir **Cloudflare API Token** istenecek. [dash.cloudflare.com/profile/api-tokens](https://dash.cloudflare.com/profile/api-tokens) adresinde şu kapsamlarla bir tane oluşturun:

| İzin | Neden |
|---|---|
| `Zone:Zone:Read` | Alan adınızın zone ID'sini bulmak için |
| `Zone:DNS:Edit` | CNAME + SPF TXT kayıtlarını oluşturmak için |
| `Zone:Email Routing Rules:Read` | *(isteğe bağlı)* E-posta iletilebilirliği için Cloudflare'in DKIM anahtarını çekmek |

Belirteç **yalnızca kurulum sırasında** kullanılır — asla `.env.local` dosyasına yazılmaz veya Vercel'e gönderilmez. Kapsamlı belirteç kullanmayı tercih etmiyorsanız, DNS'yi manuel olarak yapılandırın ve bu adımı atlayın.

Sihirbaz:
1. Belirteci `/user/tokens/verify` ile doğrular
2. Alan adınıza `CNAME → cname.vercel-dns.com` kaydı oluşturur
3. SPF TXT kaydını ekler
4. DKIM TXT kaydını yayınlar (Email Routing birini sağlarsa)
5. Alan adını Vercel projenize ekler ve `APP_URL`'yi eşleşecek şekilde günceller

Belirteç reddedilirse, alan adı kurulumu atlanır ancak dağıtımın geri kalanı devam eder.

### 6. Kalıcı veritabanı *(isteğe bağlı, üretim için önerilir)*
Başarılı bir Vercel dağıtımından sonra sihirbaz, kalıcı SQLite için [Turso](https://turso.tech) kurmak isteyip istemediğinizi sorar. Bu olmadan veriler `/tmp/pitos.db` içinde yaşar ve her soğuk başlatmada silinir.

Turso ücretsiz katmanı: 9 GB depolama, ayda 500 milyon satır okuma — herhangi bir FRC takımı için fazlasıyla yeterli.

1. [turso.tech/app/databases/new](https://turso.tech/app/databases/new) adresinde ücretsiz bir veritabanı oluşturun
2. `libsql://your-db.turso.io` URL'sini ve auth belirtecini sihirbaza kopyalayın

Sihirbaz her ikisini de Vercel'e iletir ve migrasyonların yeni DB üzerinde çalışması için yeniden dağıtımı tetikler.

### 7. Vercel'e dağıtım *(isteğe bağlı)*
Son adım bir üretim dağıtımı sunar. Kabul edilirse, sihirbaz:
- `vercel link` çalıştırır (etkileşimli — bir takım ve proje adı seçin)
- `ANTHROPIC_API_KEY`, `AUTH_SECRET` ve e-posta sağlayıcı değişkenlerinizi ortam değişkenleri olarak iletir
- `vercel --prod --yes` çalıştırır
- `APP_URL`'yi dağıtılan URL'ye (veya ayarladıysanız özel alan adınıza) günceller
- `APP_URL`'nin etkili olması için yeniden dağıtım yapar

Takım kurulumunu dağıtılan URL'deki `/onboarding` üzerinden tamamlarsınız.

---

## Özellikler

**Channels** — Slack tarzı iş parçacıklı mesajlaşma. Her mesaj, soruları yanıtlayan, görevler oluşturan veya öğrenci muhakemesini geliştirmek için "jüri refleksi" soruları (kanıt talepleri, neden soruları, öğretme modu yönlendirmeleri) soran bir Claude ajanını tetikleyebilir.

**Tasks** — Kanal tartışmasından ortaya çıkan aksiyon maddeleri. Öğretme modu görevleri, öğrencilerin tamamlandı olarak işaretlemeden önce yaklaşımlarını açıklamalarını ister.

**Decisions** — Tasarım ve strateji kararlarının gerekçeleri, değerlendirilen alternatifler ve odadaki kişilerle birlikte kayıt altına alındığı bir günlük. Sezon sonu özetleme için aranabilir.

**Ask** — Takımın daha önce söylediği veya karar verdiği her şey üzerinde semantik arama. *"Geçen yıl swerve drift sorununu nasıl çözdük?"* diye sorun ve orijinal mesajlara bağlantılı, kaynaklı bir yanıt alın.

**Judge simulator** — Gerçekçi bir sahte jüri mülakatı. Claude jüri rolünü oynar, cevaplara göre zorluğu ayarlar ve güçlü cevaplar + üzerinde çalışılacak eksikliklerle bir değerlendirme oluşturur.

**Exit interview** — Claude ile sezon sonu birebir görüşme. Öğrencilerin neler öğrendiğini, onları neyin hayal kırıklığına uğrattığını ve gelecek yıl ne istediklerini yakalar — sezon özetlemesi için ham girdi.

**Season recap** — Kanal geçmişi, kararlar ve çıkış mülakatlarından tam bir retrospektif belge oluşturur. Ödül başvuruları ve sponsor raporları için hazırdır.

**Settings** — Takım yapılandırması, üye yönetimi, dil değişikliği, API anahtarı rotasyonu.

---

## İşletme maliyetleri

FRC takımları dar bütçelerle çalışır. PitOS, bir öğrencinin harçlığına sığacak şekilde tasarlanmıştır — **kalıcı veriler ve gerçek e-postalarla ayda 0$ karşılığında gerçek bir üretim örneği** çalıştırabilirsiniz (artı Claude API belirteçleri).

### Servis bazlı döküm (Nisan 2026)

| Servis | Ücretsiz katman | Ücretli başlangıç | Notlar |
|---|---|---|---|
| **Anthropic Claude API** | Kayıtta 5$ deneme kredisi | Kullandıkça öde | Ana değişken maliyet — aşağıya bakın |
| **Vercel (Hobby)** | 1M fonksiyon çağrısı, 4 CPU-saat Aktif CPU, 100 GB veri aktarımı, 1M edge isteği, **60s maks fonksiyon süresi** | 20$ / kullanıcı / ay (Pro) + 20$ kullanım kredisi | Hobby katmanı "kişisel, ticari olmayan kullanım" içindir |
| **Netlify (Free)** | 100 GB bant genişliği, 300 derleme dk, 125k fonksiyon çağrısı | 19$ / kullanıcı / ay (Pro) | Katı üst sınırlar — site askıya alınır, sürpriz faturalar yok |
| **Resend** | **Ayda 3.000 e-posta**, 1 özel alan adı, günde 100 | 20$ / ay (Pro, 50k e-posta) | Varsayılan e-posta sağlayıcı — sihirli bağlantı oturum açma için ideal |
| **Cloudflare DNS + Email Routing** | Sınırsız zone, sınırsız DNS kaydı, gelen e-posta yönlendirme | Ücretsiz | CLI'nin yaptığı alan adı + DNS otomasyonunu kapsar |
| **Cloudflare Workers Paid** (Email Sending için isteğe bağlı) | — | **5$ / ay** minimum | Alternatif e-posta sağlayıcı; herhangi bir giden e-posta göndermek için Workers Paid gerektirir |
| **Turso (LibSQL)** | **9 GB depolama, 500M satır okuma, 500 DB** | 4,99$ / ay (Developer) | Üretimde kalıcı SQLite — CLI kurulumuna entegre |
| **Özel alan adı** | — | ~10–15$ / yıl | İsteğe bağlı — bir `*.vercel.app` veya `*.netlify.app` URL'si de iyi çalışır |

### Claude API fiyatlandırması (milyon belirteç başına)

| Model | Giriş | Çıkış | Önbellek okuma (%10) | Batch (%50 indirim) |
|---|---|---|---|---|
| **Haiku 4.5** | 1$ | 5$ | 0,10$ | 0,50$ / 2,50$ |
| **Sonnet 4.6** | 3$ | 15$ | 0,30$ | 1,50$ / 7,50$ |
| **Opus 4.7** | 5$ | 25$ | 0,50$ | 2,50$ / 12,50$ |

PitOS, kalite için `lib/agents/*.ts` içinde varsayılan olarak **Opus 4.7** kullanır. Maliyetleri 5 kat azaltmak için yüksek frekanslı, düşük riskli ajanlar (kanal yanıtları, görev çıkarımı) için model ID'sini `claude-haiku-4-5` ile değiştirin ve muhakeme kalitesinin en çok önem taşıdığı judge-sim ve season-recap için Opus'u koruyun. Prompt önbellekleme SDK tarafından zaten destekleniyor — önbellek okumaları giriş fiyatının %10'una mal olur.

**Aktif şekilde sohbet eden 20 öğrencilik bir takım için kaba aylık tahmin:**
- Hepsi Opus 4.7: **Ayda 15–40$**
- Karışık (kanallar için Haiku, ağır ajanlar için Opus): **Ayda 3–8$**
- Hepsi Haiku 4.5: **Ayda 1–3$**

### Maliyet tarifleri

**Tamamen ücretsiz üretim (önerilen başlangıç noktası):**
- Vercel Hobby veya Netlify Free
- **Resend ücretsiz katmanı** (ayda 3.000 e-posta) gerçek sihirli bağlantı e-postaları için
- **Turso ücretsiz katmanı** (9 GB) kalıcı SQLite için — veriler soğuk başlatmalarda hayatta kalır
- Tüm ajanlar için Claude Haiku 4.5
- **Maliyet: Ayda 0$** + Anthropic kullanımı (20 kişilik takım için ~aylık 1–3$)

**Tamamen ücretsiz (geliştirme / hackathon):**
- E-postayı atla — sihirli bağlantı URL'leri sunucu günlüklerine yazdırılır (oturum açmak için kopyala-yapıştır)
- Geçici `/tmp/pitos.db` SQLite (soğuk başlatmada veri sıfırlanır)
- **Maliyet: Ayda 0$** + Anthropic kullanımı

**Sponsorlu gerçek takım (~aylık 25$ + API):**
- Vercel Pro (aylık 20$) — sponsor logolarıyla ticari kullanımda yasal netlik
- Resend ücretsiz katmanı (veya tercih ederseniz Cloudflare Workers Paid aylık 5$)
- Turso ücretsiz veya Developer (daha fazla DB'ye ihtiyacınız varsa aylık 5$)
- Özel alan adı (aylık amortisman 1$)
- **Maliyet: Ayda 20–25$ + ~aylık 10–40$ Claude kullanımı**

### Dikkat edilecek konular

- **Vercel Hobby "ticari değildir"** — FRC takımları kar amacı gütmeyen/eğitim amaçlıdır, ancak adı geçen sponsorlarınız varsa veya site üzerinden ürün satıyorsanız, mentorunuzla konuşun veya Netlify Free'ye (böyle bir madde yok) geçin ya da Pro'ya yükseltin.
- **Vercel Hobby fonksiyon süresi 60s ile sınırlıdır** (varsayılan 10s, 60s'ye kadar yapılandırılabilir). Uzun Opus 4.7 ajan çalıştırmaları — judge-sim sahte mülakatlar, season-recap üretimi — bunu aşabilir. Belirtileri, karmaşık ajan isteklerinde 504 zaman aşımlarıdır. Pro, 300s açar. Çözüm yolları: daha hızlı yanıtlar için Haiku 4.5 kullanın, SSE üzerinden yayın yapın (zaten destekleniyor) veya uzun ajan işlerini arka plan işlerine bölün.
- **Cloudflare Email Sending ücretsiz değildir.** *Herhangi bir* giden e-posta göndermek için Workers Paid planını (aylık 5$) gerektirir. Kurulum sihirbazı varsayılan olarak Resend'e (ayda 3.000 e-posta ücretsiz) geçer. Cloudflare Email, zaten Workers Paid'de olan takımlar için bir seçenek olarak hala desteklenmektedir.
- **Cloudflare Workers Free, Email Sending için yeterli değildir.** Ücretsiz katman size günde 100k istek ve çağrı başına 10ms CPU verir, ancak Email Sending özellikle Workers Paid gerektirir. Ücretsiz katman diğer her şey (DNS, önbellekleme, SSL) için uygundur.
- **Geçici SQLite, soğuk başlatmada sıfırlanır.** Turso olmadan, DB `/tmp/pitos.db` konumunda yaşar ve Vercel/Netlify çağrılar arasında siler. Kurulum sihirbazı, dağıtımdan hemen sonra Turso'yu (ücretsiz 9 GB) yapılandırmayı önerir.
- **Claude API deneme kredileri sona erer.** Anthropic kayıtta 5$ ücretsiz kredi verir. Bundan sonra bir ödeme yöntemine ihtiyacınız var. Canlıya geçmeden önce bir aylık test için ~5–10$ bütçeleyin.

---

## Mimari

- **Çatı** — Turbopack ile Next.js 16 App Router (varsayılan paketleyici)
- **Arayüz** — React 19, Tailwind v4, [shadcn/ui](https://ui.shadcn.com)
- **Veritabanı** — `@libsql/client` + [Drizzle ORM](https://orm.drizzle.team) üzerinden LibSQL; geliştirmede yerel `file:./pitos.db`, üretimde Turso (`TURSO_DATABASE_URL`)
- **Kimlik doğrulama** — Sihirli bağlantı belirteçleriyle [Lucia v3](https://lucia-auth.com) (şifre yok)
- **E-posta** — Sağlayıcı zinciri: [Resend](https://resend.com) (`RESEND_API_KEY`) → [Cloudflare Email Sending](https://blog.cloudflare.com/email-for-agents/) (`CLOUDFLARE_EMAIL_API_TOKEN`) → konsol günlüğü
- **Gerçek zamanlı** — `lib/sse.ts` içinde hafif bir abone kayıt defteri ile SSE
- **AI** — Tüm ajanlar için `claude-opus-4-7` ile `@anthropic-ai/sdk`

Kimlik doğrulama ve rota koruması, kökteki `proxy.ts` içinde bulunur (Next.js 16'da `middleware.ts`'den yeniden adlandırıldı). Ajanlar `lib/agents/` altında ajan başına bir dosyadır.

---

## Manuel geliştirme kurulumu

Sihirbazı atlamak isteyen forklar ve katkıda bulunanlar için:

```bash
git clone https://github.com/bcanata/pitos.git
cd pitos
npm install
cp .env.example .env.local  # fill in ANTHROPIC_API_KEY + AUTH_SECRET
npm run db:push             # creates pitos.db
npx tsx scripts/seed-demo.ts # optional: seed Team 8092 demo data
npm run dev
```

[http://localhost:3000](http://localhost:3000) adresini ziyaret edin.

---

## Ortam değişkenleri

| Değişken | Zorunlu | Amaç |
|---|---|---|
| `ANTHROPIC_API_KEY` | evet | Claude API anahtarı |
| `AUTH_SECRET` | evet | 64 karakterlik hex dize — oturum çerezlerini imzalar |
| `APP_URL` | evet | Dağıtımın taban URL'si (geliştirmede `http://localhost:3000`) |
| `DATABASE_URL` | hayır | Yerel SQLite yolu (varsayılan `./pitos.db`; `TURSO_DATABASE_URL` ayarlanırsa yok sayılır) |
| `RESEND_API_KEY` | hayır | Resend API anahtarı — sihirli bağlantı e-postalarını etkinleştirir (ayda 3k ücretsiz) |
| `RESEND_FROM_EMAIL` | hayır | Resend için gönderen adresi (örn. `noreply@yourteam.com`) |
| `CLOUDFLARE_ACCOUNT_ID` | hayır | Alternatif e-posta sağlayıcı (Workers Paid aylık 5$ gerektirir) |
| `CLOUDFLARE_EMAIL_API_TOKEN` | hayır | Email Sending izinli kapsamlı `cfut_*` belirteci |
| `FROM_EMAIL` | hayır | Cloudflare Email için gönderen adresi |
| `TURSO_DATABASE_URL` | hayır | `libs
