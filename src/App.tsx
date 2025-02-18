import React, { useState, useEffect } from 'react';
import { PartyPopper, Calendar, Users, MapPin, Lock, Trash2 } from 'lucide-react';
import { supabase } from './supabaseClient';
import type { Guest } from './types';

// Core colors
const BLUE = '#032F70';
const YELLOW = '#F7CF05';
const GRAY = '#E4E6EF';

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [guests, setGuests] = useState(1);
  const [confirmed, setConfirmed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [guestList, setGuestList] = useState<Guest[]>([]);

  // Real-time subscription to guests table
  useEffect(() => {
    const channel = supabase
      .channel('guests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'guests',
        },
        async () => {
          const { data } = await supabase
            .from('guests')
            .select('*')
            .order('confirmation_date', { ascending: false });
          if (data) setGuestList(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initial fetch of guests for admin panel
  useEffect(() => {
    if (isAdmin) {
      const fetchGuests = async () => {
        const { data } = await supabase
          .from('guests')
          .select('*')
          .order('confirmation_date', { ascending: false });
        if (data) setGuestList(data);
      };
      fetchGuests();
    }
  }, [isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await supabase.from('guests').insert({
      name,
      email,
      guests,
    });

    if (!error) {
      setConfirmed(true);
      setName('');
      setEmail('');
      setGuests(1);
    } else {
      console.error('Error saving:', error);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: 'admin@example.com',
      password: adminPassword,
    });

    if (session && !error) {
      setIsAdmin(true);
      setAdminPassword('');
    }
  };

  const handleDeleteGuest = async (guestId: string) => {
    const { error } = await supabase
      .from('guests')
      .delete()
      .eq('id', guestId);
    
    if (error) {
      console.error('Error deleting:', error);
    }
  };

  const getTotalGuests = () => guestList.reduce((total, guest) => total + guest.guests, 0);

  const backgroundStyle = {
    backgroundImage: `url('/image/1920x1080-BNG-WALLPAPER4k.jpg')`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  if (isAdmin) {
    return (
      <div className="min-h-screen" style={backgroundStyle}>
        <div className="max-w-6xl mx-auto p-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold" style={{ color: BLUE }}>
                Painel Administrativo
              </h1>
              <button
                onClick={() => setIsAdmin(false)}
                className="px-4 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                style={{ color: BLUE }}
              >
                Voltar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                guestList.length,
                getTotalGuests(),
                guestList.length > 0 ? (getTotalGuests() / guestList.length).toFixed(1) : 0,
              ].map((value, index) => (
                <div key={index} className="p-6 rounded-xl border" style={{ borderColor: GRAY }}>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700">
                    {['Total de Confirmações', 'Total de Convidados', 'Média por Confirmação'][index]}
                  </h3>
                  <p className="text-3xl font-bold" style={{ color: BLUE }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: GRAY }}>
                    {['Nome', 'Email', 'Convidados', 'Data', 'Ações'].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-sm font-medium uppercase tracking-wider"
                        style={{ color: BLUE }}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {guestList.map((guest) => (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{guest.name}</td>
                      <td className="px-6 py-4">{guest.email}</td>
                      <td className="px-6 py-4">{guest.guests}</td>
                      <td className="px-6 py-4">
                        {new Date(guest.confirmation_date).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteGuest(guest.id)}
                          className="p-2 hover:bg-red-50 rounded-lg"
                          style={{ color: GRAY }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showAdminLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md w-full">
          <div className="text-center mb-8">
            <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: BLUE }} />
            <h2 className="text-2xl font-bold" style={{ color: BLUE }}>
              Acesso Administrativo
            </h2>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
                style={{ borderColor: GRAY }}
                placeholder="Digite a senha"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setShowAdminLogin(false)}
                className="flex-1 px-4 py-2 border rounded-lg font-medium"
                style={{ borderColor: BLUE, color: BLUE }}
              >
                Voltar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg font-medium text-white"
                style={{ backgroundColor: BLUE }}
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (confirmed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <PartyPopper className="w-16 h-16 mx-auto mb-4" style={{ color: GRAY }} />
          <h2 className="text-2xl font-bold mb-4" style={{ color: BLUE }}>
            Presença Confirmada!
          </h2>
          <p className="text-gray-700 mb-8">Obrigado, {name}! Sua confirmação foi recebida.</p>
          <button
            onClick={() => setShowAdminLogin(true)}
            className="text-sm font-medium hover:underline"
            style={{ color: BLUE }}
          >
            Acesso Administrativo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={backgroundStyle}>
      <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8" style={{ color: BLUE }}>
          Confirmação de Presença
        </h1>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5" style={{ color: YELLOW }} />
            <span className="text-gray-700">15 de Junho de 2024</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5" style={{ color: YELLOW }} />
            <span className="text-gray-700">Salão de Festas Elegance</span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" style={{ color: YELLOW }} />
            <span className="text-gray-700">19:00h</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: GRAY }}
              placeholder="Nome Completo"
            />
          </div>

          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: GRAY }}
              placeholder="E-mail"
            />
          </div>

          <div>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
              style={{ borderColor: GRAY }}
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'pessoa' : 'pessoas'}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: BLUE }}
          >
            Confirmar Presença
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setShowAdminLogin(true)}
            className="text-sm font-medium hover:underline"
            style={{ color: BLUE }}
          >
            Acesso Administrativo
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;