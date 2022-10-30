import { createHash } from 'crypto';

export default function environmentHash(
  environment: NodeJS.ProcessEnv,
): string {
  const hash = createHash('md5');
  hash.update(JSON.stringify(environment));

  return hash.digest('hex');
}
