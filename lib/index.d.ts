declare function deadbeef(...args: Array<any>): string;

declare namespace deadbeef {
  const idSym: symbol;

  function sorted(...args: Array<any>): string;

  function generateIDFor(
    helper: (value: any) => boolean,
    generator: (value: any) => any,
  ): any;

  function removeIDGenerator(
    helper: (value: any) => boolean,
  ): void;
}

export = deadbeef
