import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Heart, User, Mail, Lock, Phone, Calendar } from "lucide-react";
import { auth } from "@/lib/api";

type Mode = "login" | "register";

export default function PatientAuth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    date_of_birth: "",
    blood_type: "",
  });

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await auth.login(form.email, form.password);
      if (res.role !== "patient") {
        toast({ title: "Error", description: "This page is for patients only", variant: "destructive" });
        return;
      }
      auth.saveSession(res);
      toast({ title: "Logged in successfully" });
      navigate("/patient-portal");
    } catch (err: unknown) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await auth.register({
        email: form.email,
        password: form.password,
        full_name: form.full_name,
        role: "patient",
        phone: form.phone || undefined,
        blood_type: form.blood_type || undefined,
      });
      auth.saveSession(res);
      toast({ title: "Account created successfully" });
      navigate("/patient-portal");
    } catch (err: unknown) {
      toast({ title: "Registration error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Heart className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Patient Portal</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {mode === "login" ? "Sign in to access your medical profile" : "Create your new account"}
            </p>
          </div>

          <div className="flex rounded-lg bg-muted p-1 mb-8">
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === "login" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setMode("login")}
            >
              Sign In
            </button>
            <button
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                mode === "register" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
              onClick={() => setMode("register")}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={mode === "login" ? handleLogin : handleRegister} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="full_name"
                      name="full_name"
                      placeholder="John Doe"
                      value={form.full_name}
                      onChange={handleChange}
                      className="pr-10"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="01xxxxxxxxx"
                        value={form.phone}
                        onChange={handleChange}
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="blood_type">Blood Type</Label>
                    <select
                      id="blood_type"
                      name="blood_type"
                      value={form.blood_type}
                      onChange={handleChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select</option>
                      {bloodTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="date_of_birth"
                      name="date_of_birth"
                      type="date"
                      value={form.date_of_birth}
                      onChange={handleChange}
                      className="pr-10"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <div className="relative">
                <Mail className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={handleChange}
                  className="pr-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Lock className="absolute right-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="pr-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {mode === "login" ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            For emergencies call{" "}
            <a href="tel:911" className="text-destructive font-bold">911</a>
            {" "}or hotline{" "}
            <a href="tel:19668" className="text-primary font-bold">19668</a>
          </p>
        </div>
      </div>
    </Layout>
  );
}
