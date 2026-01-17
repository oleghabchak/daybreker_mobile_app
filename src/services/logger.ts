import { Tools } from '../utils/tools';

export class Logger {
  static info(message: any, ...optionalParams: any[]) {
    console.log(
      ...Tools.compactArray(['ℹ️ [INFO]: ', message, optionalParams])
    );
  }
  static success(message: any, ...optionalParams: any[]) {
    console.log(
      ...Tools.compactArray(['✅ [SUCCESS]: ', message, optionalParams])
    );
  }

  static warn(message: any, ...optionalParams: any[]) {
    console.warn(
      ...Tools.compactArray(['⚠️ [WARN]: ', message, optionalParams])
    );
  }

  static error(message: any, ...optionalParams: any[]) {
    console.error(
      ...Tools.compactArray(['❌ [ERROR]: ', message, optionalParams])
    );
  }

  static debug(message: any, ...optionalParams: any[]) {
    console.log(
      ...Tools.compactArray(['🔄 [DEBUG]: ', message, optionalParams])
    );
  }
}
