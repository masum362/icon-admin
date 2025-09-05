import Image from "next/image";
import Link from "next/link";
import React from "react";

const ForgotPass = () => {
  return (
    <div>
      <div className="main-content m-4">
        <div className="grid grid-cols-12 gap-y-7 sm:gap-7 card px-4 sm:px-10 2xl:px-[70px] py-15 lg:items-center lg:min-h-[calc(100vh_-_32px)] dk-theme-card-square">
          {/* Start Overview Area */}
          <div className="col-span-full lg:col-span-6">
            <div className="flex flex-col items-center justify-center gap-10 text-center">
              <div className="hidden sm:block">
                <Image
                  width={400}
                  height={100}
                  src="/assets/images/loti/loti-auth.svg"
                  alt="loti"
                  className="group-[.dark]:hidden"
                />
              </div>
              <div>
                <h3 className="text-xl md:text-[28px] leading-none font-semibold text-heading">
                  Welcome back!
                </h3>
                <p className="font-medium text-gray-500 dark:text-dark-text mt-4 px-[10%]">
                  Whether you're launching a stunning online store optimizing
                  your our object-oriented
                </p>
              </div>
            </div>
          </div>
          {/* End Overview Area */}

          {/* Start Form Area */}
          <div className="col-span-full lg:col-span-6 w-full lg:max-w-[600px]">
            <div className="border border-form dark:border-dark-border p-5 md:p-10 rounded-20 md:rounded-30 dk-theme-card-square">
              <h3 className="text-xl md:text-[28px] leading-none font-semibold text-heading">
                Forgot Password
              </h3>
              <p className="font-medium text-gray-500 dark:text-dark-text mt-4">
                Welcome Back! Log in to your account
              </p>
              <form action="index.html" className="leading-none mt-8">
                <div className="mb-5">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="debra.holt@example.com"
                    required
                    className="form-input px-4 py-3.5 rounded-lg"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn b-solid btn-primary-solid w-full"
                >
                  Forgot Password
                </button>
              </form>

              <div className="text-gray-900 dark:text-dark-text font-medium leading-none mt-5">
                Back to /
                <Link
                  href="/auth/login"
                  className="text-primary-500 font-semibold"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
          {/* End Form Area */}
        </div>
      </div>
    </div>
  );
};

export default ForgotPass;
