// Altın Bilezik Fiyat Takip — vitrin (GitHub Pages uyumlu, build gerektirmez)
// Kurallar (kullanıcı kriterleri):
//  - TL/gr = (Fiyat + Kargo) / Gramaj   (kargo ücretliyse toplam fiyata dahil)
//  - Sadece herkese açık liste fiyatları; kupon/kampanya/sepet indirimi yok
//  - "Peşin fiyatına 3 taksit": taksitliTutar > fiyat ise taksit farkı var → "uygun değil"

const TL = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
const TL2 = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 2 });

let RAW = [];

function effectivePrice(u) {
  // Kargo ücretliyse toplam fiyata dahil et
  return u.fiyat + (u.kargo && u.kargo > 0 ? u.kargo : 0);
}
function tlPerGram(u) {
  if (!u.gramaj || u.gramaj <= 0) return Infinity;
  return effectivePrice(u) / u.gramaj;
}
// 3 taksit durumu: yok / uygun (peşin fiyatına) / uygun değil (taksit farklı)
function taksitDurumu(u) {
  if (!u.ucTaksit) return { kind: "no", label: "Yok" };
  if (u.taksitliTutar != null && u.taksitliTutar > u.fiyat + 0.5) return { kind: "warn", label: "Uygun değil (fark var)" };
  return { kind: "yes", label: "Peşin fiyatına 3 taksit" };
}
function kargoText(u) {
  if (u.kargo == null) return "N/A";
  return u.kargo > 0 ? TL2.format(u.kargo) : "Ücretsiz";
}
function val(x, suffix = "") { return (x == null || x === "") ? "N/A" : x + suffix; }

function buildRow(u, rank) {
  const t = taksitDurumu(u);
  const tr = document.createElement("tr");
  if (u._best) tr.className = "best";
  tr.innerHTML = `
    <td class="num">${rank}</td>
    <td>${u.pazaryeri || "N/A"}</td>
    <td>${u.satici || "N/A"}</td>
    <td><a href="${u.link || "#"}" target="_blank" rel="noopener">${u.urunAdi || "N/A"}</a></td>
    <td class="num">${u.gramaj ? u.gramaj + " gr" : "N/A"}</td>
    <td class="num">${TL.format(u.fiyat)}</td>
    <td class="num"><strong>${TL2.format(tlPerGram(u))}</strong></td>
    <td><span class="tag ${t.kind}">${t.label}</span></td>
    <td>${kargoText(u)}</td>
    <td>${val(u.teslimat)}</td>`;
  return tr;
}

const HEAD = `<thead><tr>
  <th class="num">Sıra</th><th>Pazaryeri</th><th>Satıcı</th><th>Ürün</th>
  <th class="num">Gramaj</th><th class="num">Fiyat</th><th class="num">TL/gr</th>
  <th>3 Taksit</th><th>Kargo</th><th>Teslimat</th></tr></thead>`;

function renderTable(el, list) {
  el.innerHTML = HEAD + "<tbody></tbody>";
  const tb = el.querySelector("tbody");
  list.forEach((u, i) => tb.appendChild(buildRow(u, i + 1)));
  if (!list.length) tb.innerHTML = `<tr><td colspan="10" style="text-align:center;color:#999;padding:24px">Kriterlere uyan ürün yok.</td></tr>`;
}

