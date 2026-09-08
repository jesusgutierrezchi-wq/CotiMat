import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { login, getErrorMessage } from '../services/api';
import { useAuthStore } from '../store/auth.store';

const schema = z.object({
  username: z.string().min(1, 'Ingresa tu usuario'),
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

type FormValues = z.infer<typeof schema>;

export function Login() {
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (token) {
    const redirectTo = (location.state as { from?: string } | null)?.from || '/cotizaciones';
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values: FormValues) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const { token: newToken, admin } = await login(values.username, values.password);
      setSession(newToken, admin);
      navigate('/cotizaciones', { replace: true });
    } catch (err) {
      setServerError(getErrorMessage(err, 'Usuario o contraseña incorrectos.'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-blueprint px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="font-display text-4xl font-bold uppercase tracking-wide text-paper">CotiMat</h1>
          <p className="mt-1 font-sans text-sm uppercase tracking-wide text-paper/60">Panel administrativo</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="panel p-6" noValidate>
          <div className="mb-4">
            <label className="field-label" htmlFor="username">
              Usuario
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="field-input"
              placeholder="admin"
              {...register('username')}
            />
            {errors.username && <p className="field-error">{errors.username.message}</p>}
          </div>

          <div className="mb-2">
            <label className="field-label" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="field-input"
              placeholder="admin123"
              {...register('password')}
            />
            {errors.password && <p className="field-error">{errors.password.message}</p>}
          </div>

          {serverError && (
            <p className="field-error mb-2" role="alert">
              {serverError}
            </p>
          )}

          <button type="submit" className="btn-primary mt-4 w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>

          <p className="mt-4 border-t-[1.5px] border-dashed border-steel/40 pt-3 text-center font-sans text-xs text-steel">
            Entorno de desarrollo · usuario <span className="font-semibold text-ink">admin</span> / contraseña{' '}
            <span className="font-semibold text-ink">admin123</span>
          </p>
        </form>
      </div>
    </div>
  );
}
