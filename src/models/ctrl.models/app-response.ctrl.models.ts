interface IAppResponse {
  code?: number;
  message?: string;
  // tslint:disable-next-line:no-any
  data?: any;
}

export class AppResponse {
  code: number;
  message: string;
  // tslint:disable-next-line:no-any
  data: any;

  constructor(data?: IAppResponse) {
    this.code = (data && data.code) || 200;
    this.message = (data && data.message) || '';
    this.data = (data && data.data) || undefined;

    if (this.message === '') {
      switch (this.code) {
        case 200:
          this.message = 'Success';
          break;
        case 400:
          this.message = 'Bad Request';
          break;
        case 401:
          this.message = 'Unauthorized';
          break;
        case 404:
          this.message = 'Not found';
          break;
        case 500:
          this.message = 'Server error';
        default:
          this.message = 'Error';
      }
    }
  }
}
