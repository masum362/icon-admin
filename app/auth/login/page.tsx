"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import axiosInstance from "@/utils/axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  phone: z
    .string()
    .min(10, { message: "Phone number must be at least 10 digits" })
    .max(15, { message: "Phone number must not exceed 15 digits" })
    .regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/, {
      message: "Please enter a valid phone number",
    }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
  rememberMe: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      phone: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/login", data);
      console.log(response.data.data.accessToken);

      if (response.data.data.accessToken) {
        Cookies.set("token", response.data.data.accessToken, { expires: 30 });
        toast({
          variant: "default",
          title: "Logged in successfully!",
          description: "You can now access your admin dashboard.",
        });
        window.location.href = "/";
        setLoading(false);
      }
    } catch (e: any) {
      setLoading(false);

      console.log(e.response.data.message);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: e.response.data.message,
      });
    }
    setLoading(false);
    form.reset();
  };

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
                Sign In
              </h3>
              <p className="font-medium text-gray-500 dark:text-dark-text mt-4">
                Welcome Back! Log in to your account
              </p>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="leading-none mt-8"
                >
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem className="mb-2.5">
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+1 (555) 000-0000"
                            {...field}
                            className="form-input px-4 py-3.5 rounded-lg"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="mt-5">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Password"
                              {...field}
                              className="form-input px-4 py-3.5 rounded-lg"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-3 top-1/2 -translate-y-1/2"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center justify-between mt-3 mb-7">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center gap-1 select-none">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="font-spline_sans text-sm leading-none text-gray-900 dark:text-dark-text cursor-pointer">
                            Remember Me
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Link
                      href="/auth/forgot-pass"
                      className="text-xs leading-none text-primary-500 font-semibold"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="btn b-solid btn-primary-solid w-full"
                  >
                    {loading && <Loader2 className="animate-spin" />}
                    Sign In
                  </Button>
                </form>
              </Form>
              <div className="font-spline_sans text-gray-900 dark:text-dark-text leading-none text-center my-4">
                OR
              </div>
              <div className="flex items-center flex-col xl:flex-row gap-4 2xl:gap-5">
                <Button
                  variant="outline"
                  className="btn b-outline-static btn-disable-outline w-full grow xl:w-auto"
                >
                  <Image
                    width={20}
                    height={20}
                    src="/assets/images/icons/google.svg"
                    alt="icon"
                  />
                  <span className="shrink-0">Sign in with Google</span>
                </Button>
                <Button
                  variant="outline"
                  className="btn b-outline-static btn-disable-outline w-full grow xl:w-auto"
                >
                  <Image
                    width={17}
                    height={20}
                    src="/assets/images/icons/apple.svg"
                    alt="icon"
                    className="dark:brightness-[3]"
                  />
                  <span className="shrink-0">Continue with Apple</span>
                </Button>
              </div>
              <div className="text-gray-900 dark:text-dark-text font-medium leading-none mt-5">
                Don't have an account yet?
                <Link
                  href="/auth/signup"
                  className="text-primary-500 font-semibold"
                >
                  Sign Up
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

export default Login;
