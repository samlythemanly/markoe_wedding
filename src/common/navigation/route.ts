import type { Component } from 'react';

const toKebabCase = (title: string): string => title
  .replace(/(?<lowercase>[a-z])(?<uppercase>[A-Z])/u, '$1-$2')
  .replace(/[\s_]+/u, '-')
  .toLowerCase();

export class Route {
  public constructor(
    title: string,
    Page: typeof Component,
    path?: string | undefined,
  ) {
    this.title = title;
    this.Page = Page;
    this.path = path ?? toKebabCase(this.title);
  }

  public readonly title: string;
  public readonly Page: typeof Component;
  public readonly path: string;
}
