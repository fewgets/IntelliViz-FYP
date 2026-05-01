'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type FormState = {
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const router = useRouter();
  const [values, setValues] = useState<FormState>({ email: '', password: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({ email: false, password: false });

  const validate = (nextValues: FormState) => {
    const nextErrors: FormErrors = {};

    if (!emailPattern.test(nextValues.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (nextValues.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    return nextErrors;
  };

  const handleChange = (field: keyof FormState, value: string) => {
    const nextValues = { ...values, [field]: value };
    setValues(nextValues);
    setErrors(validate(nextValues));
  };

  const handleBlur = (field: keyof FormState) => {
    setTouched((current) => ({ ...current, [field]: true }));
    setErrors(validate(values));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    setTouched({ email: true, password: true });

    if (Object.keys(nextErrors).length === 0) {
      router.push('/overview');
    }
  };

  return (
    <main className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(23,212,245,0.16),_transparent_34%),linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] text-slate-900">
      <div className="flex h-screen w-full flex-col overflow-hidden bg-white/70 backdrop-blur-xl lg:flex-row">
        <section className="relative flex flex-1 flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,#041e5c_0%,#0962d4_60%,#17d4f5_100%)] p-8 text-white lg:p-10">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] [background-size:46px_46px]" />
          <div className="relative z-10 max-w-xl">
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.4em] text-cyan-100/80">IoT StreamGuard</p>
            <h1 className="mt-4 font-['Space_Grotesk'] text-4xl font-bold leading-tight lg:text-5xl">Secure access to the industrial intelligence layer.</h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/78 lg:text-base">
              Sign in to open the StreamGuard dashboard, monitor machine health, and inspect live analytics across your industrial network.
            </p>
          </div>

          <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ['Live telemetry', 'Real-time sensor streams'],
              ['Predictive alerts', 'Failure risk surfaced early'],
              ['Security watch', 'Anomaly and intrusion signals'],
            ].map(([title, subtitle]) => (
              <div key={title} className="rounded-2xl border border-white/15 bg-white/10 p-3.5 shadow-lg backdrop-blur-sm">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/80">{title}</div>
                <div className="mt-2 text-sm text-white/75">{subtitle}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex flex-1 items-center justify-center overflow-hidden p-4 lg:p-10">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[1.75rem] border border-blue-100 bg-white p-7 shadow-[0_20px_60px_rgba(7,19,42,0.10)]">
            <div>
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.35em] text-blue-500">Login</p>
              <h2 className="mt-3 font-['Space_Grotesk'] text-2xl font-bold text-slate-900">Welcome back</h2>
              <p className="mt-2 text-xs leading-5 text-slate-500">Use your email and password to enter the dashboard.</p>
            </div>

            <div className="mt-7 space-y-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Email</span>
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  onBlur={() => handleBlur('email')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="name@company.com"
                  autoComplete="email"
                />
                {touched.email && errors.email ? <span className="mt-1 block text-xs font-medium text-red-600">{errors.email}</span> : null}
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Password</span>
                <input
                  type="password"
                  value={values.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  onBlur={() => handleBlur('password')}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none transition focus:border-cyan-400 focus:bg-white"
                  placeholder="Minimum 6 characters"
                  autoComplete="current-password"
                />
                {touched.password && errors.password ? <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.password}</span> : null}
              </label>
            </div>

            <button
              type="submit"
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0e7af4,#0962d4)] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Login
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
