import { statusPill } from './ProjectItem';
import React, { useEffect, useRef, useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Download, Loader2 } from 'lucide-react';
import { flushSync } from 'react-dom';
import type { User } from '../lib/api';
import { downloadPdf } from '../lib/pdf';
import { QuoteDocument } from './QuoteDocument';
import { api, Quote, QuoteStatus } from '../lib/api';

interface AllQuotesProps {
  onNavigate?: (page: string) => void;
  onOpenQuote: (quoteId: string | null, preview?: boolean) => void;
  user: User;
}

export function AllQuotes({ onNavigate, onOpenQuote, user }: AllQuotesProps) {
  const [pdfQuote, setPdfQuote] = useState<Quote | null>(null);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [notification, setNotification] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.quotes()
      .then(setQuotes)
      .catch((err) => showNotification(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = quote.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         quote.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyles = (status: string) => statusPill(status);

  const getStatsByStatus = (status: string) => {
    return quotes.filter(q => q.status === status).length;
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const sortedQuotes = [...filteredQuotes].sort((a, b) => {
    switch (sortBy) {
      case 'amount': return b.totalAmount - a.totalAmount;
      case 'client': return a.clientName.localeCompare(b.clientName, 'th');
      default: return Number(b.id) - Number(a.id);
    }
  });

  const changeStatus = async (quote: Quote, status: QuoteStatus) => {
    try {
      const saved = await api.updateQuote(quote.id, { status });
      setQuotes(list => list.map(q => (q.id === saved.id ? saved : q)));
      showNotification(
        saved.status === 'expired' && status !== 'expired'
          ? `${saved.code} เลยวันที่ใช้ได้แล้ว กด "แก้ไข" เพื่อเลื่อนวันที่ใช้ได้ถึงก่อน`
          : `อัปเดต ${saved.code} เป็น "${saved.statusText}" แล้ว`
      );
    } catch (err) {
      showNotification((err as Error).message);
    }
  };

  const deleteQuote = async (quote: Quote) => {
    if (!window.confirm(`ลบใบเสนอราคา ${quote.code} ใช่หรือไม่?`)) return;
    try {
      await api.deleteQuote(quote.id);
      setQuotes(list => list.filter(q => q.id !== quote.id));
      showNotification(`ลบใบเสนอราคา ${quote.code} แล้ว`);
    } catch (err) {
      showNotification((err as Error).message);
    }
  };

  const exportPdf = async (quote: Quote) => {
    // render the document off-screen, capture it, then drop it again
    flushSync(() => setPdfQuote(quote));
    try {
      if (pdfRef.current) await downloadPdf(pdfRef.current, `${quote.code}${quote.clientName ? '-' + quote.clientName : ''}`);
    } catch {
      showNotification('สร้างไฟล์ PDF ไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setPdfQuote(null);
    }
  };

  return (
    <div className="p-5 md:p-10 pb-28 md:pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight">ใบเสนอราคา</h1>
          <p className="text-sm md:text-base text-ink-muted mt-1">จัดการใบเสนอราคาของคุณ</p>
        </div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button 
            onClick={() => onOpenQuote(null)}
            className="pb-btn-primary flex-1 lg:flex-none whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            สร้างใบเสนอราคา
          </button>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {[{ id: 'all', label: 'ทั้งหมด', count: quotes.length }, { id: 'draft', label: 'ร่าง', count: getStatsByStatus('draft') }, { id: 'sent', label: 'ส่งแล้ว', count: getStatsByStatus('sent') }, { id: 'approved', label: 'อนุมัติแล้ว', count: getStatsByStatus('approved') }, { id: 'rejected', label: 'ปฏิเสธ', count: getStatsByStatus('rejected') }, { id: 'expired', label: 'หมดอายุ', count: getStatsByStatus('expired') }].map(chip => (
          <button
            key={chip.id}
            onClick={() => setStatusFilter(chip.id)}
            aria-pressed={statusFilter === chip.id}
            className={`shrink-0 flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-full text-sm transition-colors ${
              statusFilter === chip.id ? 'bg-white shadow-card text-ink font-medium' : 'text-ink-muted hover:text-ink hover:bg-white/60'
            }`}
          >
            {chip.label}
            <span className={`min-w-6 px-1.5 py-0.5 rounded-full text-xs ${statusFilter === chip.id ? 'bg-violet-50 text-[#673AB7]' : 'bg-[#F1F0F5]'}`}>{chip.count}</span>
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="pb-card p-3 md:p-4 mb-6 md:mb-8">
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-muted w-5 h-5" />
            <input
              type="text"
              placeholder="ค้นหาใบเสนอราคา, ลูกค้า, หรือรหัส..."
              className="pb-input pl-10 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-3 py-1.5 -ml-1 text-sm text-ink-muted hover:text-ink rounded-full"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? "ซ่อนตัวเลือก" : "ช่วงเวลาและการเรียง"}
            </button>
            
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-xs md:text-sm text-ink-muted hover:text-ink"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-line">
              <select 
                className="pb-input text-ink-muted"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="draft">ร่าง</option>
                <option value="sent">ส่งแล้ว</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="rejected">ปฏิเสธ</option>
                <option value="expired">หมดอายุ</option>
              </select>
              <select 
                className="pb-input text-ink-muted"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">เรียงตามวันที่</option>
                <option value="amount">เรียงตามจำนวนเงิน</option>
                <option value="status">เรียงตามสถานะ</option>
                <option value="client">เรียงตามลูกค้า</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="text-center text-ink py-12">กำลังโหลด...</div>}
      {!loading && sortedQuotes.length === 0 && (
        <div className="pb-card p-10 text-center mb-8">
          <p className="text-ink-muted mb-4">{quotes.length === 0 ? 'ยังไม่มีใบเสนอราคา' : 'ไม่พบใบเสนอราคาที่ตรงกับเงื่อนไข'}</p>
          {quotes.length === 0 && (
            <button onClick={() => onOpenQuote(null)} className="pb-btn-primary">
              สร้างใบเสนอราคาแรก
            </button>
          )}
        </div>
      )}

      {/* Quotes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {sortedQuotes.map((quote) => (
          <div
            key={quote.id}
            className="pb-card cursor-pointer transition-all duration-300 overflow-hidden"
          >
            {/* Quote Header */}
            <div className="p-4 md:p-6 border-b border-line">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base md:text-lg text-ink mb-1 line-clamp-2 font-semibold">{quote.projectTitle}</h3>
                  <p className="text-sm text-ink-muted">รหัส: {quote.code}</p>
                </div>
                <select
                  value={quote.status}
                  onChange={(e) => changeStatus(quote, e.target.value as QuoteStatus)}
                  title="เปลี่ยนสถานะ"
                  className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border ml-2 cursor-pointer outline-none whitespace-nowrap ${getStatusStyles(quote.status)}`}
                >
                  <option value="draft">ร่าง</option>
                  <option value="sent">ส่งแล้ว</option>
                  <option value="approved">อนุมัติแล้ว</option>
                  <option value="rejected">ปฏิเสธ</option>
                  {quote.status === 'expired' && <option value="expired" disabled>หมดอายุ</option>}
                </select>
              </div>
              <div className="text-xs md:text-sm text-ink-muted">
                ลูกค้า: <span className="font-medium text-ink">{quote.clientName}</span>
              </div>
            </div>

            {/* Quote Body */}
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-ink-muted mb-1">จำนวนเงิน</div>
                  <div className="font-medium text-ink text-sm md:text-base">
                    ฿{quote.totalAmount.toLocaleString('th-TH', { maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-ink-muted mb-1">รายการ</div>
                  <div className="font-medium text-ink text-sm md:text-base">
                    {quote.itemCount} รายการ
                  </div>
                </div>
                <div>
                  <div className="text-xs text-ink-muted mb-1">วันที่สร้าง</div>
                  <div className="font-medium text-ink text-sm md:text-base">
                    {quote.createdDate}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-ink-muted mb-1">ใช้ได้ถึง</div>
                  <div className="font-medium text-ink text-sm md:text-base">
                    {quote.validUntilText || '-'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                <button onClick={() => onOpenQuote(quote.id, true)} className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#F1F0F5] text-ink rounded-full hover:bg-[#E8E6EF] transition-colors text-sm">
                  <Eye className="w-4 h-4" />
                  <span className="hidden md:inline">ดู</span>
                </button>
                <button onClick={() => onOpenQuote(quote.id)} className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#F1F0F5] text-ink rounded-full hover:bg-[#E8E6EF] transition-colors text-sm">
                  <Edit className="w-4 h-4" />
                  <span className="hidden md:inline">แก้ไข</span>
                </button>
                <button onClick={() => exportPdf(quote)} disabled={!!pdfQuote} className="flex items-center justify-center gap-1.5 py-2 px-2 bg-[#F1F0F5] text-ink rounded-full hover:bg-[#E8E6EF] transition-colors text-sm disabled:opacity-60" title="ดาวน์โหลด PDF">
                  {pdfQuote?.id === quote.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  PDF
                </button>
                <button onClick={() => deleteQuote(quote)} aria-label="ลบใบเสนอราคา" title="ลบ" className="flex items-center justify-center w-9 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-full shadow-soft-xl z-50 animate-toast text-sm">
          {notification}
        </div>
      )}

      {/* Empty State */}
      {filteredQuotes.length === 0 && (
        <div className="text-center py-12 md:py-16">
          <div className="text-ink-muted mb-4">
            <svg className="mx-auto h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base md:text-lg font-medium text-ink mb-2">ไม่พบใบเสนอราคา</h3>
          <p className="text-sm md:text-base text-ink-muted">ลองเปลี่ยนคำค้นหาหรือตัวกรองของคุณ</p>
        </div>
      )}
      {pdfQuote && (
        <div aria-hidden className="fixed top-0 pointer-events-none" style={{ left: -10000 }}>
          <QuoteDocument
            ref={pdfRef}
            user={user}
            quote={{ ...pdfQuote, validUntil: pdfQuote.validUntil, items: pdfQuote.items }}
          />
        </div>
      )}
    </div>
  );
}