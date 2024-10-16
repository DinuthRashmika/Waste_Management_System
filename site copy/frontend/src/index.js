import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './index.css';
import App from './App';
import Login from './components/login';
import reportWebVitals from './reportWebVitals';
import Signup from './components/signin';
import AdminDashboard from './pages/admindashboard';
import CustomerDashboard from './pages/customerdashboard';
import CollectorDashboard from './pages/collecterdashboard';
import AddTenant from './pages/addtenet';
import MapView from './pages/mapview';
import RequestMapView from './pages/mapviewcomp';
import AddressSelection from './pages/addressselects';
import GarbageForm from './pages/garbageforms';
import PaymentPage from './pages/paymentpage';
import ViewUsers from './pages/viewallusers';
import UserDetails from './pages/userdetails';
import ViewCollectors from './pages/viewcollectors';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes> 
        <Route path="/" element={<App />} />
        <Route path="/login" element={<Login />} />
        <Route path="/select-address" element={<AddressSelection/>}/>
        <Route path="/signin" element={<Signup/>} />
        <Route path="/view-users" element={<ViewUsers/>} />
        <Route path="/admindashboard" element={<AdminDashboard/>}/>
        <Route path="/collector/request/:requestId/map" element={<RequestMapView/>} />
        <Route path="/customerdashboard" element={<CustomerDashboard/>}/>
        <Route path="/add-tenant" element={<AddTenant/>}/>
        <Route path="/pay-bill/:addressId" element={< PaymentPage/>} />
        <Route path="/garbageform" element={<GarbageForm/>}/>
        <Route path="/view-collectors" element={<ViewCollectors/>} />
        <Route path="/users/:id" element={<UserDetails/>}/>
        <Route path="/map-view" element={<MapView/>}/>
        <Route path="/collecterdashboard" element={<CollectorDashboard/>}/>
        
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
