// src/app/admin/dashboard/page.jsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  CreditCard,
  FileText,
  BarChart2,
  // Other imports...
} from 'lucide-react';
import { useAuth } from '@/providers/auth';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    // Your state initialization
  });
  const [activeTab, setActiveTab] = useState('overview');

  // Simplified useEffect - no need to check admin status
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Your data fetching logic
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component remains the same
}