export declare interface DeadBeefFunction {
  (...args: Array<any>): string;
  sorted: (...args: Array<any>) => string;
  generateIDFor: (
    helper: (value: any) => boolean,
    generator: (value: any) => any,
  ) => any;
  removeIDGenerator: (helper: (value: any) => boolean) => void;
  idSym: symbol;
}
