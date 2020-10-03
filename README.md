# @lofty87/util

this module is for **utility** only in the lofty87 project

## 1. Installation

```bash
npm install --save @lofty87/util
```

## 2. Usage

```ts
import { arrayToObj } from '@lofty87/util';
```

### - util

* array
  * arrayToObj

* date
  * formatOf
  * fromNow

* filter
  * isNotEmpty (for compact mongoose doc)

* number
  * randomAlphaNumeric
  * refCount (for compact mongoose doc)

* object
  * lengthOf
  * compactObject (compact mongoose doc)
  * advancedDefaultsDeep (except array value)

* string
  * splitBy
  * splitByColon
  * splitByComma

* url
  * splitPathname
  * isDetailPage