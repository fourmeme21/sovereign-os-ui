# SOVEREIGN ENGINE OS — DESKTOP APP TEKNİK YOL HARİTASI v3.0
> Baz: v2.0 (Sentez: Araştırma 87/100 + GPT-4 88/100)
> v3.0 Eklentisi: 4 Katmanlı Güvenlik Mimarisi (Binary Obfuscation + Mimari Bölünmesi + License Binding + Hukuki Koruma)
> Kritik Değişiklik: JWT execution_token signing key binary'den Railway'e taşındı
> Durum: Final — Uygulamaya hazır

---

## DEĞİŞİKLİK ÖZETİ (v2.0 → v3.0)

| Alan | v2.0 (Eski) | v3.0 (Yeni) | Kaynak |
|---|---|---|---|
| JWT signing key lokasyonu | binary içinde (teknik borç) | Railway sunucusu — kopyalanamaz | Güvenlik araştırması Katman 2 |
| Execution token doğrulama | local Rust binary | Railway `/api/token/verify` → fail-closed | Güvenlik araştırması Katman 2 |
| Binary koruması | Yok | rustfuscator + build flags | Güvenlik araştırması Katman 1 |
| License binding | Yok | Donanım parmak izi + Railway `/api/license/verify` | Güvenlik araştırması Katman 3 |
| Hukuki koruma | Yok | Tarihli session log + telif kaydı protokolü | Güvenlik araştırması Katman 4 |
| ARCHITECTURE.md delta | §8: "JWT secret binary içinde" (teknik borç) | Teknik borç KAPANDI — key sunucuda | Bu değişiklik |

> ⚠️ **ARCHITECTURE.md Güncelleme Notu:**
> §2.2 ExecutionTokenPayload yorumu: `"JWT (HS256 — sovereign-core içindeki secret ile imzalı)"` → `"JWT (HS256 — Railway signing service ile imzalı, device_fingerprint zorunlu)"`
> §8 Teknik Borç: `"JWT secret binary içinde"` satırı → `"KAPANDI — v3.0 Desktop: Railway signing service"` olarak işaretle

---

## 1. VİZYON

```
"Every AI decision, approved, audited, and set in stone."
```

Sovereign Engine OS — AI kararları ile gerçek sistem aksiyonları arasındaki
değiştirilemez denetim katmanı. Copilot değil, governance layer.

Kullanıcı perspektifi:
- İndir → Kur → Aç → Claude'a giriş yap → Çalış
- API key yok. Konfigürasyon yok. PostgreSQL yok. Sürtünme yok.

---

## 2. MİMARİ — v3.0 (Güvenlik Katmanlı)

```
┌──────────────────────────────────────────────────────────┐
│                 SOVEREIGN DESKTOP APP                     │
│                      (Tauri v2)                           │
│                                                           │
│  ┌──────────────────────┐   ┌────────────────────────┐   │
│  │    Sovereign UI      │   │   Auth WebView          │   │
│  │    (Vite + React)    │   │   (claude.ai/login      │   │
│  │                      │   │    SADECE auth için)    │   │
│  │  Policy Kernel       │   │                         │   │
│  │  Memory (LanceDB)    │◄──│  Wry cookie API         │   │
│  │  GitHub Bridge       │   │  sessionKey → Keychain  │   │
│  │  Loopback Gateway    │   │  → WebView DESTROY      │   │
│  └──────────┬───────────┘   └────────────────────────┘   │
│             │ Tauri IPC (izole)                           │
│  ┌──────────▼───────────┐                                 │
│  │   Rust Core          │                                 │
│  │   Policy Kernel      │──► OS Keychain (sessionKey)    │
│  │   reqwest HTTP       │──► Claude API (direkt)         │
│  │   LanceDB embedded   │──► ~/.sovereign/db             │
│  │   Hash chain log     │──► ~/.sovereign/audit          │
│  │   Device Fingerprint │──► device_id (CPU+Disk+MAC)   │
│  └──────────┬───────────┘                                 │
│             │ HTTPS (her token işleminde)                 │
└─────────────┼────────────────────────────────────────────┘
              │
┌─────────────▼────────────────────────────────────────────┐
│              RAILWAY SUNUCU (Kopyalanamaz Katman)         │
│                                                           │
│  /api/license/verify  ← device_id + user_id + tier       │
│  /api/token/sign      ← policy_hash + device_id → JWT    │
│  /api/token/verify    ← JWT + device_id → PERMIT/DENY    │
│  /api/claude-manifest ← endpoint listesi (canary)        │
│                                                           │
│  JWT_SIGNING_SECRET   ← env var, binary'de YOK           │
│  Tier limitleri       ← manipüle edilemez                 │
└──────────────────────────────────────────────────────────┘
```

