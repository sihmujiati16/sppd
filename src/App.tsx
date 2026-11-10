import React, { useState, useEffect } from 'react';
import {
  DocumentPackage,
  PTKEmployee,
  SchoolIdentity,
  NumberingSettings,
} from './types';
import {
  INITIAL_PTK_LIST,
  INITIAL_SCHOOL_IDENTITY,
  INITIAL_DOCUMENTS,
} from './data/initialPTK';
import {
  expandDocumentPerPegawai,
  formatNomorSurat,
  parseNomorUrut,
} from './utils/documentLogic';
import { DashboardOverview } from './components/DashboardOverview';
import { DocumentEditorForm } from './components/DocumentEditorForm';
import { DocumentPreview } from './components/DocumentPreview';
import { PTKManagement } from './components/PTKManagement';
import { ArchiveList } from './components/ArchiveList';
import { NumberingSettingsView } from './components/NumberingSettingsView';
import { SchoolSettingsView } from './components/SchoolSettingsView';
import { SignatureStampSettingsView } from './components/SignatureStampSettingsView';
import { TemplateSettingsView } from './components/TemplateSettingsView';
import { SuratTugasPage } from './components/SuratTugasPage';
import { SPPDPage } from './components/SPPDPage';
import { LampiranSPPDPage } from './components/LampiranSPPDPage';
import { PrintFallbackModal } from './components/PrintFallbackModal';
import {
  LayoutDashboard,
  FilePlus,
  Users,
  Archive,
  Hash,
  Building,
  FileCode,
  Menu,
  X,
  School,
  Sparkles,
  Stamp,
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeMenu, setActiveMenu] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Core Data States with localStorage persistence
  const [documents, setDocuments] = useState<DocumentPackage[]>(() => {
    try {
      const saved = localStorage.getItem('sdn1_pujiharjo_documents');
      return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
    } catch {
      return INITIAL_DOCUMENTS;
    }
  });

  const [ptkList, setPtkList] = useState<PTKEmployee[]>(() => {
    try {
      const saved = localStorage.getItem('sdn1_pujiharjo_ptk');
      return saved ? JSON.parse(saved) : INITIAL_PTK_LIST;
    } catch {
      return INITIAL_PTK_LIST;
    }
  });

  const [school, setSchool] = useState<SchoolIdentity>(() => {
    try {
      const saved = localStorage.getItem('sdn1_pujiharjo_school');
      return saved ? JSON.parse(saved) : INITIAL_SCHOOL_IDENTITY;
    } catch {
      return INITIAL_SCHOOL_IDENTITY;
    }
  });

  const [numbering, setNumbering] = useState<NumberingSettings>(() => {
    try {
      const saved = localStorage.getItem('sdn1_pujiharjo_numbering');
      return saved
        ? JSON.parse(saved)
        : {
            formatSuratTugas: '400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]',
            formatSPPD: '400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]',
            counterSuratTugas: 170,
            counterSPPD: 170,
            tahun: 2026,
          };
    } catch {
      return {
        formatSuratTugas: '400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]',
        formatSPPD: '400.3.10.8/[NOMOR]/35.07.301.30.28/[TAHUN]',
        counterSuratTugas: 170,
        counterSPPD: 170,
        tahun: 2026,
      };
    }
  });

  // Active document for preview, editing, or printing
  const [previewDoc, setPreviewDoc] = useState<DocumentPackage | null>(null);
  const [editingDoc, setEditingDoc] = useState<DocumentPackage | null>(null);
  const [activePrintDoc, setActivePrintDoc] = useState<DocumentPackage | null>(null);
  const [activePrintPageFilter, setActivePrintPageFilter] = useState<1 | 2 | 3 | undefined>(undefined);
  const [printFallbackTarget, setPrintFallbackTarget] = useState<{
    doc: DocumentPackage;
    singlePage?: 1 | 2 | 3;
  } | null>(null);

  const handlePrintDocument = (doc: DocumentPackage, singlePage?: 1 | 2 | 3) => {
    setActivePrintDoc(doc);
    setActivePrintPageFilter(singlePage);

    setTimeout(() => {
      try {
        const sandboxAttr = window.frameElement?.getAttribute('sandbox');
        if (sandboxAttr !== null && sandboxAttr !== undefined && !sandboxAttr.includes('allow-modals')) {
          setPrintFallbackTarget({ doc, singlePage });
          return;
        }
      } catch {
        // Cross-origin frame: proceed with beforeprint detection
      }

      let printDialogOpened = false;
      const onBeforePrint = () => {
        printDialogOpened = true;
      };
      window.addEventListener('beforeprint', onBeforePrint, { once: true });

      try {
        window.print();
      } catch {
        printDialogOpened = false;
      }

      setTimeout(() => {
        window.removeEventListener('beforeprint', onBeforePrint);
        if (!printDialogOpened) {
          setPrintFallbackTarget({ doc, singlePage });
        }
      }, 350);
    }, 150);
  };

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sdn1_pujiharjo_documents', JSON.stringify(documents));
    } catch (e) {
      console.error(e);
    }
  }, [documents]);

  useEffect(() => {
    try {
      localStorage.setItem('sdn1_pujiharjo_ptk', JSON.stringify(ptkList));
    } catch (e) {
      console.error(e);
    }
  }, [ptkList]);

  useEffect(() => {
    try {
      localStorage.setItem('sdn1_pujiharjo_school', JSON.stringify(school));
    } catch (e) {
      console.error(e);
    }
  }, [school]);

  useEffect(() => {
    try {
      localStorage.setItem('sdn1_pujiharjo_numbering', JSON.stringify(numbering));
    } catch (e) {
      console.error(e);
    }
  }, [numbering]);

  // Handler: Start creating new document
  const handleStartCreateNew = () => {
    setEditingDoc(null);
    setActiveMenu('buat-surat');
    setPreviewDoc(null);
  };

  // Handler: Save document from editor form
  const handleSaveDocument = (doc: DocumentPackage, shouldPreview: boolean = false) => {
    const syncedNomor = doc.nomorSuratTugas || doc.nomorSPPD;
    const baseUrut = doc.nomorUrutSuratTugas || parseNomorUrut(syncedNomor) || numbering.counterSuratTugas;
    const syncedDoc: DocumentPackage = {
      ...doc,
      nomorSuratTugas: syncedNomor,
      nomorUrutSuratTugas: baseUrut,
      nomorSPPD: syncedNomor,
      nomorUrutSPPD: baseUrut,
      lampiranSppdNomor: syncedNomor,
    };

    const existingIndex = documents.findIndex((d) => d.id === syncedDoc.id);
    let updatedDocs: DocumentPackage[];

    if (existingIndex >= 0) {
      updatedDocs = documents.map((d) => (d.id === syncedDoc.id ? syncedDoc : d));
    } else {
      updatedDocs = [syncedDoc, ...documents];
      const pegCount = Math.max(1, syncedDoc.daftarPegawai.length);
      const nextCounter = baseUrut + pegCount;
      setNumbering((prev) => ({
        ...prev,
        counterSuratTugas: Math.max(prev.counterSuratTugas, nextCounter),
        counterSPPD: Math.max(prev.counterSPPD, nextCounter),
      }));
    }

    setDocuments(updatedDocs);

    if (shouldPreview) {
      setPreviewDoc(syncedDoc);
    } else {
      setActiveMenu('arsip');
    }
    setEditingDoc(null);
  };

  // Handler: Update doc options (e.g. TTD/Stempel toggle from preview)
  const handleUpdateDocOptions = (docId: string, patch: Partial<DocumentPackage>) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, ...patch, updatedAt: new Date().toISOString() } : d))
    );
    setPreviewDoc((prev) => (prev && prev.id === docId ? { ...prev, ...patch } : prev));
  };

  // Handler: Open edit
  const handleOpenEdit = (doc: DocumentPackage) => {
    setEditingDoc(doc);
    setPreviewDoc(null);
    setActiveMenu('buat-surat');
  };

  // Handler: Open preview
  const handleOpenPreview = (doc: DocumentPackage) => {
    setPreviewDoc(doc);
  };

  // Handler: Duplicate document
  const handleDuplicate = (doc: DocumentPackage) => {
    const nextUrut = numbering.counterSuratTugas;
    const year = new Date().getFullYear();
    const nextNomor = formatNomorSurat(numbering.formatSuratTugas, ` ${nextUrut} `, year);

    const duplicated: DocumentPackage = {
      ...doc,
      id: `doc-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tahun: year,
      nomorUrutSuratTugas: nextUrut,
      nomorSuratTugas: nextNomor,
      nomorUrutSPPD: nextUrut,
      nomorSPPD: nextNomor,
      lampiranSppdNomor: nextNomor,
    };

    setEditingDoc(duplicated);
    setActiveMenu('buat-surat');
    setPreviewDoc(null);
  };

  // Handler: Delete document
  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (previewDoc?.id === id) setPreviewDoc(null);
  };

  // Menu items array
  const menuItems = [
    { id: 'dashboard', label: '1. Dashboard', icon: LayoutDashboard },
    { id: 'buat-surat', label: '2. Buat Surat & SPPD', icon: FilePlus },
    { id: 'ptk', label: '3. Data Guru & Tendik', icon: Users },
    { id: 'arsip', label: '4. Arsip Surat Kedinasan', icon: Archive },
    { id: 'nomor', label: '5. Pengaturan Nomor', icon: Hash },
    { id: 'identitas', label: '6. Identitas Sekolah', icon: Building },
    { id: 'ttd-stempel', label: '7. Tanda Tangan & Stempel', icon: Stamp },
    { id: 'template', label: '8. Template Dokumen', icon: FileCode },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-800">
      {/* TOP HEADER (no-print) */}
      <header className="no-print bg-blue-900 text-white border-b border-blue-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-blue-800 text-blue-200 hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-blue-200 border border-white/20">
                <School className="w-5 h-5 text-amber-400" />
              </span>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white uppercase leading-tight">
                  SD NEGERI 1 PUJIHARJO
                </h1>
                <p className="text-[11px] text-blue-200 leading-tight">
                  Sistem Administrasi Surat Tugas & SPPD
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-white">{school.kepalaSekolah.nama}</p>
              <p className="text-blue-200 text-[11px]">Kepala Sekolah (NIP. {school.kepalaSekolah.nip})</p>
            </div>
            <button
              onClick={handleStartCreateNew}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
            >
              <FilePlus className="w-4 h-4" />
              <span className="hidden sm:inline">+ Buat Baru</span>
              <span className="sm:hidden">Baru</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="no-print flex-1 flex max-w-7xl w-full mx-auto">
        {/* SIDEBAR NAVIGATION (no-print) */}
        <aside
          className={`no-print fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:z-auto ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-0 hidden lg:block'
          }`}
        >
          <div className="h-full flex flex-col justify-between p-4">
            <div className="space-y-1">
              <div className="px-3 py-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                Menu Utama Administrasi
              </div>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.id && !previewDoc;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveMenu(item.id);
                        setPreviewDoc(null);
                        setIsMobileMenuOpen(false);
                        if (item.id === 'buat-surat' && !editingDoc) {
                          setEditingDoc(null);
                        }
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium transition text-left cursor-pointer ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <span className="leading-tight">{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom info in sidebar */}
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                Format Resmi 3 Hal A4
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Menghasilkan Surat Tugas (Hal 1), SPPD (Hal 2), dan Lampiran II (Hal 3) serasi dengan file Word referensi.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile menu backdrop */}
        {isMobileMenuOpen && (
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="no-print fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          />
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {/* Active View Router */}
          {activeMenu === 'dashboard' && (
            <DashboardOverview
              documents={documents}
              ptkList={ptkList}
              school={school}
              onCreateNew={handleStartCreateNew}
              onViewDoc={handleOpenPreview}
              onNavigateTab={(tab) => {
                setActiveMenu(tab);
                setPreviewDoc(null);
              }}
            />
          )}

          {activeMenu === 'buat-surat' && (
            <DocumentEditorForm
              initialData={editingDoc}
              ptkList={ptkList}
              school={school}
              numbering={numbering}
              onSave={handleSaveDocument}
              onCancel={() => {
                setActiveMenu('dashboard');
                setEditingDoc(null);
              }}
            />
          )}

          {activeMenu === 'ptk' && (
            <PTKManagement
              ptkList={ptkList}
              school={school}
              onUpdatePTKList={(newList) => setPtkList(newList)}
              onSelectForSurat={(ptk) => {
                handleStartCreateNew();
              }}
            />
          )}

          {activeMenu === 'arsip' && (
            <ArchiveList
              documents={documents}
              school={school}
              onPreview={handleOpenPreview}
              onEdit={handleOpenEdit}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
              onCreateNew={handleStartCreateNew}
              onPrint={handlePrintDocument}
            />
          )}

          {activeMenu === 'nomor' && (
            <NumberingSettingsView
              settings={numbering}
              documents={documents}
              onSaveSettings={(newSettings) => setNumbering(newSettings)}
            />
          )}

          {activeMenu === 'identitas' && (
            <SchoolSettingsView
              school={school}
              onSaveSchool={(newSchool) => setSchool(newSchool)}
            />
          )}

          {activeMenu === 'ttd-stempel' && (
            <SignatureStampSettingsView
              school={school}
              onSaveSchool={(newSchool) => setSchool(newSchool)}
            />
          )}

          {activeMenu === 'template' && (
            <TemplateSettingsView school={school} />
          )}
        </main>
      </div>

      {/* FULL PREVIEW MODAL (When previewDoc is active) */}
      {previewDoc && (
        <div className="no-print fixed inset-0 z-50 overflow-hidden">
          <DocumentPreview
            document={previewDoc}
            school={school}
            onEdit={() => handleOpenEdit(previewDoc)}
            onClose={() => setPreviewDoc(null)}
            onUpdateDocOptions={handleUpdateDocOptions}
            onPrint={(targetDoc, singlePage) => handlePrintDocument(targetDoc, singlePage)}
          />
        </div>
      )}

      {/* PRINT FALLBACK MODAL (Shown automatically if iframe/browser suppresses window.print()) */}
      {printFallbackTarget && (
        <PrintFallbackModal
          doc={printFallbackTarget.doc}
          school={school}
          singlePage={printFallbackTarget.singlePage}
          onClose={() => setPrintFallbackTarget(null)}
        />
      )}

      {/* PRINT CONTAINER (Hidden on screen, rendered on window.print()) */}
      <div className="print-only">
        {(activePrintDoc || previewDoc || documents[0]) && (
          <div>
            {expandDocumentPerPegawai(activePrintDoc || previewDoc || documents[0]).map((pkg, idx) => (
              <React.Fragment key={pkg.id || idx}>
                {(!activePrintPageFilter || activePrintPageFilter === 1) && (
                  <SuratTugasPage data={pkg} school={school} />
                )}
                {(!activePrintPageFilter || activePrintPageFilter === 2) && (
                  <SPPDPage data={pkg} school={school} />
                )}
                {(!activePrintPageFilter || activePrintPageFilter === 3) && (
                  <LampiranSPPDPage data={pkg} school={school} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
