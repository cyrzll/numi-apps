import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import AdminDashboard from '../components/admin/AdminDashboard.js';
import { useHistory } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const history = useHistory();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      history.replace('/');
      return;
    }
    try {
      const payloadBase64 = token.split('.')[1];
      const payloadDecoded = JSON.parse(atob(payloadBase64));
      
      if (payloadDecoded.role !== 'admin') {
        console.warn('Access denied. Non-admin user tried to access admin page.');
        history.replace('/play');
      } else {
        setAuthorized(true);
      }
    } catch (e) {
      console.error('Invalid token payload.', e);
      history.replace('/');
    }
  }, [history]);

  if (!authorized) return null;

  return (
    <IonPage>
      <IonContent fullscreen className="ion-no-padding">
        <main className="min-h-screen bg-brand-cream py-6">
          <AdminDashboard />
        </main>
      </IonContent>
    </IonPage>
  );
};

export default AdminPage;
