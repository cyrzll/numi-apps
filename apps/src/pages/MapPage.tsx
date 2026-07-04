import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import AdventureMap from '../components/map/AdventureMap.js';

export const MapPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen className="ion-no-padding">
        <main className="min-h-screen bg-brand-cream py-6 relative">
          
          {/* Mobile optimization: Prompt user to rotate to portrait if in landscape */}
          <div className="hidden landscape:flex fixed inset-0 z-[100] bg-brand-cream flex-col items-center justify-center p-6 text-center select-none">
            <div className="bg-brand-pink border-4 border-brand-dark p-6 rounded-3xl shadow-[5px_5px_0px_0px_#1E293B] max-w-xs animate-bounce mb-6">
              <span className="text-6xl">🔄</span>
            </div>
            <h2 className="text-2xl font-black text-brand-dark text-stroke mb-2">Putar Layar HP-mu!</h2>
            <p className="text-slate-600 font-extrabold max-w-xs">
              Peta Petualangan paling seru dilihat dalam mode Potret (Portrait). Silakan aktifkan rotasi otomatis dan putar HP-mu! 📱
            </p>
          </div>

          <AdventureMap />
        </main>
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