function summarize(list) {
  const el = document.getElementById("summary");
  if (!list.length) { el.innerHTML = ""; return; }
  const sorted = [...list].sort((a, b) => tlPerGram(a) - tlPerGram(b));
  const cheapest = sorted[0];

  // En rekabetçi pazaryeri: en düşük ortalama TL/gr
  const byMarket = {};
  list.forEach(u => { (byMarket[u.pazaryeri] ||= []).push(tlPerGram(u)); });
  let bestMarket = null, bestAvg = Infinity;
  for (const [m, arr] of Object.entries(byMarket)) {
    const avg = arr.reduce((s, x) => s + x, 0) / arr.length;
    if (avg < bestAvg) { bestAvg = avg; bestMarket = m; }
  }

  // En iyi "peşin fiyatına 3 taksit" seçeneği
  const taksitOk = sorted.filter(u => taksitDurumu(u).kind === "yes");
  const bestTaksit = taksitOk[0];

  const cards = [
    { k: "En düşük TL/gr", v: TL2.format(tlPerGram(cheapest)), s: `${cheapest.urunAdi} · ${cheapest.pazaryeri}` },
    { k: "En uygun satıcı", v: cheapest.satici || "N/A", s: `${TL2.format(tlPerGram(cheapest))}/gr` },
    { k: "En rekabetçi pazaryeri", v: bestMarket || "N/A", s: `ort. ${TL2.format(bestAvg)}/gr` },
    { k: "En iyi 3 taksit", v: bestTaksit ? `${TL2.format(tlPerGram(bestTaksit))}/gr` : "N/A", s: bestTaksit ? `${bestTaksit.pazaryeri} · ${bestTaksit.satici}` : "uygun seçenek yok" },
    { k: "Toplam ürün", v: String(list.length), s: `${Object.keys(byMarket).length} pazaryeri` },
  ];
  el.innerHTML = cards.map(c => `<div class="card"><div class="k">${c.k}</div><div class="v">${c.v} <small>${c.s || ""}</small></div></div>`).join("");
}

function perGramTable(list) {
  const groups = {};
  list.forEach(u => { (groups[u.gramaj] ||= []).push(u); });
  const rows = Object.keys(groups)
    .map(Number).sort((a, b) => a - b)
    .map(g => [...groups[g]].sort((a, b) => tlPerGram(a) - tlPerGram(b))[0]);
  renderTable(document.getElementById("perGram"), rows);
}

function applyFilters() {
  const g = document.getElementById("gramFilter").value;
  const m = document.getElementById("marketFilter").value;
  const onlyT = document.getElementById("onlyTaksit").checked;

  let list = RAW.filter(u => u.fiyat > 0 && u.gramaj > 0);
  if (g !== "all") list = list.filter(u => String(u.gramaj) === g);
  if (m !== "all") list = list.filter(u => u.pazaryeri === m);
  if (onlyT) list = list.filter(u => taksitDurumu(u).kind === "yes");

  list.sort((a, b) => tlPerGram(a) - tlPerGram(b));
  list.forEach(u => (u._best = false));
  if (list[0]) list[0]._best = true;

  summarize(list);
  renderTable(document.getElementById("top10"), list.slice(0, 10));
  renderTable(document.getElementById("allTable"), list);
  perGramTable(list);
}

function fillSelect(id, values, label) {
  const sel = document.getElementById(id);
  values.forEach(v => {
    const o = document.createElement("option");
    o.value = String(v); o.textContent = label ? label(v) : v;
    sel.appendChild(o);
  });
  sel.addEventListener("change", applyFilters);
}

async function init() {
  try {
    const res = await fetch("data/products.json", { cache: "no-store" });
    const data = await res.json();
    RAW = data.urunler || [];
    if (data.meta?.kaynak === "ornek" || RAW.some(u => u.ornek)) {
      document.getElementById("sampleBanner").classList.remove("hidden");
    }
    if (data.meta?.guncellemeTarihi) {
      const d = new Date(data.meta.guncellemeTarihi);
      document.getElementById("updatedAt").textContent = "Son güncelleme: " + d.toLocaleString("tr-TR");
    }
    const grams = [...new Set(RAW.map(u => u.gramaj))].sort((a, b) => a - b);
    const markets = [...new Set(RAW.map(u => u.pazaryeri))].sort();
    fillSelect("gramFilter", grams, v => v + " gr");
    fillSelect("marketFilter", markets);
    document.getElementById("onlyTaksit").addEventListener("change", applyFilters);
    applyFilters();
  } catch (e) {
    document.getElementById("summary").innerHTML =
      `<div class="card"><div class="k">Hata</div><div class="v">Veri yüklenemedi <small>${e.message}</small></div></div>`;
  }
}
init();
