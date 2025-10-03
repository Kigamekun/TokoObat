import React from "react";
import { Card } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Shield, User } from "lucide-react";
import { useForm, Link, Head } from "@inertiajs/react";

export default function LoginPage() {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center p-4">
            <Head title="Login" />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield className="w-10 h-10 text-teal-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Mitra Toko Obat
                    </h1>
                    <p className="text-sm text-gray-600">
                        Pharmacy Management System
                    </p>
                </div>

                <Card className="bg-white shadow-xl border-0">
                    <form onSubmit={submit} className="p-8 space-y-6">
                        <h2 className="text-2xl font-semibold text-center text-gray-900">
                            Sign In
                        </h2>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    className="pl-10 h-12"
                                    required
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData("password", e.target.value)}
                                    className="pl-10 h-12"
                                    required
                                />
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password}</p>
                            )}
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="remember"
                                checked={data.remember}
                                onChange={(e) => setData("remember", e.target.checked)}
                                className="mr-2"
                            />
                            <Label htmlFor="remember">Remember me</Label>
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white"
                        >
                            {processing ? "Signing In..." : "Sign In"}
                        </Button>

                        <p className="text-center text-sm text-gray-600 mt-4">
                            Don’t have an account?{" "}
                            <Link
                                href={route("register")}
                                className="text-teal-600 hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
}
