'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Clock, ExternalLink, Sparkles, Calendar, CheckCircle2 } from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Connecté avec le compte candidat démo
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'candidat@tunijobs.tn', password: 'Tunisia2026!' }),
      });

      if (loginRes.ok) {
        const { accessToken } = await loginRes.json();
        const res = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      }
    } catch (err) {
      console.error('Erreur chargement notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [API_URL]);

  const handleMarkAllRead = async () => {
    try {
      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'candidat@tunijobs.tn', password: 'Tunisia2026!' }),
      });

      if (loginRes.ok) {
        const { accessToken } = await loginRes.json();
        await fetch(`${API_URL}/notifications/read-all`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        await loadNotifications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <div className="flex items-center justify-between pb-6 border-b mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            Centre de notifications
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historique des alertes en temps réel générées par vos candidatures et les recruteurs.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 px-3 py-1.5 border rounded-lg hover:bg-blue-50 transition"
          >
            <CheckCheck className="w-4 h-4" />
            Tout marquer comme lu
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="animate-spin w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-xs">Chargement des notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <Bell className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-slate-800 text-sm">Aucune notification pour le moment</p>
          <p className="text-xs text-slate-500 mt-1">
            Vous recevrez ici les réponses des recruteurs et les changements d'état de vos candidatures.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition ${
                notif.isRead
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50/50 border-blue-200 shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                    {notif.title.includes('entretien') ? (
                      <Calendar className="w-4 h-4" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-2 block">
                      {new Date(notif.createdAt).toLocaleString('fr-TN')}
                    </span>
                  </div>
                </div>

                {notif.link && (
                  <Link
                    href={notif.link}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition shrink-0"
                    title="Voir le détail"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
