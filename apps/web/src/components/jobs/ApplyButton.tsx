'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { ApplyModal } from './ApplyModal';

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export function ApplyButton({ jobId, jobTitle, companyName }: ApplyButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [applied, setApplied] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        disabled={applied}
        className={`px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition flex items-center gap-2 ${
          applied
            ? 'bg-emerald-600 text-white cursor-default'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        }`}
      >
        <Send className="w-4 h-4" />
        {applied ? 'Candidature transmise ✓' : 'Postuler en 1 clic'}
      </button>

      <ApplyModal
        jobId={jobId}
        jobTitle={jobTitle}
        companyName={companyName}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => setApplied(true)}
      />
    </>
  );
}
