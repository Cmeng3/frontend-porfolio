"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminRequest } from "@/services/admin";
import { LoginPanel } from "./login-panel";

export function AdminLogin() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    // The public sign-in form must not depend on a working session/API.
    void adminRequest("me").then(
      () => {
        if (active) router.replace("/admin");
      },
      () => {
        // Guests and unavailable sessions stay on the usable sign-in form.
      },
    );
    return () => {
      active = false;
    };
  }, [router]);

  return <LoginPanel onLogin={() => router.replace("/admin")} />;
}
