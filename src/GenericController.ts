import {Request, Response} from 'express';
import {checkId, create, isTypeError, update} from './edit';
import {handleError, Log} from './http';
import {LoadController} from './LoadController';
import {Attribute, Attributes, ErrorMessage} from './metadata';
import {resources} from './resources';
import {buildAndCheckId, buildId} from './view';

export type Build<T> = (res: Response, obj: T, isCreate?: boolean, isPatch?: boolean) => void;
export type Validate<T> = (obj: T, patch?: boolean) => Promise<ErrorMessage[]>;
export type Save<T> = (obj: T, ctx?: any) => Promise<number|ErrorMessage[]>;
export interface GenericService<T, ID, R> {
  metadata?(): Attributes|undefined;
  load(id: ID, ctx?: any): Promise<T|null>;
  insert(obj: T, ctx?: any): Promise<R>;
  update(obj: T, ctx?: any): Promise<R>;
  patch?(obj: Partial<T>, ctx?: any): Promise<R>;
  delete?(id: ID, ctx?: any): Promise<number>;
}
export class GenericController<T, ID> extends LoadController<T, ID> {
  metadata?: Attributes;
  returnNumber?: boolean;
  constructor(log: Log, public service: GenericService<T, ID, number|ErrorMessage[]>, public build?: Build<T>, public validate?: Validate<T>, returnNumber?: boolean) {
    super(log, service);
    this.returnNumber = returnNumber;
    if (service.metadata) {
      const m = service.metadata();
      if (m) {
        this.metadata = m;
      }
    }
    this.create = this.create.bind(this);
    this.insert = this.insert.bind(this);
    this.update = this.update.bind(this);
    this.patch = this.patch.bind(this);
    this.delete = this.delete.bind(this);
    if (!validate && resources.createValidator && this.metadata) {
      const v = resources.createValidator(this.metadata);
      this.validate = v.validate;
    }
  }
  create(req: Request, res: Response): void {
    return this.insert(req, res);
  }
  insert(req: Request, res: Response): void {
    validateAndCreate(req, res, this.service.insert, this.log, this.validate, this.build);
  }
  update(req: Request, res: Response): void {
    const id = buildAndCheckIdWithBody<T, ID, any>(req, res, this.keys, this.service.update);
    if (id) {
      validateAndUpdate(res, req.body, false, this.service.update, this.log, this.validate, this.build);
    }
  }
  patch(req: Request, res: Response): void {
    const id = buildAndCheckIdWithBody<T, ID, any>(req, res, this.keys, this.service.patch);
    if (id && this.service.patch) {
      validateAndUpdate(res, req.body, true, this.service.patch, this.log, this.validate, this.build);
    }
  }
  delete(req: Request, res: Response): void {
    const id = buildAndCheckId<ID>(req, res, this.keys);
    if (id) {
      if (!this.service.delete) {
        res.status(405).end('Method Not Allowed');
      } else {
        this.service.delete(id).then(count => {
          res.status(getDeleteStatus(count)).json(count).end();
        }).catch(err => handleError(err, res, this.log));
      }
    }
  }
}
export function validateAndCreate<T>(req: Request, res: Response, save: Save<T>, log: Log, validate?: Validate<T>, build?: Build<T>, returnNumber?: boolean): void {
  const obj = req.body;
  if (!obj || obj === '') {
    res.status(400).end('The request body cannot be empty.');
  } else {
    if (validate) {
      validate(obj).then(errors => {
        if (errors && errors.length > 0) {
          res.status(getStatusCode(errors)).json(errors).end();
        } else {
          if (build) {
            build(res, obj, true);
          }
          create(res, obj, save, log, returnNumber);
        }
      }).catch(err => handleError(err, res, log));
    } else {
      create(res, obj, save, log, returnNumber);
    }
  }
}
export function validateAndUpdate<T>(res: Response, obj: T, isPatch: boolean, save: Save<T>, log: Log, validate?: Validate<T>, build?: Build<T>, returnNumber?: boolean):  void {
  if (validate) {
    validate(obj, isPatch).then(errors => {
      if (errors && errors.length > 0) {
        res.status(getStatusCode(errors)).json(errors).end();
      } else {
        if (build) {
          build(res, obj, false, isPatch);
        }
        update(res, obj, save, log, returnNumber);
      }
    }).catch(err => handleError(err, res, log));
  } else {
    update(res, obj, save, log, returnNumber);
  }
}
export function buildAndCheckIdWithBody<T, ID, R>(req: Request, res: Response, keys?: Attribute[], patch?: (obj: T, ctx?: any) => Promise<R>): ID | undefined {
  const obj = req.body;
  if (!obj || obj === '') {
    res.status(400).end('The request body cannot be empty.');
    return undefined;
  }
  if (!patch) {
    res.status(405).end('Method Not Allowed');
    return undefined;
  }
  const id = buildId<ID>(req, keys);
  if (!id) {
    res.status(400).end('Invalid parameters');
    return undefined;
  }
  const ok = checkId<T, ID>(obj, id, keys);
  if (!ok) {
    res.status(400).end('body and url are not matched');
    return undefined;
  }
  return id;
}
export function getDeleteStatus(count: number): number {
  if (count > 0) {
    return 200;
  } else if (count === 0) {
    return 404;
  } else {
    return 409;
  }
}
export function getStatusCode(errs: ErrorMessage[]): number {
  return (isTypeError(errs) ? 400 : 422);
}
export interface ModelConfig {
  id?: string;
  payload?: string;
  user?: string;
  updatedBy?: string;
  updatedAt?: string;
  createdBy?: string;
  createdAt?: string;
  version?: string;
}
export function useBuild<T>(c: ModelConfig, generate?: (() => string)): Build<T> {
  const b = new Builder<T>(generate, c.id ? c.id : '', c.payload ? c.payload : '', c.user ? c.user : '', c.updatedBy ? c.updatedBy : '', c.updatedAt ? c.updatedAt : '', c.createdBy ? c.createdBy : '', c.createdAt ? c.createdAt : '', c.version ? c.version : '');
  return b.build;
}
// tslint:disable-next-line:max-classes-per-file
export class Builder<T> {
  constructor(public generate: (() => string)|undefined, public id: string, public payload: string, public user: string, public updatedBy: string, public updatedAt: string, public createdBy: string, public createdAt: string, public version: string) {
    this.build = this.build.bind(this);
  }
  build(res: Response, obj: T, isCreate?: boolean, isPatch?: boolean): void {
    const o: any = obj;
    let usr = '';
    if (this.user.length > 0) {
      if (this.payload.length > 0) {
        const payload = res.locals[this.payload];
        if (payload) {
          usr = payload[this.user];
        }
      } else {
        usr = res.locals[this.user];
      }
    }
    if (!usr) {
      usr = '';
    }
    const now = new Date();
    if (isCreate) {
      if (this.generate && this.id.length > 0) {
        o[this.id] = this.generate();
      }
      if (usr.length > 0) {
        if (this.createdAt.length > 0) {
          o[this.createdAt] = now;
        }
        if (this.createdBy.length > 0) {
          o[this.createdBy] = usr;
        }
      }
      if (this.version.length > 0) {
        o[this.version] = 1;
      }
    } else if (isPatch) {
      const keys = Object.keys(o);
      if (keys.length === 0) {
        return;
      }
    }
    if (usr.length > 0) {
      if (this.updatedAt.length > 0) {
        o[this.updatedAt] = now;
      }
      if (this.updatedBy.length > 0) {
        o[this.updatedBy] = usr;
      }
    }
  }
}
