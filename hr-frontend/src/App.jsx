import React, { useState, useEffect } from 'react'
import './index.css'

const API_BASE = '/api'

const PENDING_TASKS = [
  { id: 1, task: 'Verify Identity Documents', employee: 'John Doe', priority: 'High', due: '2026-03-12' },
  { id: 2, task: 'Approve Quarterly Bonus', employee: 'Jane Smith', priority: 'Medium', due: '2026-03-15' },
  { id: 3, task: 'Update Bank Details', employee: 'Michael Brown', priority: 'Low', due: '2026-03-20' }
]

function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('login')
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [employees, setEmployees] = useState([])
  const [payrollHistory, setPayrollHistory] = useState([])
  const [authHeader, setAuthHeader] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [lastProcessed, setLastProcessed] = useState(null)
  const [summaryType, setSummaryType] = useState(null)
  const [toasts, setToasts] = useState([])

  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [sortBy, setSortBy] = useState('firstName')
  const [sortDir, setSortDir] = useState('asc')
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [selectedEmployee, setSelectedEmployee] = useState(null)

  useEffect(() => {
    document.body.className = theme === 'light' ? 'light-mode' : ''
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light')

  const notify = {
    show: (message, type = 'info') => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, message, type }])
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, hiding: true } : t))
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== id))
        }, 500)
      }, 4000)
    },
    success: (m) => notify.show(m, 'success'),
    error: (m) => notify.show(m, 'error'),
    info: (m) => notify.show(m, 'info')
  }

  const fetchEmployees = () => {
    const params = new URLSearchParams({
      query: search,
      page,
      size: 10,
      sortBy,
      direction: sortDir
    })
    if (deptFilter) params.append('department', deptFilter)
    if (statusFilter) params.append('status', statusFilter)

    fetch(`${API_BASE}/employees/search?${params}`, { headers: { 'Authorization': authHeader || localStorage.getItem('auth') } })
      .then(res => res.json())
      .then(data => {
        setEmployees(data.content || [])
        setTotalPages(data.totalPages || 0)
      })
      .catch(err => console.error('Failed to fetch employees.'))
  }

  const login = (username, password) => {
    const creds = btoa(`${username}:${password}`)
    setAuthHeader(`Basic ${creds}`)
    localStorage.setItem('auth', `Basic ${creds}`)

    fetch(`${API_BASE}/employees`, { headers: { 'Authorization': `Basic ${creds}` } })
      .then(res => {
        if (!res.ok) throw new Error('Invalid credentials.')
        return res.json()
      })
      .then(empData => {
        setEmployees(empData || [])
        setUser({ username, role: username === 'admin' ? 'ADMIN' : 'USER' })
        
        fetch(`${API_BASE}/payroll/all`, { headers: { 'Authorization': `Basic ${creds}` } })
          .then(res => res.json())
          .then(setPayrollHistory)
          .catch(err => console.error('Failed to fetch payroll:', err))

        notify.success('Authentication Successful.')
        setView('dashboard')
      })
      .catch(err => {
        const errorMsg = err.name === 'TypeError' && err.message === 'Failed to fetch' 
          ? 'Backend Unreachable. Please ensure the backend is running on port 8080.' 
          : err.message
        notify.error(`Login failed: ${errorMsg}`)
        setAuthHeader('')
      })
  }

  const logout = () => {
    setUser(null)
    setAuthHeader('')
    localStorage.removeItem('auth')
    setView('login')
  }

  useEffect(() => {
    const openLeave = () => { setSummaryType('leave'); setShowModal(true) }
    window.addEventListener('open-leave-modal', openLeave)
    return () => window.removeEventListener('open-leave-modal', openLeave)
  }, [])

  useEffect(() => {
    if (view === 'employees' && authHeader) {
      const timeout = setTimeout(fetchEmployees, 300)
      return () => clearTimeout(timeout)
    }
  }, [view, search, deptFilter, statusFilter, page, sortBy, sortDir, authHeader])

  const toggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'DEACTIVE' : 'ACTIVE'
    fetch(`${API_BASE}/employees/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ status: newStatus })
    }).then(() => {
      notify.success(`Employee ${newStatus === 'ACTIVE' ? 'activated' : 'deactivated'}.`)
      fetchEmployees()
    })
  }

  if (view === 'login') {
    return <LoginPage onLogin={login} />
  }

  return (
    <div className="app-container">
      <ToastContainer toasts={toasts} />
      <Sidebar user={user} setView={setView} onLogout={logout} />
      <main className="main-content">
        <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1>{view.charAt(0).toUpperCase() + view.slice(1).replace('-', ' ')}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button className="btn btn-outline" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`} style={{ padding: '0 1rem', borderRadius: '8px', height: '36px', fontSize: '0.85rem', fontWeight: '600' }}>
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
            <div className="user-profile">
              <span className={`badge badge-${user?.username}`}>{user?.role}</span>
              <span style={{ marginLeft: '1rem' }}>{user?.username}</span>
            </div>
          </div>
        </header>

        {view === 'dashboard' && <Dashboard employees={employees} setView={setView} payrollHistory={payrollHistory} setShowModal={setShowModal} setSummaryType={setSummaryType} />}
        {view === 'employees' && (
          <EmployeeList 
            employees={employees} 
            search={search} setSearch={setSearch}
            deptFilter={deptFilter} setDeptFilter={setDeptFilter}
            statusFilter={statusFilter} setStatusFilter={setStatusFilter}
            page={page} setPage={setPage}
            totalPages={totalPages}
            sortBy={sortBy} setSortBy={setSortBy}
            sortDir={sortDir} setSortDir={setSortDir}
            onEdit={(emp) => { setEditingEmployee(emp); setView('edit-employee') }}
            onView={(emp) => { setSelectedEmployee(emp); setView('employee-detail') }}
            onToggleStatus={toggleStatus}
            setView={setView}
          />
        )}
        {view === 'add-employee' && <EmployeeForm onCancel={() => setView('employees')} onSuccess={() => { setView('employees'); fetchEmployees() }} authHeader={authHeader} />}
        {view === 'edit-employee' && <EmployeeForm employee={editingEmployee} onCancel={() => setView('employees')} onSuccess={() => { setView('employees'); fetchEmployees() }} authHeader={authHeader} />}
        {view === 'employee-detail' && <EmployeeDetail employee={selectedEmployee} onBack={() => setView('employees')} onEdit={(emp) => { setEditingEmployee(emp); setView('edit-employee') }} />}
        {view === 'payroll' && <PayrollDashboard employees={employees} payrollHistory={payrollHistory} setPayrollHistory={setPayrollHistory} authHeader={authHeader} setShowModal={setShowModal} setLastProcessed={setLastProcessed} setSummaryType={setSummaryType} />}
        {view === 'attendance' && <AttendanceHub user={user} employees={employees} authHeader={authHeader} />}
        {view === 'recruitment' && <RecruitmentHub authHeader={authHeader} />}
        {view === 'onboarding' && <OnboardingCenter employees={employees} authHeader={authHeader} />}
        {view === 'performance' && <PerformanceHub employees={employees} authHeader={authHeader} />}
        {view === 'training' && <TrainingDevelopment employees={employees} authHeader={authHeader} />}
        {view === 'benefits' && <BenefitsHub employees={employees} authHeader={authHeader} />}

        {showModal && summaryType === 'processed' && <SuccessModal data={lastProcessed} onClose={() => { setShowModal(false); setSummaryType(null) }} />}
        {showModal && summaryType === 'employees' && <SummaryModal type="employees" data={employees} onClose={() => { setShowModal(false); setSummaryType(null) }} />}
        {showModal && summaryType === 'payroll' && <SummaryModal type="payroll" data={payrollHistory} onClose={() => { setShowModal(false); setSummaryType(null) }} />}
        {showModal && summaryType === 'tasks' && <SummaryModal type="tasks" data={PENDING_TASKS} onClose={() => { setShowModal(false); setSummaryType(null) }} />}
        {showModal && summaryType === 'leave' && <LeaveRequestModal onClose={() => { setShowModal(false); setSummaryType(null) }} onSubmit={(data) => {
          fetch(`${API_BASE}/attendance/leave-request`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
            body: JSON.stringify({ ...data, employeeId: employees[0]?.id || 1 })
          }).then(() => { setShowModal(false); setSummaryType(null); window.dispatchEvent(new CustomEvent('refresh-attendance')) })
        }} />}
      </main>
    </div>
  )
}

function SummaryModal({ type, data, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>{type === 'employees' ? 'Employee Summary' : type === 'payroll' ? 'Payroll Summary' : 'Pending Tasks'}</h2>
        <div style={{ maxHeight: '400px', overflowY: 'auto', textAlign: 'left' }}>
          {type === 'tasks' ? (
            <table className="table">
              <thead><tr><th>Task</th><th>Employee</th><th>Priority</th></tr></thead>
              <tbody>{data.map(t => (<tr key={t.id}><td>{t.task}</td><td>{t.employee}</td><td><span className={`badge badge-${t.priority.toLowerCase() === 'high' ? 'admin' : t.priority.toLowerCase() === 'medium' ? 'hr' : 'user'}`}>{t.priority}</span></td></tr>))}</tbody>
            </table>
          ) : type === 'employees' ? (
            <table className="table">
              <thead><tr><th>Name</th><th>Department</th><th>Country</th></tr></thead>
              <tbody>{data.map(emp => (<tr key={emp.id}><td>{emp.firstName} {emp.lastName}</td><td>{emp.department}</td><td>{emp.country}</td></tr>))}</tbody>
            </table>
          ) : (
            <table className="table">
              <thead><tr><th>Ref</th><th>Employee</th><th>Amount</th></tr></thead>
              <tbody>{data.map(rec => (<tr key={rec.id}><td style={{ fontSize: '0.7rem' }}>{rec.paymentReference}</td><td>{rec.employee ? rec.employee.firstName : 'N/A'}</td><td style={{ fontWeight: 'bold' }}>{rec.currency} {rec.netSalary.toLocaleString()}</td></tr>))}</tbody>
            </table>
          )}
        </div>
        <button className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} onClick={onClose}>Close</button>
      </div>
    </div>
  )
}

function LeaveRequestModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({ startDate: '', endDate: '', leaveType: 'VACATION', reason: '' })
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px' }}>
        <h3>Request Leave</h3>
        <div className="input-group">
          <label>Leave Type</label>
          <select value={form.leaveType} onChange={e => setForm({ ...form, leaveType: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-dark)', color: 'white', border: '1px solid var(--border)' }}>
            <option value="VACATION">Vacation</option>
            <option value="SICK">Sick Leave</option>
            <option value="PARENTAL">Parental Leave</option>
            <option value="UNPAID">Unpaid Leave</option>
          </select>
        </div>
        <div className="input-group">
          <label>Start Date</label>
          <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
        </div>
        <div className="input-group">
          <label>End Date</label>
          <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
        </div>
        <div className="input-group">
          <label>Reason</label>
          <textarea value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-glass)', color: 'var(--text-main)', border: '1px solid var(--border)', minHeight: '80px' }} />
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => onSubmit(form)}>Submit</button>
          <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

