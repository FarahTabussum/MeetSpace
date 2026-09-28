import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import UserManagement from './pages/UserManagement';
import RoomManagement from './pages/RoomManagement';
import BookRoom from './pages/BookRoom';
import MyBookings from './pages/MyBookings';
import AdminBookings from './pages/AdminBookings';
import AdminDashboard from './pages/AdminDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="/admin/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/admin/rooms" element={<ProtectedRoute><RoomManagement /></ProtectedRoute>} />
        <Route path="/admin/bookings" element={<ProtectedRoute><AdminBookings /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/employee/book" element={<ProtectedRoute><BookRoom /></ProtectedRoute>} />
        <Route path="/employee/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/employee/dashboard" element={<ProtectedRoute><EmployeeDashboard /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
