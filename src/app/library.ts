/**
 * This application follows the LAB Architecture (https://github.com/jbreckmckye/node-typescript-architecture)
 * The library contains domain logic, performing IO through adapters.
 */
import { Adapter } from './context';

export type Library = {
  commands: {
    tab: () => void,
    keep: () => void,
    newFile: () => Promise<void>,
    openFile: (f: File) => Promise<void>,
    saveFile: () => Promise<void>,
    untab: () => void
  },
  queries: {
    keptFile: () => null | {
      filename: string, text: string
    }
  }
}

export function Library (adapter: Adapter) {

}