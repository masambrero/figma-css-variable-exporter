import {
  ExportMessage,
  InitCollectionsMessage,
  InitStylesMessage,
} from '../types';
import { MESSAGE_TYPES, type Message } from '../constants/message';

export const isInitCollectionsMessage = (
  msg: Message
): msg is InitCollectionsMessage => {
  return msg.type === MESSAGE_TYPES.INIT_COLLECTIONS;
};

export const isInitStylesMessage = (msg: Message): msg is InitStylesMessage => {
  return msg.type === MESSAGE_TYPES.INIT_STYLES;
};

export const isExportMessage = (msg: Message): msg is ExportMessage => {
  return msg.type === MESSAGE_TYPES.EXPORT;
};
