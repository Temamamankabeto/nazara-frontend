import { useMutation } from '@tanstack/react-query';
import { forgotPassword, loginUser, logoutUser, resetPassword } from '@/services/auth.service';

export function useLogin() {
  return useMutation({ mutationFn: loginUser });
}

export function useLogout() {
  return useMutation({ mutationFn: logoutUser });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}
