import React, { useState, useEffect } from 'react';
import { db } from './firebase'; // استدعاء قاعدة البيانات
import { collection, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';

// ==========================================
// 1. مكوّن الموقف التفاعلي
// ==========================================
const ParkingSpot = ({ id, status, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  const config = {
    available: {
      bg: isHovered ? 'rgba(76, 175, 80, 0.4)' : 'rgba(76, 175, 80, 0.15)',
      border: 'rgba(76, 175, 80, 0.6)', cursor: 'pointer',
      transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
      text: 'متاح', icon: '✨', animationClass: 'pulse-glow-glass'
    },
    occupied: {
      bg: 'rgba(244, 67, 54, 0.15)', border: 'rgba(244, 67, 54, 0.4)',
      cursor: 'not-allowed', transform: 'translateY(0)',
      text: 'ممتلئ', icon: '🔒', animationClass: ''
    },
    reserved: {
      bg: isHovered ? 'rgba(255, 193, 7, 0.4)' : 'rgba(255, 193, 7, 0.2)',
      border: 'rgba(255, 193, 7, 0.6)', cursor: 'pointer',
      transform: isHovered ? 'translateY(-5px)' : 'translateY(0)',
      text: 'موقفك المحجوز', icon: '⭐', animationClass: 'float-slow'
    }
  };

  const currentConfig = config[status] || config.available;

  return (
    <div
      className={`glass-panel ${currentConfig.animationClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => status !== 'occupied' && onClick(id)}
      style={{
        padding: '30px 10px', textAlign: 'center', borderRadius: '16px',
        fontWeight: 'bold', fontSize: '16px', backgroundColor: currentConfig.bg,
        border: `1px solid ${currentConfig.border}`, cursor: currentConfig.cursor,
        transform: currentConfig.transform, transition: 'all 0.4s', color: '#fff'
      }}
    >
      <div style={{ fontSize: '24px', marginBottom: '8px' }}>{currentConfig.icon}</div>
      موقف {id} <br />
      <span style={{ fontSize: '14px', fontWeight: 'normal' }}>({currentConfig.text})</span>
    </div>
  );
};

// ==========================================
// 2. التطبيق الرئيسي
// ==========================================
function App() {
  const [activePortal, setActivePortal] = useState('employee');
  const [currentView, setCurrentView] = useState('home'); 
  const [bookingStatus, setBookingStatus] = useState(null);
  const [selectedSpotId, setSelectedSpotId] = useState(''); 
  const [spots, setSpots] = useState([]); // لحفظ البيانات من Firebase
  
  const videoList = ['/clip1.mp4', '/clip2.mp4', '/clip3.mp4'];
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  // جلب البيانات لحظياً (Real-time) من Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'parkingSpots'), (snapshot) => {
      const spotsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // ترتيب المواقف أبجدياً
      spotsData.sort((a, b) => a.id.localeCompare(b.id));
      setSpots(spotsData);
    });
    return () => unsubscribe();
  }, []);

  // حساب الإحصائيات من البيانات الحقيقية
  const totalSpots = spots.length;
  const occupiedSpots = spots.filter(s => s.status === 'occupied').length;
  const reservedSpots = spots.filter(s => s.status === 'reserved').length;
  const availableSpots = spots.filter(s => s.status === 'available').length;
  const occupancyRate = totalSpots > 0 ? (((occupiedSpots + reservedSpots) / totalSpots) * 100).toFixed(1) : 0;

  // دالة تهيئة قاعدة البيانات لأول مرة (تُستخدم من لوحة الإدارة)
  const initializeDatabase = async () => {
    const initialSpots = [
      { id: 'A-12', status: 'available' },
      { id: 'A-13', status: 'occupied' },
      { id: 'A-14', status: 'available' },
      { id: 'A-15', status: 'available' }
    ];
    
    for (const spot of initialSpots) {
      await setDoc(doc(db, 'parkingSpots', spot.id), { status: spot.status });
    }
    alert("✅ تم تهيئة قاعدة البيانات بنجاح!");
  };

  // إرسال الحجز إلى Firebase
  const handleBookingSubmit = async () => {
    if (!selectedSpotId) return;
    setBookingStatus('processing');
    
    try {
      const spotRef = doc(db, 'parkingSpots', selectedSpotId);
      await updateDoc(spotRef, {
        status: 'reserved'
      });
      setBookingStatus('success');
      setCurrentView('booking_confirmation');
    } catch (error) {
      console.error("خطأ في الحجز:", error);
      alert("حدث خطأ أثناء الحجز. تأكد من إعدادات Firebase.");
      setBookingStatus(null);
    }
  };

  const handleSpotClick = (id, status) => {
    if (status === 'available') {
      setSelectedSpotId(id);
      setCurrentView('reserve'); 
    } else if (status === 'reserved') {
      setCurrentView('booking_confirmation');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', direction: 'rtl', minHeight: '100vh', position: 'relative', color: '#fff', overflow: 'hidden' }}>
      
      <video key={videoList[currentVideoIndex]} autoPlay muted playsInline onEnded={() => setCurrentVideoIndex((prev) => (prev + 1) % videoList.length)} style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: -2 }}>
        <source src={videoList[currentVideoIndex]} type="video/mp4" />
      </video>

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: -1 }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '30px 20px', maxWidth: '900px', margin: 'auto' }}>
        
        <style>{`
          .glass-panel { background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.2); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); border-radius: 16px; }
          .glass-btn { background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(5px); border: 1px solid rgba(255, 255, 255, 0.3); color: #fff; transition: all 0.3s ease; cursor: pointer; }
          .glass-btn:hover { background: rgba(255, 255, 255, 0.3); transform: translateY(-2px); }
          .glass-btn.active { background: rgba(0, 86, 179, 0.7); border-color: rgba(0, 86, 179, 1); }
          @keyframes pulseGlowGlass { 0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.4); } 70% { box-shadow: 0 0 0 15px rgba(76, 175, 80, 0); } 100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); } }
          @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .pulse-glow-glass { animation: pulseGlowGlass 2s infinite; }
          .fade-in-up { animation: fadeInUp 0.6s ease-out forwards; }
          input[type="date"], input[type="time"] { background: rgba(255, 255, 255, 0.2); border: 1px solid rgba(255, 255, 255, 0.4); color: #fff; padding: 10px; border-radius: 8px;}
        `}</style>

        <header className="fade-in-up" style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '36px' }}>RCRC Park</h1>
          <p style={{ opacity: 0.9, fontSize: '18px' }}>متصل بقاعدة البيانات السحابية ☁️</p>
        </header>

        <div className="fade-in-up" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px' }}>
          <button onClick={() => { setActivePortal('employee'); setCurrentView('home'); }} className={`glass-btn ${activePortal === 'employee' ? 'active' : ''}`} style={{ padding: '12px 25px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold' }}>بوابة الموظف</button>
          <button onClick={() => { setActivePortal('admin'); setCurrentView('dashboard'); }} className={`glass-btn ${activePortal === 'admin' ? 'active' : ''}`} style={{ padding: '12px 25px', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold' }}>لوحة الإدارة</button>
        </div>

        {/* بوابة الموظف */}
        {activePortal === 'employee' && (
          <div className="fade-in-up">
            {currentView === 'home' && (
              <div className="glass-panel" style={{ padding: '30px' }}>
                <h2>اكتشف المواقف المتاحة</h2>
                <p>المواقف المتبقية للعامة: {availableSpots}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '25px' }}>
                  {spots.length === 0 ? (
                    <p style={{ color: '#ffc107' }}>⚠️ لا توجد بيانات. يرجى تهيئة قاعدة البيانات من لوحة الإدارة.</p>
                  ) : (
                    spots.map(spot => (
                      <ParkingSpot key={spot.id} id={spot.id} status={spot.status} onClick={(id) => handleSpotClick(id, spot.status)} />
                    ))
                  )}
                </div>
              </div>
            )}

            {currentView === 'reserve' && (
              <div className="fade-in-up glass-panel" style={{ padding: '30px' }}>
                <h2>تفاصيل الحجز (الموقف: {selectedSpotId})</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label>وقت الوصول: <input type="time" defaultValue="08:00" /></label>
                    <label>وقت المغادرة: <input type="time" defaultValue="16:00" /></label>
                  </div>
                  <button onClick={handleBookingSubmit} disabled={bookingStatus === 'processing'} className="glass-btn" style={{ backgroundColor: 'rgba(40, 167, 69, 0.8)', padding: '15px', borderRadius: '10px', fontSize: '18px', fontWeight: 'bold' }}>
                    {bookingStatus === 'processing' ? '⚙️ جاري تسجيل الحجز سحابياً...' : '✅ تأكيد الحجز'}
                  </button>
                </div>
              </div>
            )}

            {currentView === 'booking_confirmation' && (
              <div className="fade-in-up glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
                <h2 style={{ color: '#81c784' }}>تم تأكيد حجزك بنجاح! 🎉</h2>
                <div style={{ background: 'rgba(76, 175, 80, 0.2)', padding: '40px', borderRadius: '20px', margin: '30px 0', border: '1px solid rgba(76, 175, 80, 0.5)' }}>
                  <h1 style={{ fontSize: '60px', margin: '0' }}>{selectedSpotId}</h1>
                </div>
                <button onClick={() => setCurrentView('home')} className="glass-btn" style={{ background: 'rgba(0, 86, 179, 0.8)', width: '100%', padding: '15px', borderRadius: '12px', fontSize: '18px' }}>العودة للرئيسية</button>
              </div>
            )}
          </div>
        )}

        {/* لوحة الإدارة */}
        {activePortal === 'admin' && (
          <div className="fade-in-up glass-panel" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0 }}>📊 الإشغال اللحظي (Live)</h2>
              <button onClick={initializeDatabase} className="glass-btn" style={{ background: 'rgba(220, 53, 69, 0.8)', padding: '10px 20px', borderRadius: '8px' }}>
                ⚙️ تهيئة قاعدة البيانات
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '25px', borderBottom: '4px solid #4dabf7' }}>
                <h3 style={{ margin: '0 0 10px 0', opacity: 0.8 }}>إجمالي المواقف</h3>
                <h2 style={{ margin: 0, fontSize: '36px' }}>{totalSpots}</h2>
              </div>
              <div className="glass-panel" style={{ padding: '25px', borderBottom: '4px solid #ff6b6b' }}>
                <h3 style={{ margin: '0 0 10px 0', opacity: 0.8 }}>الإشغال الفعلي</h3>
                <h2 style={{ margin: 0, fontSize: '36px', color: '#ffc9c9' }}>{occupancyRate}%</h2>
              </div>
              <div className="glass-panel" style={{ padding: '25px', borderBottom: '4px solid #69db7c' }}>
                <h3 style={{ margin: '0 0 10px 0', opacity: 0.8 }}>متاح للعامة</h3>
                <h2 style={{ margin: 0, fontSize: '36px', color: '#b2f2bb' }}>{availableSpots}</h2>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;