function SuccessModal({ data, onClose }) {
  if (!data) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div style={{ background: 'var(--bg-dark)', borderRadius: '8px', padding: '1.25rem', margin: '1.25rem 0', textAlign: 'left', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Employee:</span><span style={{ fontWeight: 'bold' }}>{data.employee ? `${data.employee.firstName} ${data.employee.lastName}` : 'N/A'}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}><span>Net Paid:</span><span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{data.currency} {data.netSalary.toLocaleString()}</span></div>
        </div>
        <button className="btn btn-primary" style={{ width: '100%' }} onClick={onClose}>Done</button>
      </div>
    </div>
  )
}

function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    onLogin(username, password)
    setTimeout(() => setIsSubmitting(false), 2000)
  }

  return (
    <div className="login-page">
      <div className="login-card glass-card animate-fade-in" style={{ padding: '3rem', maxWidth: '450px', width: '100%', border: '1px solid var(--glass)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <img src="/logo.png" alt="PaySphere" style={{ width: '56px', height: '56px', objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.5rem', color: 'var(--text-main)' }}>PaySphere</h2>
          <p className="text-muted" style={{ letterSpacing: '1px', fontSize: '0.9rem' }}>Human Capital Management Platform</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Username</label>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              style={{ padding: '1rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', marginTop: '0.5rem' }}
              autoFocus
            />
          </div>
          
          <div className="input-group" style={{ marginTop: '1.5rem' }}>
            <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.7 }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ padding: '1rem', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-main)', marginTop: '0.5rem' }}
            />
          </div>
          
          <button 
            type="submit"
            className="btn btn-primary" 
            style={{ width: '100%', padding: '1rem', marginTop: '2.5rem', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '12px', boxShadow: '0 10px 20px rgba(99, 102, 241, 0.3)' }}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Accessing...' : 'Enter System'}
          </button>
        </form>
        
        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Secure Biometric Access Enabled • v2.0.4
        </p>
      </div>
    </div>
  )
}

