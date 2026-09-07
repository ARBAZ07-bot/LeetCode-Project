import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import { verifyOtp, resendOtp, clearAuthError } from '../authSlice';
import ThemeToggle from '../components/ThemeToggle';
import Logo from '../components/Logo';
import { ShieldCheck } from 'lucide-react';

function VerifyOtp() {
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error, pendingVerificationEmail } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Agar koi signup kiye bina seedha is page pe aa gaya, wapas bhej do
    if (!pendingVerificationEmail) {
      navigate('/signup');
    }
  }, [pendingVerificationEmail, navigate]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    dispatch(verifyOtp({ emailId: pendingVerificationEmail, otp }));
  };

  const handleResend = () => {
    dispatch(clearAuthError());
    dispatch(resendOtp(pendingVerificationEmail));
    setResendCooldown(30);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base-200 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Logo size="text-4xl" />
        </div>

        <div className="bg-base-100 border-4 border-black rounded-2xl shadow-[8px_8px_0_0_#000] p-8">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="text-violet-600" size={22} />
            <h2 className="text-xl font-bold">Verify your email</h2>
          </div>
          <p className="text-sm text-base-content/60 mb-6">
            We sent a 6-digit code to <span className="font-medium text-base-content">{pendingVerificationEmail}</span>
          </p>

          {error && (
            <div className="alert alert-error mb-4 text-sm">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="input input-bordered w-full border-2 rounded-xl text-center text-2xl tracking-[0.5em] font-bold focus:border-violet-600 focus:outline-none"
              autoFocus
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full mt-6 py-3 rounded-xl bg-[#FF5A5F] text-white font-bold border-2 border-black shadow-[4px_4px_0_0_#000] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_0_#000] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Verifying...
                </>
              ) : 'Verify'}
            </button>
          </form>

          <div className="text-center mt-6 text-sm">
            Didn't get the code?{' '}
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="link font-semibold text-violet-600 disabled:no-underline disabled:text-base-content/40 disabled:cursor-not-allowed"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;