import { $ } from 'bun';

const { stdout, stderr } = await $`bun push`;

// Exit with error exit code on error
if (/error/i.test(stdout.toString() + stderr.toString())) {
  process.exit(1);
}
