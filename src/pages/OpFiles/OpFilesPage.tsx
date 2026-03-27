export function OpFilesPage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-op-files">Op Files</div>;
}
