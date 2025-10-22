import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'admin' | 'moderator' | 'user';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    console.log('useUserRole useEffect - user:', user);
    if (user) {
      fetchUserRoles();
    } else {
      setRoles([]);
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      setLoading(true);
      console.log('Fetching roles for user:', user.id);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      console.log('User roles query result:', { data, error });

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      const userRoles = data?.map(row => row.role) || [];
      console.log('User roles:', userRoles);
      setRoles(userRoles);
      setIsAdmin(userRoles.includes('admin'));
      console.log('Is admin:', userRoles.includes('admin'));
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return roles.includes(role);
  };

  return {
    roles,
    isAdmin,
    loading,
    hasRole,
    refreshRoles: fetchUserRoles
  };
};