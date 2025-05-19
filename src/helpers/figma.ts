import { normalizeName } from './style';
import { rgbaToHex } from './colors';

function isVariableAlias(variable: unknown): variable is VariableAlias {
  return (
    typeof variable === 'object' &&
    variable !== null &&
    'type' in variable &&
    variable.type === 'VARIABLE_ALIAS'
  );
}

function formatValue(
  value: number,
  unit: 'px' | 'rem' = 'px',
  remValue: number = 16
) {
  return unit === 'px' ? `${value}px` : `${(value / remValue).toFixed(4)}rem`;
}

export async function getGridStyleCSSVariables(
  unit: 'px' | 'rem' = 'px',
  remValue: number = 16
) {
  try {
    const gridStyles = await figma.getLocalGridStylesAsync();

    const cssVariables: string[] = [];

    gridStyles.forEach((style) => {
      const styleName = normalizeName(style.name);
      style.layoutGrids.forEach((layoutGrid, index) => {
        if (layoutGrid.pattern === 'COLUMNS' || layoutGrid.pattern === 'ROWS') {
          const count = layoutGrid.count > 0 ? layoutGrid.count : 'auto';
          const gutterSize = `${formatValue(layoutGrid.gutterSize, unit, remValue)}`;
          const alignment = layoutGrid.alignment.toLowerCase();
          const sectionSize = layoutGrid.sectionSize
            ? `${formatValue(layoutGrid.sectionSize, unit, remValue)}`
            : 'auto';

          const variables = [
            `--${styleName}-${index}-pattern: ${layoutGrid.pattern.toLowerCase()};`,
            `--${styleName}-${index}-gutter-size: ${gutterSize};`,
            `--${styleName}-${index}-count: ${count};`,
            `--${styleName}-${index}-alignment: ${alignment};`,
            `--${styleName}-${index}-section-size: ${sectionSize};`,
          ];
          cssVariables.push(variables.join('\n'));
        }
      });
    });

    return cssVariables;
  } catch (e) {
    console.error(new Error(`Error getting grid style CSS variables: ${e}`));

    return [];
  }
}

export async function getTextStyleCSSVariables(
  unit: 'px' | 'rem' = 'px',
  remValue: number = 16
) {
  try {
    const textStyles = await figma.getLocalTextStylesAsync();

    const cssVariables: string[] = [];

    textStyles.forEach((style) => {
      const styleName = normalizeName(style.name);

      const { fontSize, fontName, lineHeight } = style;

      const fontFamily = `"${fontName.family}"`;
      const fontWeight = fontName.style.replace(/\D/g, '') || 'normal';

      const variables = [
        `--${styleName}-font-size: ${formatValue(fontSize, unit, remValue)};`,
        `--${styleName}-font-family: ${fontFamily};`,
        `--${styleName}-font-weight: ${fontWeight};`,
        `--${styleName}-line-height: ${
          lineHeight.unit === 'PIXELS'
            ? formatValue(lineHeight.value, unit, remValue)
            : lineHeight.unit === 'PERCENT'
              ? lineHeight.value + '%'
              : 1
        };`,
      ];

      cssVariables.push(variables.join('\n'));
    });

    return cssVariables;
  } catch (e) {
    console.error(new Error(`Error getting text style CSS variables: ${e}`));

    return [];
  }
}

export async function getEffectStyleCSSVariables(
  unit: 'px' | 'rem' = 'px',
  remValue: number = 16
) {
  try {
    const effectStyles = await figma.getLocalEffectStylesAsync();

    const cssVariables: string[] = [];

    effectStyles.forEach((style) => {
      const styleName = normalizeName(style.name);

      style.effects.forEach((effect, index) => {
        if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
          const { color, offset, radius, spread } = effect;

          const cssVariable = `--${styleName}-${index}: ${formatValue(offset.x, unit)} ${formatValue(
            offset.y,
            unit,
            remValue
          )} ${formatValue(radius, unit, remValue)} ${formatValue(spread || 0, unit, remValue)} ${rgbaToHex(color)};`;

          cssVariables.push(cssVariable);
        }
      });
    });

    return cssVariables;
  } catch (e) {
    console.error(new Error(`Error getting effect style CSS variables: ${e}`));

    return [];
  }
}

export async function getPaintStyleCSSVariables() {
  try {
    const cssVariables: string[] = [];

    const styles = await figma.getLocalPaintStylesAsync();

    for (const style of styles) {
      const p = style.paints[0];

      if (p.type === 'SOLID') {
        const hex = rgbaToHex(p.color);
        const name = normalizeName(style.name);
        cssVariables.push(`--${name}: ${hex};`);
      }
    }

    return cssVariables;
  } catch (e) {
    console.error(new Error(`Error getting paint style CSS variables: ${e}`));

    return [];
  }
}

export async function getCollectionCSSVariables(
  collection: VariableCollection,
  unit: 'px' | 'rem' = 'px',
  remValue: number = 16
) {
  try {
    const cssVariables: string[] = [];

    for (const varId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(varId);

      if (variable) {
        const key = normalizeName(variable.name);
        const mode = Object.keys(variable.valuesByMode)[0];
        const raw = variable.valuesByMode[mode];
        let val = '';

        switch (variable.resolvedType) {
          case 'COLOR':
            if (
              raw &&
              typeof raw === 'object' &&
              'r' in raw &&
              raw.r !== undefined
            ) {
              val = rgbaToHex(raw);
            } else if (typeof raw === 'string' && raw.startsWith('#')) {
              val = raw;
            } else if (isVariableAlias(raw)) {
              const alias = await figma.variables.getVariableByIdAsync(raw.id);

              if (alias) {
                val = `var(--${normalizeName(alias.name)})`;
              }
            }
            break;

          case 'FLOAT':
            // Handle numeric alias first
            if (isVariableAlias(raw)) {
              const alias = await figma.variables.getVariableByIdAsync(raw.id);

              if (alias) {
                val = `var(--${normalizeName(alias.name)})`;
              }
            } else {
              const num = typeof raw === 'number' ? raw : 0;

              if (key.includes('opacity')) {
                val = `${(num / 100).toFixed(2)}`;
              } else {
                val = formatValue(num, unit, remValue);
              }
            }
            break;

          case 'STRING':
            val = `"${raw}"`;
            break;

          default:
            if (isVariableAlias(raw)) {
              const alias = await figma.variables.getVariableByIdAsync(raw.id);

              if (alias) {
                val = `var(--${normalizeName(alias.name)})`;
              }
            } else {
              val = String(raw);
            }
        }

        cssVariables.push(`--${key}: ${val};`);
      }
    }

    return cssVariables;
  } catch (e) {
    console.error(new Error(`Error getting collection CSS variables: ${e}`));

    return [];
  }
}

export function getFormattedVariables(variables: string[], comment?: string) {
  if (variables.length === 0) return '';

  return `\n${comment && `/* ${comment || ''}*/`}\n${variables.join('\n')}`;
}
