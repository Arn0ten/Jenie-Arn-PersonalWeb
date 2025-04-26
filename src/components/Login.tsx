import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Loader2, Heart } from "lucide-react";

const Login = () => {
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const success = await login(password, name);
      if (success) {
        navigate("/");
      } else {
        setError("Invalid login credentials. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during login. Please try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg animate-fade-in">
        <div className="text-center mb-8">
          <img
            src="/welcome.png"
            alt="Welcome"
            className="mx-auto mb-4"
            style={{
              width: "min(120px, 40vw)",
              height: "auto",
              objectFit: "contain",
            }}
          />
          <h2 className="text-3xl font-bold text-pink-500 cursive">
            Welcome Back
          </h2>
          <p className="text-gray-600 mt-2">Login to manage your memories</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Who are you?</Label>
            <div className="grid grid-cols-2 gap-4">
              <Button
                type="button"
                variant={name === "Jenie" ? "default" : "outline"}
                className={
                  name === "Jenie"
                    ? "bg-pink-500 hover:bg-pink-600"
                    : "border-pink-500 text-pink-500 hover:bg-pink-100"
                }
                onClick={() => setName("Jenie")}
              >
                Jenie
              </Button>
              <Button
                type="button"
                variant={name === "Arn" ? "default" : "outline"}
                className={
                  name === "Arn"
                    ? "bg-pink-500 hover:bg-pink-600"
                    : "border-pink-500 text-pink-500 hover:bg-pink-100"
                }
                onClick={() => setName("Arn")}
              >
                Arn
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="border-pink-200 focus:border-pink-500 focus:ring-pink-500"
            />
          </div>

          {error && (
            <div className="text-destructive text-sm font-medium">{error}</div>
          )}

          <Button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600"
            disabled={isLoading || !name}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>This area is password protected for administrators only.</p>
          <p className="mt-1">Only Jenie and Arn can access this section.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
