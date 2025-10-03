import React from "react";
import { Card } from "../../Components/ui/card";
import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import { Shield, User } from "lucide-react";
import { useForm, Link, Head } from "@inertiajs/react";

export default function RegisterPage() {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("register"));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-100 flex items-center justify-center p-4">
            <Head title="Register" />
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="bg-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Shield className="w-10 h-10 text-teal-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Mitra Toko Obat
                    </h1>
                    <p className="text-sm text-gray-600">
                        Create your account
                    </p>
                </div>

                <Card className="bg-white shadow-xl border-0">
                    <form onSubmit={submit} className="p-8 space-y-6">
                        <h2 className="text-2xl font-semibold text-center text-gray-900">
                            Sign Up
                        </h2>

                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-500 text-sm">{errors.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                required
                            />
                            {errors.email && (
                                <p className="text-red-500 text-sm">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                required
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm">{errors.password}</p>
                            )}
                        </div>

                        {/* Password Confirmation */}
                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation">
                                Confirm Password
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData("password_confirmation", e.target.value)
                                }
                                required
                            />
                            {errors.password_confirmation && (
                                <p className="text-red-500 text-sm">
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full h-12 bg-teal-600 hover:bg-teal-700 text-white"
                        >
                            {processing ? "Registering..." : "Register"}
                        </Button>

                        <p className="text-center text-sm text-gray-600 mt-4">
                            Already have an account?{" "}
                            <Link
                                href={route("login")}
                                className="text-teal-600 hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>
                    </form>
                </Card>
            </div>
        </div>
    );
}
