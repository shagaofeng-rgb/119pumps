"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductMedia({ name, photos, detailGallery = false }: { name: string; photos: string[]; detailGallery?: boolean }) {
  const [selected, setSelected] = useState(0);
  const current = photos[selected] ?? photos[0];
  if (!current) return <div className="photo-box empty"><Image className="icon" src="/interior/icons/image.svg" alt="" width={38} height={38} unoptimized /><span>Product image pending</span></div>;
  return <div>
    <div className={detailGallery ? "gallery-cover" : "photo-box"}><Image src={current} alt={name} width={800} height={560} unoptimized loading="eager" /></div>
    {photos.length > 1 && <div className="thumbs" role="group" aria-label="Product images">
      {photos.map((photo, i) => <button key={photo} type="button" onClick={() => setSelected(i)} aria-pressed={selected === i} aria-label={`View photo ${i + 1}`}>
        <Image src={photo} alt="" width={62} height={44} unoptimized loading="lazy" />
      </button>)}
    </div>}
  </div>;
}
