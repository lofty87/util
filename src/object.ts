import { Object } from '@lofty87/types';
import { Document } from 'mongoose';
import {
  defaultsDeep,
  forEach,
  get,
  isArray,
  isEmpty,
  isNull,
  isPlainObject,
  isUndefined,
  reduce,
  set,
} from 'lodash';

import { refCount } from './number';

/**
 * @name lengthOf
 * * 객체의 key 개수 반환
 */
export const lengthOf = (obj: Object) => {
  return Object.keys(obj).length;
};

const compactObjectRecursive = <T extends object | Document>(
  obj: T,
  filter: (val: any) => boolean,
  notFilteringCount?: ReturnType<typeof refCount>
) => {
  const keyLength = Object.keys(obj).length;

  let keyCount = 1;

  return reduce<Object, Object>(
    obj,
    (result, value, key) => {
      if(isPlainObject(value) && !isEmpty(value)) {
        result[key] = compactObjectRecursive(value, filter, notFilteringCount);
      } else if(filter(value)) {
        result[key] = value;
      } else if(notFilteringCount && keyCount === keyLength) {
        notFilteringCount.plus();
      }

      keyCount++;

      return result;
    },
    {}
  ) as T;
};

/**
 * @name compactObject
 * * mongoose doc 을 compact 하기 위해 작성
 * * default filter 는 value 가 undefined 또는 null 이 아닐 때
 *
 * ! notFilteringCount 를 통해,
 * ! 한번 더 compact 하는 이유는
 * ! depth 걱정없이 완벽하게 compact 하기 위해
 * ? e.g. { sign: { email: { certification: null, at: null } } }
 */
export const compactObject = <T extends object | Document>(
  obj: T,
  filter = (val: any) => !(isUndefined(val) || isNull(val))
) => {
  if(!isPlainObject(obj)) {
    throw Error(`not supported ${typeof obj} type. (plain object type or mongoose Document type)`);
  }

  const notFilteringCount = refCount();

  let result = compactObjectRecursive(obj, filter, notFilteringCount);

  for(let i = 0; i < notFilteringCount.get(); i++) {
    result = compactObjectRecursive(result, filter);
  }

  return result;
};

const loadArrayValueKeysRecursive = (obj: Object, keyPath: string, arrayValueKeys: string[]) => {
  forEach(obj, (value, key) => {
    const newKeyPath = keyPath ? `${keyPath}.${key}` : `${key}`;

    if(isPlainObject(value)) {
      loadArrayValueKeysRecursive(value, newKeyPath, arrayValueKeys);
    } else if(isArray(value)) {
      arrayValueKeys.push(newKeyPath);
    }
  });
};

/**
 * @name advancedDefaultsDeep
 * @return new object (immutate)
 * * 배열은 defaultsDeep 처리에서 제외한 커스텀 defaultsDeep
 *
 * ! defaultsDeep({ values: [ 1 ] }, { values: [ 3, 4 ] })
 * ! result : { imgSrc: [ 1, 4 ] }
 * ! resolve: { imgSrc: [ 1 ] }
 */
export const advancedDefaultsDeep = (obj: Object, source: Object) => {
  const arrayValueKeys: string[] = [];

  loadArrayValueKeysRecursive(obj, '', arrayValueKeys);

  const result = defaultsDeep({}, obj, source);

  // ? overwrite
  arrayValueKeys.forEach((key) => {
    set(result, key, get(obj, key));
  });

  return result;
};
