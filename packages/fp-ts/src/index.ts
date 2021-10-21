import { property as coreProperty } from '@frp-ts/core'
import * as fptsProperty from './property'
export const property = { ...coreProperty, ...fptsProperty }