### Cihazda Olan (Kopyalanabilir Ama İşlevsiz)

| Bileşen | Açıklama |
|---|---|
| Policy Kernel binary | Kararları değerlendirir — ama token imzalayamaz |
| Execution Gate | Token doğrular — ama Railway olmadan DENY |
| UI | Gösterir — ama çalıştıramaz |
| OS Keychain | Claude sessionKey tutar — cihaza bağlı |

### Sunucuda Kalan (Kopyalanamaz)

| Bileşen | Neden Kritik |
|---|---|
| JWT_SIGNING_SECRET | Bu olmadan geçerli execution_token üretilemez |
| License doğrulama | device_fingerprint eşleşmezse binary başlamaz |
| Tier limitleri | Değiştirilemez — istemci tarafında yok |
| Remote API manifest | Endpoint'ler değişince client kör |

---

## 3. 4 KATMANLI GÜVENLİK MİMARİSİ

### Katman 1 — Binary Obfuscation

rustfuscator string literal'leri şifreler, opaque control-flow inject eder, AST mantığını yeniden yazar. Compile-time'da şifreleme — runtime'da çözme logic'i üretilir.

**Build pipeline:**

```bash
# Cargo.toml
[profile.release]
strip    = "debuginfo"   # Semboller sıyrılır
opt-level = "z"          # Boyut küçülür
panic    = "abort"       # Panic handler sıyrılır
lto      = true          # Link-time optimization

# Build komutu
RUSTFLAGS="-C strip=debuginfo -C opt-level=z -C panic=abort" \
  cargo build --release
```

**String obfuscation:**

```rust
// src-tauri/src/constants.rs
use rust_code_obfuscator::obfuscate_string;

// Endpoint'ler binary'de plaintext görünmez
pub const LICENSE_ENDPOINT: &str =
    obfuscate_string!("https://sovereign-engine-production.up.railway.app/api/license/verify");

pub const TOKEN_SIGN_ENDPOINT: &str =
    obfuscate_string!("https://sovereign-engine-production.up.railway.app/api/token/sign");

pub const TOKEN_VERIFY_ENDPOINT: &str =
    obfuscate_string!("https://sovereign-engine-production.up.railway.app/api/token/verify");
```

**Etki:** Meraklı kullanıcı binary'ye bakamaz. Analist için referans noktaları (string literals) ortadan kalkar.

---

### Katman 2 — Mimari Bölünmesi + Sunucu JWT (En Güçlü)

> ⚠️ Bu değişiklik ARCHITECTURE.md §2.2 ve §8'i etkiler — aşağıdaki delta notuna bak.

**Eski akış (v2.0 — teknik borç):**
```
Policy Kernel → JWT imzala (binary içi secret) → Execution Gate doğrula (local)
```

**Yeni akış (v3.0):**
```
Policy Kernel → PERMIT kararı
    → POST /api/token/sign { policy_hash, decision_id, device_id, actor_id }
    → Railway JWT imzalar (JWT_SIGNING_SECRET — sunucuda)
    → execution_token (30s expiry) döner
    → Execution Gate → POST /api/token/verify { token, device_id }
    → Railway doğrular → PERMIT/DENY
    → DENY → Execution Gate fail-closed → işlem durur
```

**Railway signing endpoint (engine/src/routes/tokenRouter.ts):**

