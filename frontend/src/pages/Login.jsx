import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, NavLink } from 'react-router';
import { loginUser } from "../authSlice";
import { useEffect, useState } from 'react';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { Zap, Flame, Trophy } from 'lucide-react';


const loginSchema = z.object({
  emailId: z.string().email("Invalid Email"),
  password: z.string().min(8, "Password is too weak")
});

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  return (
    <div className="min-h-screen flex bg-base-200 relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Hero panel - desktop only */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center px-16 overflow-hidden bg-gradient-to-br from-violet-600 to-rose-500">
        <span className="absolute -right-10 -bottom-10 text-[280px] font-black text-white/10 select-none leading-none">
          {'</>'}
        </span>

        <div className="inline-flex items-center gap-2 bg-yellow-300 text-black font-bold text-sm px-4 py-1.5 rounded-full w-fit mb-6 border-2 border-black shadow-[3px_3px_0_0_#000]">
          <Zap size={16} />
          Welcome back
        </div>

        <h1 className="text-5xl font-black text-white tracking-tight leading-tight mb-4 relative z-10">
          Pick up right<br />where you left.
        </h1>
        <p className="text-violet-50 text-lg max-w-sm mb-10 relative z-10">
          Your streak, your submissions, your progress — all waiting for you on CodeArena.
        </p>

        <div className="flex flex-wrap gap-3 relative z-10">
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white text-sm font-medium">
            <Flame size={16} className="text-yellow-300" />
            150+ Problems
          </div>
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/30 rounded-xl px-4 py-2 text-white text-sm font-medium">
            <Trophy size={16} className="text-yellow-300" />
            AI Doubt Solver
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-8">
            <Logo size="text-4xl" />
          </div>

          <div className="bg-base-100 border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] p-8">
            <h2 className="text-xl font-bold mb-6">Log in to your account</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="alert alert-error mb-4 text-sm">
                  <span>{typeof error === 'string' ? error : 'Invalid email or password'}</span>
                </div>
              )}

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Email</span>
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  className={`input input-bordered w-full border-2 rounded-xl focus:border-violet-600 focus:outline-none ${errors.emailId ? 'input-error' : ''}`}
                  {...register('emailId')}
                />
                {errors.emailId && (
                  <span className="text-error text-sm mt-1">{errors.emailId.message}</span>
                )}
              </div>

              <div className="form-control mt-4">
                <label className="label">
                  <span className="label-text font-medium">Password</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={`input input-bordered w-full border-2 rounded-xl pr-10 focus:border-violet-600 focus:outline-none ${errors.password ? 'input-error' : ''}`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-error text-sm mt-1">{errors.password.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 py-3 rounded-xl bg-[#FF5A5F] text-white font-bold border-2 border-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Logging in...
                  </>
                ) : 'Login'}
              </button>
            </form>

            <div className="text-center mt-6">
              <span className="text-sm">
                Don't have an account?{' '}
                <NavLink to="/signup" className="link font-semibold text-violet-600">
                  Sign Up
                </NavLink>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;