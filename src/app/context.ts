/**
 * This application follows the LAB Architecture (https://github.com/jbreckmckye/node-typescript-architecture)
 * The context type ties the library and adapters together in a type-safe way.
 */

export type Context = {
  dialog: {
    alert: (s: string) => void,
    confirm: (s: string) => boolean
  },
  editor: {
    focus: () => void,
    getCursor: () => [number, number],
    getText: () => string,
    insertText: (s: string) => void,
    positionCursor: (start: number, end: number) => void,
    replaceText: (s: string) => void,
    setText: (s: string) => void
  },
  files: {
    read: (f: File) => Promise<string>,
    save: (name: string, text: string) => Promise<void>
  },
  storage: {
    get: (k: string) => string | null,
    set: (k: string, t: string) => void
  },
  toolbar: {
    getName: () => string,
    setName: (n: string) => void
  }
}

export type Operation <I, O> = (ctx: Context, input: I) => O

export type Adapter = <I, O, Op extends Operation<I, O>> (op: Op) => {
  op?: Op,
  ctx: Partial<Context>
}

export function mergeAdapter (...adapters: Adapter[]): Adapter {
  return function (op) {
    return adapters.reduce(
      (acc, adapter) => {
        const result = adapter(acc.op);
        return {
          op: result.op || acc.op,
          ctx: Object.assign(acc.ctx, result.ctx)
        }
      },
      { op, ctx: {} }
    );
  };
}