```typescript
// Yeni endpoint — engine'e eklenecek
router.post('/api/token/sign', adminOnly, async (req, res) => {
  const { policy_hash, decision_id, device_id, actor_id, action_name, scope } = req.body;

  // device_id license tablosunda kayıtlı mı?
  const license = await supabase
    .from('licenses')
    .select('*')
    .eq('device_id', device_id)
    .eq('active', true)
    .single();

  if (!license.data) {
    return res.status(403).json({ error: 'DEVICE_NOT_LICENSED' });
  }

  const payload: ExecutionTokenPayload = {
    decision_id,
    policy_hash,
    actor_id,
    action_name,
    scope,
    device_id,          // v3.0 eklentisi — device binding
    issued_at:  Math.floor(Date.now() / 1000),
    expires_at: Math.floor(Date.now() / 1000) + 30,
  };

  const token = jwt.sign(payload, process.env.JWT_SIGNING_SECRET!, {
    algorithm: 'HS256',
  });

  res.json({ execution_token: token });
});

router.post('/api/token/verify', async (req, res) => {
  const { token, device_id } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SIGNING_SECRET!) as ExecutionTokenPayload;

    // Device binding kontrolü — TOCTOU koruması
    if (decoded.device_id !== device_id) {
      return res.status(403).json({ verdict: 'DENY', reason: 'DEVICE_MISMATCH' });
    }

    res.json({ verdict: 'PERMIT', payload: decoded });
  } catch (err) {
    // Token expired veya imza geçersiz
    res.status(403).json({ verdict: 'DENY', reason: 'INVALID_TOKEN' });
  }
});
```

**Rust tarafı — token sign isteği:**

```rust
// src-tauri/src/token_client.rs

use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct TokenSignRequest {
    pub policy_hash:  String,
    pub decision_id:  String,
    pub device_id:    String,   // Hardware fingerprint
    pub actor_id:     String,
    pub action_name:  String,
    pub scope:        String,
}

#[derive(Deserialize)]
pub struct TokenSignResponse {
    pub execution_token: String,
}

pub async fn request_execution_token(
    req: TokenSignRequest,
) -> Result<String, TokenError> {
    let client = Client::new();

    let resp = client
        .post(TOKEN_SIGN_ENDPOINT)   // obfuscated string
        .json(&req)
        .timeout(std::time::Duration::from_millis(3000))
        .send()
        .await
        .map_err(|_| TokenError::NetworkError)?;

    if !resp.status().is_success() {
        // Fail-closed — network hata → DENY
        return Err(TokenError::SigningFailed(resp.status().as_u16()));
    }

    let body: TokenSignResponse = resp.json().await
        .map_err(|_| TokenError::ParseError)?;

    Ok(body.execution_token)
}
```

**Offline durumu → fail-closed:**

```rust
// Railway'e ulaşılamazsa Execution Gate başlamaz
match request_execution_token(req).await {
    Ok(token) => proceed_to_execution_gate(token).await,
    Err(TokenError::NetworkError) => {
        log_deny("RAILWAY_UNREACHABLE — fail-closed");
        Err(ExecutionError::FailClosed)
    }
    Err(e) => {
        log_deny(&format!("TOKEN_SIGN_FAILED: {:?}", e));
        Err(ExecutionError::FailClosed)
    }
}
```

---

### Katman 3 — License Binding (Donanım Parmak İzi)

Binary başka bilgisayara kopyalanırsa fingerprint değişir → Railway tanımaz → binary başlamaz.

**Hardware fingerprint:**

```rust
// src-tauri/src/license.rs

use sha2::{Sha256, Digest};

pub fn device_fingerprint() -> String {
    let cpu_id   = get_cpu_id();      // CPU seri numarası
    let disk_id  = get_disk_uuid();   // Disk UUID
    let mac_addr = get_mac_address(); // İlk aktif ağ kartı

    let raw = format!("{}{}{}", cpu_id, disk_id, mac_addr);
    let hash = Sha256::digest(raw.as_bytes());
    hex::encode(hash)
}

// Startup'ta çağrılır — başarısız → sistem başlamaz
pub async fn verify_license(user_id: &str, tier: &str) -> Result<(), LicenseError> {
    let device_id  = device_fingerprint();
    let client     = reqwest::Client::new();

    let resp = client
        .post(LICENSE_ENDPOINT)   // obfuscated
        .json(&serde_json::json!({
            "device_id": device_id,
            "user_id":   user_id,
            "tier":      tier,
        }))
        .timeout(std::time::Duration::from_millis(5000))
        .send()
        .await
        .map_err(|_| LicenseError::NetworkError)?;

    if resp.status() == 200 {
        Ok(())
    } else {
        Err(LicenseError::NotAuthorized)
    }
}
```

**Railway license endpoint (engine/src/routes/licenseRouter.ts):**

