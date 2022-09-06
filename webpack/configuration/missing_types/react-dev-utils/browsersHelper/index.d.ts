declare module 'react-dev-utils/browsersHelper' {
  export async function checkBrowsers(
    dir: string,
    isInteractive: boolean,
    retry: boolean = true,
  ): Promise<string[]>;
}
