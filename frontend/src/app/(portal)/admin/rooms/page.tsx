'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Topbar from '@/components/Topbar/Topbar';
import { api } from '@/lib/api';

interface Subject {
  id: number;
  code: string;
  name: string;
  teacher: string;
  day: string;
  timeStart: string;
  timeEnd: string;
  room: string;
}

const ROOMS = Array.from({ length: 20 }, (_, i) => `Room ${101 + i}`);
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function RoomManagement() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadSubjects();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const loadSubjects = async () => {
    try {
      const res = await api.get('/admin/all-subjects');
      if (res.success) setSubjects(res.subjects);
    } finally {
      setLoading(false);
    }
  };

  // Helper to parse time strings like "08:00 AM" into comparable numbers (minutes from midnight)
  const parseTime = (timeStr: string) => {
    if (!timeStr) return 0;
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  };

  const isRoomOccupied = (roomName: string) => {
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();

    return subjects.find(s => {
      if (s.room !== roomName || s.day !== currentDay) return false;
      const start = parseTime(s.timeStart);
      const end = parseTime(s.timeEnd);
      return currentMins >= start && currentMins < end;
    });
  };

  const getAvailableSlots = (roomName: string) => {
    const currentDay = currentTime.toLocaleDateString('en-US', { weekday: 'long' });
    const daySubjects = subjects
      .filter(s => s.room === roomName && s.day === currentDay)
      .sort((a, b) => parseTime(a.timeStart) - parseTime(b.timeStart));

    // Working hours: 7 AM (420 mins) to 8 PM (1200 mins)
    let slots = [];
    let lastTime = 420;

    daySubjects.forEach(s => {
      const start = parseTime(s.timeStart);
      if (start > lastTime) {
        slots.push(`${Math.floor(lastTime/60)}:${(lastTime%60).toString().padStart(2, '0')} - ${s.timeStart}`);
      }
      lastTime = parseTime(s.timeEnd);
    });

    if (lastTime < 1200) {
      slots.push(`${Math.floor(lastTime/60)}:${(lastTime%60).toString().padStart(2, '0')} - 08:00 PM`);
    }

    return slots;
  };

  if (user?.role !== 'admin') return <div className="page-content">Access Denied</div>;

  return (
    <div className="animate-in">
      <Topbar title="Institutional Room Registry" subtitle="Strategic oversight of facility utilization and real-time occupancy tracking." />
      
      <main className="page-content">
        
        {/* Status Legends */}
        <div style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success)' }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Institutional Available</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)' }} />
              <span style={{ fontSize: 13, fontWeight: 700 }}>Occupied (In-Session)</span>
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--primary)' }}>🕒 Current Portal Time: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 32 }}>
           
           {/* Room Grid */}
           <div className="grid-3" style={{ gridAutoRows: 'min-content' }}>
              {ROOMS.map(room => {
                const currentSubject = isRoomOccupied(room);
                const isOccupied = !!currentSubject;
                
                return (
                  <div 
                    key={room} 
                    className="card" 
                    style={{ 
                      padding: 24, 
                      cursor: 'pointer',
                      border: selectedRoom === room ? '2px solid var(--primary)' : '1px solid var(--divider)',
                      background: selectedRoom === room ? 'var(--secondary)' : 'var(--bg-card)'
                    }}
                    onClick={() => setSelectedRoom(room)}
                  >
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 18, fontWeight: 900 }}>{room}</h3>
                        <div style={{ 
                          width: 10, height: 10, borderRadius: '50%', 
                          background: isOccupied ? 'var(--danger)' : 'var(--success)',
                          boxShadow: isOccupied ? '0 0 10px var(--danger)' : '0 0 10px var(--success)'
                        }} />
                     </div>
                     
                     {isOccupied ? (
                       <div>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--danger)', textTransform: 'uppercase', marginBottom: 4 }}>Now Occupied By:</div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>{currentSubject.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Until {currentSubject.timeEnd}</div>
                       </div>
                     ) : (
                       <div>
                          <div style={{ fontSize: 11, fontWeight: 900, color: 'var(--success)', textTransform: 'uppercase', marginBottom: 4 }}>Capacity Status:</div>
                          <div style={{ fontSize: 14, fontWeight: 800 }}>Available Now</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Ready for Allocation</div>
                       </div>
                     )}
                  </div>
                );
              })}
           </div>

           {/* Room Detail Sidebar */}
           <div style={{ position: 'sticky', top: 32, height: 'fit-content' }}>
              {selectedRoom ? (
                <div className="card animate-in" key={selectedRoom}>
                   <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 4 }}>{selectedRoom} Specification</h2>
                   <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Strategic schedule overview for this facility.</p>
                   
                   <div style={{ marginBottom: 32 }}>
                      <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 12 }}>Open Slots (Today)</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                         {getAvailableSlots(selectedRoom).map((slot, i) => (
                           <div key={i} style={{ padding: '8px 12px', background: 'var(--secondary)', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>
                              🕒 {slot}
                           </div>
                         ))}
                         {getAvailableSlots(selectedRoom).length === 0 && <p style={{ fontSize: 12, opacity: 0.5 }}>No available slots identified for today.</p>}
                      </div>
                   </div>

                   <div className="divider" />

                   <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', color: 'var(--primary)', marginBottom: 16 }}>Weekly Curricular Loadout</h4>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {DAYS.map(day => {
                        const dayItems = subjects.filter(s => s.room === selectedRoom && s.day === day)
                          .sort((a, b) => parseTime(a.timeStart) - parseTime(b.timeStart));
                        
                        return (
                          <div key={day}>
                             <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 8, color: 'var(--text-muted)' }}>{day}</div>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                {dayItems.map(s => (
                                  <div key={s.id} style={{ padding: 12, border: '1.5px solid var(--divider)', borderRadius: 10 }}>
                                     <div style={{ fontSize: 13, fontWeight: 800 }}>{s.name}</div>
                                     <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.timeStart} - {s.timeEnd}</div>
                                  </div>
                                ))}
                                {dayItems.length === 0 && <div style={{ fontSize: 11, opacity: 0.4, fontStyle: 'italic' }}>No session assigned</div>}
                             </div>
                          </div>
                        );
                      })}
                   </div>
                </div>
              ) : (
                <div className="card" style={{ textAlign: 'center', padding: '60px 20px', opacity: 0.6 }}>
                   <div style={{ fontSize: 40, marginBottom: 16 }}>🏨</div>
                   <h3 style={{ fontSize: 16, fontWeight: 800 }}>Select a facility</h3>
                   <p style={{ fontSize: 13 }}>Click on a room to view its detailed academic schedule and availability.</p>
                </div>
              )}
           </div>

        </div>
      </main>
    </div>
  );
}
