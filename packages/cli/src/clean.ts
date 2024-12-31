import { existsSync, lstatSync, rmSync } from 'fs';

export const clean = () => {
  if (!existsSync('./dist')) {
    return;
  }

  const status = lstatSync('./dist');
  if (!status.isDirectory()) {
    return;
  }

  rmSync('./dist', { recursive: true, force: true });
};
