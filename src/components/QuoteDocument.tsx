import React, { forwardRef, useEffect, useRef, useState } from 'react';
import type { User } from '../lib/api';
import { brandLogo, brandName } from '../lib/brand';

export interface QuoteDocData {
  code: string;
  createdDate: string;
  validUntil: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  projectTitle: string;
  eventDate: string;
  notes: string;
  taxRate: number;
  discountRate: number;
  items: Array<{ description: string; quantity: number; unitPrice: number }>;
}

interface QuoteDocumentProps {
  user: User;
  quote: QuoteDocData;
}

const money = (n: number) => n.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const thaiDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' }) : '-';

/**
 * The quote as the customer receives it: one A4-width sheet (794px = 210mm at 96dpi).
 * Used for the on-screen preview and rasterised as-is for the PDF.
 */
export const QuoteDocument = forwardRef<HTMLDivElement, QuoteDocumentProps>(function QuoteDocument({ user, quote }, ref) {
  const items = quote.items.filter((i) => i.description.trim() || i.quantity * i.unitPrice > 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const discount = subtotal * (quote.discountRate / 100);
  const afterDiscount = subtotal - discount;
  const tax = afterDiscount * (quote.taxRate / 100);
  const total = afterDiscount + tax;

  return (
    <div ref={ref} className="bg-white text-[#221A33]" style={{ width: 794, minHeight: 1123, padding: '56px 56px 48px', fontSize: 13 }}>
      {/* Seller + title */}
      <div className="flex justify-between items-start gap-8 pb-6 border-b-2 border-[#673AB7]">
        <div className="flex gap-4 items-start">
          <img src={brandLogo(user)} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }} />
          <div style={{ maxWidth: 330 }}>
            <p style={{ fontSize: 18, fontWeight: 700 }}>{brandName(user)}</p>
            {user.businessAddress && <p className="text-[#5B566D] mt-1 leading-relaxed">{user.businessAddress}</p>}
            {user.businessPhone && <p className="text-[#5B566D]">โทร {user.businessPhone}</p>}
            {user.businessTaxId && <p className="text-[#5B566D]">เลขประจำตัวผู้เสียภาษี {user.businessTaxId}</p>}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p style={{ fontSize: 24, fontWeight: 700, color: '#673AB7' }}>ใบเสนอราคา</p>
          <p className="text-[#5B566D] mb-3">Quotation</p>
          <table className="ml-auto text-left">
            <tbody>
              <tr><td className="pr-3 text-[#5B566D]">เลขที่</td><td style={{ fontWeight: 600 }}>{quote.code || 'ฉบับร่าง'}</td></tr>
              <tr><td className="pr-3 text-[#5B566D]">วันที่</td><td style={{ fontWeight: 600 }}>{quote.createdDate}</td></tr>
              <tr><td className="pr-3 text-[#5B566D]">ใช้ได้ถึง</td><td style={{ fontWeight: 600 }}>{thaiDate(quote.validUntil)}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer + job */}
      <div className="grid grid-cols-2 gap-6 py-6">
        <div>
          <p className="text-[#5B566D] mb-1" style={{ fontWeight: 600 }}>เสนอราคาให้</p>
          <p style={{ fontSize: 15, fontWeight: 700 }}>{quote.clientName || '-'}</p>
          {quote.clientPhone && <p className="text-[#5B566D]">โทร {quote.clientPhone}</p>}
          {quote.clientEmail && <p className="text-[#5B566D]">{quote.clientEmail}</p>}
        </div>
        <div>
          <p className="text-[#5B566D] mb-1" style={{ fontWeight: 600 }}>งาน</p>
          <p style={{ fontSize: 15, fontWeight: 700 }}>{quote.projectTitle || '-'}</p>
          {quote.eventDate && <p className="text-[#5B566D]">วันที่จัดงาน {thaiDate(quote.eventDate)}</p>}
        </div>
      </div>

      {/* Items */}
      <table className="w-full" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#F4F1FB', color: '#35235e' }}>
            <th className="text-center py-2.5 px-2" style={{ width: 40, fontWeight: 600 }}>#</th>
            <th className="text-left py-2.5 px-2" style={{ fontWeight: 600 }}>รายการ</th>
            <th className="text-right py-2.5 px-2" style={{ width: 70, fontWeight: 600 }}>จำนวน</th>
            <th className="text-right py-2.5 px-2" style={{ width: 110, fontWeight: 600 }}>ราคาต่อหน่วย</th>
            <th className="text-right py-2.5 px-2" style={{ width: 120, fontWeight: 600 }}>จำนวนเงิน</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={5} className="text-center py-6 text-[#5B566D]">ยังไม่มีรายการ</td></tr>
          )}
          {items.map((item, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #ECEAF2' }}>
              <td className="text-center py-2.5 px-2 text-[#5B566D]">{i + 1}</td>
              <td className="py-2.5 px-2">{item.description || '-'}</td>
              <td className="text-right py-2.5 px-2">{item.quantity.toLocaleString('th-TH')}</td>
              <td className="text-right py-2.5 px-2">{money(item.unitPrice)}</td>
              <td className="text-right py-2.5 px-2" style={{ fontWeight: 600 }}>{money(item.quantity * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals + notes */}
      <div className="flex justify-between gap-8 mt-6">
        <div className="flex-1">
          {quote.notes && (
            <>
              <p className="text-[#5B566D] mb-1" style={{ fontWeight: 600 }}>หมายเหตุ</p>
              <p className="leading-relaxed whitespace-pre-line">{quote.notes}</p>
            </>
          )}
        </div>
        <table style={{ width: 280 }}>
          <tbody>
            <tr><td className="py-1 text-[#5B566D]">รวมเป็นเงิน</td><td className="py-1 text-right">{money(subtotal)}</td></tr>
            {quote.discountRate > 0 && (
              <tr><td className="py-1 text-[#5B566D]">ส่วนลด {quote.discountRate}%</td><td className="py-1 text-right">-{money(discount)}</td></tr>
            )}
            {quote.taxRate > 0 && (
              <tr><td className="py-1 text-[#5B566D]">ภาษีมูลค่าเพิ่ม {quote.taxRate}%</td><td className="py-1 text-right">{money(tax)}</td></tr>
            )}
            <tr style={{ borderTop: '2px solid #673AB7' }}>
              <td className="pt-2.5" style={{ fontSize: 15, fontWeight: 700 }}>ยอดรวมสุทธิ</td>
              <td className="pt-2.5 text-right" style={{ fontSize: 17, fontWeight: 700, color: '#673AB7' }}>฿{money(total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-16 text-center" style={{ marginTop: 88 }}>
        {['ผู้เสนอราคา', 'ผู้อนุมัติ / ลูกค้า'].map((role) => (
          <div key={role}>
            <div style={{ borderBottom: '1px solid #BDB8CC', height: 40 }} />
            <p className="mt-2" style={{ fontWeight: 600 }}>{role}</p>
            <p className="text-[#5B566D] mt-1">วันที่ ......./......./.......</p>
          </div>
        ))}
      </div>
    </div>
  );
});

/** Shows an A4-width sheet shrunk to fit its container (for on-screen preview only, never for PDF capture). */
export function FitToWidth({ width = 794, children }: { width?: number; children: React.ReactNode }) {
  const outer = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number>();

  useEffect(() => {
    const measure = () => {
      if (!outer.current || !inner.current) return;
      const s = Math.min(1, outer.current.clientWidth / width);
      setScale(s);
      setHeight(inner.current.offsetHeight * s);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (outer.current) ro.observe(outer.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={outer} className="w-full" style={{ height }}>
      <div ref={inner} style={{ width, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
        {children}
      </div>
    </div>
  );
}