function Sidebar({ user, view, setView, onLogout }) {
  return (
    <aside className="sidebar">
      <div style={{ padding: '0.5rem 0', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <img src="/logo.png" alt="P" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', letterSpacing: '0.5px', color: 'var(--text-main)' }}>PaySphere</h2>
      </div>
      
      <button className={`btn btn-outline ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
        Dashboard
      </button>
      
      {(user.role === 'ADMIN' || user.role === 'HR') && (
        <>
          <button className={`btn btn-outline ${view === 'employees' ? 'active' : ''}`} onClick={() => setView('employees')}>
            Employees
          </button>
          <button className={`btn btn-outline ${view === 'recruitment' ? 'active' : ''}`} onClick={() => setView('recruitment')}>
            Recruitment & ATS
          </button>
          <button className={`btn btn-outline ${view === 'onboarding' ? 'active' : ''}`} onClick={() => setView('onboarding')}>
            Onboarding
          </button>
          <button className={`btn btn-outline ${view === 'attendance' ? 'active' : ''}`} onClick={() => setView('attendance')}>
            Time & Attendance
          </button>
          <button className={`btn btn-outline ${view === 'performance' ? 'active' : ''}`} onClick={() => setView('performance')}>
            Performance
          </button>
          <button className={`btn btn-outline ${view === 'training' ? 'active' : ''}`} onClick={() => setView('training')}>
            Training
          </button>
          <button className={`btn btn-outline ${view === 'payroll' ? 'active' : ''}`} onClick={() => setView('payroll')}>
            Payroll
          </button>
          <button className={`btn btn-outline ${view === 'benefits' ? 'active' : ''}`} onClick={() => setView('benefits')}>
            Benefits
          </button>
        </>
      )}
      <div style={{ flex: 1 }}></div>
      <div style={{ padding: '1rem', background: 'var(--bg-dark)', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Logged in as</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>{user.username.slice(0,2).toUpperCase()}</div>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user.username} ({user.role})</p>
        </div>
      </div>
      <button className="btn btn-outline" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', marginTop: '0.5rem' }} onClick={onLogout}>Log Out</button>
    </aside>
  )
}

function Dashboard({ employees, setView, payrollHistory, setShowModal, setSummaryType }) {
  const totalPayroll = payrollHistory.reduce((sum, rec) => sum + rec.netSalary, 0).toLocaleString()
  return (
    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
      <div className="card" onClick={() => { setSummaryType('employees'); setShowModal(true) }} style={{ cursor: 'pointer' }}>
        <h3>Total Employees</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1rem' }}>{employees.length}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>View details</p>
      </div>
      <div className="card" onClick={() => { setSummaryType('payroll'); setShowModal(true) }} style={{ cursor: 'pointer' }}>
        <h3>Total Net Pay</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1rem' }}>${totalPayroll}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>View reports</p>
      </div>
      <div className="card" onClick={() => { setSummaryType('tasks'); setShowModal(true) }} style={{ cursor: 'pointer' }}>
        <h3>Pending Tasks</h3>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '1rem' }}>{PENDING_TASKS.length}</p>
        <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>Take action</p>
      </div>
    </div>
  )
}

function EmployeeList({ 
  employees, search, setSearch, deptFilter, setDeptFilter, statusFilter, setStatusFilter,
  page, setPage, totalPages, sortBy, setSortBy, sortDir, setSortDir, onEdit, onView, onToggleStatus, setView 
}) {
  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))]
  
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <span style={{ opacity: 0.3, marginLeft: '5px' }}>⇵</span>
    return <span style={{ marginLeft: '5px' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  return (
    <div className="employee-module">
      <div className="filters-bar card" style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', padding: '1.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: 2, minWidth: '200px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', opacity: 0.7 }}>SEARCH EMPLOYEES</label>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'white' }}
          />
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', opacity: 0.7 }}>DEPARTMENT</label>
          <select 
            value={deptFilter} 
            onChange={e => setDeptFilter(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'white' }}
          >
            <option value="">All Departments</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div style={{ flex: 1, minWidth: '150px' }}>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.5rem', display: 'block', opacity: 0.7 }}>STATUS</label>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'white' }}
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DEACTIVE">Deactive</option>
          </select>
        </div>
        <button className="btn btn-primary" onClick={() => setView('add-employee')} style={{ height: '45px', padding: '0 1.5rem' }}>+ Add Employee</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>ID <SortIcon field="id" /></th>
              <th onClick={() => handleSort('firstName')} style={{ cursor: 'pointer' }}>Name <SortIcon field="firstName" /></th>
              <th>Email</th>
              <th>Department</th>
              <th>Role</th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>Status <SortIcon field="status" /></th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length > 0 ? employees.map(emp => (
              <tr key={emp.id} className={emp.status === 'DEACTIVE' ? 'row-inactive' : ''}>
                <td><span style={{ opacity: 0.6, fontSize: '0.8rem' }}>#{emp.id}</span></td>
                <td>
                  <div style={{ fontWeight: '600' }}>{emp.firstName} {emp.lastName}</div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Joined: {emp.joiningDate || 'N/A'}</div>
                </td>
                <td>{emp.email}</td>
                <td><span className="badge badge-hr">{emp.department}</span></td>
                <td>{emp.jobTitle}</td>
                <td>
                  <span className={`badge badge-${emp.status?.toLowerCase() === 'active' ? 'approved' : 'rejected'}`}>
                    {emp.status || 'ACTIVE'}
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => onView(emp)}>Profile</button>
                    <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} onClick={() => onEdit(emp)}>Edit</button>
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', borderColor: emp.status === 'ACTIVE' ? 'var(--danger)' : 'var(--success)', color: emp.status === 'ACTIVE' ? 'var(--danger)' : 'var(--success)' }}
                      onClick={() => onToggleStatus(emp.id, emp.status || 'ACTIVE')}
                    >
                      {emp.status === 'ACTIVE' ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>No employees found matching your criteria.</td></tr>
            )}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="pagination-bar" style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            <button className="btn btn-outline" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} className={`btn ${page === i ? 'btn-primary' : 'btn-outline'}`} style={{ minWidth: '40px' }} onClick={() => setPage(i)}>{i + 1}</button>
            ))}
            <button className="btn btn-outline" disabled={page === totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  )
}

function EmployeeForm({ employee, onCancel, onSuccess, authHeader }) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    location: '',
    country: '',
    currency: 'USD',
    baseSalary: '',
    status: 'ACTIVE',
    joiningDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (employee) {
      setForm({
        ...employee,
        baseSalary: employee.baseSalary || '',
        joiningDate: employee.joiningDate || new Date().toISOString().split('T')[0]
      })
    }
  }, [employee])

  const handleSubmit = (e) => {
    e.preventDefault()
    const url = employee ? `${API_BASE}/employees/${employee.id}` : `${API_BASE}/employees`
    const method = employee ? 'PUT' : 'POST'
    
    fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(form)
    }).then(res => {
      if (res.ok) {
        onSuccess()
      } else {
        throw new Error('Failed to save.')
      }
    }).catch(err => console.error(err))
  }

  return (
    <div className="card glass-card animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h3 style={{ marginBottom: '2rem' }}>{employee ? 'Edit Employee Profile' : 'Register New Employee'}</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="input-group"><label>First Name</label><input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required /></div>
          <div className="input-group"><label>Last Name</label><input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required /></div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="input-group"><label>Email Address</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required /></div>
          <div className="input-group"><label>Phone Number</label><input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="input-group"><label>Department</label>
            <select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} required style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', background: 'var(--bg-dark)', color: 'white', border: '1px solid var(--border)' }}>
              <option value="">Select Department</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">Human Resources</option>
              <option value="Sales">Sales</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
            </select>
          </div>
          <div className="input-group"><label>Role / Job Title</label><input value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} required /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="input-group"><label>Joining Date</label><input type="date" value={form.joiningDate} onChange={e => setForm({ ...form, joiningDate: e.target.value })} /></div>
          <div className="input-group"><label>Base Salary</label><input type="number" value={form.baseSalary} onChange={e => setForm({ ...form, baseSalary: e.target.value })} /></div>
          <div className="input-group"><label>Currency</label><input value={form.currency} onChange={e => setForm({ ...form, currency: e.target.value })} /></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
          <div className="input-group"><label>Country</label><input value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} /></div>
          <div className="input-group"><label>Work Location</label><input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Remote / Office" /></div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
          <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{employee ? 'Update Records' : 'Create Employee'}</button>
          <button type="button" className="btn btn-outline" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

function EmployeeDetail({ employee, onBack, onEdit }) {
  if (!employee) return null;
  return (
    <div className="employee-profile animate-fade-in">
      <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: '2rem' }}>← Back to Directory</button>
      
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        <div className="card glass-card" style={{ textAlign: 'center' }}>
          <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'var(--primary-glow)', margin: '0 auto 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', fontWeight: 'bold' }}>
            {employee.firstName[0]}{employee.lastName[0]}
          </div>
          <h2 style={{ marginBottom: '0.5rem' }}>{employee.firstName} {employee.lastName}</h2>
          <p className="badge badge-hr">{employee.jobTitle}</p>
          <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <div style={{ marginBottom: '1rem' }}><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>ACCOUNT STATUS</label><span className={`badge badge-${employee.status?.toLowerCase() === 'active' ? 'approved' : 'rejected'}`}>{employee.status || 'ACTIVE'}</span></div>
            <div style={{ marginBottom: '1rem' }}><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>EMPLOYEE ID</label><span style={{ fontWeight: '600' }}>#{employee.id}</span></div>
            <div style={{ marginBottom: '1rem' }}><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>JOINED DATE</label><span style={{ fontWeight: '600' }}>{employee.joiningDate || 'N/A'}</span></div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => onEdit(employee)}>Edit Profile</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card glass-card">
            <h4 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Contact Information</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>PERSONAL EMAIL</label><span style={{ fontWeight: '600' }}>{employee.email}</span></div>
              <div><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>PHONE NUMBER</label><span style={{ fontWeight: '600' }}>{employee.phone || '(Unspecified)'}</span></div>
              <div><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>LOCATION</label><span style={{ fontWeight: '600' }}>{employee.location}, {employee.country}</span></div>
            </div>
          </div>

          <div className="card glass-card">
            <h4 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>Job & Compensation</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>DEPARTMENT</label><span style={{ fontWeight: '600' }}>{employee.department}</span></div>
              <div><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>ANNUAL BASE SALARY</label><span style={{ fontWeight: '600', color: 'var(--success)' }}>{employee.currency} {employee.baseSalary?.toLocaleString() || '0'}</span></div>
              <div><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>TAX IDENTIFICATION</label><span style={{ fontWeight: '600' }}>{employee.taxId || 'N/A'}</span></div>
              <div><label style={{ fontSize: '0.7rem', opacity: 0.6, display: 'block' }}>BANK DETAILS</label><span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{employee.bankDetails || 'N/A'}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PayrollDashboard({ employees, payrollHistory, setPayrollHistory, authHeader, setShowModal, setLastProcessed, setSummaryType }) {
  const [processing, setProcessing] = useState(false)
  const runPayroll = (empId) => {
    setProcessing(true)
    fetch(`${API_BASE}/payroll/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ employeeId: empId, startDate: '2026-03-01', endDate: '2026-03-31' })
    }).then(res => res.json()).then(newRecord => {
      setPayrollHistory([newRecord, ...payrollHistory]); setLastProcessed(newRecord); setSummaryType('processed'); setShowModal(true); setProcessing(false)
    }).catch(() => { setProcessing(false); notify.error('Failed.') })
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="card">
        <h3>Global Payroll Processing</h3>
        <table className="table">
          <thead><tr><th>Employee</th><th>Country</th><th>Salary</th><th>Currency</th><th>Action</th></tr></thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id}><td>{emp.firstName} {emp.lastName}</td><td><span className="badge badge-hr">{emp.country}</span></td><td>{emp.baseSalary?.toLocaleString()}</td><td>{emp.currency}</td><td><button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => runPayroll(emp.id)} disabled={processing}>Process Pay</button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h3>Payroll History</h3>
        <table className="table" style={{ marginTop: '1rem' }}>
          <thead><tr><th>Date</th><th>Employee</th><th>Net Pay</th><th>Ref</th></tr></thead>
          <tbody>
            {payrollHistory.map(rec => (rec && rec.employee) ? (
              <tr key={rec.id}><td>{rec.payPeriodEnd}</td><td>{rec.employee.firstName}</td><td style={{ fontWeight: 'bold' }}>{rec.currency} {rec.netSalary.toLocaleString()}</td><td style={{ fontSize: '0.7rem' }}>{rec.paymentReference}</td></tr>
            ) : null)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function AttendanceHub({ user, employees, authHeader }) {
  const [history, setHistory] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])
  const [isClockedIn, setIsClockedIn] = useState(false)
  const currentEmpId = employees[0]?.id || 1;

  const refreshData = () => {
    fetch(`${API_BASE}/attendance/employee/${currentEmpId}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(data => { setHistory(data); setIsClockedIn(data.some(r => !r.clockOut)) })
    fetch(`${API_BASE}/attendance/leave/employee/${currentEmpId}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(data => setLeaveRequests(data))
  }

  useEffect(() => {
    refreshData()
    window.addEventListener('refresh-attendance', refreshData)
    return () => window.removeEventListener('refresh-attendance', refreshData)
  }, [])

  const handleClockAction = () => {
    const endpoint = isClockedIn ? 'clock-out' : 'clock-in'
    fetch(`${API_BASE}/attendance/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ employeeId: currentEmpId })
    }).then(() => refreshData())
  }

  const handleCancelLeave = (leaveId) => {
    fetch(`${API_BASE}/attendance/leave/cancel/${leaveId}`, {
      method: 'DELETE',
      headers: { 'Authorization': authHeader }
    }).then(() => refreshData())
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      <div className="card attendance-card">
        <h3>Real-time Attendance</h3>
        <LiveClock />
        <p className="text-muted">Status: <span className={`badge badge-${isClockedIn ? 'approved' : 'rejected'}`}>{isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}</span></p>
        <button className={`btn ${isClockedIn ? 'btn-outline' : 'btn-primary'}`} style={{ width: '220px', height: '64px', fontSize: '1.2rem', marginTop: '1rem' }} onClick={handleClockAction}>
          {isClockedIn ? 'Clock Out' : 'Clock In Now'}
        </button>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Working from: **Remote**</p>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0 }}>Leave Management</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.3rem 0 0 0' }}>Request and track your time off.</p>
          </div>
          <button className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', boxShadow: '0 4px 15px var(--primary-glow)' }} onClick={() => { window.dispatchEvent(new CustomEvent('open-leave-modal')) }}>Apply Leave</button>
        </div>

        <div className="balance-card">
          <div className="balance-item">
            <span className="balance-value">12</span>
            <span className="balance-label">Vacation</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }}></div>
          <div className="balance-item">
            <span className="balance-value" style={{ color: 'var(--accent)' }}>5</span>
            <span className="balance-label">Sick Leave</span>
          </div>
          <div style={{ width: '1px', background: 'var(--border)' }}></div>
          <div className="balance-item">
            <span className="balance-value" style={{ color: 'var(--secondary)' }}>2</span>
            <span className="balance-label">Personal</span>
          </div>
        </div>

        <table className="table">
          <thead><tr><th>Type</th><th>Dates</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            {leaveRequests.map(l => (
              <tr key={l.id}>
                <td style={{ fontWeight: '600' }}>{l.leaveType}</td>
                <td style={{ fontSize: '0.85rem', opacity: 0.8 }}>{l.startDate} to {l.endDate}</td>
                <td><span className={`badge badge-${l.status.toLowerCase()}`}>{l.status}</span></td>
                <td>{l.status === 'PENDING' && <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', color: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.75rem' }} onClick={() => handleCancelLeave(l.id)}>Cancel</button>}</td>
              </tr>
            ))}
            {leaveRequests.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No leave requests found.</td></tr>}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ gridColumn: 'span 2' }}>
        <h3>Work History</h3>
        <table className="table">
          <thead><tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Hours</th><th>OT</th><th>Status</th></tr></thead>
          <tbody>
            {history.map(h => (
              <tr key={h.id}><td>{new Date(h.clockIn).toLocaleDateString()}</td><td>{new Date(h.clockIn).toLocaleTimeString()}</td><td>{h.clockOut ? new Date(h.clockOut).toLocaleTimeString() : '--'}</td><td>{h.totalHours?.toFixed(2) || '0.00'}</td><td>{h.overtimeHours?.toFixed(2) || '0.00'}</td><td><span className={`badge badge-${h.status?.toLowerCase()}`}>{h.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  return <div className="big-clock">{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
}

function RecruitmentHub({ authHeader }) {
  const [jobs, setJobs] = useState([])
  const [candidates, setCandidates] = useState([])
  const [view, setView] = useState('jobs') // 'jobs', 'ats', 'calendar'
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [showInterviewModal, setShowInterviewModal] = useState(false)
  const [modalType, setModalType] = useState('schedule') // 'schedule' or 'feedback'
  const [interviews, setInterviews] = useState([])
  const [allInterviews, setAllInterviews] = useState([])
  const [showJobModal, setShowJobModal] = useState(false)
  const [showScorecardModal, setShowScorecardModal] = useState(false)

  const safeSetJobs = (data) => Array.isArray(data) ? setJobs(data) : setJobs([])
  const safeSetCandidates = (data) => Array.isArray(data) ? setCandidates(data) : setCandidates([])
  const safeSetAllInterviews = (data) => Array.isArray(data) ? setAllInterviews(data) : setAllInterviews([])

  const fetchJobsAndCandidates = () => {
    fetch(`${API_BASE}/recruitment/jobs`, { headers: { 'Authorization': authHeader } })
      .then(res => res.ok ? res.json() : [])
      .then(safeSetJobs)
      .catch(() => setJobs([]))
    
    fetch(`${API_BASE}/recruitment/candidates`, { headers: { 'Authorization': authHeader } })
      .then(res => res.ok ? res.json() : [])
      .then(safeSetCandidates)
      .catch(() => setCandidates([]))
      
    fetch(`${API_BASE}/recruitment/interviews`, { headers: { 'Authorization': authHeader } })
      .then(res => res.ok ? res.json() : [])
      .then(safeSetAllInterviews)
      .catch(() => setAllInterviews([]))
  }

  useEffect(() => {
    fetchJobsAndCandidates()
  }, [])

  const updateStatus = (id, status) => {
    fetch(`${API_BASE}/recruitment/candidates/${id}/status?status=${status}`, { method: 'PATCH', headers: { 'Authorization': authHeader } })
      .then(() => fetchJobsAndCandidates())
  }

  const openInterviewModal = (candidate, type) => {
    setSelectedCandidate(candidate)
    setModalType(type)
    setShowInterviewModal(true)
    if (type === 'feedback') {
      fetch(`${API_BASE}/recruitment/candidates/${candidate.id}/interviews`, { headers: { 'Authorization': authHeader } })
        .then(res => res.json())
        .then(setInterviews)
    }
  }

  const statuses = ['NEW', 'SHORTLISTED', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button className={`btn ${view === 'jobs' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('jobs')}>Job Postings</button>
        <button className={`btn ${view === 'ats' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('ats')}>ATS Board</button>
        <button className={`btn ${view === 'calendar' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('calendar')}>Calendar</button>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div className="reminder-bell" style={{ background: 'var(--glass)', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>
             Notifications
             {(allInterviews || []).filter(i => i?.dateTime && (new Date(i.dateTime) > new Date())).length > 0 && (
               <span style={{ marginLeft: '0.5rem', color: 'var(--primary)' }}>({(allInterviews || []).filter(i => i?.dateTime && (new Date(i.dateTime) > new Date())).length})</span>
             )}
           </div>
           <span className="badge badge-hr">Jobs: {(jobs || []).length}</span>
           <span className="badge badge-user">Candidates: {(candidates || []).length}</span>
        </div>
      </div>

      {view === 'jobs' ? (
        <div className="card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>Active Job Postings</h3>
            <button className="btn btn-primary" style={{boxShadow: '0 0 15px var(--primary-glow)'}} onClick={() => setShowJobModal(true)}>+ Post New Job</button>
          </div>
          <table className="table">
            <thead><tr><th>Title</th><th>Department</th><th>Location</th><th>Status</th><th>Candidates</th></tr></thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td style={{fontWeight: '600'}}>{job.title}</td>
                  <td>{job.department}</td>
                  <td>{job.location}</td>
                  <td><span className="badge badge-approved">{job.status}</span></td>
                  <td><span className="badge badge-hr">{candidates.filter(c => c.jobPosting?.id === job.id).length} applicants</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : view === 'ats' ? (
        <div className="ats-board" style={{padding: '1rem 0'}}>
          {statuses.map(status => (
            <div key={status} className="ats-column">
              <h4 style={{display: 'flex', justifyContent: 'space-between'}}>
                {status.replace('_', ' ')}
                <span className="badge" style={{background: 'var(--glass)'}}>{candidates.filter(c => c.status === status).length}</span>
              </h4>
              <div style={{minHeight: '200px'}}>
                {candidates.filter(c => c.status === status).map(c => (
                  <div key={c.id} className="candidate-card glass-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                      <h5 style={{margin: 0}}>{c.firstName} {c.lastName}</h5>
                      <span className="badge badge-shortlisted" style={{fontSize: '0.6rem'}}>VERIFIED</span>
                    </div>
                    <p className="email">{c.email}</p>
                    <p style={{ fontSize: '0.7rem', marginTop: '0.5rem', opacity: 0.7 }}>Role: {c.jobPosting?.title || 'General'}</p>
                    
                    <div style={{display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap'}}>
                      {status === 'NEW' && <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem'}} onClick={() => updateStatus(c.id, 'SHORTLISTED')}>Shortlist</button>}
                      {(status === 'SHORTLISTED' || status === 'SCREENING') && <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem'}} onClick={() => updateStatus(c.id, 'SCREENING')}>Screen</button>}
                      {(status === 'SHORTLISTED' || status === 'SCREENING') && <button className="btn btn-primary" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem'}} onClick={() => openInterviewModal(c, 'schedule')}>Schedule</button>}
                      {status === 'INTERVIEW' && <button className="btn btn-primary" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: 'var(--success)'}} onClick={() => openInterviewModal(c, 'feedback')}>Feedback</button>}
                      {status === 'OFFER' && <button className="btn btn-primary" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', background: 'var(--success)'}} onClick={() => updateStatus(c.id, 'HIRED')}>Hire</button>}
                      {status !== 'HIRED' && status !== 'REJECTED' && <button className="btn btn-outline" style={{padding: '0.2rem 0.5rem', fontSize: '0.7rem', color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={() => updateStatus(c.id, 'REJECTED')}>Reject</button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card glass-card" style={{padding: '0'}}>
          <CalendarView interviews={allInterviews} />
        </div>
      )}

      {showJobModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{maxWidth: '600px'}}>
            <h3 style={{marginBottom: '1.5rem'}}>Post New Job</h3>
            <JobForm 
              authHeader={authHeader} 
              onClose={() => setShowJobModal(false)} 
              onSuccess={() => { fetchJobsAndCandidates(); setShowJobModal(false) }} 
            />
          </div>
        </div>
      )}

      {showInterviewModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card interview-modal">
            <h3>{modalType === 'schedule' ? 'Schedule Interview' : 'Scorecard & Feedback'}</h3>
            <p className="text-muted">Candidate: {selectedCandidate?.firstName} {selectedCandidate?.lastName}</p>
            
            {modalType === 'schedule' ? (
              <InterviewForm 
                candidateId={selectedCandidate?.id} 
                authHeader={authHeader} 
                onClose={() => setShowInterviewModal(false)}
                onSuccess={() => { updateStatus(selectedCandidate.id, 'INTERVIEW'); setShowInterviewModal(false) }}
              />
            ) : (
              <ScorecardForm 
                interview={interviews[interviews.length - 1]} 
                authHeader={authHeader} 
                onClose={() => setShowInterviewModal(false)}
                onSuccess={() => { updateStatus(selectedCandidate.id, 'OFFER'); setShowInterviewModal(false) }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function JobForm({ authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', department: '', location: '', description: '', salaryRange: '' })
  const handleSubmit = () => {
    fetch(`${API_BASE}/recruitment/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ ...form, status: 'ACTIVE' })
    }).then(res => {
      if (!res.ok) throw new Error('Failed to post job');
      return res.json();
    }).then(onSuccess)
    .catch(err => notify.error(err.message))
  }
  return (
    <div style={{textAlign: 'left'}}>
      <div className="input-group"><label>Job Title</label><input placeholder="e.g. Senior Software Engineer" onChange={e => setForm({...form, title: e.target.value})} /></div>
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
        <div className="input-group"><label>Department</label><input placeholder="e.g. Engineering" onChange={e => setForm({...form, department: e.target.value})} /></div>
        <div className="input-group"><label>Location</label><input placeholder="e.g. Remote / New York" onChange={e => setForm({...form, location: e.target.value})} /></div>
      </div>
      <div className="input-group"><label>Salary Range</label><input placeholder="e.g. $120k - $150k" onChange={e => setForm({...form, salaryRange: e.target.value})} /></div>
      <div className="input-group"><label>Description</label><textarea placeholder="Job requirements and responsibilities..." style={{height: '100px'}} onChange={e => setForm({...form, description: e.target.value})} /></div>
      <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
        <button className="btn btn-primary" style={{flex: 1}} onClick={handleSubmit}>Publish Posting</button>
        <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function InterviewForm({ candidateId, authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ dateTime: '', interviewer: '', notes: '', invitationSent: false })
  const handleSubmit = () => {
    fetch(`${API_BASE}/recruitment/interviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify({ candidate: { id: candidateId }, ...form })
    }).then(() => {
      if (form.invitationSent) notify.success('Invitation email sent to candidate!');
      onSuccess();
    })
  }
  return (
    <div className="interview-modal">
       <div className="input-group"><label>Date & Time</label><input type="datetime-local" onChange={e => setForm({...form, dateTime: e.target.value})} /></div>
       <div className="input-group"><label>Interviewer</label><input placeholder="Name of interviewer" onChange={e => setForm({...form, interviewer: e.target.value})} /></div>
       <div className="input-group"><label>Pre-interview Notes</label><textarea placeholder="e.g. Focus on system design" onChange={e => setForm({...form, notes: e.target.value})} /></div>
       <div className="input-group" style={{flexDirection: 'row', alignItems: 'center', gap: '10px'}}>
         <input type="checkbox" id="sendEmail" checked={form.invitationSent} onChange={e => setForm({...form, invitationSent: e.target.checked})} />
         <label htmlFor="sendEmail" style={{marginBottom: 0, cursor: 'pointer'}}>Send Invitation Email to Candidate</label>
       </div>
       <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
          <button className="btn btn-primary" style={{flex: 1}} onClick={handleSubmit}>Schedule Now</button>
          <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
       </div>
    </div>
  )
}

function ScorecardForm({ interview, authHeader, onClose, onSuccess }) {
  const [sc, setSc] = useState({ technicalRating: 3, culturalRating: 3, communicationRating: 3, technicalNotes: '', culturalNotes: '' })
  
  const handleSubmit = () => {
    fetch(`${API_BASE}/recruitment/interviews/${interview.id}/scorecard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(sc)
    }).then(onSuccess)
  }

  if (!interview) return <div style={{padding: '2rem'}}>Loading interview details...</div>;

  const StarRating = ({ label, value, setter }) => (
    <div className="input-group" style={{marginBottom: '1rem'}}>
       <label>{label}: {value}/5</label>
       <div className="rating-stars">
         {[1,2,3,4,5].map(s => (
           <span key={s} onClick={() => setter(s)} style={{cursor: 'pointer', fontSize: '1.2rem', color: s <= value ? 'var(--warning)' : 'var(--glass)'}}>★</span>
         ))}
       </div>
    </div>
  )

  return (
    <div className="interview-modal">
       <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
         <div>
           <StarRating label="Technical Ability" value={sc.technicalRating} setter={(v) => setSc({...sc, technicalRating: v})} />
           <StarRating label="Cultural Fit" value={sc.culturalRating} setter={(v) => setSc({...sc, culturalRating: v})} />
           <StarRating label="Communication" value={sc.communicationRating} setter={(v) => setSc({...sc, communicationRating: v})} />
         </div>
         <div>
           <div className="input-group"><label>Technical Notes</label><textarea style={{height: '80px', fontSize: '0.8rem'}} onChange={e => setSc({...sc, technicalNotes: e.target.value})} /></div>
           <div className="input-group"><label>Cultural Notes</label><textarea style={{height: '80px', fontSize: '0.8rem'}} onChange={e => setSc({...sc, culturalNotes: e.target.value})} /></div>
         </div>
       </div>
       <div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
         <button className="btn btn-primary" style={{flex: 1, background: 'var(--success)'}} onClick={handleSubmit}>Submit Scorecard</button>
         <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
       </div>
    </div>
  )
}

function OnboardingCenter({ employees, authHeader }) {
  const [selectedEmp, setSelectedEmp] = useState(null)
  const [workflow, setWorkflow] = useState(null)

  const fetchWorkflow = (empId) => {
    fetch(`${API_BASE}/onboarding/employee/${empId}`, { headers: { 'Authorization': authHeader } })
      .then(res => {
        if (!res.ok) throw new Error('Workflow not found');
        return res.json();
      })
      .then(setWorkflow)
      .catch(() => setWorkflow(null))
  }

  const initiate = (empId) => {
    fetch(`${API_BASE}/onboarding/initiate/${empId}`, { method: 'POST', headers: { 'Authorization': authHeader } })
      .then(res => {
        if (!res.ok) throw new Error('Failed to initiate onboarding');
        return res.json();
      })
      .then(data => { setWorkflow(data); setSelectedEmp(empId) })
      .catch(err => notify.error(err.message))
  }

  const completeStep = (stepId) => {
    fetch(`${API_BASE}/onboarding/steps/${stepId}/complete`, { method: 'PATCH', headers: { 'Authorization': authHeader } })
      .then(() => fetchWorkflow(selectedEmp))
  }

  const progress = workflow && workflow.steps 
    ? Math.round((workflow.steps.filter(s => s.status === 'COMPLETED').length / workflow.steps.length) * 100) 
    : 0;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
      <div className="card glass-card">
        <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Onboarding Pipeline</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {employees.map(emp => (
            <button
              key={emp.id}
              className={`btn ${selectedEmp === emp.id ? 'btn-primary' : 'btn-outline'}`}
              style={{ justifyContent: 'flex-start', padding: '1rem', border: selectedEmp === emp.id ? 'none' : '1px solid var(--border)' }}
              onClick={() => { setSelectedEmp(emp.id); fetchWorkflow(emp.id) }}
            >
              <div style={{width: '8px', height: '8px', borderRadius: '50%', background: selectedEmp === emp.id ? 'white' : 'var(--primary)', marginRight: '10px'}}></div>
              {emp.firstName} {emp.lastName}
            </button>
          ))}
        </div>
      </div>

      <div className="card glass-card" style={{position: 'relative', overflow: 'hidden'}}>
        {!selectedEmp ? (
          <div style={{ textAlign: 'center', padding: '6rem', opacity: 0.5 }}>
            <p style={{ fontSize: '0.9rem' }}>Select an employee to manage their journey</p>
          </div>
        ) : !workflow ? (
          <div style={{ textAlign: 'center', padding: '6rem' }}>
            <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>This employee hasn't started their onboarding journey yet.</p>
            <button className="btn btn-primary animate-pulse-soft" style={{padding: '1rem 2rem'}} onClick={() => initiate(selectedEmp)}>
              Launch Onboarding Experience
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
              <div>
                <h3 style={{fontSize: '1.8rem', marginBottom: '0.5rem'}}>Onboarding Checklist</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                  Employee: <span style={{color: 'var(--text-main)', fontWeight: 'bold'}}>{(employees || []).find(e => e.id === selectedEmp)?.firstName}</span>
                </p>
                <div style={{marginTop: '1rem', display: 'flex', gap: '0.5rem'}}>
                  <span className="badge badge-hr">{workflow?.country} Compliance</span>
                  <span className="badge badge-approved">{workflow?.status}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>{progress}%</div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Completion</p>
              </div>
            </div>

            <div className="progress-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}></div>
            </div>

            <div className="onboarding-list" style={{marginTop: '2rem'}}>
              {workflow.steps.map((step, idx) => (
                <div key={step.id} className={`onboarding-step glass-card ${step.status === 'COMPLETED' ? 'completed' : ''}`} style={{background: step.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.05)' : 'var(--bg-dark)'}}>
                  <div className="step-number" style={{background: step.status === 'COMPLETED' ? 'var(--success)' : 'var(--glass)', color: step.status === 'COMPLETED' ? 'white' : 'inherit' }}>
                    {step.status === 'COMPLETED' ? 'DONE' : idx + 1}
                  </div>
                  <div className="step-info">
                    <h4 style={{fontSize: '1.1rem'}}>{step.title}</h4>
                    <p>Due: {step.dueDate} • <span style={{color: 'var(--primary)'}}>{step.type}</span></p>
                  </div>
                  {step.status === 'PENDING' ? (
                    <button className="btn btn-primary" style={{fontSize: '0.85rem'}} onClick={() => completeStep(step.id)}>Mark Complete</button>
                  ) : (
                    <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--success)', fontWeight: 'bold'}}>
                      <span style={{fontSize: '0.8rem'}}>VERIFIED</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PerformanceHub({ employees, authHeader }) {
  const [selectedEmp, setSelectedEmp] = useState(employees[0]?.id)
  const [activeTab, setActiveTab] = useState('reviews')
  const [reviews, setReviews] = useState([])
  const [goals, setGoals] = useState([])
  const [feedback, setFeedback] = useState([])
  const [programs, setPrograms] = useState([])
  const [succession, setSuccession] = useState(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showSuccessionModal, setShowSuccessionModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)

  const safeSet = (setter, fallback = []) => data => setter(Array.isArray(data) ? data : fallback)

  const refreshData = (empId) => {
    if (!empId) return;
    fetch(`${API_BASE}/performance/reviews/employee/${empId}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(safeSet(setReviews)).catch(() => setReviews([]))
    fetch(`${API_BASE}/performance/goals/employee/${empId}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(safeSet(setGoals)).catch(() => setGoals([]))
    fetch(`${API_BASE}/performance/feedback/employee/${empId}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(safeSet(setFeedback)).catch(() => setFeedback([]))
    fetch(`${API_BASE}/talent/succession/employee/${empId}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(setSuccession).catch(() => setSuccession(null))
    fetch(`${API_BASE}/talent/programs/employee/${empId}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(safeSet(setPrograms)).catch(() => setPrograms([]))
  }

  useEffect(() => {
    if (!selectedEmp && employees.length > 0) setSelectedEmp(employees[0].id)
  }, [employees])

  useEffect(() => { if (selectedEmp) refreshData(selectedEmp) }, [selectedEmp])

  const employee = employees.find(e => e.id === selectedEmp)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
      <div className="card glass-card">
        <h4 style={{marginBottom: '1rem', color: 'var(--primary)'}}>Team Members</h4>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
          {employees.map(emp => (
            <button key={emp.id} className={`btn ${selectedEmp === emp.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedEmp(emp.id)} style={{justifyContent: 'flex-start', textAlign: 'left'}}>
              {emp.firstName} {emp.lastName}
            </button>
          ))}
        </div>
      </div>

      <div className="performance-content">
        <div className="card glass-card" style={{marginBottom: '2rem'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <h2 style={{margin: 0}}>{employee?.firstName}'s Performance</h2>
              <p className="text-muted">{employee?.jobTitle} • {employee?.department}</p>
            </div>
            <div style={{display: 'flex', gap: '0.5rem'}}>
              <button className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('reviews')}>Reviews</button>
              <button className={`btn ${activeTab === 'goals' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('goals')}>Goals</button>
              <button className={`btn ${activeTab === '360' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('360')}>360 Feedback</button>
              <button className={`btn ${activeTab === 'talent' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('talent')}>Talent & Growth</button>
            </div>
          </div>
        </div>

        {activeTab === 'reviews' && (
          <div className="card glass-card animate-slide-up">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h3>Performance Reviews</h3>
              <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>+ New Review</button>
            </div>
            <div className="review-list" style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
              {reviews.length === 0 ? <p className="text-muted">No reviews found for this employee.</p> : reviews.map(r => (
                <div key={r.id} className="glass-card" style={{padding: '1.5rem', background: 'rgba(255,255,255,0.03)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1rem'}}>
                    <span style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{r.period} Review</span>
                    <span className="badge badge-approved">Rating: {r.rating}/5</span>
                  </div>
                  <p style={{fontStyle: 'italic', color: 'var(--text-muted)'}}>"{r.feedback}"</p>
                  <div style={{marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7}}>Reviewed by: {r.reviewer?.firstName} {r.reviewer?.lastName} on {r.reviewDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'goals' && (
          <div className="card glass-card animate-slide-up">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h3>SMART Goals</h3>
              <button className="btn btn-primary" onClick={() => setShowGoalModal(true)}>+ Set Goal</button>
            </div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
              {goals.length === 0 ? <p className="text-muted">No active goals.</p> : goals.map(g => (
                <div key={g.id} className="goal-item glass-card" style={{padding: '1.5rem'}}>
                   <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem'}}>
                     <h4 style={{margin: 0}}>{g.title}</h4>
                     <span className={`badge badge-${(g.status || 'IN_PROGRESS').toLowerCase().replace('_','-')}`}>{g.status}</span>
                   </div>
                   <p style={{fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem'}}>{g.description}</p>
                   <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem'}}>
                     <span>Progress</span>
                     <span>{g.completionPercentage}%</span>
                   </div>
                   <div className="progress-container"><div className="progress-bar" style={{width: `${g.completionPercentage}%`}}></div></div>
                   <div style={{marginTop: '1rem', fontSize: '0.75rem'}}>Target: {g.targetDate}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === '360' && (
          <div className="card glass-card animate-slide-up">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
              <h3>360-Degree Feedback</h3>
              <button className="btn btn-primary" onClick={() => setShowFeedbackModal(true)}>Request/Give Feedback</button>
            </div>
            <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
               {feedback.length === 0 ? <p className="text-muted">No external feedback collected yet.</p> : feedback.map(f => (
                 <div key={f.id} className="glass-card" style={{padding: '1.2rem', borderLeft: '4px solid var(--primary)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between'}}>
                      <span style={{fontWeight: 'bold'}}>{f.relationship} Feedback</span>
                      <span style={{color: 'var(--warning)'}}>{'★'.repeat(f.rating)}</span>
                    </div>
                    <p style={{marginTop: '0.5rem', fontSize: '0.9rem'}}>"{f.comments}"</p>
                    <div style={{marginTop: '0.5rem', fontSize: '0.75rem', opacity: 0.6}}>From: {f.provider?.firstName} {f.provider?.lastName}</div>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'talent' && (
          <div className=" talent-section" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
            <div className="card glass-card animate-slide-up">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h3>Career Path & succession</h3>
                <button className="btn btn-outline" style={{fontSize: '0.8rem'}} onClick={() => setShowSuccessionModal(true)}>Manage Potential</button>
              </div>
              <div style={{background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px', marginTop: '1.5rem'}}>
                <div className="input-group">
                  <label>Promotion Potential</label>
                  <span className="badge badge-hr" style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>{succession?.potential || 'NOT ASSESSED'}</span>
                </div>
                <div className="input-group" style={{marginTop: '1.5rem'}}>
                  <label>Readiness Level</label>
                  <span className="badge badge-approved" style={{fontSize: '1rem', padding: '0.5rem 1rem'}}>{succession?.readiness || 'N/A'}</span>
                </div>
                <div style={{marginTop: '1.5rem'}}>
                  <label style={{fontSize: '0.8rem', opacity: 0.7}}>Target Role</label>
                  <p style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{succession?.targetRole || 'Not defined'}</p>
                </div>
              </div>
            </div>

            <div className="card glass-card animate-slide-up">
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem'}}>
                <h3>Training & Upskilling</h3>
                <button className="btn btn-outline" style={{fontSize: '0.8rem'}} onClick={() => setShowEnrollModal(true)}>+ Assign</button>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem'}}>
                {programs.length === 0 ? <p>No specific programs assigned.</p> : programs.map(p => (
                  <div key={p.id} className="glass-card" style={{padding: '1rem', border: '1px solid var(--glass)'}}>
                    <h4 style={{margin: 0, color: 'var(--primary)'}}>{p.name}</h4>
                    <p style={{fontSize: '0.8rem', margin: '0.5rem 0'}}>{p.description}</p>
                    <div className="badge badge-hr" style={{fontSize: '0.7rem'}}>{p.targetRole} Training</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {showReviewModal && <div className="modal-overlay"><PerformanceReviewForm employeeId={selectedEmp} employees={employees} authHeader={authHeader} onClose={() => setShowReviewModal(false)} onSuccess={() => {refreshData(selectedEmp); setShowReviewModal(false)}} /></div>}
      {showGoalModal && <div className="modal-overlay"><GoalForm employeeId={selectedEmp} authHeader={authHeader} onClose={() => setShowGoalModal(false)} onSuccess={() => {refreshData(selectedEmp); setShowGoalModal(false)}} /></div>}
      {showFeedbackModal && <div className="modal-overlay"><FeedbackForm subjectId={selectedEmp} employees={employees} authHeader={authHeader} onClose={() => setShowFeedbackModal(false)} onSuccess={() => {refreshData(selectedEmp); setShowFeedbackModal(false)}} /></div>}
      {showSuccessionModal && <div className="modal-overlay"><SuccessionForm employeeId={selectedEmp} current={succession} authHeader={authHeader} onClose={() => setShowSuccessionModal(false)} onSuccess={() => {refreshData(selectedEmp); setShowSuccessionModal(false)}} /></div>}
      {showEnrollModal && <div className="modal-overlay"><ProgramEnrollmentForm employeeId={selectedEmp} authHeader={authHeader} onClose={() => setShowEnrollModal(false)} onSuccess={() => {refreshData(selectedEmp); setShowEnrollModal(false)}} /></div>}
    </div>
  )
}

function PerformanceReviewForm({ employeeId, employees, authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ employee: {id: employeeId}, reviewer: {id: 1}, period: 'Q1 2026', rating: 5, feedback: '' })
  const handleSubmit = () => {
    fetch(`${API_BASE}/performance/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(form)
    }).then(onSuccess)
  }
  return (
    <div className="modal-content glass-card" style={{maxWidth: '500px'}}>
      <h3>Submit Review</h3>
      <div className="input-group">
        <label>Review Period</label>
        <input value={form.period} onChange={e => setForm({...form, period: e.target.value})} />
      </div>
      <div className="input-group">
        <label>Overall Rating (1-5)</label>
        <input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} />
      </div>
      <div className="input-group">
        <label>Detailed Feedback</label>
        <textarea style={{height: '150px'}} onChange={e => setForm({...form, feedback: e.target.value})} />
      </div>
      <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
        <button className="btn btn-primary" style={{flex: 1}} onClick={handleSubmit}>Submit Final Review</button>
        <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function GoalForm({ employeeId, authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ employee: {id: employeeId}, title: '', description: '', targetDate: '', completionPercentage: 0, status: 'IN_PROGRESS' })
  const handleSubmit = () => {
    fetch(`${API_BASE}/performance/goals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(form)
    }).then(onSuccess)
  }
  return (
    <div className="modal-content glass-card" style={{maxWidth: '500px'}}>
      <h3>Set Performance Goal</h3>
      <div className="input-group"><label>Goal Title</label><input placeholder="e.g. Master React Advanced hooks" onChange={e => setForm({...form, title: e.target.value})} /></div>
      <div className="input-group"><label>Description</label><textarea onChange={e => setForm({...form, description: e.target.value})} /></div>
      <div className="input-group"><label>Target Date</label><input type="date" onChange={e => setForm({...form, targetDate: e.target.value})} /></div>
      <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
        <button className="btn btn-primary" style={{flex: 1}} onClick={handleSubmit}>Create Goal</button>
        <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function FeedbackForm({ subjectId, employees, authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ subject: {id: subjectId}, provider: {id: 1}, relationship: 'Peer', rating: 5, comments: '' })
  return (
    <div className="modal-content glass-card" style={{maxWidth: '500px'}}>
      <h3>360-Degree Feedback</h3>
      <div className="input-group">
        <label>Your Relationship</label>
        <select onChange={e => setForm({...form, relationship: e.target.value})} style={{width: '100%', padding: '0.8rem', background: 'var(--bg-card)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)'}}>
          <option>Peer</option><option>Manager</option><option>Direct Report</option><option>Self</option>
        </select>
      </div>
      <div className="input-group"><label>Rating</label><input type="number" min="1" max="5" value={form.rating} onChange={e => setForm({...form, rating: parseInt(e.target.value)})} /></div>
      <div className="input-group"><label>Comments</label><textarea style={{height: '100px'}} onChange={e => setForm({...form, comments: e.target.value})} /></div>
      <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
        <button className="btn btn-primary" style={{flex: 1}} onClick={() => {
          fetch(`${API_BASE}/performance/feedback`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }, body: JSON.stringify(form) }).then(onSuccess)
        }}>Submit Feedback</button>
        <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function SuccessionForm({ employeeId, current, authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState(current || { employee: {id: employeeId}, potential: 'MEDIUM', readiness: 'IN_2_YEARS', targetRole: '', developmentNeeds: '' })
  const handleSubmit = () => {
    fetch(`${API_BASE}/talent/succession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
      body: JSON.stringify(form)
    }).then(onSuccess)
  }
  return (
    <div className="modal-content glass-card" style={{maxWidth: '500px'}}>
      <h3>Succession Planning</h3>
      <div className="input-group">
        <label>Potential Level</label>
        <select value={form.potential} onChange={e => setForm({...form, potential: e.target.value})} style={{width: '100%', padding: '0.8rem', background: 'var(--bg-dark)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)'}}>
          <option value="HIGH">High Potential</option>
          <option value="MEDIUM">Medium Potential</option>
          <option value="LOW">Low Potential</option>
        </select>
      </div>
      <div className="input-group">
        <label>Readiness</label>
        <select value={form.readiness} onChange={e => setForm({...form, readiness: e.target.value})} style={{width: '100%', padding: '0.8rem', background: 'var(--bg-dark)', color: 'var(--text-main)', borderRadius: '8px', border: '1px solid var(--border)'}}>
          <option value="READY_NOW">Ready Now</option>
          <option value="IN_1_YEAR">Ready in 1 Year</option>
          <option value="IN_2_YEARS">Ready in 2 Years</option>
          <option value="EMERGENCY_ONLY">Emergency Only</option>
        </select>
      </div>
      <div className="input-group">
        <label>Target Role</label>
        <input value={form.targetRole} placeholder="e.g. Engineering Manager" onChange={e => setForm({...form, targetRole: e.target.value})} />
      </div>
      <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
        <button className="btn btn-primary" style={{flex: 1}} onClick={handleSubmit}>Update Plan</button>
        <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function BenefitsHub({ employees, authHeader }) {
  const [activeTab, setActiveTab] = useState('admin')
  const [packages, setPackages] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [structures, setStructures] = useState([])
  const [bonuses, setBonuses] = useState([])
  const [selectedEmp, setSelectedEmp] = useState(employees[0]?.id)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showEnrollModal, setShowEnrollModal] = useState(false)
  const [showStructureModal, setShowStructureModal] = useState(false)
  const [showBonusModal, setShowBonusModal] = useState(false)

  const safeSet = (setter, fallback = []) => data => setter(Array.isArray(data) ? data : fallback)

  const refreshData = () => {
    console.log('Refreshing Benefits Data...', { selectedEmp, authHeader })
    fetch(`${API_BASE}/benefits/packages`, { headers: { 'Authorization': authHeader } })
      .then(res => { console.log('Packages Res:', res.status); return res.ok ? res.json() : [] })
      .then(data => { console.log('Packages Data:', data); setPackages(Array.isArray(data) ? data : []) })
      .catch(err => { console.error('Packages Error:', err); setPackages([]) })

    fetch(`${API_BASE}/compensation/structures`, { headers: { 'Authorization': authHeader } })
      .then(res => { console.log('Structures Res:', res.status); return res.ok ? res.json() : [] })
      .then(data => { console.log('Structures Data:', data); setStructures(Array.isArray(data) ? data : []) })
      .catch(err => { console.error('Structures Error:', err); setStructures([]) })

    fetch(`${API_BASE}/compensation/bonuses/pending`, { headers: { 'Authorization': authHeader } })
      .then(res => { console.log('Bonuses Res:', res.status); return res.ok ? res.json() : [] })
      .then(data => { console.log('Bonuses Data:', data); setBonuses(Array.isArray(data) ? data : []) })
      .catch(err => { console.error('Bonuses Error:', err); setBonuses([]) })

    if (selectedEmp) {
      fetch(`${API_BASE}/benefits/employee/${selectedEmp}`, { headers: { 'Authorization': authHeader } })
        .then(res => { console.log('Enrollments Res:', res.status); return res.ok ? res.json() : [] })
        .then(data => { console.log('Enrollments Data:', data); setEnrollments(Array.isArray(data) ? data : []) })
        .catch(err => { console.error('Enrollments Error:', err); setEnrollments([]) })
    }
  }

  useEffect(() => {
    if (!selectedEmp && employees.length > 0) {
      setSelectedEmp(employees[0].id)
    }
  }, [employees])

  useEffect(() => { 
    if (selectedEmp) refreshData() 
  }, [selectedEmp])

  const employee = employees.find(e => e.id === selectedEmp)

  return (
    <div className="benefits-hub animate-slide-up">
      <div className="card glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Benefits & Compensation</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className={`btn ${activeTab === 'admin' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('admin')}>Global Admin</button>
            <button className={`btn ${activeTab === 'enrollment' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('enrollment')}>Employee Enrollment</button>
            <button className={`btn ${activeTab === 'bonus' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('bonus')}>Bonus Management</button>
          </div>
        </div>
      </div>

      {activeTab === 'admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="card glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Benefit Packages</h3>
              <button className="btn btn-primary" onClick={() => setShowPackageModal(true)}>+ New Package</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {packages.map(p => (
                <div key={p.id} className="glass-card" style={{ padding: '1rem', border: '1px solid var(--glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <h4 style={{ margin: 0 }}>{p.name}</h4>
                    <span className="badge badge-hr">{p.type}</span>
                  </div>
                  <p style={{ fontSize: '0.8rem', margin: '0.5rem 0' }}>{p.description}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.8 }}>
                    <span>Cost: {p.monthlyCost} | Employer: {p.employerContribution}%</span>
                    <span>{p.region}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Salary Structures</h3>
              <button className="btn btn-primary" onClick={() => setShowStructureModal(true)}>+ Add Range</button>
            </div>
            <table className="table">
              <thead><tr><th>Role</th><th>Region</th><th>Range</th></tr></thead>
              <tbody>
                {structures.map(s => (
                  <tr key={s.id}>
                    <td>{s.role}</td>
                    <td>{s.region}</td>
                    <td>{s.minSalary} - {s.maxSalary} {s.currency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'enrollment' && (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>
          <div className="card glass-card">
            <h4 style={{ marginBottom: '1rem' }}>Employees</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {employees.map(emp => (
                <button key={emp.id} className={`btn ${selectedEmp === emp.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedEmp(emp.id)} style={{ justifyContent: 'flex-start' }}>
                  {emp.firstName} {emp.lastName}
                </button>
              ))}
            </div>
          </div>
          <div className="card glass-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>Enrolled Benefits: {employee?.firstName}</h3>
              <button className="btn btn-primary" onClick={() => setShowEnrollModal(true)}>Enroll in Benefit</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {enrollments.map(e => (
                <div key={e.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success)' }}>
                  <h4 style={{ margin: 0 }}>{e.benefitPackage?.name}</h4>
                  <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Enrolled: {e.enrollmentDate}</p>
                  <span className="badge badge-approved">{e.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {activeTab === 'bonus' && (
        <div className="card glass-card animate-slide-up">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3>Bonus Allocation & History</h3>
            <button className="btn btn-primary" onClick={() => setShowBonusModal(true)}>+ Allocate Bonus</button>
          </div>
          <table className="table">
            <thead><tr><th>Employee</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {bonuses.map(b => (
                <tr key={b.id}>
                  <td>{b.employee?.firstName} {b.employee?.lastName}</td>
                  <td><span className="badge badge-hr">{b.type}</span></td>
                  <td style={{ fontWeight: 'bold' }}>{b.currency} {b.amount?.toLocaleString()}</td>
                  <td><span className={`badge badge-${b.status?.toLowerCase() || 'pending'}`}>{b.status || 'PENDING'}</span></td>
                </tr>
              ))}
              {bonuses.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bonus records found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {showPackageModal && <div className="modal-overlay"><BenefitPackageForm authHeader={authHeader} onClose={() => setShowPackageModal(false)} onSuccess={() => { refreshData(); setShowPackageModal(false) }} /></div>}
      {showStructureModal && <div className="modal-overlay"><SalaryStructureForm authHeader={authHeader} onClose={() => setShowStructureModal(false)} onSuccess={() => { refreshData(); setShowStructureModal(false) }} /></div>}
      {showEnrollModal && <div className="modal-overlay"><ProgramEnrollmentForm employeeId={selectedEmp} authHeader={authHeader} onClose={() => setShowEnrollModal(false)} onSuccess={() => { refreshData(); setShowEnrollModal(false) }} /></div>}
      {showBonusModal && <div className="modal-overlay"><BonusAllocationForm employees={employees} authHeader={authHeader} onClose={() => setShowBonusModal(false)} onSuccess={() => { refreshData(); setShowBonusModal(false) }} /></div>}
    </div>
  )
}
function TimeAndAttendance({ employees }) {
  const [selectedEmp, setSelectedEmp] = useState(employees[0]?.id)
  const [attendance, setAttendance] = useState([])
  const [balances, setBalances] = useState({ PTO: 0, SICK_LEAVE: 0 })

  useEffect(() => {
    if (selectedEmp) {
      fetch(`${API_BASE}/attendance/employee/${selectedEmp}`, { headers: { 'Authorization': authHeader } })
        .then(res => res.json())
        .then(data => setAttendance(Array.isArray(data) ? data : []))
        .catch(() => setAttendance([]))

      fetch(`${API_BASE}/attendance/employee/${selectedEmp}/balances`, { headers: { 'Authorization': authHeader } })
        .then(res => res.json())
        .then(data => setBalances(data || { PTO: 0, SICK_LEAVE: 0 }))
        .catch(() => setBalances({ PTO: 0, SICK_LEAVE: 0 }))
    }
  }, [selectedEmp, authHeader])

  const clockIn = () => {
    fetch(`${API_BASE}/attendance/clock-in?employeeId=${selectedEmp}`, { method: 'POST', headers: { 'Authorization': authHeader } })
      .then(() => fetch(`${API_BASE}/attendance/employee/${selectedEmp}`, { headers: { 'Authorization': authHeader } }))
      .then(res => res.json())
      .then(setAttendance)
  }

  const clockOut = () => {
    fetch(`${API_BASE}/attendance/clock-out?employeeId=${selectedEmp}`, { method: 'POST', headers: { 'Authorization': authHeader } })
      .then(() => fetch(`${API_BASE}/attendance/employee/${selectedEmp}`, { headers: { 'Authorization': authHeader } }))
      .then(res => res.json())
      .then(setAttendance)
  }

  const [currentTime, setCurrentTime] = useState(new Date())
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])


  return (
    <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 2fr', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div className="card glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Employee Select</h3>
          <select 
            value={selectedEmp || ''} 
            onChange={(e) => setSelectedEmp(Number(e.target.value))}
            style={{ width: '100%', padding: '0.8rem', background: 'var(--bg-dark)', color: 'white', borderRadius: '12px', border: '1px solid var(--border)' }}
          >
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
            ))}
          </select>
        </div>

        <div className="card glass-card attendance-card" style={{ textAlign: 'center' }}>
          <div className="big-clock">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', letterSpacing: '1px' }}>
            {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', width: '100%' }}>
            <button className="btn btn-primary" style={{ flex: 1, boxShadow: '0 0 20px var(--primary-glow)' }} onClick={clockIn}>Clock In</button>
            <button className="btn btn-outline" style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={clockOut}>Clock Out</button>
          </div>
        </div>
      </div>

      <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Leave Balances</h3>
        <div className="balance-card glass-card">
           <div className="balance-item">
             <span className="balance-value">{balances.PTO}</span>
             <span className="balance-label">PTO Hours</span>
           </div>
           <div style={{ width: '1px', background: 'var(--border)' }}></div>
           <div className="balance-item">
             <span className="balance-value" style={{ color: 'var(--accent)' }}>{balances.SICK_LEAVE}</span>
             <span className="balance-label">Sick Leave</span>
           </div>
        </div>
        
        <h3 style={{ marginBottom: '1rem', marginTop: '1.5rem', color: 'var(--text-main)' }}>Recent Activity</h3>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table className="table">
            <thead>
              <tr><th>Date</th><th>Clock In</th><th>Clock Out</th><th>Status</th></tr>
            </thead>
            <tbody>
              {attendance.map((record, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: '500' }}>{record.date}</td>
                  <td style={{ color: 'var(--success)' }}>{record.clockInTime || '--'}</td>
                  <td style={{ color: record.clockOutTime ? 'var(--warning)' : 'var(--text-muted)' }}>{record.clockOutTime || '--'}</td>
                  <td><span className={`badge badge-${record.status?.toLowerCase() || 'pending'}`}>{record.status?.replace('_', ' ') || 'ACTIVE'}</span></td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr><td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No recent attendance records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


function PerformanceAndTalent({ employees }) {
  const [selectedEmp, setSelectedEmp] = useState(employees[0]?.id)
  const [reviews, setReviews] = useState([])

  const [goals, setGoals] = useState([])

  const safeSet = (setter, fallback = []) => data => setter(Array.isArray(data) ? data : fallback)

  useEffect(() => {
    if (selectedEmp) {
      fetch(`${API_BASE}/talent/reviews/employee/${selectedEmp}`, { headers: { 'Authorization': authHeader } })
        .then(res => res.json())
        .then(safeSet(setReviews))
        .catch(() => setReviews([]))
      fetch(`${API_BASE}/talent/goals/employee/${selectedEmp}`, { headers: { 'Authorization': authHeader } })
        .then(res => res.json())
        .then(safeSet(setGoals))
        .catch(() => setGoals([]))
    }
  }, [selectedEmp])

  const addGoal = () => {
    const title = prompt('Goal Title:')
    if (title) {
      fetch(`${API_BASE}/talent/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify({ employee: { id: selectedEmp }, title: title, targetDate: new Date().toISOString().split('T')[0], status: 'NOT_STARTED' })
      }).then(() => fetch(`${API_BASE}/talent/goals/employee/${selectedEmp}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(safeSet(setGoals)))
    }
  }

  const addReview = () => {
    const score = prompt('Performance Score (1-5):')
    const comments = prompt('Review Comments:')
    if (score && comments) {
      fetch(`${API_BASE}/talent/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify({ employee: { id: selectedEmp }, reviewDate: new Date().toISOString().split('T')[0], score: Number(score), comments: comments, potential: 'HIGH', performanceStatus: 'MEETING_EXPECTATIONS' })
      }).then(() => fetch(`${API_BASE}/talent/reviews/employee/${selectedEmp}`, { headers: { 'Authorization': authHeader } }).then(res => res.json()).then(safeSet(setReviews)))
    }
  }

  return (
    <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
      <div className="card glass-card">
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Team Members</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {employees.map(emp => (
            <button key={emp.id} className={`btn ${selectedEmp === emp.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedEmp(emp.id)} style={{ justifyContent: 'flex-start', padding: '1rem' }}>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '600' }}>{emp.firstName} {emp.lastName}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginTop: '0.2rem' }}>{emp.role}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div>
        <div className="card glass-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Performance Reviews</h3>
            <button className="btn btn-outline" onClick={addReview}>+ New Review</button>
          </div>
          <table className="table">
            <thead><tr><th>Date</th><th>Score</th><th>Comments</th><th>Potential</th></tr></thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r.id}>
                  <td>{r.reviewDate}</td>
                  <td><span style={{ fontSize: '1.2rem', color: 'var(--warning)' }}>{'★'.repeat(r.score)}{'☆'.repeat(5-r.score)}</span></td>
                  <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.comments}</td>
                  <td><span className={`badge ${r.potential === 'HIGH' ? 'badge-success' : 'badge-warning'}`}>{r.potential}</span></td>
                </tr>
              ))}
              {reviews.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No reviews recorded.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="card glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3>Goals & Objectives</h3>
            <button className="btn btn-outline" onClick={addGoal}>+ Set Goal</button>
          </div>
          <table className="table">
            <thead><tr><th>Title</th><th>Target Date</th><th>Status</th></tr></thead>
            <tbody>
              {goals.map(g => (
                <tr key={g.id}>
                  <td style={{ fontWeight: '500' }}>{g.title}</td>
                  <td>{g.targetDate}</td>
                  <td><span className={`badge badge-${g.status.toLowerCase().replace('_', '-')}`}>{g.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
              {goals.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No goals set.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TrainingDevelopment({ employees, authHeader }) {
  const [selectedEmp, setSelectedEmp] = useState(employees[0]?.id)
  const [programs, setPrograms] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [showProgramModal, setShowProgramModal] = useState(false)

  const safeSet = (setter, fallback = []) => data => setter(Array.isArray(data) ? data : fallback)

  const fetchTrainingData = () => {
    fetch(`${API_BASE}/talent/programs`, { headers: { 'Authorization': authHeader } })
      .then(res => res.json())
      .then(safeSet(setPrograms))
      .catch(() => setPrograms([]))
    if (selectedEmp) {
      fetch(`${API_BASE}/talent/programs/enrolled/${selectedEmp}`, { headers: { 'Authorization': authHeader } })
        .then(res => res.json())
        .then(safeSet(setEnrollments))
        .catch(() => setEnrollments([]))
    }
  }

  useEffect(fetchTrainingData, [selectedEmp])

  const enrollEmployee = (programId) => {
    fetch(`${API_BASE}/talent/programs/${programId}/enroll/${selectedEmp}`, { method: 'POST', headers: { 'Authorization': authHeader } })
      .then(fetchTrainingData)
  }

  const completeProgram = (programId) => {
    fetch(`${API_BASE}/talent/programs/${programId}/complete/${selectedEmp}`, { method: 'PATCH', headers: { 'Authorization': authHeader } })
      .then(fetchTrainingData)
  }

  return (
    <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) 2fr', gap: '2rem' }}>
      <div className="card glass-card">
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 'bold' }}>Learner Profile</h3>
        <select 
          style={{ width: '100%', padding: '0.8rem', marginBottom: '1.5rem', background: 'var(--bg-dark)', color: 'white', borderRadius: '12px', border: '1px solid var(--border)' }} 
          value={selectedEmp || ''} 
          onChange={e => setSelectedEmp(Number(e.target.value))}
        >
          {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
        </select>
        
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Available Programs</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {programs.filter(p => !enrollments.find(e => e.program?.id === p.id)).map(p => (
            <div key={p.id} style={{ padding: '1rem', border: '1px solid var(--border)', borderRadius: '12px', background: 'rgba(0,0,0,0.2)' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{p.name}</div>
              <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '1rem' }}>{p.description}</p>
              <button className="btn btn-outline" style={{ width: '100%', fontSize: '0.8rem' }} onClick={() => enrollEmployee(p.id)}>Enroll Now</button>
            </div>
          ))}
          {programs.filter(p => !enrollments.find(e => e.program?.id === p.id)).length === 0 && <p className="text-muted" style={{ fontSize: '0.85rem' }}>No new programs available.</p>}
        </div>
      </div>
      <div>
        <div className="card glass-card" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0 }}>Learning Journey</h3>
            <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>Track enrolled courses and certifications.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowProgramModal(true)}>Assign Program</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {enrollments.map(e => (
            <div key={e.id} className="card glass-card" style={{ position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: e.status === 'COMPLETED' ? 'var(--success)' : 'var(--warning)' }}></div>
              <h4 style={{ marginBottom: '1rem' }}>{e.program?.name}</h4>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                <span>Enrolled: {e.enrollmentDate}</span>
                <span className={`badge ${e.status === 'COMPLETED' ? 'badge-success' : 'badge-warning'}`}>{e.status.replace('_', ' ')}</span>
              </div>
              {e.status !== 'COMPLETED' && (
                <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(90deg, var(--success), #10b981)' }} onClick={() => completeProgram(e.program?.id)}>Mark as Completed</button>
              )}
            </div>
          ))}
          {enrollments.length === 0 && (
            <div className="card glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              No active learning programs. Enroll to start upskilling!
            </div>
          )}
        </div>
      </div>
      {showProgramModal && (
        <div className="modal-overlay">
          <ProgramEnrollmentForm employeeId={selectedEmp} authHeader={authHeader} onClose={() => setShowProgramModal(false)} onSuccess={() => { fetchTrainingData(); setShowProgramModal(false) }} />
        </div>
      )}
    </div>
  )
}



function BenefitPackageForm({ authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', type: 'HEALTHCARE', description: '', provider: '', monthlyCost: 0, employerContribution: 50, region: 'GLOBAL', contractType: 'FULL_TIME' })
  const handleSubmit = () => {
    fetch(`${API_BASE}/benefits/packages`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }, 
      body: JSON.stringify(form) 
    }).then(res => {
      if (res.ok) onSuccess()
      else res.text().then(text => notify.error(`Failed to create package: ${text}`))
    }).catch(err => notify.error(`Network error: ${err.message}`))
  }
  return (
    <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
      <h3>Create Benefit Package</h3>
      <div className="input-group"><label>Package Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
      <div className="input-group"><label>Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>HEALTHCARE</option><option>RETIREMENT</option><option>ALLOWANCE</option><option>GYM_MEMBERSHIP</option></select></div>
      <div className="input-group"><label>Monthly Cost</label><input type="number" value={form.monthlyCost} onChange={e => setForm({ ...form, monthlyCost: parseFloat(e.target.value) })} /></div>
      <div className="input-group"><label>Employer Contribution %</label><input type="number" value={form.employerContribution} onChange={e => setForm({ ...form, employerContribution: parseFloat(e.target.value) })} /></div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Create Package</button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function BenefitEnrollmentForm({ employeeId, packages, authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ employee: { id: employeeId }, benefitPackage: { id: packages[0]?.id }, status: 'ACTIVE' })
  const handleSubmit = () => {
    fetch(`${API_BASE}/benefits/enroll`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }, 
      body: JSON.stringify(form) 
    }).then(res => {
      if (res.ok) onSuccess()
      else res.text().then(text => notify.error(`Failed to enroll employee: ${text}`))
    }).catch(err => notify.error(`Network error: ${err.message}`))
  }
  return (
    <div className="modal-content glass-card" style={{ maxWidth: '400px' }}>
      <h3>Enroll Employee in Benefit</h3>
      <div className="input-group">
        <label>Select Package</label>
        <select value={form.benefitPackage.id} onChange={e => setForm({ ...form, benefitPackage: { id: parseInt(e.target.value) } })}>
          {packages.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Enroll</button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function CompensationStructureForm({ authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ role: '', region: 'GLOBAL', minSalary: 0, maxSalary: 0, currency: 'USD', payFrequency: 'SALARIED' })
  const handleSubmit = () => {
    fetch(`${API_BASE}/compensation/structures`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }, 
      body: JSON.stringify(form) 
    }).then(res => {
      if (res.ok) onSuccess()
      else res.text().then(text => notify.error(`Failed to save structure: ${text}`))
    }).catch(err => notify.error(`Network error: ${err.message}`))
  }
  return (
    <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
      <h3>Add Compensation Range</h3>
      <div className="input-group"><label>Role</label><input value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} /></div>
      <div className="input-group"><label>Region</label><input value={form.region} onChange={e => setForm({ ...form, region: e.target.value })} /></div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div className="input-group" style={{ flex: 1 }}><label>Min Salary</label><input type="number" value={form.minSalary} onChange={e => setForm({ ...form, minSalary: parseFloat(e.target.value) })} /></div>
        <div className="input-group" style={{ flex: 1 }}><label>Max Salary</label><input type="number" value={form.maxSalary} onChange={e => setForm({ ...form, maxSalary: parseFloat(e.target.value) })} /></div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Save Range</button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function BonusAllocationForm({ employees, authHeader, onClose, onSuccess }) {
  const [form, setForm] = useState({ employee: { id: employees[0]?.id }, amount: 0, type: 'PERFORMANCE', notes: '' })

  useEffect(() => {
    if (!form.employee.id && employees.length > 0) {
      setForm(prev => ({ ...prev, employee: { id: employees[0].id } }))
    }
  }, [employees])
  const handleSubmit = () => {
    console.log('Allocating bonus...', form)
    if (!form.employee?.id) {
       notify.error('Please select an employee.')
       return
    }
    if (form.amount <= 0) {
       notify.error('Please enter a valid amount.')
       return
    }

    fetch(`${API_BASE}/compensation/bonuses`, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': authHeader }, 
      body: JSON.stringify(form) 
    }).then(res => {
      if (res.ok) {
        onSuccess()
      } else {
        res.text().then(text => {
          console.error('Bonus allocation failed:', res.status, text)
          notify.error(`Failed to allocate bonus: ${res.status} ${text}`)
        })
      }
    }).catch(err => {
      console.error('Network error during bonus allocation:', err)
      notify.error(`Network error: ${err.message}`)
    })
  }
  return (
    <div className="modal-content glass-card" style={{ maxWidth: '500px' }}>
      <h3>Allocate Bonus</h3>
      <div className="input-group">
        <label>Select Employee</label>
        <select value={form.employee.id} onChange={e => setForm({ ...form, employee: { id: parseInt(e.target.value) } })}>
          {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>)}
        </select>
      </div>
      <div className="input-group"><label>Bonus Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option>PERFORMANCE</option><option>REFERRAL</option><option>SIGN_ON</option><option>ANNUAL</option></select></div>
      <div className="input-group"><label>Amount</label><input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: parseFloat(e.target.value) })} /></div>
      <div className="input-group"><label>Notes</label><textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
        <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Allocate Bonus</button>
        <button className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function ProgramEnrollmentForm({ employeeId, authHeader, onClose, onSuccess }) {
  const [availablePrograms, setAvailablePrograms] = useState([])
  const [selectedProgram, setSelectedProgram] = useState('')

  const safeSet = (setter, fallback = []) => data => setter(Array.isArray(data) ? data : fallback)

  useEffect(() => {
    fetch(`${API_BASE}/talent/programs`, { headers: { 'Authorization': authHeader } })
      .then(res => res.json())
      .then(safeSet(setAvailablePrograms))
      .catch(() => setAvailablePrograms([]))
  }, [])

  const handleEnroll = () => {
    if (!selectedProgram) return
    fetch(`${API_BASE}/talent/programs/${selectedProgram}/enroll/${employeeId}`, {
      method: 'POST',
      headers: { 'Authorization': authHeader }
    }).then(onSuccess)
  }

  return (
    <div className="modal-content glass-card" style={{maxWidth: '500px'}}>
      <h3>Assign Training Program</h3>
      <div className="input-group">
        <label>Select Program</label>
        <select value={selectedProgram} onChange={e => setSelectedProgram(e.target.value)} style={{width: '100%', padding: '0.8rem', background: 'var(--bg-dark)', color: 'white', borderRadius: '8px'}}>
          <option value="">-- Choose a program --</option>
          {Array.isArray(availablePrograms) && availablePrograms.map(p => (
            <option key={p?.id} value={p?.id}>{p?.name} ({p?.targetRole})</option>
          ))}
        </select>
      </div>
      <div style={{display: 'flex', gap: '1rem', marginTop: '1.5rem'}}>
        <button className="btn btn-primary" style={{flex: 1}} onClick={handleEnroll} disabled={!selectedProgram}>Enroll Employee</button>
        <button className="btn btn-outline" style={{flex: 1}} onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

function CalendarView({ interviews = [] }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  
  const calendarDays = []
  for (let i = 0; i < firstDayOfMonth.getDay(); i++) calendarDays.push(null)
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) calendarDays.push(new Date(today.getFullYear(), today.getMonth(), i))

  const cleanestInterviews = Array.isArray(interviews) ? interviews : []

  return (
    <div className="calendar-container">
      <div style={{padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3 style={{margin: 0}}>{today.toLocaleString('default', { month: 'long' })} {today.getFullYear()}</h3>
        <div style={{display: 'flex', gap: '0.5rem', fontSize: '0.8rem'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}><div style={{width: 10, height: 10, background: 'var(--primary)', borderRadius: 2}}></div> Interview</span>
        </div>
      </div>
      <div className="calendar-grid">
        {days.map(d => <div key={d} className="calendar-day header">{d}</div>)}
        {calendarDays.map((date, idx) => (
          <div key={idx} className="calendar-day">
            <span style={{fontSize: '0.8rem', opacity: date ? 1 : 0}}>{date?.getDate()}</span>
            {date && cleanestInterviews.filter(i => {
              if (!i?.dateTime) return false;
              try {
                return new Date(i.dateTime).toDateString() === date.toDateString();
              } catch (e) {
                return false;
              }
            }).map(i => (
              <div key={i.id} className="calendar-event">
                <div style={{fontWeight: 'bold'}}>{new Date(i.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                <div>{i.candidate?.firstName} {i.candidate?.lastName}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type} ${t.hiding ? 'hiding' : ''}`}>
          <div className="toast-icon">
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </div>
          <div className="toast-content">
            <div className="toast-message">{t.message}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App


