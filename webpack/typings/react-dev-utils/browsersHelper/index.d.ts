declare module 'react-dev-utils/browsersHelper' {
  export function checkBrowsers(
    dir: string,
    isInteractive: boolean,
    retry: boolean = true,
  ): Promise<string[]>;
}
