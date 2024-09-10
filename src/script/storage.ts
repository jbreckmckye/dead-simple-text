import trkl from 'trkl';

export enum LockStates {
    WAITING,
    HAS_LOCK,
    LOCK_REJECTED,
    DISABLED,
    RELEASED
}

export class StorageLock {
    public state = trkl<LockStates>(
        'locks' in window.navigator ? LockStates.WAITING : LockStates.DISABLED
    )

    constructor(private name: string) {
        if (this.state() !== LockStates.DISABLED) {
            console.log({ INFO: 'Acquiring lock' })
            this.acquireLock();
        } else {
            console.log({ INFO: 'Web Locks API missing / disabled' })
        }
    }

    public readDocument() {
        return window.localStorage.getItem(this.name);
    }

    public writeDocument(text: string) {
        try {
            return window.localStorage.setItem(this.name, text);
        } catch {
            // Could throw if out of storage - ignore in this case
        }
    }

    // Will be replaced in acquireLock
    public releaseLock = () => {};

    private acquireLock() {
        window.navigator.locks.request(this.name, { ifAvailable: true }, (lock) => {
            if (!lock) {
                console.log({ INFO: 'Unable to acquire lock' })
                this.state(LockStates.LOCK_REJECTED);
            } else {
                console.log({ INFO: 'Acquired lock' })
                this.state(LockStates.HAS_LOCK);
                // Hold the lock with a promise that won't resolve until the class is torn down
                return new Promise((resolve) => {
                    this.releaseLock = () => {
                        this.state(LockStates.RELEASED);
                        resolve('Released lock');
                        console.log({ INFO: 'Released lock' })
                    }
                })
            }
        })
    }
}
