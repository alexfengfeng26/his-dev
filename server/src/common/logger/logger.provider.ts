import { Provider } from '@nestjs/common';

export const LoggerProvider: Provider = {
  provide: 'Logger',
  useFactory: () => {
    return {
      log: (message: string) => console.log(message),
      error: (message: string, error: any) => console.error(message, error),
    };
  },
};