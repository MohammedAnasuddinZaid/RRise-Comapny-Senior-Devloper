"use client";

/**
 * AuthModal Component
 * 
 * This component provides a modal for user authentication (signup/login).
 * It supports:
 * - Email/password signup
 * - Email/password login
 * - Google sign-in
 * - Toggle between signup and login modes
 * 
 * The modal is triggered from the landing page CTA button.
 * After successful authentication, the user is redirected to the dashboard.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Globe } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { GlassCard } from "@/components/ui/GlassCard";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (mode === 'signup' && !acceptTerms) {
      setError('You must accept the Terms of Service to continue');
      return;
    }
    
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await signUpWithEmail(email, password, name, true); // Pass terms accepted
        if (error) {
          setError(error.message);
        } else {
          // Success - will redirect to dashboard
          onClose();
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          setError(error.message);
        } else {
          // Success - will redirect to dashboard
          onClose();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please ensure Supabase is configured.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
      } else {
        // Success - will redirect to dashboard
        onClose();
      }
    } catch (err) {
      setError('An unexpected error occurred. Please ensure Supabase is configured.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setEmail('');
    setPassword('');
    setName('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-8 relative">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-8">
                  <h2 className="font-clash text-3xl font-bold text-foreground mb-2">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h2>
                  <p className="text-muted-foreground">
                    {mode === 'login' 
                      ? 'Sign in to access your dashboard' 
                      : 'Start your personal growth journey'}
                  </p>
                </div>

                {/* Google Sign-in */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 p-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-all mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Globe className="w-5 h-5" />
                  <span>Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-sm text-muted-foreground">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your name"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        minLength={6}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {mode === 'signup' && (
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="terms"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 focus:ring-primary focus:ring-offset-0"
                      />
                      <label htmlFor="terms" className="text-sm text-muted-foreground">
                        I agree to the{' '}
                        <button
                          type="button"
                          onClick={() => setShowTerms(true)}
                          className="text-primary hover:underline"
                        >
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={() => window.open('/privacy', '_blank')}
                          className="text-primary hover:underline"
                        >
                          Privacy Policy
                        </button>
                      </label>
                    </div>
                  )}

                  {/* Terms Popup Modal */}
                  <AnimatePresence>
                    {showTerms && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowTerms(false)}
                          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]"
                        />
                        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                          >
                            <GlassCard className="p-6 relative">
                              <button
                                onClick={() => setShowTerms(false)}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                              <h3 className="font-clash text-2xl font-bold text-foreground mb-4">
                                Terms of Service
                              </h3>
                              <div className="text-sm text-muted-foreground space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                <p><strong>1. Acceptance of Terms:</strong> By accessing or using RRise, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
                                <p><strong>2. Account Security:</strong> You are responsible for maintaining the confidentiality of your account credentials and all activities under your account.</p>
                                <p><strong>3. Service Usage:</strong> You agree to use RRise for lawful purposes only. You must not use the service for illegal activities, attempt to gain unauthorized access, or interfere with service operations.</p>
                                <p><strong>4. Subscription Plans:</strong> Paid subscriptions (Pro $20/month, Ultra $40/month) are charged monthly. You may cancel at any time, but fees are non-refundable.</p>
                                <p><strong>5. AI Services:</strong> AI features are provided "as is" and may not always be accurate. For BYOK functionality, you are responsible for your API keys and any charges from AI providers.</p>
                                <p><strong>6. Intellectual Property:</strong> All content and features of RRise are owned by us. You may not reproduce or distribute our content without consent.</p>
                                <p><strong>7. Limitation of Liability:</strong> RRise shall not be liable for any indirect, incidental, or consequential damages arising from your use of the service.</p>
                                <p className="text-xs">By creating an account, you acknowledge that you have read, understood, and agree to these terms.</p>
                              </div>
                              <div className="mt-6 flex gap-3">
                                <button
                                  onClick={() => {
                                    setAcceptTerms(true);
                                    setShowTerms(false);
                                  }}
                                  className="flex-1 p-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all"
                                >
                                  Accept Terms
                                </button>
                                <button
                                  onClick={() => setShowTerms(false)}
                                  className="flex-1 p-3 rounded-xl border border-white/20 hover:bg-white/10 text-foreground font-semibold transition-all"
                                >
                                  Close
                                </button>
                              </div>
                            </GlassCard>
                          </motion.div>
                        </div>
                      </>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading || (mode === 'signup' && !acceptTerms)}
                    className="w-full p-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                {/* Toggle mode */}
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {mode === 'login' 
                      ? "Don't have an account? Sign up" 
                      : 'Already have an account? Login'}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
