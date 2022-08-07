import {NextFunction, Request, Response} from 'express';
import {GenericController} from './GenericController';
import {GenericSearchController} from './GenericSearchController';
import {HealthController} from './HealthController';
import {LoadController} from './LoadController';
import {LoadSearchController} from './LoadSearchController';
import {LogController} from './LogController';
import {Controller} from './LowCodeController';
import {Service} from './LowCodeController';
import {SearchController} from './SearchController';

export {HealthController as HealthHandler};
export {LogController as LogHandler};
export {LoadController as LoadHandler};
export {LoadController as ViewHandler};
// export {LoadController as ViewController};

export {GenericController as GenericHandler};
export {SearchController as SearchHandler};
export {LoadSearchController as LoadSearchHandler};
export {GenericSearchController as GenericSearchHandler};
export {Controller as Handler};
export {Service as LowCodeService};

export * from './health';
export * from './client';
export * from './HealthController';
export * from './LogController';
export * from './log';
export * from './http';
export * from './metadata';
export * from './view';
export * from './LoadController';
export * from './search_func';
export * from './search';
export * from './SearchController';
export * from './LoadSearchController';
export * from './resources';
export * from './edit';
export * from './GenericController';
export * from './GenericSearchController';
export * from './LowCodeController';

export interface AccessConfig {
  origin?: string | string[];
  credentials?: string | string[];
  methods?: string | string[];
  headers: number | string | ReadonlyArray<string>;
}
export type AccessControlAllowConfig = AccessConfig;
export function allow(access: AccessConfig): (req: Request, res: Response, next: NextFunction) => void {
  const ao = access.origin;
  if (typeof ao === 'string') {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', access.origin);
      res.header('Access-Control-Allow-Credentials', access.credentials);
      res.header('Access-Control-Allow-Methods', access.methods);
      res.setHeader('Access-Control-Allow-Headers', access.headers);
      next();
    };
  } else if (Array.isArray(ao) && ao.length > 0) {
    return (req: Request, res: Response, next: NextFunction) => {
      const origin = req.headers.origin;
      if (origin) {
        if (ao.includes(origin)) {
          res.setHeader('Access-Control-Allow-Origin', origin);
        }
      }
      res.header('Access-Control-Allow-Credentials', access.credentials);
      res.header('Access-Control-Allow-Methods', access.methods);
      res.setHeader('Access-Control-Allow-Headers', access.headers);
      next();
    };
  }
  return (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Credentials', access.credentials);
    res.header('Access-Control-Allow-Methods', access.methods);
    res.setHeader('Access-Control-Allow-Headers', access.headers);
    next();
  };
}
export interface SavedService<T> {
  load(id: string): Promise<T[]>;
  save(id: string, itemId: string): Promise<number>;
}
export class SavedController<T> {
  constructor(public log: (msg: string) => void, public service: SavedService<T>, public item: string, id?: string) {
    this.id = (id && id.length > 0 ? id : 'id');
    this.save = this.save.bind(this);
    this.load = this.load.bind(this);
  }
  id: string;
  save(req: Request, res: Response) {
    const id = req.params[this.id];
    const itemId = req.params[this.item];
    this.service.save(id, itemId).then(data => {
      res.status(200).json(data).end();
    })
    .catch(err => console.log(err));
  }
  load(req: Request, res: Response) {
    const id = req.params[this.id];
    this.service.load(id).then(data => {
      res.status(200).json(data).send();
    })
    .catch(err => console.log(err));
  }
}
