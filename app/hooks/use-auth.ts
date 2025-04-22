import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabase";

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) throw userError;
      
      if (user) {
        setUserEmail(user.email ?? null);
        
        const { data, error: roleError } = await supabase
          .from("users")
          .select("role")
          .eq("email", user.email)
          .single();
        
        if (roleError) throw roleError;
        
        if (data?.role === "admin") {
          setIsAdmin(true);
        }
      }
      setError(null);
    } catch (err) {
      console.error("Auth check failed:", err);
      setError("Authentication check failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, [checkAuth]);

  const handleSignIn = useCallback(async (email?: string, password?: string) => {
    try {
      let userEmail = email;
      let userPassword = password;
      
      if (!userEmail) {
        userEmail = prompt("Enter your email") ?? undefined;
      }
      if (!userEmail) return;
      
      if (!userPassword) {
        userPassword = prompt("Enter your password") ?? undefined;
      }
      if (!userPassword) return;
      
      setLoading(true);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({ 
        email: userEmail, 
        password: userPassword 
      });
      
      if (signInError) throw signInError;
      
      setError(null);
    } catch (err) {
      console.error("Login failed:", err);
      setError("Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      
      if (signOutError) throw signOutError;
      
      setUserEmail(null);
      setIsAdmin(false);
      setError(null);
    } catch (err) {
      console.error("Logout failed:", err);
      setError("Logout failed");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    isAdmin,
    userEmail,
    handleSignIn,
    handleSignOut,
    loading,
    error
  };
}
