"use client";

// If an owner login link lands on any page other than /admin (for example the Home page),
// send it on to /admin so the login is not lost.

import { useEffect } from "react";

export default function AuthRedirect() {
  useEffect(() => {
    const { pathname, hash, search } = window.location;
    if (pathname === "/admin") return;
    const isLogin = /(^|[#&])(access_token|error_description)=/.test(hash) || /[?&](code|token_hash)=/.test(search);
    if (isLogin) window.location.replace(`/admin${search}${hash}`);
  }, []);
  return null;
}
