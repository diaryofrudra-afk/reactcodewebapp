export function AttendancePage({ active }: { active: boolean }) {
  return <div className={`page ${active ? 'active' : ''}`} id="page-attendance">Attendance</div>;
}
