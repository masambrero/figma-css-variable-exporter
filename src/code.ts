import { createRootContent } from './helpers/style';
import {
  getGridStyleCSSVariables,
  getTextStyleCSSVariables,
  getEffectStyleCSSVariables,
  getPaintStyleCSSVariables,
  getCollectionCSSVariables,
  getFormattedVariables,
  getLocalStylesVariables,
} from './helpers/figma';
import { LOCAL_STYLES_IDS } from './constants/figma';
import {
  ExportMessage,
  Message,
  InitStylesMessage,
  InitCollectionsMessage,
} from './types';

// Show the plugin UI
figma.showUI(__html__, { width: 800, height: 900, themeColors: true });

(async () => {
  const selectedCollection =
    await figma.variables.getLocalVariableCollectionsAsync();
  figma.ui.postMessage({
    type: 'init-collections',
    collections: selectedCollection.map((c) => ({ id: c.id, name: c.name })),
  } satisfies InitCollectionsMessage);

  const availableStyles = await getLocalStylesVariables();

  figma.ui.postMessage({
    type: 'init-styles',
    styles: availableStyles,
  } satisfies InitStylesMessage);
})();

figma.ui.onmessage = async (msg: Message) => {
  if (msg.type !== 'generate') return;

  const { unit, remValue, collections: selectedIds, styles } = msg;

  const variableCollection =
    await figma.variables.getLocalVariableCollectionsAsync();

  const selectedCollection = selectedIds.length
    ? variableCollection.filter((c) => selectedIds.includes(c.id))
    : [];

  let css: string = '';

  for (const collection of selectedCollection) {
    const commentName = collection.name.trim().replace(/[/\s]+/g, '_');

    const collectionCSSVariables = await getCollectionCSSVariables(
      collection,
      unit,
      remValue
    );

    css += getFormattedVariables(collectionCSSVariables, commentName);
  }

  if (styles.includes(LOCAL_STYLES_IDS.PAINT)) {
    const paintStyleCSSVariables = await getPaintStyleCSSVariables();

    css += getFormattedVariables(
      paintStyleCSSVariables,
      'Paint style variables'
    );
  }

  if (styles.includes(LOCAL_STYLES_IDS.EFFECT)) {
    const effectStyleCSSVariables = await getEffectStyleCSSVariables(
      unit,
      remValue
    );
    css += getFormattedVariables(
      effectStyleCSSVariables,
      'Effect style variables'
    );
  }

  if (styles.includes(LOCAL_STYLES_IDS.TEXT)) {
    const textStyleCSSVariables = await getTextStyleCSSVariables(
      unit,
      remValue
    );

    css += getFormattedVariables(textStyleCSSVariables, 'Text style variables');
  }

  if (styles.includes(LOCAL_STYLES_IDS.GRID)) {
    const gridStyleCSSVariables = await getGridStyleCSSVariables(
      unit,
      remValue
    );
    css += getFormattedVariables(gridStyleCSSVariables, 'Grid style variables');
  }

  const rootContent = createRootContent(css);

  return figma.ui.postMessage({
    type: 'export',
    css: css ? rootContent : null,
  } satisfies ExportMessage);
};
