import { useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { todayISO } from '../../utils';

const MAX_SZ = 5 * 1024 * 1024; // 5MB

interface StoredFile {
  id: string;
  name: string;
  type: string;
  data: string;
  timestamp: string;
  size: string;
}

export function OpFilesPage({ active }: { active: boolean }) {
  const { state, setState, showToast, save, user } = useApp();
  const { files } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myFiles = user ? ((files[user] || []) as StoredFile[]) : [];

  const handleFileChange = (file: File | undefined) => {
    if (!file) return;
    if (file.size > MAX_SZ) return showToast('Max 5MB', 'error');
    const reader = new FileReader();
    reader.onload = ev => {
      const fd: StoredFile = {
        id: String(Date.now()),
        name: file.name,
        type: file.type,
        data: ev.target?.result as string,
        timestamp: new Date().toLocaleString('en-IN'),
        size: (file.size / 1024).toFixed(1) + ' KB',
      };
      setState(prev => {
        const uid = user || '';
        return {
          ...prev,
          files: {
            ...prev.files,
            [uid]: [fd, ...(prev.files[uid] || [])],
          },
        };
      });
      save();
      showToast('File stored.');
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.onerror = () => showToast('Read failed', 'error');
    reader.readAsDataURL(file);
  };

  const deleteFile = (id: string) => {
    const f = myFiles.find(x => x.id === id);
    if (!confirm(`Remove "${f ? f.name : 'this file'}"?`)) return;
    setState(prev => {
      const uid = user || '';
      return {
        ...prev,
        files: {
          ...prev.files,
          [uid]: (prev.files[uid] || []).filter((x: unknown) => (x as StoredFile).id !== id),
        },
      };
    });
    save();
  };

  const exportXlsx = () => {
    if (!XLSX) return showToast('XLSX library missing', 'error');
    const wb = XLSX.utils.book_new();
    const fd: unknown[][] = [['File', 'Type', 'Size', 'Uploaded']];
    myFiles.forEach(f => fd.push([f.name, f.type, f.size, f.timestamp]));
    const ws = XLSX.utils.aoa_to_sheet(fd);
    XLSX.utils.book_append_sheet(wb, ws, 'Files');
    XLSX.writeFile(wb, `files_${user}_${todayISO()}.xlsx`);
    showToast('Exported successfully.');
  };

  const openPreview = (f: StoredFile) => {
    const win = window.open('', '_blank');
    if (!win) return;
    if (f.type.includes('pdf')) {
      win.document.write(`<iframe src="${f.data}" style="width:100%;height:100vh;border:none" title="${f.name}"></iframe>`);
    } else if (f.type.includes('image')) {
      win.document.write(`<img src="${f.data}" alt="${f.name}" style="max-width:100%;display:block;margin:auto" />`);
    } else {
      win.document.write(`<pre>${f.name}</pre>`);
    }
  };

  return (
    <div className={`page ${active ? 'active' : ''}`} id="page-op-files">
      <div className="section-bar" style={{ marginBottom: 14 }}>
        <div className="section-title">My Files</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {myFiles.length > 0 && (
            <button className="btn-sm outline" onClick={exportXlsx}>Export List</button>
          )}
          <label className="btn-sm accent" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            Upload File
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              onChange={e => handleFileChange(e.target.files?.[0])}
            />
          </label>
        </div>
      </div>

      <div id="op-files-content">
        {!myFiles.length ? (
          <div className="upload-zone" style={{ marginTop: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth="1.5" strokeLinecap="round" style={{ marginBottom: 8 }}>
              <polyline points="16 16 12 12 8 16" />
              <line x1="12" y1="12" x2="12" y2="21" />
              <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
            </svg>
            <div style={{ fontSize: 12, color: 'var(--t2)', marginBottom: 4 }}>No files yet</div>
            <div style={{ fontSize: 10, color: 'var(--t3)' }}>Use the Upload button above to add files</div>
          </div>
        ) : (
          <div>
            {/* Latest file featured */}
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--accent)', marginBottom: 8 }}>Latest File</div>
            <div className="section-card" style={{ marginBottom: 14 }}>
              {myFiles[0].type?.includes('image') ? (
                <img src={myFiles[0].data} style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block', borderBottom: '1px solid var(--border)', opacity: 0.85 }} alt={myFiles[0].name} />
              ) : (
                <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border)', background: 'var(--bg4)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" stroke="var(--t3)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                </div>
              )}
              {renderFileRow(myFiles[0], openPreview, deleteFile)}
            </div>

            {/* Archive */}
            {myFiles.length > 1 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--t3)', marginBottom: 8 }}>
                  Archive ({myFiles.length - 1})
                </div>
                {myFiles.slice(1).map(f => (
                  <div key={f.id} className="section-card" style={{ marginBottom: 8 }}>
                    {renderFileRow(f, openPreview, deleteFile)}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function renderFileRow(
  f: StoredFile,
  onPreview: (f: StoredFile) => void,
  onDelete: (id: string) => void
) {
  return (
    <div className="file-item" key={f.id}>
      <div className="file-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="file-name">{f.name}</div>
        <div className="file-meta">{f.timestamp} · {f.size}</div>
      </div>
      <div style={{ display: 'flex', gap: 5 }}>
        <button className="btn-icon-sm acc" style={{ width: 26, height: 26 }} title="Preview" onClick={() => onPreview(f)}>
          <svg width="12" height="12" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
          </svg>
        </button>
        <button className="btn-icon-sm red" style={{ width: 26, height: 26 }} title="Delete" onClick={() => onDelete(f.id)}>×</button>
      </div>
    </div>
  );
}
