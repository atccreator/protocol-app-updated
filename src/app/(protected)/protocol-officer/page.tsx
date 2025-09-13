'use client';

import { useRBAC } from '@/contexts/auth-context';
import React from 'react';

export default function ProtocolOfficerComponent()  {
    const { user, isAdmin, isProtocolOfficer, isProtocolIncharge } = useRBAC();

    return (
        <div>
        <h1>I am Protocol officer</h1>
        </div>
    );
}