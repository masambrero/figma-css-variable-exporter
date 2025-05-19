import { LOCAL_STYLES_IDS } from './constants/figma';

type CollectionId = string;

export type ExportMessage = {
  type: 'export';
  css: string | null;
};

export type GenerateMessage = {
  type: 'generate';
  unit: 'px' | 'rem';
  remValue: number;
  collections: CollectionId[];
  styles: string[];
};

export type InitCollectionsMessage = {
  type: 'init-collections';
  collections: { id: CollectionId; name: string }[];
};

export type InitStylesMessage = {
  type: 'init-styles';
  styles: (typeof LOCAL_STYLES_IDS)[keyof typeof LOCAL_STYLES_IDS][];
};
