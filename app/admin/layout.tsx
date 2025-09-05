"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import axiosInstance from "@/utils/axios";
import { useToast } from "@/hooks/use-toast";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/SidebarMenu";
import {
  MdHome,
  MdAccountBalance,
  MdPerson,
  MdCategory,
  MdMenuBook,
  MdNotifications,
  MdSettings,
  MdSchool,
  MdPeople,
  MdAttachMoney,
  MdShoppingCart,
  MdToken,
  MdStore,
  MdStar,
  MdCardGiftcard,
  MdExitToApp,
  MdLock,
  MdSupervisorAccount,
  MdDashboard,
  MdAnnouncement,
  MdPayment,
  MdShoppingBag,
  MdRedeem,
  MdGroup,
  MdAssignment,
  MdList,
  MdAdd,
  MdEdit,
  MdInfo,
  MdSearch,
  MdFavorite,
  MdVisibility,
  MdVisibilityOff,
  MdArrowForward,
  MdArrowBack,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await axiosInstance.get("/user/profile");
        setUserProfile(response?.data?.data);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch user profile",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [toast]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Close sidebar when clicking outside on mobile
      if (
        isSidebarOpen &&
        !target.closest("#app-drawer") &&
        !target.closest(".menu-hamburger")
      ) {
        setIsSidebarOpen(false);
      }

      if (
        !target.closest('[data-dropdown="notification"]') &&
        !target.closest('[data-dropdown-trigger="notification"]')
      ) {
        setIsNotificationOpen(false);
      }

      if (
        !target.closest('[data-dropdown="language"]') &&
        !target.closest('[data-dropdown-trigger="language"]')
      ) {
        setIsLanguageOpen(false);
      }

      if (
        !target.closest('[data-dropdown="profile"]') &&
        !target.closest('[data-dropdown-trigger="profile"]')
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  // Check for dark mode preference
  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);

    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const logOutUser = () => {
    Cookies.remove("token");
    router.push("/auth/login");
  };

  // Sidebar menu data structure
  const sidebarMenuData: SidebarMenuItem[] = [
    {
      label: "Dashboard",
      icon: <MdDashboard size={20} />,
      href: "/admin/dashboard",
      // children: [
      //   {
      //     label: "Admin",
      //     href: "/admin/dashboard",
      //     icon: <MdSupervisorAccount size={18} />,
      //   },
      // ],
    },
    {
      label: "Accounts Manage",
      icon: <MdAccountBalance size={20} />,
      children: [
        {
          label: "Create Expense",
          href: "/admin/accounts/create-expense",
          icon: <MdAdd size={18} />,
        },
        {
          label: "All Expense",
          href: "/admin/accounts/all-expense",
          icon: <MdList size={18} />,
        },
        {
          label: "All Income Sales",
          href: "/admin/accounts/all-income-sales",
          icon: <MdList size={18} />,
        },
      ],
    },
    {
      label: "User",
      icon: <MdPerson size={20} />,
      children: [
        {
          label: "All User",
          href: "/admin/user/all-user",
          icon: <MdList size={18} />,
        },
      ],
    },
    {
      label: "Course Category",
      icon: <MdCategory size={20} />,
      children: [
        {
          label: "All Course Category",
          href: "/admin/course-category/all-course-category",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Course Category",
          href: "/admin/course-category/create-course-category",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Course Manage",
      icon: <MdMenuBook size={20} />,
      children: [
        {
          label: "All Course List",
          href: "/admin/course/all-course",
          icon: <MdList size={18} />,
        },
        {
          label: "Create new Course",
          href: "/admin/course/create-course",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Module Manage",
      icon: <MdMenuBook size={20} />,
      children: [
        {
          label: "All Module List",
          href: "/admin/module/all-module",
          icon: <MdList size={18} />,
        },
        {
          label: "Create new Module",
          href: "/admin/module/create-module",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "University Manage",
      icon: <MdMenuBook size={20} />,
      children: [
        {
          label: "All University List",
          href: "/admin/university/all-university",
          icon: <MdList size={18} />,
        },
        {
          label: "Create new University",
          href: "/admin/university/create-university",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Notice Board",
      icon: <MdAnnouncement size={20} />,
      children: [
        {
          label: "All Notice",
          href: "/admin/notice/all-notice",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Notice",
          href: "/admin/notice/create-notice",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Admin Manage",
      icon: <MdSupervisorAccount size={20} />,
      children: [
        {
          label: "All Admin",
          href: "/admin/admin/all-admin",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Admin",
          href: "/admin/admin/create-admin",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Student Manage",
      icon: <MdPeople size={20} />,
      children: [
        {
          label: "Student List",
          href: "/admin/student/all-student",
          icon: <MdList size={18} />,
        },
        {
          label: "Offline Student List",
          href: "/admin/student/offline-student",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Student",
          href: "/admin/student/create-student",
          icon: <MdAdd size={18} />,
        },
        {
          label: "Attendence",
          href: "/admin/student/attendence",
          icon: <MdAssignment size={18} />,
        },
      ],
    },
    {
      label: "Enrollment Manage",
      icon: <MdAssignment size={20} />,
      children: [
        {
          label: "Enrollment List",
          href: "/admin/enrollment/all-enrollment",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Enrollment",
          href: "/admin/enrollment/create-enrollment",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Instructor Manage",
      icon: <MdSchool size={20} />,
      children: [
        {
          label: "Instructor List",
          href: "/admin/instructor/all-instructor",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Instructor",
          href: "/admin/instructor/create-instructor",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Blog Category Manage",
      icon: <MdCategory size={20} />,
      children: [
        {
          label: "Category List",
          href: "/admin/blog-category/all-blog-category",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Category",
          href: "/admin/blog-category/create-blog-category",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Blog Manage",
      icon: <MdMenuBook size={20} />,
      children: [
        {
          label: "Blog List",
          href: "/admin/blog/all-blog",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Blog",
          href: "/admin/blog/create-blog",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Payment Manage",
      icon: <MdPayment size={20} />,
      href: "/admin/payment/all-payment",
      // children: [
      //   {
      //     label: "Payment List",
      //     href: "/admin/payment/all-payment",
      //     icon: <MdList size={18} />,
      //   },
      // ],
    },
    {
      label: "Purchase Manage",
      icon: <MdShoppingCart size={20} />,
      href: "/admin/purchase/all-purchase",
      // children: [
      //   {
      //     label: "Purchase List",
      //     href: "/admin/purchase/all-purchase",
      //     icon: <MdList size={18} />,
      //   },
      // ],
    },
    {
      label: "Purchase Token Manage",
      icon: <MdToken size={20} />,
      children: [
        {
          label: "Purchase List",
          href: "/admin/purchase-token/all-purchase-token",
          icon: <MdList size={18} />,
        },
      ],
    },
    {
      label: "Book Category Manage",
      icon: <MdCategory size={20} />,
      children: [
        {
          label: "All Book Category",
          href: "/admin/product-category/all-product-category",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Book Category",
          href: "/admin/product-category/create-product-category",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Book Manage",
      icon: <MdShoppingBag size={20} />,
      children: [
        {
          label: "All Book",
          href: "/admin/product/all-product",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Book",
          href: "/admin/product/create-product",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Order Manage",
      icon: <MdShoppingCart size={20} />,
      children: [
        {
          label: "All Order",
          href: "/admin/order/all-order",
          icon: <MdList size={18} />,
        },
      ],
    },
    {
      label: "Shop Manager Manage",
      icon: <MdStore size={20} />,
      children: [
        {
          label: "All Shop Manager",
          href: "/admin/shop-manager/all-shop-manager",
          icon: <MdList size={18} />,
        },
        {
          label: "Create Shop Manager",
          href: "/admin/shop-manager/create-shop-manager",
          icon: <MdAdd size={18} />,
        },
      ],
    },
    {
      label: "Referral Manage",
      icon: <MdGroup size={20} />,
      children: [
        {
          label: "All Referral",
          href: "/admin/referral/all-referral",
          icon: <MdList size={18} />,
        },
      ],
    },
    {
      label: "Reward Manage",
      icon: <MdCardGiftcard size={20} />,
      children: [
        {
          label: "All Reward",
          href: "/admin/reward/all-reward",
          icon: <MdList size={18} />,
        },
      ],
    },
    {
      label: "Withdraw Manage",
      icon: <MdRedeem size={20} />,
      children: [
        {
          label: "All Withdraw",
          href: "/admin/withdraw/all-withdraw",
          icon: <MdList size={18} />,
        },
      ],
    },
  ];

  //Sidebar teacher menu data structure
  const sidebarTeacherMenuData: SidebarMenuItem[] = [
    {
      label: "Course Manage",
      icon: <MdMenuBook size={20} />,
      children: [
        {
          label: "Course",
          icon: <MdSchool size={18} />,
          children: [
            {
              label: "All Course List",
              href: "/admin/course/all-course",
              icon: <MdList size={18} />,
            },
          ],
        },
      ],
    },
  ];

  //Sidebar shop manager menu data structure
  const sidebarShopManagerMenuData: SidebarMenuItem[] = [
    {
      label: "Shop Manager Manage",
      icon: <MdStore size={20} />,
      children: [
        {
          label: "All Shop Manager",
          href: "/admin/shop-manager/all-shop-manager",
          icon: <MdList size={18} />,
        },
      ],
    },
  ];

  return (
    <body className="bg-body-light dark:bg-dark-body group-data-[theme-width=box]:container group-data-[theme-width=box]:max-w-screen-3xl xl:group-data-[theme-width=box]:px-4">
      {/* <!-- Start Header --> */}
      <header className="header px-4 sm:px-6 h-[calc(theme('spacing.header')_-_10px)] sm:h-header bg-white dark:bg-dark-card rounded-none xl:rounded-15 flex items-center mb-4 xl:m-4 group-data-[sidebar-size=lg]:xl:ml-[calc(theme('spacing.app-menu')_+_32px)] group-data-[sidebar-size=sm]:xl:ml-[calc(theme('spacing.app-menu-sm')_+_32px)] group-data-[sidebar-size=sm]:group-data-[theme-width=box]:xl:ml-[calc(theme('spacing.app-menu-sm')_+_16px)] group-data-[theme-width=box]:xl:ml-[calc(theme('spacing.app-menu')_+_16px)] group-data-[theme-width=box]:xl:mr-0 dk-theme-card-square ac-transition">
        <div className="flex-center-between grow">
          {/* <!-- Header Left --> */}
          <div className="menu-hamburger-container flex-center">
            <button
              type="button"
              id="app-menu-hamburger"
              className="menu-hamburger hidden xl:block dk-theme-card-square"
              onClick={toggleSidebar}
            ></button>
            <button
              type="button"
              className="menu-hamburger block xl:hidden dk-theme-card-square"
              onClick={toggleSidebar}
              aria-controls="app-drawer"
            ></button>
          </div>
          {/* <!-- Header Right --> */}
          <div className="flex items-center gap-5 md:gap-3">
            <div className="w-56 md:w-72 leading-none text-sm relative text-gray-900 dark:text-dark-text hidden sm:block">
              <span className="absolute top-1/2 -translate-y-[40%] left-3.5">
                <i className="ri-search-line text-gray-900 dark:text-dark-text text-[14px]"></i>
              </span>
              <input
                type="text"
                name="header-search"
                id="header-search"
                placeholder="Search..."
                className="form-input border-gray-200 dark:border-dark-border pl-[36px] pr-12 py-4 rounded-full dk-theme-card-square"
              />
              <span className="absolute top-1/2 -translate-y-[40%] right-4 hidden lg:flex lg:items-center lg:gap-0.5 select-none">
                <i className="ri-command-line text-[12px]"></i>
                <span>+</span>
                <span>k</span>
              </span>
            </div>
            {/* <!-- Dark Light Button --> */}
            <button
              type="button"
              className="themeMode size-8 hidden md:flex-center hover:bg-gray-200 dark:hover:bg-dark-icon rounded-md dk-theme-card-square"
              onClick={toggleDarkMode}
            >
              <i className="ri-contrast-2-line text-[22px] group-[.dark]:before:!content-['\f1bf']"></i>
            </button>
            {/* <!-- Settings Button --> */}
            <button
              type="button"
              className="size-8 hidden md:flex-center hover:bg-gray-200 dark:hover:bg-dark-icon rounded-md dk-theme-card-square"
              onClick={() => {
                // Toggle settings drawer
              }}
            >
              <i className="ri-settings-3-line text-[22px] animate-spin-slow"></i>
            </button>
            {/* <!-- Notification Button --> */}
            <div className="relative">
              <button
                type="button"
                data-dropdown-trigger="notification"
                className="relative size-8 flex-center hover:bg-gray-200 dark:hover:bg-dark-icon rounded-md dk-theme-card-square"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              >
                <i className="ri-notification-3-line text-[24px]"></i>
                <span className="absolute -top-1 -right-1 size-4 rounded-50 flex-center bg-primary-500 leading-none text-xs text-white">
                  0
                </span>
              </button>
              {/* <!-- Dropdown menu --> */}
              {isNotificationOpen && (
                <div
                  data-dropdown="notification"
                  className="absolute right-0 top-full mt-2 z-backdrop w-[250px] sm:w-[320px] bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-dark-card-two dark:divide-dark-border-four dk-theme-card-square"
                >
                  <div className="block px-4 py-2 font-medium text-center text-heading rounded-t-lg bg-gray-50 dark:bg-dark-card-shade dark:text-white dk-theme-card-square">
                    Notifications
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-dark-border-four">
                    <a
                      href="all-notice.html"
                      className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-icon"
                    >
                      <div className="flex-shrink-0">
                        <img
                          className="size-10 rounded-50 dk-theme-card-square"
                          src="/assets/images/user/user-1.png"
                          alt="user"
                        />
                      </div>
                      <div className="w-full ps-3">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1.5">
                          New message from{" "}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Jese Leos
                          </span>
                          : "Hey, what's up? All set for the presentation?"
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">
                          a few moments ago
                        </div>
                      </div>
                    </a>
                    <a
                      href="all-notice.html"
                      className="flex px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-icon"
                    >
                      <div className="flex-shrink-0">
                        <img
                          className="size-10 rounded-50 dk-theme-card-square"
                          src="/assets/images/user/user-2.png"
                          alt="user"
                        />
                      </div>
                      <div className="w-full ps-3">
                        <div className="text-gray-500 dark:text-gray-400 text-sm mb-1.5">
                          New message from{" "}
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Jese Leos
                          </span>
                          : "Hey, what's up? All set for the presentation?"
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">
                          10 min ago
                        </div>
                      </div>
                    </a>
                  </div>
                  <a
                    href="all-notice.html"
                    className="flex-center py-2 text-sm font-medium text-center text-heading rounded-b-lg bg-gray-50 dark:bg-dark-card-shade dark:text-white dk-theme-card-square"
                  >
                    View all
                  </a>
                </div>
              )}
            </div>
            {/* <!-- Language Select Button --> */}
            {/* <div className="relative hidden md:block">
              <button
                type="button"
                data-dropdown-trigger="language"
                className="size-8 flex-center hover:bg-gray-200 dark:hover:bg-dark-icon rounded-md dk-theme-card-square"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
              >
                <img
                  id="header-lang-img"
                  src="/assets/images/flag/us.svg"
                  alt="flag"
                  className="size-5 rounded-sm"
                  title="English"
                />
              </button> */}
            {/* <!-- Dropdown --> */}
            {/* {isLanguageOpen && (
                <div
                  data-dropdown="language"
                  className="absolute z-backdrop py-2 bg-white rounded-md shadow-md min-w-[10rem] flex flex-col dark:bg-dark-card-shade dk-theme-card-square"
                >
                  <a
                    href="#"
                    className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2 dark:hover:bg-dark-icon relative after:absolute after:inset-0 after:size-full"
                    data-lang="en"
                    title="English"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    <img
                      src="/assets/images/flag/us.svg"
                      alt="flag"
                      className="object-cover size-4 rounded-50 dk-theme-card-square"
                    />
                    <h6 className="font-medium text-gray-500 dark:text-white">
                      English
                    </h6>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2 dark:hover:bg-dark-icon relative after:absolute after:inset-0 after:size-full"
                    data-lang="sp"
                    title="Spanish"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    <img
                      src="/assets/images/flag/es.svg"
                      alt="flag"
                      className="object-cover size-4 rounded-50 dk-theme-card-square"
                    />
                    <h6 className="font-medium text-gray-500 dark:text-white">
                      Spanish
                    </h6>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2 dark:hover:bg-dark-icon relative after:absolute after:inset-0 after:size-full"
                    data-lang="fr"
                    title="French"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    <img
                      src="/assets/images/flag/fr.svg"
                      alt="flag"
                      className="object-cover size-4 rounded-50 dk-theme-card-square"
                    />
                    <h6 className="font-medium text-gray-500 dark:text-white">
                      French
                    </h6>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2 dark:hover:bg-dark-icon relative after:absolute after:inset-0 after:size-full"
                    data-lang="it"
                    title="Italian"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    <img
                      src="/assets/images/flag/it.svg"
                      alt="flag"
                      className="object-cover size-4 rounded-50 dk-theme-card-square"
                    />
                    <h6 className="font-medium text-gray-500 dark:text-white">
                      Italian
                    </h6>
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 hover:bg-gray-200 px-4 py-2 dark:hover:bg-dark-icon relative after:absolute after:inset-0 after:size-full"
                    data-lang="ar"
                    title="Arabic"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    <img
                      src="/assets/images/flag/ar.svg"
                      alt="flag"
                      className="object-cover size-4 rounded-50 dk-theme-card-square"
                    />
                    <h6 className="font-medium text-gray-500 dark:text-white">
                      Arabic
                    </h6>
                  </a>
                </div>
              )}
            </div> */}
            {/* <!-- Border --> */}
            <div className="w-[1px] h-header bg-gray-200 dark:bg-dark-border hidden sm:block"></div>
            {/* <!-- User Profile Button --> */}
            <div className="relative">
              <button
                type="button"
                data-dropdown-trigger="profile"
                className="flex items-center"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  src={
                    userProfile?.profile_picture ||
                    "/assets/images/user/profile-img.png"
                  }
                  alt="user-img"
                  className="size-9 rounded-50 dk-theme-card-square"
                />
              </button>
              {/* <!-- Dropdown menu --> */}
              {isProfileOpen && (
                <div
                  data-dropdown="profile"
                  className="absolute right-0 z-backdrop bg-white text-left divide-y divide-gray-100 rounded-lg shadow w-48 dark:bg-dark-card-shade dark:divide-dark-border-four dk-theme-card-square"
                >
                  <div className="px-4 py-3 text-sm text-gray-500 dark:text-white">
                    <div className="card-title text-lg">
                      {userProfile?.name || "Loading..."}
                    </div>
                    <div className="truncate">
                      {userProfile?.phone || "Loading..."}
                    </div>
                    <div className="text-xs mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          userProfile?.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userProfile?.status || "Loading..."}
                      </span>
                    </div>
                  </div>
                  <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                    <li>
                      <Link
                        href="/admin/dashboard"
                        className="flex font-medium px-4 py-2 hover:bg-gray-200 dark:hover:bg-dark-icon dark:hover:text-white"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/admin/settings"
                        className="flex font-medium px-4 py-2 hover:bg-gray-200 dark:hover:bg-dark-icon dark:hover:text-white"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        Settings
                      </Link>
                    </li>
                  </ul>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        logOutUser();
                      }}
                      className="flex w-full font-medium px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:hover:bg-dark-icon dark:text-gray-200 dark:hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {/* <!-- End Header --> */}

      {/* <!-- Start App Menu --> */}
      <div
        id="app-drawer"
        className={`app-menu flex flex-col bg-white dark:bg-dark-card w-app-menu fixed top-0 left-0 bottom-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } group-data-[sidebar-size=sm]:min-h-screen group-data-[sidebar-size=sm]:h-max border-r-2 border-primary-400 xl:border-none xl:translate-x-0 rounded-r-15 xl:rounded-15 xl:group-data-[sidebar-size=lg]:w-app-menu xl:group-data-[sidebar-size=sm]:w-app-menu-sm xl:group-data-[sidebar-size=sm]:absolute xl:group-data-[sidebar-size=lg]:fixed xl:top-4 xl:left-4 xl:group-data-[sidebar-size=lg]:bottom-4 xl:group-data-[theme-width=box]:left-auto dk-theme-card-square z-backdrop ac-transition`}
        tabIndex={-1}
      >
        <div className="px-6 group-data-[sidebar-size=sm]:px-4 h-header flex items-center shrink-0 group-data-[sidebar-size=sm]:justify-center">
          <Link
            href="/admin/dashboard"
            className="group-data-[sidebar-size=lg]:block hidden"
          >
            <Image
              src="/assets/icons/logo.svg"
              alt="logo"
              width={80}
              height={40}
              priority
              className="group-[.dark]:hidden"
            />  
            <Image
              src="/assets/icons/logo.svg"
              alt="logo"
              width={80}
              height={40}
              priority
              className="group-[.light]:hidden"
            />
          </Link>
          <Link
            href="/admin/dashboard"
            className="group-data-[sidebar-size=lg]:hidden block"
          >
            <Image
              src="/assets/icons/logo.svg"
              alt="logo"
              width={40}
              height={40}
              priority
            />
          </Link>
        </div>
        <div
          id="app-menu-scrollbar"
          data-scrollbar
          className="px-2.5 group-data-[sidebar-size=sm]:px-0 group-data-[sidebar-size=sm]:!overflow-visible !overflow-x-hidden smooth-scrollbar"
        >
          <div className="group-data-[sidebar-size=lg]:max-h-full">
            {/* Render SidebarMenu using the new data structure */}
            {userProfile &&
              (userProfile.role === "admin" ||
                userProfile.role === "superAdmin") &&
              sidebarMenuData.map((item, idx) => (
                <SidebarMenu key={item.label + idx} item={item} />
              ))}
            {userProfile &&
              userProfile.role === "teacher" &&
              sidebarTeacherMenuData.map((item, idx) => (
                <SidebarMenu key={item.label + idx} item={item} />
              ))}
            {userProfile &&
              userProfile.role === "shopManager" &&
              sidebarShopManagerMenuData.map((item, idx) => (
                <SidebarMenu key={item.label + idx} item={item} />
              ))}
          </div>
        </div>
        {/* <!-- Logout Link --> */}
        <div className="mt-auto px-2.5 py-6 group-data-[sidebar-size=sm]:px-2">
          <a
            onClick={() => logOutUser()}
            className="flex-center-between text-gray-500 font-semibold leading-none bg-gray-200 dark:bg-dark-icon dark:text-dark-text rounded-[10px] px-6 py-4 group-data-[sidebar-size=sm]:p-[12px_8px] group-data-[sidebar-size=sm]:justify-center dk-theme-card-square cursor-pointer"
          >
            <span className="group-data-[sidebar-size=sm]:hidden block">
              Logout
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
            >
              <path fill="currentColor" d="M5 5h7V3H3v18h9v-2H5z" />
              <path fill="currentColor" d="m21 12l-4-4v3H9v2h8v3z" />
            </svg>
          </a>
        </div>
      </div>
      {/* <!-- End App Menu --> */}

      {/* <!-- Start Main Content --> */}
      <div className="main-content group-data-[sidebar-size=lg]:xl:ml-[calc(theme('spacing.app-menu')_+_16px)] group-data-[sidebar-size=sm]:xl:ml-[calc(theme('spacing.app-menu-sm')_+_16px)] px-4 group-data-[theme-width=box]:xl:px-0 ac-transition">
        {children}
      </div>
      {/* <!-- End Main Content --> */}
      <Script src="/assets/js/vendor/jquery.min.js"></Script>

      {/* <Script src="/assets/js/vendor/apexcharts.min.js"></Script> */}
      <Script src="/assets/js/vendor/flowbite.min.js"></Script>
      <Script src="/assets/js/vendor/smooth-scrollbar/smooth-scrollbar.min.js"></Script>
      <Script src="/assets/js/pages/dashboard-admin-lms.js"></Script>
      <Script src="/assets/js/component/app-menu-bar.js"></Script>
      <Script src="/assets/js/switcher.js"></Script>
      <Script src="/assets/js/layout.js"></Script>
      <Script src="/assets/js/main.js"></Script>
    </body>
  );
}