```typescript
router.post('/api/license/verify', async (req, res) => {
  const { device_id, user_id, tier } = req.body;

  const { data, error } = await supabase
    .from('licenses')
    .select('*')
    .eq('user_id', user_id)
    .eq('device_id', device_id)
    .eq('tier', tier)
    .eq('active', true)
    .single();

  if (error || !data) {
    return res.status(403).json({ authorized: false, reason: 'DEVICE_NOT_LICENSED' });
  }

  res.json({ authorized: true, expires_at: data.expires_at });
});
```

**Supabase tablosu:**

```sql
-- MIGRATION: licenses tablosu
CREATE TABLE licenses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES auth.users(id),
  device_id  TEXT NOT NULL,   -- SHA-256(cpu+disk+mac)
  tier       TEXT NOT NULL,   -- 'free' | 'pro' | 'team'
  active     BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, device_id)
);

-- İndeks
CREATE INDEX idx_licenses_device ON licenses(device_id, active);
```

**Startup entegrasyonu (ARCHITECTURE.md §7 ile uyumlu):**

```rust
// src-tauri/src/main.rs — startup sırası (ARCHITECTURE.md §7'ye eklenir)

// 0. Device fingerprint üret
// 1. Railway license verify → başarısız → sistem başlamaz (fail-closed)
// 2. sovereign-core binary healthcheck → exit != 0 → başlamaz
// 3. Domain config yükle
// 4. Idempotency store temizle
// 5. AuditLog hash chain doğrula
```

---

### Katman 4 — Hukuki Koruma

**Yapılacaklar (bir kerelik):**

```
□ CORE.md + AI_AGENT.md + ARCHITECTURE.md başına telif satırı ekle:
  "© 2026 [İsim]. All rights reserved. Sovereign Engine OS."

□ GitHub repo → her commit tarihli → zaman damgası kanıtı
  git log --format="%H %ai %s" > commit_history.txt

□ session_log_hot.md → Session 1'den beri tarihli bloklar var → koru

□ Tüm roadmap + mimari belgeleri README.md'de referanslı tut
  → "Bu belge [tarih]'de oluşturulmuştur" notu

□ Periyodik: ZIP + notarize → Wayback Machine veya IPFS'e yükle
  → Değiştirilemez zaman damgası
```

---

## 4. GÜVENLİK SALDIRGANI TABLOSU (Güncellenmiş)

| Saldırgan | Ne yapabilir | Ne yapamaz |
|---|---|---|
| Meraklı kullanıcı | Binary'ye bakabilir | Anlayamaz — string'ler şifreli |
| Rakip geliştirici | Mimariyi tahmin edebilir | JWT key olmadan token üretemez |
| Binary kopyacı | Kopyalayabilir | Fingerprint değişir → Railway tanımaz |
| Büyük şirket | Benzerini yazabilir | 6-12 ay gerekir, sen çok ileride olursun |
| Network saldırganı | Token'ı dinleyebilir | 30s expiry + device binding → işe yaramaz |

---

## 5. CLAUDE ENTEGRASYONU (v2.0'dan değişmedi)

