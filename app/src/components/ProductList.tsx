import type { Product } from "../types";
import { ProductRow } from "./ProductRow";

interface Props {
  urunler: Product[];
  onSil: (id: string) => void;
}

export function ProductList({ urunler, onSil }: Props) {
  if (urunler.length === 0) {
    return (
      <div className="empty">
        <div className="empty__icon">🪙</div>
        <h3>Henüz ürün yok</h3>
        <p>“Ekle / Ayarlar” sekmesinden bir ürün linki yapıştır. Sistem otomatik analiz edip listeye ekler.</p>
      </div>
    );
  }

  return (
    <div className="list">
      <div className="list__head">
        <span>#</span>
        <span>Ürün</span>
        <span className="list__head-metrics">TL/gram · Fiyat</span>
        <span></span>
      </div>
      {urunler.map((u, i) => (
        <ProductRow key={u.id} urun={u} sira={i + 1} onSil={onSil} />
      ))}
    </div>
  );
}
