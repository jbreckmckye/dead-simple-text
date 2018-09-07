import trkl from 'trkl';

export default class Model {
    public readonly filename: trkl.Observable<string> = trkl();
    public readonly text: trkl.Observable<string> = trkl();
}