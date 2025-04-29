import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { getAuthToken } from "@/utils/auth";

export const useAuth = () => {
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (!token) {
        router.push("/auth");
      }
      tokenRef.current = token;
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const redirectToAuth = useCallback(() => {
    router.push("/auth");
  }, []);

  const redirectToHome = useCallback(() => {
    router.push("/");
  }, []);

  return {
    token: tokenRef.current,
    isAuthenticated: !tokenRef.current,
    redirectToAuth,
    redirectToHome
  };
};
