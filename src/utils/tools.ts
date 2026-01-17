interface HashMap<T> {
  [key: string]: T;
}

export class Tools {
  static isPresent(value: any | string | object): boolean {
    if (typeof value === 'undefined' || value === 'undefined') {
      return false;
    }

    if (typeof value === 'boolean') {
      return true;
    }

    if (typeof value === 'string') {
      return value.trim().length > 0;
    }

    if (typeof value === 'number') {
      return true;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return (
      value !== null &&
      value !== undefined &&
      Object.getOwnPropertyNames(value).length > 0
    );
  }

  static isBlank(value: any | string | object): boolean {
    if (typeof value === 'string') {
      return value.trim().length === 0;
    }

    if (typeof value === 'number') {
      return false;
    }

    if (typeof value === 'boolean') {
      return false;
    }

    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return (
      value === null ||
      value === undefined ||
      typeof value === 'undefined' ||
      Object.getOwnPropertyNames(value).length === 0
    );
  }

  static splitByChunks(data: any[], perChunk: number = 3) {
    return data.reduce((resultArray: any, item: any, index: number) => {
      const chunkIndex = Math.floor(index / perChunk);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    }, []);
  }

  static groupBy(xs: any[], key: string) {
    return xs.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  }

  static uniqueByKey(data: any[], key: string) {
    return [...new Map(data.map(item => [item[key], item])).values()];
  }

  static arrayToObject(data: any[], key: number | string) {
    const result: HashMap<object> = {};

    data.forEach(gr => {
      result[gr[key]] = gr;
    });

    return result;
  }

  static arrayToItselfObject<T>(data: any[]) {
    const result: HashMap<T> = {};

    data.forEach(gr => {
      result[gr] = gr;
    });

    return result;
  }

  static objectToArray(data: any) {
    return Object.keys((key: any) => data[key] as any[]);
  }

  static hash(data: string, _len: number) {
    const hash = data.split('').reduce((hash, char) => {
      return char.charCodeAt(0) + (hash << 6) + (hash << 16) - hash;
    }, 0);

    return `${hash}`;
  }

  static compactObject(data: any) {
    const result: any = {};

    Object.keys(data).forEach(key => {
      if (this.isPresent(data[key]) && data[key] !== 'null') {
        result[key] = data[key];
      }
    });

    return result;
  }

  static compactArray(data: any[]) {
    return data.filter((el: any) => Tools.isPresent(el));
  }

  static timeout(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /*
   * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
   * */
  /**
   * Simple object check.
   * @param item
   * @returns {boolean}
   */
  static isObject(item: any) {
    return item && typeof item === 'object' && !Array.isArray(item);
  }

  /**
   * Deep merge two objects.
   * @param target
   * @param ...sources
   */
  static deepMerge(target: any, ...sources: any[]): object {
    if (!sources.length) {
      return target;
    }
    const source = sources.shift();

    if (Tools.isObject(target) && Tools.isObject(source)) {
      for (const key in source) {
        if (Tools.isObject(source[key])) {
          if (!target[key]) {
            Object.assign(target, { [key]: {} });
          }
          Tools.deepMerge(target[key], source[key]);
        } else {
          Object.assign(target, { [key]: source[key] });
        }
      }
    }

    return Tools.deepMerge(target, ...sources);
  }

  static haveKey(target: object | null | unknown, key: string) {
    return (
      target !== null &&
      target !== undefined &&
      Object.getOwnPropertyNames(target).includes(key)
    );
  }

  static zipArray(names: any[], data: any[]) {
    return names.map((key, index) => [key, data[index]]);
  }

  static generateId(length = 10) {
    const symbols =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length }, () =>
      symbols.charAt(Math.floor(Math.random() * 62))
    ).join('');
  }

  static delay(ms: number) {
    return new Promise(res => setTimeout(res, ms));
  }

  static deepClone(object: object) {
    return JSON.parse(JSON.stringify(object));
  }
}