*(Bölüm 3'ün tamamı v2.0 ile aynıdır — Native Cookie Extraction, TOS Güvencesi, API key fallback)*

---

## 6. DAYANIKLILIK — REMOTE API MANIFEST (v2.0'dan değişmedi)

*(Bölüm 4 v2.0 ile aynıdır)*

---

## 7. VECTOR DB — EMBEDDED LanceDB (v2.0'dan değişmedi)

*(Bölüm 5 v2.0 ile aynıdır)*

---

## 8. MULTI-AI ORKESTRASYON — RUST TRAIT (v2.0'dan değişmedi)

*(Bölüm 6 v2.0 ile aynıdır — AiOrchestrator, ClaudeAdapter, OllamaAdapter)*

---

## 9. SIFIR SÜRTÜNME ONBOARDING (Güncellenmiş)

İlk açılışta 6 adım, ~75 saniye:

```
Adım 1 — Diagnostic (5 sn — license check dahil)
┌─────────────────────────────────────┐
│ [OK] Device fingerprint generated   │
│ [OK] License verified (Railway)     │   ← YENİ
│ [OK] Policy Kernel initialized      │
│ [OK] Local sandbox secured          │
│ [OK] Vector store ready             │
│ [OK] Audit chain loaded             │
└─────────────────────────────────────┘

Adım 2-6: v2.0 ile aynı (Claude auth akışı)
```

---

## 10. RAILWAY — YENİ ENDPOINT'LER (v3.0 Eklentisi)

| Endpoint | Metod | Açıklama | Katman |
|---|---|---|---|
| `/api/license/verify` | POST | device_id + user_id + tier → authorized/denied | K3 |
| `/api/token/sign` | POST | policy_hash + device_id → JWT execution_token | K2 |
| `/api/token/verify` | POST | JWT + device_id → PERMIT/DENY | K2 |
| `/api/claude-manifest` | GET | Endpoint listesi (v2.0'dan) | K1 |

**Env vars (Railway dashboard'a eklenecek):**

```
JWT_SIGNING_SECRET=<256-bit random — openssl rand -hex 32>
LICENSE_HMAC_SECRET=<ayrı secret>
```

---

## 11. FAZ PLANI — v3.0 (Güncellenmiş)

### Faz 1 — Tauri Shell + Binary Hardening (1-2 hafta)

```
□ Mevcut Vite+React'ı Tauri v2 wrapper'a al
□ tauri.conf.json + Cargo.toml yapılandır
□ GitHub Actions: Win/Mac/Linux build pipeline
□ Build flags ekle: strip=debuginfo, opt-level=z, panic=abort   ← YENİ (Katman 1)
□ rustfuscator entegrasyonu + endpoint string'lerini obfuscate  ← YENİ (Katman 1)
□ Otomatik güncelleme (tauri-plugin-updater)
□ macOS notarization + Windows code signing
□ Sonuç: İndirilebilir signed + obfuscated masaüstü app
```

### Faz 1.5 — License & JWT Altyapısı (3-4 gün) ← YENİ FAZ

```
□ Supabase: licenses tablosu + migration
□ Railway: /api/license/verify endpoint
□ Railway: /api/token/sign endpoint
□ Railway: /api/token/verify endpoint
□ JWT_SIGNING_SECRET env var → Railway'e yükle (binary'den kaldır)
□ ARCHITECTURE.md §2.2 + §8 güncelle (JWT secret lokasyonu)
□ Rust: device_fingerprint() implementasyonu
□ Rust: verify_license() startup entegrasyonu
□ Rust: request_execution_token() — local → Railway isteği
□ Sonuç: Kopyalanamaz JWT altyapısı + device-bound license
```

### Faz 2 — Claude Native Bridge (2-3 hafta)

```
□ Auth WebView (IPC izole, sadece claude.ai)
□ Wry::cookies_for_url → sessionKey extraction
□ OS Keychain entegrasyonu (keyring crate)
□ WebView destroy sonrası Rust reqwest client
□ Remote API manifest (Railway hosted)
□ Canary test (Playwright + Discord webhook)
□ API key fallback ekranı (TOS güvencesi)
□ Sonuç: API key'siz Claude entegrasyonu
```

### Faz 2.5 — Embedded DB Geçişi (1 hafta)

```
□ LanceDB Rust binding kurulumu
□ ~/.sovereign/vectors dizini oluşturma
□ Mevcut memory sistemi LanceDB'ye port
□ Voyage AI embedding → local embedding (opsiyonel)
□ Sonuç: Sıfır dış bağımlılık, offline memory
```

### Faz 3 — Onboarding & Landing (1 hafta)

```
□ Diagnostic başlatma ekranı (license check dahil)
□ "Connect Claude Account" tek buton akışı
□ İlk değer gösterimi (policy trial)
□ Landing page (sovereign-os-ui.vercel.app/)
□ İndirme sayfası (/download)
□ Sonuç: Production lansmana hazır
```

### Faz 4 — Stabilizasyon & Uyum (1 hafta)

```
□ GDPR cryptographic shred (audit log)
□ Telemetri sistemi (opt-in, anonimize)
□ Multi-AI trait altyapısı (GPT/Ollama Faz 5'e hazır)
□ WebView2 (Windows) test matrisi
□ Hukuki koruma checklist tamamla (Katman 4)    ← YENİ
□ Sonuç: Global lansman
```

**Toplam: 7-9 hafta** (Faz 1.5 eklendi)

---

## 12. DAĞITIM STRATEJİSİ (v2.0'dan değişmedi)

*(GitHub Releases, macOS Notarization, Windows Code Signing — v2.0 ile aynı)*

---

## 13. GÜVENLİK MİMARİSİ — ÖZET TABLO

| Kural | Uygulama | Katman |
|---|---|---|
| Session key disk'e yazılmaz | OS Keychain zorunlu | v2.0 |
| Auth WebView'de IPC kapalı | CVE-2024-35222 koruması | v2.0 |
| Auth WebView sadece claude.ai | on_navigation hook | v2.0 |
| WebView auth sonrası yok edilir | XSS saldırı yüzeyi sıfırlanır | v2.0 |
| JWT signing key binary'de yok | Railway env var — kopyalanamaz | **v3.0 K2** |
| execution_token device-bound | device_id her token'a gömülü | **v3.0 K2** |
| Binary başka cihazda çalışmaz | device_fingerprint + license binding | **v3.0 K3** |
| String'ler plaintext değil | rustfuscator + build flags | **v3.0 K1** |
| Audit log cryptographic shred | GDPR uyum (Faz 4) | v2.0 |
| Network kesintisi → fail-closed | Railway ulaşılamazsa DENY | **v3.0 K2** |

---

## 14. LANSMAN TAGLINI

```
"Every AI decision, approved, audited, and set in stone."
```

Rakip konumlanma:
- Cursor → Kod editörü. Sovereign kod editörünü denetler.
- Raycast → Kısayol launcher. Sovereign aksiyonları onaylatır.
- AI Agents → Kör çalışır. Sovereign her adımı durdurur.

Sovereign yeni bir kategori: **AI Governance OS**

---

## ARCHITECTURE.md — GEREKLİ DEĞİŞİKLİKLER (Delta)

> Bu belge ARCHITECTURE.md'yi değiştirmez — sadece delta not olarak tanımlar.
> Uygulama: ARCHITECTURE.md'yi ayrı bir session'da güncelle.

### §2.2 Execution Token — Değiştirilecek Yorum

```
// ESKİ (v2.0):
// Token formatı: JWT (HS256 — sovereign-core içindeki secret ile imzalı)

// YENİ (v3.0):
// Token formatı: JWT (HS256 — Railway /api/token/sign ile imzalı)
// Signing key: JWT_SIGNING_SECRET env var — binary'de YOKTUR
// Ek alan: device_id — hardware fingerprint, device binding için
// Verification: Execution Gate → Railway /api/token/verify → PERMIT/DENY
// Offline fail-closed: Railway ulaşılamazsa Execution Gate DENY döner
```

### §2.2 ExecutionTokenPayload — Eklenecek Alan

```typescript
interface ExecutionTokenPayload {
  decision_id:   string;
  policy_hash:   string;
  actor_id:      string;
  action_name:   string;
  issued_at:     number;
  expires_at:    number;
  scope:         string;
  device_id:     string;   // ← YENİ: hardware fingerprint (v3.0)
}
```

### §7 Startup — Eklenecek Adım

```
// 0. device_fingerprint() üret                    ← YENİ (Katman 3)
// 0.1. Railway /api/license/verify → başarısız → sistem başlamaz  ← YENİ
// 1. sovereign-core binary healthcheck → (mevcut)
// ...
```

### §8 Teknik Borç — Kapatılan Satır

```
// ESKİ:
// | JWT secret binary içinde | Solo operator | Multi-instance'ta secret yönetimi gerekir |

// YENİ:
// | JWT secret binary içinde | ✅ KAPANDI — v3.0: Railway signing service | — |
```

### §6 Hata Taksonomisi — Eklenecek Hatalar

```
DEVICE_NOT_LICENSED    → License binding başarısız → startup DENY
RAILWAY_UNREACHABLE    → Token sign/verify endpoint erişilemiyor → fail-closed DENY
DEVICE_MISMATCH        → Token device_id ≠ current device_id → DENY (anti-copy)
```

---

*SOVEREIGN ENGINE OS — DESKTOP ROADMAP v3.0*
*4 Katmanlı Güvenlik: Binary Obfuscation + Mimari Bölünmesi + License Binding + Hukuki Koruma*
*Solo Operator · Global Launch · Tauri v2 · Rust-first · Server-side JWT*
*Son güncelleme: Session 24 — JWT signing key Railway'e taşındı, teknik borç kapandı*
