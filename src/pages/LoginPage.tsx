import { Link } from 'react-router';

import { login } from '../api/auth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthForm } from '../domains/auth';

export function LoginPage() {
  return (
    <AuthLayout>
      <AuthForm submitLabel="로그인" authenticate={login} />
      <p className="mt-6 text-center text-sm text-gray-500">
        계정이 없으신가요?{' '}
        <Link to="/signup" className="font-semibold text-primary hover:underline">
          회원가입
        </Link>
      </p>
    </AuthLayout>
  );
}
