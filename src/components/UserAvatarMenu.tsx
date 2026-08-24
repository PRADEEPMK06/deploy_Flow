import React, { useState, useRef, useEffect } from 'react';
import {
  User as UserIcon,
  KeyRound,
  LogOut,
  Trash2,
  Lock,
  Check,
  AlertCircle,
  Eye,
  EyeOff,
  X,
  RotateCw,
  ShieldAlert
} from 'lucide-react';
import { User } from '../types/deployflow';
import { deployEngine } from '../services/deployEngine';

interface UserAvatarMenuProps {
  currentUser: User;
  onUserUpdated: (user: User, message: string) => void;
  onSignOut: () => void;
}

export const UserAvatarMenu: React.FC<UserAvatarMenuProps> = ({
  currentUser,
  onUserUpdated,
  onSignOut
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'none' | 'username' | 'password' | 'delete'>('none');

  // Change Username state
  const [newUsername, setNewUsername] = useState('');
  const [usernameError, setUsernameError] = useState<string | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Delete Account confirmation state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const firstLetter = (currentUser.username || 'U').charAt(0).toUpperCase();

  // Password constraints for password update
  const isMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isNewPasswordValid = isMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const isUsernameAvailable =
    newUsername.trim().length >= 3 ? deployEngine.isUsernameAvailable(newUsername) : null;

  // Handle Username Change
  const handleChangeUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameError(null);
    setIsLoading(true);

    try {
      const res = await deployEngine.updateUsername(newUsername);
      setIsLoading(false);
      if (res.success) {
        const u = deployEngine.getCurrentUser();
        if (u) onUserUpdated(u, res.message);
        setActiveModal('none');
        setDropdownOpen(false);
      } else {
        setUsernameError(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setUsernameError(err.message || 'Failed to update username');
    }
  };

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!isNewPasswordValid) {
      setPasswordError('Please fulfill all password security constraints.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await deployEngine.updatePassword(currentPassword, newPassword);
      setIsLoading(false);
      if (res.success) {
        const u = deployEngine.getCurrentUser();
        if (u) onUserUpdated(u, res.message);
        setActiveModal('none');
        setDropdownOpen(false);
      } else {
        setPasswordError(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setPasswordError(err.message || 'Failed to update password');
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError(null);

    if (deleteConfirmText !== currentUser.username) {
      setDeleteError(`Please type "${currentUser.username}" exactly to confirm.`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await deployEngine.deleteAccount();
      setIsLoading(false);
      if (res.success) {
        setActiveModal('none');
        setDropdownOpen(false);
        onSignOut();
      } else {
        setDeleteError(res.message);
      }
    } catch (err: any) {
      setIsLoading(false);
      setDeleteError(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button on Top Right */}
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2.5 p-1.5 pr-3 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-full transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
        title="User Account Menu"
      >
        {/* Avatar Circle with capitalized initial */}
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold flex items-center justify-center text-sm shadow-sm group-hover:scale-105 transition-transform">
          {firstLetter}
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors truncate max-w-[120px]">
            {currentUser.username}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono truncate max-w-[120px]">
            {currentUser.email}
          </div>
        </div>
      </button>

      {/* Dropdown Menu */}
      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-zinc-800/80 mb-1">
            <div className="text-xs font-bold text-zinc-200 truncate">{currentUser.username}</div>
            <div className="text-[11px] text-zinc-500 font-mono truncate">{currentUser.email}</div>
          </div>

          {/* Option 1: Change Username */}
          <button
            onClick={() => {
              setNewUsername(currentUser.username);
              setUsernameError(null);
              setActiveModal('username');
              setDropdownOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors text-left"
          >
            <UserIcon className="w-4 h-4 text-emerald-400" />
            <span>Change Username</span>
          </button>

          {/* Option 2: Change Password */}
          <button
            onClick={() => {
              setCurrentPassword('');
              setNewPassword('');
              setPasswordError(null);
              setActiveModal('password');
              setDropdownOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors text-left"
          >
            <Lock className="w-4 h-4 text-amber-400" />
            <span>Change Password</span>
          </button>

          <div className="border-t border-zinc-800/80 my-1"></div>

          {/* Option 3: Sign Out */}
          <button
            onClick={() => {
              setDropdownOpen(false);
              onSignOut();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-300 hover:text-zinc-100 hover:bg-zinc-900 rounded-lg transition-colors text-left"
          >
            <LogOut className="w-4 h-4 text-zinc-400" />
            <span>Sign Out</span>
          </button>

          {/* Option 4: Delete Account */}
          <button
            onClick={() => {
              setDeleteConfirmText('');
              setDeleteError(null);
              setActiveModal('delete');
              setDropdownOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-lg transition-colors text-left"
          >
            <Trash2 className="w-4 h-4 text-rose-400" />
            <span>Delete Account</span>
          </button>
        </div>
      )}

      {/* MODAL 1: CHANGE USERNAME */}
      {activeModal === 'username' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-zinc-100">Change Username</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {usernameError && (
              <div className="flex items-start gap-2 p-2.5 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{usernameError}</span>
              </div>
            )}

            <form onSubmit={handleChangeUsername} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-300">New Username</label>
                  {newUsername.trim().length >= 3 && (
                    <span
                      className={`text-[10px] font-mono ${
                        isUsernameAvailable ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isUsernameAvailable ? '✓ Available' : '✗ Already taken'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                  className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || isUsernameAvailable === false}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-400 hover:bg-emerald-300 text-zinc-950 rounded-lg shadow-sm"
                >
                  {isLoading ? 'Saving...' : 'Save Username'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CHANGE PASSWORD */}
      {activeModal === 'password' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-zinc-100">Change Password</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {passwordError && (
              <div className="flex items-start gap-2 p-2.5 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="w-full pl-3 pr-9 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="w-full pl-3 pr-9 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 font-mono focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password checklist */}
              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-1.5 text-[10px] font-mono">
                <div className={`flex items-center gap-1.5 ${isMinLength ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>8+ characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasUpper ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>1 uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>1 lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>1 number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  <Check className="w-3 h-3" />
                  <span>1 special character (!@#...)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !isNewPasswordValid}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm ${
                    isNewPasswordValid
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-zinc-950 cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE ACCOUNT CONFIRMATION */}
      {activeModal === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-950 border border-rose-900/60 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-rose-400">
                <ShieldAlert className="w-5 h-5" />
                <h3 className="text-sm font-bold">Delete Account</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="text-zinc-400 hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              This action is permanent. All your deployments, containers, and configurations will be permanently removed.
            </p>

            {deleteError && (
              <div className="flex items-start gap-2 p-2.5 bg-rose-950/40 border border-rose-800/80 rounded-lg text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-400">
                  Type <strong className="text-zinc-200 font-mono">{currentUser.username}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={currentUser.username}
                  required
                  className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 font-mono focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal('none')}
                  className="px-3 py-2 text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || deleteConfirmText !== currentUser.username}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg shadow-sm ${
                    deleteConfirmText === currentUser.username
                      ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                      : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
