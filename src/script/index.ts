import {DEAD_SIMPLE_TXT, State} from './state';
import { View } from './View';
import {StorageLock} from "./storage";

const view = new View();
const storage = new StorageLock(DEAD_SIMPLE_TXT);

new State(view, storage);
