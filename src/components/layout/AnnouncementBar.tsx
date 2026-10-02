'use client';

import React from 'react';

export const AnnouncementBar: React.FC = () => {
  return (
    <div className="w-full bg-surface-container border-b border-outline-variant py-2.5 px-4 text-center">
      <p className="font-subhead-eyebrow text-subhead-eyebrow text-secondary uppercase tracking-[0.22em]">
        COMPLIMENTARY EXPRESS WORLDWIDE SHIPPING ON ORDERS ABOVE ₹10,000
      </p>
    </div>
  );
};
