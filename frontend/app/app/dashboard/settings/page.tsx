'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/useAuth';
import { ProtectedButton } from '@/components/dashboard/ProtectedButton';
import { ProtectedContent } from '@/components/dashboard/ProtectedContent';
import { OSLayout } from '@/components/dashboard/OSLayout';
import { Save, Lock, Users, CreditCard, Bell, Shield, Trash2, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { canManageTeam, canManageBilling } from '@/lib/auth/rbac';

interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  company_name?: string;
  phone?: string;
  avatar_url?: string;
}

interface TeamMember {
  id: string;
  email: string;
  role: 'viewer' | 'editor' | 'admin' | 'owner';
  joined_at: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'viewer' | 'editor' | 'admin'>('viewer');
  const { user, team, role } = useAuth();
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user, team]);

  const loadSettings = async () => {
    try {
      setLoading(true);

      // Get user profile (from auth metadata)
      if (user) {
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          company_name: user.user_metadata?.company_name || '',
          phone: user.user_metadata?.phone || '',
        });
      }

      // Get team members (only if admin/owner)
      if (team?.teamId && canManageTeam(role)) {
        const { data: membersData, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', team.teamId)
          .order('joined_at', { ascending: false });

        if (!error && membersData) {
          setTeamMembers(membersData as TeamMember[]);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      setSaving(true);

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: profile.full_name,
          company_name: profile.company_name,
          phone: profile.phone,
        },
      });

      if (error) throw error;

      alert('Profiili päivitetty!');
      loadSettings();
    } catch (error: any) {
      console.error('Error saving profile:', error);
      alert('Virhe profiilin tallentamisessa: ' + (error.message || 'Tuntematon virhe'));
    } finally {
      setSaving(false);
    }
  };

  const handleAddTeamMember = async () => {
    if (!newMemberEmail || !team?.teamId) return;

    try {
      setSaving(true);

      // For now, just show a message (actual invite would call API)
      alert('Jäsenkutsu -ominaisuus tulossa pian. Ota yhteyttä admin@converto.fi');

      // TODO: Call /api/team/invite endpoint
      // const response = await fetch('/api/team/invite', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     email: newMemberEmail,
      //     role: newMemberRole,
      //   }),
      // });

      setNewMemberEmail('');
      loadSettings();
    } catch (error: any) {
      console.error('Error adding team member:', error);
      alert('Virhe jäsenen lisäämisessä: ' + (error.message || 'Tuntematon virhe'));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveTeamMember = async (memberId: string) => {
    if (!confirm('Oletko varma että haluat poistaa tämän jäsenen?')) return;

    try {
      const { error } = await supabase.from('team_members').delete().eq('id', memberId);

      if (error) throw error;

      loadSettings();
      alert('Jäsen poistettu!');
    } catch (error: any) {
      console.error('Error removing team member:', error);
      alert('Virhe jäsenen poistamisessa: ' + (error.message || 'Tuntematon virhe'));
    }
  };

  const handleChangePassword = async () => {
    const newPassword = prompt('Syötä uusi salasana (vähintään 6 merkkiä):');
    if (!newPassword || newPassword.length < 6) {
      alert('Salasanan tulee olla vähintään 6 merkkiä');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      alert('Salasana vaihdettu!');
    } catch (error: any) {
      console.error('Error changing password:', error);
      alert('Virhe salasanan vaihtamisessa: ' + (error.message || 'Tuntematon virhe'));
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/app/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <OSLayout currentPath="/app/dashboard/settings">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Ladataan asetuksia...</p>
        </div>
      </OSLayout>
    );
  }

  return (
    <OSLayout currentPath="/app/dashboard/settings">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Asetukset</h1>
          <p className="text-gray-600 dark:text-gray-400">Hallinnoi profiiliasi ja tiimia</p>
        </div>

        {/* Välilehdet */}
        <div className="flex gap-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
          {[
            { id: 'profile', label: 'Profiili', icon: '👤', protected: false },
            { id: 'team', label: 'Tiimi', icon: '👥', protected: true },
            { id: 'billing', label: 'Laskutus', icon: '💳', protected: true },
            { id: 'security', label: 'Turvallisuus', icon: '🔒', protected: false },
          ].map((tab) => {
            const isProtected = tab.protected && !canManageTeam(role);
            return (
              <button
                key={tab.id}
                onClick={() => !isProtected && setActiveTab(tab.id)}
                disabled={isProtected}
                className={`px-4 py-3 font-semibold border-b-2 transition whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                } ${isProtected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {tab.icon} {tab.label}
              </button>
            );
          })}
        </div>

        {/* Sisältö */}
        <div className="max-w-4xl">
          {/* PROFIILI */}
          {activeTab === 'profile' && profile && (
            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Henkilökohtaiset tiedot</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Sähköposti
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg dark:bg-gray-900 opacity-50 cursor-not-allowed text-gray-600 dark:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1">Sähköpostia ei voi muuttaa</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Nimi</label>
                    <input
                      type="text"
                      value={profile.full_name || ''}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Yritys
                    </label>
                    <input
                      type="text"
                      value={profile.company_name || ''}
                      onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                      Puhelinnumero
                    </label>
                    <input
                      type="tel"
                      value={profile.phone || ''}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                  >
                    <Save size={18} />
                    <span>{saving ? 'Tallennetaan...' : 'Tallenna'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TIIMI */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Tiimin jäsenet</h2>
                <div className="space-y-4 mb-6">
                  {teamMembers.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">Ei tiimin jäseniä vielä</p>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-800"
                      >
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{member.email}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Rooli: <span className="font-semibold">{member.role}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Liittynyt: {new Date(member.joined_at).toLocaleDateString('fi-FI')}
                          </p>
                        </div>
                        <ProtectedButton
                          permission="manage:team"
                          onClick={() => handleRemoveTeamMember(member.id)}
                          className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400 transition-colors"
                          fallback={null}
                        >
                          <Trash2 size={18} />
                        </ProtectedButton>
                      </div>
                    ))
                  )}
                </div>
                <ProtectedContent permission="manage:team">
                  <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                    <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">Lisää uusi jäsen</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          Sähköposti
                        </label>
                        <input
                          type="email"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          placeholder="uusi@example.com"
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                          Rooli
                        </label>
                        <select
                          value={newMemberRole}
                          onChange={(e) => setNewMemberRole(e.target.value as any)}
                          className="w-full px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg dark:bg-gray-900 text-gray-900 dark:text-white"
                        >
                          <option value="viewer">Katselija (vain luku)</option>
                          <option value="editor">Muokkaja (luku + kirjoitus)</option>
                          <option value="admin">Admin (kaikki oikeudet)</option>
                        </select>
                      </div>
                      <button
                        onClick={handleAddTeamMember}
                        disabled={saving || !newMemberEmail}
                        className="w-full px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        {saving ? 'Lähetetään...' : '+ Lisää jäsen'}
                      </button>
                    </div>
                  </div>
                </ProtectedContent>
              </div>
            </div>
          )}

          {/* LASKUTUS */}
          {activeTab === 'billing' && (
            <ProtectedContent
              permission="manage:billing"
              fallback={
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                  <p className="text-gray-600 dark:text-gray-400">
                    Laskutustiedot ovat saatavilla vain admin/owner -roolille.
                  </p>
                </div>
              }
            >
              <div className="space-y-6">
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Laskutustieto</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Nykyinen paketti</p>
                      <p className="text-2xl font-bold text-green-600 capitalize">{team?.teamId ? 'Pro' : 'Starter'}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Hinta</p>
                      <p className="text-2xl font-bold text-blue-600">99€/kk</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                      <p className="text-2xl font-bold text-purple-600 capitalize">Active</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-800">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Seuraava laskutus</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('fi-FI')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <button className="w-full px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 font-semibold text-gray-900 dark:text-white transition-colors">
                      Muuta pakettia
                    </button>
                    <button className="w-full px-6 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 font-semibold text-gray-900 dark:text-white transition-colors">
                      Hallinnoi maksutapaa
                    </button>
                    <button className="w-full px-6 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold transition-colors">
                      Peruuta tilaus
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                  <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Laskutushistoria</h2>
                  <p className="text-gray-600 dark:text-gray-400">Laskut ja maksuhistoria näkyvät täällä</p>
                </div>
              </div>
            </ProtectedContent>
          )}

          {/* TURVALLISUUS */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Lock size={24} />
                  Salasana
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Vaihda salasanasi säännöllisesti</p>
                <button
                  onClick={handleChangePassword}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Vaihda salasana
                </button>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <Shield size={24} />
                  Kaksivaiheinen tunnistus
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Paranna turvallisuutta kaksivaiheisella tunnistuksella
                </p>
                <button className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                  Ota käyttöön (tulossa pian)
                </button>
              </div>
              <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-white dark:bg-gray-800">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                  <LogOut size={24} />
                  Kirjaudu ulos
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Kirjaudu ulos kaikista istunnoista</p>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Kirjaudu ulos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </OSLayout>
  );
}
