const toKebabCase = (title: string): string => title
  .replace(/(?<lowercase>[a-z])(?<uppercase>[A-Z])/u, '$1-$2')
  .replace(/[\s_]+/u, '-')
  .toLowerCase();

export class Route {
  public constructor(
    title: string,
    Page: () => JSX.Element,
    path?: string | undefined,
  ) {
    this.title = title;
    this.Page = Page;
    this.path = path ?? `/${ toKebabCase(this.title) }`;
  }

  public readonly title: string;
  public readonly Page: () => JSX.Element;
  public readonly path: string;
}
