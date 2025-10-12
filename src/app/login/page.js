"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button, Input, Card, CardBody } from "@/components/ui";
import Link from "next/link";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    appName: "POS System",
    logoPath: "/burger-logo.svg",
  });
  const { login } = useAuth();

  // Fetch branding for dynamic logo and app name
  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const response = await fetch("/api/branding");
        if (response.ok) {
          const data = await response.json();
          setSettings({
            appName: data.appName || "POS System",
            logoPath: data.logoPath || "/burger-logo.svg",
          });
        }
      } catch (error) {
        console.error("Error fetching branding:", error);
      }
    };

    fetchBranding();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full space-y-8 p-8'>
        <div className='flex flex-col items-center'>
          <img
            src={settings.logoPath}
            alt='Logo'
            className='h-24 w-24 mb-4'
          />
          <h2 className='mt-2 text-center text-3xl font-bold text-gray-900'>
            Welcome To 7 Social Space
          </h2>
          <h2 className='mt-2 text-center text-3xl font-bold text-gray-900'>
            Sign in to your account
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Or{" "}
            <Link
              href='/register'
              className='font-medium text-primary-600 hover:text-primary-500'
            >
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardBody>
            <form
              onSubmit={handleSubmit}
              className='space-y-6'
            >
              {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded'>
                  {error}
                </div>
              )}

              <Input
                label='Email address'
                type='email'
                name='email'
                value={formData.email}
                onChange={handleChange}
                required
                placeholder='Enter your email'
              />

              <Input
                label='Password'
                type='password'
                name='password'
                value={formData.password}
                onChange={handleChange}
                required
                placeholder='Enter your password'
              />

              <Button
                type='submit'
                variant='primary'
                className='w-full'
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
