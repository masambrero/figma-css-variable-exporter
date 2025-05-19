import {
  ExportMessage,
  InitCollectionsMessage,
  InitStylesMessage,
} from '../types';

export type Message =
  | ExportMessage
  | InitCollectionsMessage
  | InitStylesMessage;

type FormattedType<T extends string> = T extends `${infer T}-${infer U}`
  ? Uppercase<`${T}_${FormattedType<U>}`>
  : Uppercase<T>;

type MessageType<T extends string> = {
  [K in T as FormattedType<K>]: K;
};

export const MESSAGE_TYPES: MessageType<Message['type']> = {
  EXPORT: 'export',
  INIT_COLLECTIONS: 'init-collections',
  INIT_STYLES: 'init-styles',
} as const;
