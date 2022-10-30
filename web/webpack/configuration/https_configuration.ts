import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import chalk from 'chalk';

import type WebpackDevServer from 'webpack-dev-server';

import paths from './paths';

/**
 * Validates whether the certificate and key provided are valid.
 *
 * If either of the files are invalid, an error is thrown.
 */
function validateKeyAndCertificates(
  certificate: crypto.RsaPublicKey | crypto.RsaPrivateKey | crypto.KeyLike,
  key: crypto.RsaPublicKey | crypto.RsaPrivateKey | crypto.KeyLike,
  keyFile: string,
  certificateFile: string,
): void {
  let encrypted: Buffer;
  try {
    // An invalid cert will cause publicEncrypt to throw an error.
    encrypted = crypto.publicEncrypt(certificate, Buffer.from('test'));
  } catch (error) {
    throw new Error(
      `The certificate "${chalk.yellow(certificateFile)}" is invalid.\n${
        (error as Error).message
      }`,
    );
  }

  try {
    // An invalid cert will cause privateEncrypt to throw an error.
    crypto.privateDecrypt(key, encrypted);
  } catch (error) {
    throw new Error(
      `The certificate key "${chalk.yellow(keyFile)}" is invalid.\n${
        (error as Error).message
      }`,
    );
  }
}

/**
 * Attempts to read the provided file.
 *
 * Throws an error if it doesn't exist.
 */
function read(file: string): Buffer {
  if (!fs.existsSync(file)) {
    throw new Error(`The file "${chalk.yellow(file)}" can't be found.`);
  }

  return fs.readFileSync(file);
}

/**
 * Returns whether HTTPS is enabled, as well as the key and certificate files
 * if provided in the env.
 */
function httpConfiguration(): {
  isHttps: boolean;
  serverOptions?: WebpackDevServer.ServerOptions;
} {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
  const isHttps = HTTPS === 'true';

  let serverOptions: WebpackDevServer.ServerOptions | undefined;

  if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
    const certificateFile = path.resolve(paths.app, SSL_CRT_FILE);
    const keyFile = path.resolve(paths.app, SSL_KEY_FILE);
    const certificate = read(certificateFile);
    const key = read(keyFile);

    validateKeyAndCertificates(certificate, key, keyFile, certificateFile);

    serverOptions = { key, cert: certificate };
  }

  return { isHttps, serverOptions };
}

export default httpConfiguration;
