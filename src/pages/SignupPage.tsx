import { Link } from 'react-router';

import { register, REGISTER_ERROR_MESSAGES } from '../api/auth';
import { AuthLayout } from '../components/layout/AuthLayout';
import { AuthForm } from '../domains/auth';

export function SignupPage() {
  return (
    <AuthLayout>
      <AuthForm submitLabel="회원가입" authenticate={register} errorMessages={REGISTER_ERROR_MESSAGES} />
      <p className="mt-6 text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          로그인
        </Link>
      </p>
    </AuthLayout>
  );
}
