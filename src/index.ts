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
export {LoadController as ViewController};

export {GenericController as GenericHandler};
export {SearchController as SearchHandler};
export {LoadSearchController as LoadSearchHandler};
export {GenericSearchController as GenericSearchHandler};
export {Controller as LowCodeHandler};
// export {Controller as Handler};
export {Controller as LowCodeController};
export {Service as LowCodeService};

export * from './health';
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
  origin: string;
  credentials: string;
  methods: string;
  headers: string;
}
export type AccessControlAllowConfig = AccessConfig;
export function allow(access: AccessConfig): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Origin', access.origin);
    res.header('Access-Control-Allow-Credentials', access.credentials);
    res.header('Access-Control-Allow-Methods', access.methods);
    res.setHeader('Access-Control-Allow-Headers', access.headers);
    next();
  };
}
