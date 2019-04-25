import {inject} from '@loopback/context';
import {
  FindRoute,
  InvokeMethod,
  ParseParams,
  Reject,
  RequestContext,
  RestBindings,
  Send,
  SequenceHandler,
} from '@loopback/rest';
import {AuthenticationBindings, AuthenticateFn} from '@loopback/authentication';
import {AppResponse} from './models/ctrl.models';

const SequenceActions = RestBindings.SequenceActions;

export class MySequence implements SequenceHandler {
  constructor(
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      const route = this.findRoute(request);
      if (request.url.startsWith('/api')) {
        console.log(request.method + ' ' + request.url);
      }
      await this.authenticateRequest(request);
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      this.send(response, result);
    } catch (err) {
      if (err && err.code && typeof err.code === 'number') {
        context.response.status(err.code);
        this.send(context.response, err);
      } else {
        if (err && err.statusCode && typeof err.statusCode === 'number') {
          context.response.status(err.statusCode);
          const message =
            (err.details && err.details[0] && err.details[0].message) ||
            err.message;
          this.send(
            context.response,
            new AppResponse({code: err.statusCode, message: message}),
          );
        } else {
          this.reject(context, err);
        }
      }
      console.log(err);
    }
  }
}
