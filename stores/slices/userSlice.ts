import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { removeToken, removeUserFromLocalStorage, saveUserToLocalStorage } from '@/lib/utils';
import { DwmsUser, formatUser } from '@/types/auth.types';
interface AuthState { user: DwmsUser | null; isLoading: boolean; error: string | null; }
const initialState: AuthState = { user: null, isLoading: false, error: null };
const authSlice = createSlice({ name: 'auth', initialState, reducers: { setUser: (state, action: PayloadAction<{ user: any }>) => { const user = formatUser(action.payload.user); state.user = user; state.error = null; saveUserToLocalStorage(user); }, logoutReduxAction: (state) => { state.user = null; state.error = null; removeToken(); removeUserFromLocalStorage(); } } });
export const { logoutReduxAction, setUser } = authSlice.actions;
export default authSlice.reducer;
