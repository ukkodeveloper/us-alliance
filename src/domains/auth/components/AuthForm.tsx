import { useMutation } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router';

import { type Credentials, type LoginResponse } from '../../../api/auth';
import { setTokens } from '../../../api/tokenStorage';
import { Button } from '../../../components/Button';
import { TextField } from '../../../components/TextField';
import { validateAuth } from '../utils/validateAuth';

type AuthFormProps = {
  submitLabel: string;
  authenticate: (credentials: Credentials) => Promise<LoginResponse>;
};

const INITIAL_VALUES: Credentials = { email: '', password: '' };

export function AuthForm({ submitLabel, authenticate }: AuthFormProps) {
  const navigate = useNavigate();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: authenticate,
    onSuccess: ({ access_token, refresh_token }) => {
      setTokens({ accessToken: access_token, refreshToken: refresh_token });
      navigate('/', { replace: true });
    },
  });

  const validation = validateAuth(values);
  const fieldErrors = isSubmitAttempted && !validation.ok ? validation.errors : {};

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitAttempted(true);
    if (!validation.ok) {
      return;
    }
    mutate(values);
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col gap-6">
        <TextField
          label="이메일"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="이메일을 입력해주세요."
          value={values.email}
          error={fieldErrors.email}
          onChange={event => setValues(prev => ({ ...prev, email: event.target.value }))}
        />
        <TextField
          label="비밀번호"
          type="password"
          name="password"
          placeholder="비밀번호를 입력해주세요."
          value={values.password}
          error={fieldErrors.password}
          onChange={event => setValues(prev => ({ ...prev, password: event.target.value }))}
        />
      </div>
      <Button type="submit" disabled={isPending} className="mt-12 w-full">
        {submitLabel}
      </Button>
      {error != null && (
        <p role="alert" className="mt-3 text-center text-sm text-danger">
          {error.message}
        </p>
      )}
    </form>
  );
}
