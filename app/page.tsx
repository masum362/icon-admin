"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const HomePage = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /login if someone visits the base URL
    router.push("/auth/login");
  }, [router]);

  return (
    <body>
      <div
        id="loader"
        className="w-screen h-screen flex-center bg-white dark:bg-dark-card fixed inset-0 z-[9999]"
      >
        <img src="/assets/images/loader.gif" alt="loader" />
      </div>
    </body>
  ); // You can also return a loading spinner or similar until the redirection happens
};

export default HomePage;
