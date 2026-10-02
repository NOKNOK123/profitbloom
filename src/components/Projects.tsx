import { statusPill } from './ProjectItem';
import React, { useEffect, useState } from 'react';
import { Search, Filter, Plus, Eye, Edit, Trash2, Download, FileBarChart, Archive, X } from 'lucide-react';
import { getProgressFromStatus } from '../App';
import { api, Project, ProjectStatus, type User } from '../lib/api';
import { LEVEL_STYLE, projectHealth } from '../lib/job';

interface ProjectsProps {
  onProjectSelect: (project: Project, edit?: boolean) => void;
  onNavigate: (page: string) => void;
  user: User;
}

interface StatusOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  className: string;
}

export function Projects({ onProjectSelect, onNavigate, user }: ProjectsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [notification, setNotification] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.projects()
      .then(setProjects)
      .catch((err) => showNotification(err.message))
      .finally(() => setLoading(false));
  }, []);

  const statusOptions: StatusOption[] = [
    {
      id: 'draft',
      name: 'ร่าง',
      description: 'โปรเจ็กต์ยังอยู่ในขั้นตอนการเตรียม',
      icon: '📝',
      className: 'status-draft'
    },
    {
      id: 'quote_created',
      name: 'สร้างใบเสนอราคาแล้ว',
      description: 'สร้างใบเสนอราคาแล้ว พร้อมส่งให้ลูกค้า',
      icon: '📄',
      className: 'status-quote-created'
    },
    {
      id: 'pending',
      name: 'รอการอนุมัติ',
      description: 'ส่งใบเสนอราคาแล้ว รอลูกค้าตอบกลับ',
      icon: '⏳',
      className: 'status-pending'
    },
    {
      id: 'approved',
      name: 'อนุมัติแล้ว',
      description: 'ลูกค้าอนุมัติแล้ว เริ่มดำเนินการ',
      icon: '✅',
      className: 'status-approved'
    },
    {
      id: 'completed',
      name: 'เสร็จสิ้น',
      description: 'ดำเนินการเสร็จสิ้นแล้ว สร้างใบเสร็จแล้ว',
      icon: '🎉',
      className: 'status-completed'
    },
    {
      id: 'cancelled',
      name: 'ยกเลิก',
      description: 'ยกเลิกโปรเจ็กต์',
      icon: '❌',
      className: 'status-cancelled'
    }
  ];

  const statusOrder: ProjectStatus[] = ['draft', 'quote_created', 'pending', 'approved', 'completed', 'cancelled'];

  const inTimeRange = (project: Project) => {
    if (timeFilter === 'all') return true;
    if (!project.eventDate) return false;
    const d = new Date(project.eventDate);
    const now = new Date();
    if (timeFilter === 'week') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      start.setDate(now.getDate() - now.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      return d >= start && d < end;
    }
    if (timeFilter === 'month') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3);
  };

  const filteredProjects = projects
    .filter(project => {
      const term = searchTerm.toLowerCase();
      const matchesSearch = project.title.toLowerCase().includes(term) ||
                           project.code.toLowerCase().includes(term) ||
                           project.client.toLowerCase().includes(term);
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus && inTimeRange(project);
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.title.localeCompare(b.title, 'th');
        case 'budget': return b.budget - a.budget;
        case 'status': return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        default: return (b.eventDate || '').localeCompare(a.eventDate || '');
      }
    });

  const getStatusStyles = (status: string) => statusPill(status);

  const getStatsByStatus = (status: string) => {
    return projects.filter(p => p.status === status).length;
  };

  const openStatusModal = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setIsStatusModalOpen(true);
  };

  const closeStatusModal = () => {
    setIsStatusModalOpen(false);
    setSelectedProject(null);
  };

  const updateProjectStatus = async (newStatus: string) => {
    if (!selectedProject) return;
    try {
      const saved = await api.updateProject(selectedProject.id, { status: newStatus as ProjectStatus });
      setProjects(list => list.map(p => (p.id === saved.id ? saved : p)));
      showNotification(`อัปเดตสถานะโปรเจ็กต์ ${saved.code} เรียบร้อยแล้ว`);
    } catch (err) {
      showNotification((err as Error).message);
    }
    closeStatusModal();
  };

  const deleteProject = async (project: Project) => {
    if (!window.confirm(`ลบโปรเจ็กต์ "${project.title}" ใช่หรือไม่?`)) return;
    try {
      await api.deleteProject(project.id);
      setProjects(list => list.filter(p => p.id !== project.id));
      showNotification(`ลบโปรเจ็กต์ ${project.code} เรียบร้อยแล้ว`);
    } catch (err) {
      showNotification((err as Error).message);
    }
  };

  const exportCsv = () => {
    const header = ['รหัส', 'ชื่อโปรเจ็กต์', 'ประเภท', 'ลูกค้า', 'เบอร์โทร', 'อีเมล', 'วันที่จัดงาน', 'งบลูกค้า', 'ต้นทุน', 'ราคาขาย', 'กำไร', 'Margin (%)', 'คะแนนสุขภาพ', 'สถานะ'];
    const rows = filteredProjects.map(p => {
      const h = projectHealth(p, user);
      return [p.code, p.title, p.projectType, p.client, p.phone, p.email, p.eventDate, p.budget, Math.round(h.cost), Math.round(h.price), Math.round(h.profit), h.margin.toFixed(1), h.score, p.statusText];
    });
    const csv = [header, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `projects-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleProjectClick = (project: Project) => {
    onProjectSelect(project);
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const formatEventDate = (dateString: string) => {
    if (!dateString) return "ยังไม่กำหนด";
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="p-5 md:p-10 pb-28 md:pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 md:mb-8 gap-4">
        <div><h1 className="text-2xl md:text-[28px] font-semibold text-ink tracking-tight">โปรเจ็กต์</h1><p className="text-sm text-ink-muted mt-1">งานทั้งหมดของคุณ แตะการ์ดเพื่อดูรายละเอียด</p></div>
        <div className="flex gap-2 w-full lg:w-auto">
          <button onClick={exportCsv} aria-label="ส่งออก CSV" className="pb-btn-secondary shrink-0">
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">ส่งออก CSV</span>
          </button>
          <button onClick={() => onNavigate('new-project')} className="pb-btn-primary flex-1 lg:flex-none whitespace-nowrap">
            <Plus className="w-4 h-4" />
            สร้างโปรเจ็กต์ใหม่
          </button>
        </div>
      </div>

      {/* Status filter chips */}
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 mb-4 -mx-1 px-1">
        {[{ id: 'all', label: 'ทั้งหมด', count: projects.length }, { id: 'draft', label: 'ร่าง', count: getStatsByStatus('draft') }, { id: 'quote_created', label: 'มีใบเสนอราคา', count: getStatsByStatus('quote_created') }, { id: 'pending', label: 'รออนุมัติ', count: getStatsByStatus('pending') }, { id: 'approved', label: 'อนุมัติแล้ว', count: getStatsByStatus('approved') }, { id: 'completed', label: 'เสร็จสิ้น', count: getStatsByStatus('completed') }, { id: 'cancelled', label: 'ยกเลิก', count: getStatsByStatus('cancelled') }].map(chip => (
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
              placeholder="ค้นหาโปรเจ็กต์, ลูกค้า, หรือรหัสงาน..."
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
            
            {(statusFilter !== 'all' || timeFilter !== 'all') && (
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setTimeFilter('all');
                }}
                className="text-xs md:text-sm text-ink-muted hover:text-ink"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-line">
              <select 
                className="pb-input text-ink-muted"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">สถานะทั้งหมด</option>
                <option value="draft">ร่าง</option>
                <option value="quote_created">สร้างใบเสนอราคาแล้ว</option>
                <option value="pending">รอการอนุมัติ</option>
                <option value="approved">อนุมัติแล้ว</option>
                <option value="completed">เสร็จสิ้น</option>
                <option value="cancelled">ยกเลิก</option>
              </select>
              <select 
                className="pb-input text-ink-muted"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">ช่วงเวลาทั้งหมด</option>
                <option value="week">สัปดาห์นี้</option>
                <option value="month">เดือนนี้</option>
                <option value="quarter">ไตรมาสนี้</option>
              </select>
              <select 
                className="pb-input text-ink-muted"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">เรียงตามวันที่</option>
                <option value="name">เรียงตามชื่อ</option>
                <option value="budget">เรียงตามงบประมาณ</option>
                <option value="status">เรียงตามสถานะ</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="text-center text-ink py-12">กำลังโหลด...</div>}
      {!loading && filteredProjects.length === 0 && (
        <div className="pb-card p-10 text-center mb-8">
          <p className="text-ink-muted mb-4">{projects.length === 0 ? 'ยังไม่มีโปรเจ็กต์' : 'ไม่พบโปรเจ็กต์ที่ตรงกับเงื่อนไข'}</p>
          {projects.length === 0 && (
            <button onClick={() => onNavigate('new-project')} className="pb-btn-primary">
              สร้างโปรเจ็กต์แรก
            </button>
          )}
        </div>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {filteredProjects.map((project) => {
          const progress = getProgressFromStatus(project.status);
          
          return (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="pb-card cursor-pointer transition-all duration-300 overflow-hidden"
            >
              {/* Project Header */}
              <div className="p-4 md:p-6 border-b border-line">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-lg text-ink mb-2 line-clamp-2 font-semibold">{project.title}</h3>
                    <p className="text-sm text-ink-muted">รหัส: {project.code}</p>
                  </div>
                  <button
                    onClick={(e) => openStatusModal(project, e)}
                    className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium border transition-all hover:scale-105 ml-2 whitespace-nowrap whitespace-nowrap ${getStatusStyles(project.status)}`}
                  >
                    {project.statusText}
                  </button>
                </div>
              </div>

              {/* Project Body */}
              <div className="p-4 md:p-6">
                {(() => {
                  const h = projectHealth(project, user);
                  return (
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-4 mb-6 items-center">
                      <span title="คะแนนสุขภาพกำไร" className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold ${LEVEL_STYLE[h.level].chip}`}>{h.score}</span>
                      <div>
                        <div className="text-xs text-ink-muted mb-1">วันที่จัดงาน</div>
                        <div className="font-medium text-ink text-sm">{formatEventDate(project.eventDate)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-ink-muted mb-1">ราคา · Margin</div>
                        <div className="font-medium text-ink text-sm whitespace-nowrap">฿{Math.round(h.price).toLocaleString('th-TH')} · {h.margin.toFixed(0)}%</div>
                      </div>
                    </div>
                  );
                })()}

                {/* Progress based on status */}
                <div className="mb-6">
                  <div className="w-full bg-[#F1F0F5] rounded-full h-1.5 mb-2">
                    <div 
                      className="bg-gold h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <div className="text-xs md:text-sm text-ink-muted">{progress}% เสร็จสิ้น</div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleProjectClick(project)}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-[#F1F0F5] text-ink rounded-full hover:bg-[#E8E6EF] transition-colors text-xs md:text-sm"
                  >
                    <Eye className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">ดู</span>
                  </button>
                  <button
                    onClick={() => onProjectSelect(project, true)}
                    className="flex items-center justify-center gap-1 py-2 px-2 bg-[#F1F0F5] text-ink rounded-full hover:bg-[#E8E6EF] transition-colors text-xs md:text-sm"
                  >
                    <Edit className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden md:inline">แก้ไข</span>
                  </button>
                  {project.status === 'completed' ? (
                    <button
                      onClick={() => handleProjectClick(project)}
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-[#F1F0F5] text-ink rounded-full hover:bg-[#E8E6EF] transition-colors text-xs md:text-sm"
                    >
                      <FileBarChart className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden md:inline">รายงาน</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => deleteProject(project)}
                      className="flex items-center justify-center gap-1 py-2 px-2 bg-rose-50 text-rose-600 rounded-full hover:bg-rose-100 transition-colors text-xs md:text-sm"
                    >
                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      <span className="hidden md:inline">ลบ</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Update Modal */}
      {isStatusModalOpen && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] shadow-soft-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 md:p-6 border-b border-line">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base md:text-lg text-ink mb-2 font-semibold">อัปเดตสถานะโปรเจ็กต์</h3>
                  <p className="text-sm text-ink-muted line-clamp-2">{selectedProject.title}</p>
                </div>
                <button
                  onClick={closeStatusModal}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6">
              <div className="space-y-3 mb-6">
                {statusOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => updateProjectStatus(option.id)}
                    className={`p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-[#673AB7] hover:bg-canvas/60 ${
                      selectedProject.status === option.id 
                        ? 'border-[#673AB7] bg-canvas/60' 
                        : 'border-line'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xl md:text-2xl">{option.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-ink mb-1 text-sm md:text-base">{option.name}</div>
                        <div className="text-xs md:text-sm text-ink-muted line-clamp-2">{option.description}</div>
                        <div className="text-xs text-ink mt-1 font-medium">
                          ความคืบหน้า: {getProgressFromStatus(option.id)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeStatusModal}
                  className="px-4 md:px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm md:text-base"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-3 rounded-full shadow-soft-xl z-50 animate-toast text-sm">
          {notification}
        </div>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <div className="text-center py-12 md:py-16">
          <div className="text-ink-muted mb-4">
            <svg className="mx-auto h-8 w-8 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-base md:text-lg font-medium text-ink mb-2">ไม่พบโปรเจ็กต์</h3>
          <p className="text-sm md:text-base text-ink-muted">ลองเปลี่ยนคำค้นหาหรือตัวกรองของคุณ</p>
        </div>
      )}
    </div>
  );
}