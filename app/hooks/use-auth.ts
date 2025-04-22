import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export function useAuth() {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email);
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("email", user.email)
          .single();
        
        if (!error && data?.role === "admin") {
          setIsAdmin(true);
        }
      }
    };

    checkAuth();
  }, []);

  const handleSignIn = async () => {
    const email = prompt("Enter your email") ?? "";
    const password = prompt("Enter your password") ?? "";
    
    const { error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });
    
    if (error) alert("Login failed");
    else location.reload();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    location.reload();
  };

  return {
    isAdmin,
    userEmail,
    handleSignIn,
    handleSignOut
  };
}
