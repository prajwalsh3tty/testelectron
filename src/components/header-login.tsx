import React, { useState } from 'react';
import { useUserStore } from '@/stores/user-store';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/alert-dialog';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { User2 } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';

export function HeaderLogin() {
  const { email, setEmail, clear } = useUserStore();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const validate = (val: string) => {
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(val);
  };

  const handleLogin = () => {
    if (!validate(input)) {
      setError('Please enter a valid email.');
      return;
    }
    setEmail(input);
    setOpen(false);
    setInput('');
    setError('');
  };

  const handleLogout = () => {
    clear();
  };

  if (!email) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button onClick={() => setOpen(true)} variant="outline">Login</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Login</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Input
              type="email"
              placeholder="Email"
              value={input}
              onChange={e => setInput(e.target.value)}
              className={error ? 'border-destructive' : ''}
            />
            {error && <span className="text-destructive text-xs">{error}</span>}
            <Button onClick={handleLogin} className="mt-2">Login</Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="outline" className="rounded-full ">
          <User2 className="h-4 w-4" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className="min-w-[12rem] bg-card border rounded shadow z-[9999] p-4 flex flex-col gap-2">
          <div className="text-sm break-all">{email}</div>
          <Button variant="destructive" onClick={handleLogout}>Log out</Button>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
} 